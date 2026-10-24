import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { addAuditLog, getDb, listCategories, listCommissionSettings, listCommissions, listFinanceEntries, listInventoryTransactions, listOrders, listProducts, listPublicProducts, listTeamMembers } from "./db";
import { categories, commissionLedger, commissionSettings, financeEntries, inventoryTransactions, orderItems, orders, products, teamMembers } from "../drizzle/schema";
import { desc, eq, sql } from "drizzle-orm";
import { auditLogs } from "../drizzle/schema";
import { categoryInputSchema, productInputSchema, teamMemberInputSchema } from "../shared/adminSchemas";
import { parseImageDataUrl } from "../shared/imageUpload";
import { storagePut } from "./storage";
import { aggregatePerformance } from "../shared/analytics";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 }); return { success: true } as const; }),
  }),
  products: router({
    list: publicProcedure.query(() => listPublicProducts()),
    adminList: adminProcedure.query(() => listProducts()),
    uploadImage: adminProcedure.input(z.object({ dataUrl: z.string().min(32) })).mutation(async ({ ctx, input }) => {
      const parsed = parseImageDataUrl(input.dataUrl);
      const uploaded = await storagePut(`products/${ctx.user.id}/${Date.now()}.${parsed.extension}`, Buffer.from(parsed.base64, "base64"), parsed.contentType);
      return uploaded;
    }),
    create: adminProcedure.input(productInputSchema).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة" });
      const [created] = await db.insert(products).values({ ...input, costPrice: input.costPrice.toFixed(2), sellingPrice: input.sellingPrice.toFixed(2), createdBy: ctx.user.id }).$returningId();
      await addAuditLog({ actorId: ctx.user.id, actorName: ctx.user.name ?? undefined, action: "create", entity: "product", entityId: created.id, newValue: input });
      return created;
    }),
    update: adminProcedure.input(productInputSchema.extend({ id: z.number().int() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, ...rest } = input; await db.update(products).set({ ...rest, costPrice: rest.costPrice.toFixed(2), sellingPrice: rest.sellingPrice.toFixed(2) }).where(eq(products.id, id));
      await addAuditLog({ actorId: ctx.user.id, actorName: ctx.user.name ?? undefined, action: "update", entity: "product", entityId: id, newValue: rest }); return { success: true };
    }),
  }),
  categories: router({
    list: publicProcedure.query(() => listCategories()),
    create: adminProcedure.input(categoryInputSchema).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة" });
      const [created] = await db.insert(categories).values({ ...input, name: input.nameAr }).$returningId();
      await addAuditLog({ actorId: ctx.user.id, actorName: ctx.user.name ?? undefined, action: "create", entity: "category", entityId: created.id, newValue: input });
      return created;
    }),
    update: adminProcedure.input(categoryInputSchema.extend({ id: z.number().int() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, ...rest } = input;
      await db.update(categories).set({ ...rest, name: rest.nameAr }).where(eq(categories.id, id));
      await addAuditLog({ actorId: ctx.user.id, actorName: ctx.user.name ?? undefined, action: "update", entity: "category", entityId: id, newValue: rest });
      return { success: true };
    }),
  }),
  orders: router({
    list: adminProcedure.query(() => listOrders()),
    create: publicProcedure.input(z.object({ customerName: z.string().min(2), customerPhone: z.string().min(6), customerAddress: z.string().optional(), referralCode: z.string().optional(), items: z.array(z.object({ productId: z.number().int(), quantity: z.number().int().positive().max(50) })).min(1) })).mutation(async ({ input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const orderNumber = `BV-${Date.now().toString().slice(-8)}`;
      return db.transaction(async (tx) => {
        const rows = await Promise.all(input.items.map(item => tx.select({ id: products.id, name: products.name, sellingPrice: products.sellingPrice, costPrice: products.costPrice, stock: products.stock }).from(products).where(eq(products.id, item.productId)).limit(1)));
        const resolved = rows.map((row, index) => ({ product: row[0], quantity: input.items[index].quantity }));
        if (resolved.some(item => !item.product)) throw new TRPCError({ code: "BAD_REQUEST", message: "يوجد منتج غير متاح" });
        if (resolved.some(item => Number(item.product!.stock) < item.quantity)) throw new TRPCError({ code: "BAD_REQUEST", message: "الكمية المطلوبة غير متاحة في المخزون" });
        const subtotal = resolved.reduce((sum, item) => sum + Number(item.product!.sellingPrice) * item.quantity, 0);
        const deliveryFee = 60;
        const total = subtotal + deliveryFee;
        const [created] = await tx.insert(orders).values({ orderNumber, customerName: input.customerName, customerPhone: input.customerPhone, customerAddress: input.customerAddress, referralCode: input.referralCode, subtotal: subtotal.toFixed(2), deliveryFee: deliveryFee.toFixed(2), total: total.toFixed(2) }).$returningId();
        await tx.insert(orderItems).values(resolved.map(item => ({ orderId: created.id, productId: item.product!.id, productName: item.product!.name, quantity: item.quantity, unitPrice: Number(item.product!.sellingPrice).toFixed(2), costPrice: Number(item.product!.costPrice).toFixed(2) })));
        for (const item of resolved) await tx.update(products).set({ stock: sql`${products.stock} - ${item.quantity}` }).where(eq(products.id, item.product!.id));
        return { ...created, orderNumber, subtotal, deliveryFee, total };
      });
    }),
    updateStatus: adminProcedure.input(z.object({ id: z.number().int(), status: z.enum(["new", "confirmed", "shipping", "delivered", "cancelled"]) })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.id));
      await addAuditLog({ actorId: ctx.user.id, actorName: ctx.user.name ?? undefined, action: "update_status", entity: "order", entityId: input.id, newValue: input.status }); return { success: true };
    }),
  }),
  team: router({
    list: adminProcedure.query(() => listTeamMembers()),
    create: adminProcedure.input(teamMemberInputSchema).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [created] = await db.insert(teamMembers).values({ ...input, permissions: JSON.stringify(input.permissions), commissionRate: input.commissionRate.toFixed(2) }).$returningId();
      await addAuditLog({ actorId: ctx.user.id, actorName: ctx.user.name ?? undefined, action: "create", entity: "team_member", entityId: created.id, newValue: input }); return created;
    }),
  }),
  inventory: router({
    list: adminProcedure.query(() => listInventoryTransactions()),
    receive: adminProcedure.input(z.object({ productId: z.number().int(), quantity: z.number().int().positive(), source: z.string().optional(), note: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(inventoryTransactions).values({ ...input, type: "receive", createdBy: ctx.user.id });
      await db.update(products).set({ stock: sql`${products.stock} + ${input.quantity}` }).where(eq(products.id, input.productId));
      return { success: true };
    }),
  }),
  commissions: router({
    list: adminProcedure.query(() => listCommissions()),
    settings: adminProcedure.query(() => listCommissionSettings()),
    markPaid: adminProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const existing = await db.select({ id: commissionLedger.id, status: commissionLedger.status }).from(commissionLedger).where(eq(commissionLedger.id, input.id)).limit(1);
      if (!existing[0]) throw new TRPCError({ code: "NOT_FOUND", message: "العمولة غير موجودة" });
      if (existing[0].status !== "approved") throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن صرف إلا العمولة المعتمدة" });
      await db.update(commissionLedger).set({ status: "paid" }).where(eq(commissionLedger.id, input.id));
      await addAuditLog({ actorId: ctx.user.id, actorName: ctx.user.name ?? undefined, action: "mark_paid", entity: "commission", entityId: input.id, oldValue: { status: "approved" }, newValue: { status: "paid" } });
      return { success: true };
    }),
    updateSetting: adminProcedure.input(z.object({ id: z.number().int(), value: z.number().nonnegative() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(commissionSettings).set({ value: input.value.toFixed(2), updatedBy: ctx.user.id }).where(eq(commissionSettings.id, input.id));
      await addAuditLog({ actorId: ctx.user.id, actorName: ctx.user.name ?? undefined, action: "update", entity: "commission_setting", entityId: input.id, newValue: input.value }); return { success: true };
    }),
  }),
  finance: router({
    list: adminProcedure.query(() => listFinanceEntries()),
    add: adminProcedure.input(z.object({ type: z.enum(["capital", "revenue", "cost", "expense", "salary", "commission", "withdrawal"]), description: z.string().min(2), amount: z.number().positive(), reference: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [created] = await db.insert(financeEntries).values({ ...input, amount: input.amount.toFixed(2), createdBy: ctx.user.id }).$returningId(); return created;
    }),
  }),
  dashboard: router({
    summary: adminProcedure.query(async () => {
      const [productRows, orderRows, memberRows, financeRows, commissionRows] = await Promise.all([listProducts(), listOrders(), listTeamMembers(), listFinanceEntries(), listCommissions()]);
      const revenue = financeRows.filter(x => x.type === "revenue").reduce((s, x) => s + Number(x.amount), 0);
      const costs = financeRows.filter(x => ["cost", "expense", "salary", "commission"].includes(x.type)).reduce((s, x) => s + Number(x.amount), 0);
      const performance = aggregatePerformance(orderRows, commissionRows, memberRows);
      return { products: productRows.length, orders: orderRows.length, members: memberRows.length, revenue: performance.totalSales || revenue, profit: (performance.totalSales || revenue) - costs, lowStock: productRows.filter(x => x.stock <= x.minStock).length, pendingOrders: orderRows.filter(x => ["new", "confirmed"].includes(x.status)).length, totalSales: performance.totalSales, totalCommissions: performance.totalCommissions, totalCompletedOrders: performance.totalOrders, memberPerformance: performance.memberPerformance };
    }),
    exportData: adminProcedure.query(async () => ({ products: await listProducts(), orders: await listOrders(), members: await listTeamMembers(), finance: await listFinanceEntries() })),
  }),
  audit: router({ list: adminProcedure.query(async () => { const db = await getDb(); return db ? db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100) : []; }) }),
});

export type AppRouter = typeof appRouter;
