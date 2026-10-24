import express from "express";
import { describe, expect, it } from "vitest";
import { createWebhookSignature, registerDropshipWebhook } from "./dropshipWebhook";

describe("configured dropship webhook secret", () => {
  it("accepts the configured signature before validating the event payload", async () => {
    const secret = process.env.DROPSHIP_WEBHOOK_SECRET;
    expect(secret, "DROPSHIP_WEBHOOK_SECRET must be configured").toBeTruthy();
    const app = express();
    app.use(express.json({ verify: (req, _res, buffer) => { (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buffer); } }));
    registerDropshipWebhook(app);
    const server = await new Promise<ReturnType<typeof app.listen>>(resolve => {
      const instance = app.listen(0, () => resolve(instance));
    });
    try {
      const body = "{}";
      const response = await fetch(`http://127.0.0.1:${(server.address() as { port: number }).port}/api/webhooks/dropshipping`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-webhook-signature": createWebhookSignature(body, secret!) },
        body,
      });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "eventId is required" });
    } finally {
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  });
});
