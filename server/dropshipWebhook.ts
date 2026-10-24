import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { auditLogs, dropshipWebhookEvents, orders } from "../drizzle/schema";
import { getDb } from "./db";
import { ENV } from "./_core/env";
import { notifyOwner } from "./_core/notification";

type RawRequest = Request & { rawBody?: Buffer };

type DropshipPayload = {
  eventId?: string;
  event_id?: string;
  id?: string;
  type?: string;
  eventType?: string;
  event_type?: string;
  provider?: string;
  orderNumber?: string;
  order_number?: string;
  orderId?: string;
  order_id?: string;
  supplierOrderId?: string;
  supplier_order_id?: string;
  status?: string;
  data?: Record<string, unknown>;
};

export type DropshipEventResult = {
  accepted: boolean;
  duplicate?: boolean;
  orderNumber?: string;
  mappedStatus?: string;
};

export function createWebhookSignature(rawBody: Buffer | string, secret: string) {
  return `sha256=${crypto.createHmac("sha256", secret).update(rawBody).digest("hex")}`;
}

export function verifyWebhookSignature(rawBody: Buffer, signature: string | undefined, secret: string) {
  if (!signature || !secret) return false;
  const provided = signature.trim().replace(/^sha256=/, "");
  if (!/^[a-f0-9]{64}$/i.test(provided)) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const providedBuffer = Buffer.from(provided, "hex");
  return expectedBuffer.length === providedBuffer.length && crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

export function mapDropshipStatus(status: string | undefined): "new" | "confirmed" | "shipping" | "delivered" | "cancelled" | undefined {
  const normalized = status?.toLowerCase().replace(/[\s-]+/g, "_");
  if (!normalized) return undefined;
  if (["new", "received", "created", "pending", "accepted", "processing", "confirmed", "paid", "packed"].includes(normalized)) return normalized === "new" ? "new" : "confirmed";
  if (["shipped", "shipping", "in_transit", "out_for_delivery", "dispatched"].includes(normalized)) return "shipping";
  if (["delivered", "completed", "complete", "fulfilled"].includes(normalized)) return "delivered";
  if (["cancelled", "canceled", "failed", "refunded", "returned"].includes(normalized)) return "cancelled";
  return undefined;
}

function getString(payload: DropshipPayload, key: keyof DropshipPayload) {
  const value = payload[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}

export async function processDropshipWebhook(input: { provider: string; eventId: string; eventType: string; payload: DropshipPayload; rawPayload: string }): Promise<DropshipEventResult> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const nested = input.payload.data ?? {};
  const orderNumber = getString(input.payload, "orderNumber") ?? getString(input.payload, "order_number") ?? (typeof nested.orderNumber === "string" ? nested.orderNumber : typeof nested.order_number === "string" ? nested.order_number : undefined) ?? getString(input.payload, "orderId") ?? getString(input.payload, "order_id");
  const supplierOrderId = getString(input.payload, "supplierOrderId") ?? getString(input.payload, "supplier_order_id") ?? (typeof nested.supplierOrderId === "string" ? nested.supplierOrderId : typeof nested.supplier_order_id === "string" ? nested.supplier_order_id : undefined);
  const sourceStatus = getString(input.payload, "status") ?? (typeof nested.status === "string" ? nested.status : undefined);
  const mappedStatus = mapDropshipStatus(sourceStatus);

  const result = await db.transaction(async (tx) => {
    const existing = await tx.select({ id: dropshipWebhookEvents.id }).from(dropshipWebhookEvents).where(eq(dropshipWebhookEvents.eventId, input.eventId)).limit(1);
    if (existing.length) return { accepted: true, duplicate: true, orderNumber, mappedStatus };

    let matchedOrderId: number | undefined;
    if (orderNumber) {
      const matched = await tx.select({ id: orders.id }).from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
      matchedOrderId = matched[0]?.id;
      if (matchedOrderId && mappedStatus) {
        await tx.update(orders).set({ status: mappedStatus, dropshipStatus: sourceStatus, supplierOrderId }).where(eq(orders.id, matchedOrderId));
        await tx.insert(auditLogs).values({ action: "dropship_webhook", entity: "order", entityId: matchedOrderId, oldValue: undefined, newValue: JSON.stringify({ provider: input.provider, eventType: input.eventType, sourceStatus, mappedStatus, supplierOrderId }) });
      }
    }

    await tx.insert(dropshipWebhookEvents).values({ provider: input.provider, eventId: input.eventId, eventType: input.eventType, orderNumber, supplierOrderId, status: sourceStatus, payload: input.rawPayload, processedAt: new Date() });
    return { accepted: true, duplicate: false, orderNumber, mappedStatus, matchedOrderId };
  });

  if (!result.duplicate) {
    await notifyOwner({ title: `تحديث دروبشيبينغ — ${input.eventType}`, content: `المورّد: ${input.provider}\nالطلب: ${result.orderNumber ?? "غير مرتبط"}\nالحالة: ${result.mappedStatus ?? "غير معروفة"}` }).catch(error => console.warn("[Dropship] Owner notification failed:", error));
  }
  return { accepted: result.accepted, duplicate: result.duplicate, orderNumber: result.orderNumber, mappedStatus: result.mappedStatus };
}

export function registerDropshipWebhook(app: Express) {
  app.post("/api/webhooks/dropshipping", async (req: RawRequest, res: Response) => {
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
    if (!ENV.dropshipWebhookSecret) return res.status(503).json({ error: "Webhook secret is not configured" });
    if (!verifyWebhookSignature(rawBody, req.header("x-webhook-signature") ?? req.header("x-bagvora-signature"), ENV.dropshipWebhookSecret)) return res.status(401).json({ error: "Invalid webhook signature" });

    const payload = (req.body ?? {}) as DropshipPayload;
    const eventId = req.header("x-event-id") ?? getString(payload, "eventId") ?? getString(payload, "event_id") ?? getString(payload, "id");
    if (!eventId) return res.status(400).json({ error: "eventId is required" });
    const eventType = req.header("x-event-type") ?? getString(payload, "eventType") ?? getString(payload, "event_type") ?? getString(payload, "type") ?? "order.updated";
    const provider = req.header("x-provider") ?? getString(payload, "provider") ?? "generic";

    try {
      const result = await processDropshipWebhook({ provider, eventId, eventType, payload, rawPayload: rawBody.toString("utf8") });
      return res.status(result.duplicate ? 200 : 202).json(result);
    } catch (error) {
      console.error("[Dropship] Webhook processing failed:", error);
      return res.status(500).json({ error: "Webhook processing failed" });
    }
  });
}
