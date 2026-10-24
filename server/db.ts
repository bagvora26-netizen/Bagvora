import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { ENV } from "./_core/env";
import { InsertUser, User, auditLogs, categories, commissionLedger, commissionSettings, financeEntries, inventoryTransactions, orders, products, teamMembers, users } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listProducts() {
  const db = await getDb();
  return db ? db.select().from(products).where(eq(products.status, "active")).orderBy(desc(products.createdAt)) : [];
}

export async function listPublicProducts() {
  const db = await getDb();
  return db ? db.select({ id: products.id, sku: products.sku, name: products.name, description: products.description, category: products.category, size: products.size, sourceType: products.sourceType, imageUrl: products.imageUrl, sellingPrice: products.sellingPrice, stock: products.stock, minStock: products.minStock, status: products.status, isFeatured: products.isFeatured }).from(products).where(eq(products.status, "active")).orderBy(desc(products.createdAt)) : [];
}

export async function listCategories() {
  const db = await getDb();
  return db ? db.select().from(categories).orderBy(categories.nameAr) : [];
}

export async function listOrders() {
  const db = await getDb();
  return db ? db.select().from(orders).orderBy(desc(orders.createdAt)) : [];
}

export async function listTeamMembers() {
  const db = await getDb();
  return db ? db.select().from(teamMembers).orderBy(desc(teamMembers.createdAt)) : [];
}

export async function listCommissions() {
  const db = await getDb();
  return db ? db.select().from(commissionLedger).orderBy(desc(commissionLedger.createdAt)) : [];
}

export async function listCommissionSettings() {
  const db = await getDb();
  return db ? db.select().from(commissionSettings).orderBy(desc(commissionSettings.updatedAt)) : [];
}

export async function listInventoryTransactions() {
  const db = await getDb();
  return db ? db.select().from(inventoryTransactions).orderBy(desc(inventoryTransactions.createdAt)).limit(100) : [];
}

export async function listFinanceEntries() {
  const db = await getDb();
  return db ? db.select().from(financeEntries).orderBy(desc(financeEntries.entryDate)).limit(100) : [];
}

export async function addAuditLog(input: { actorId?: number; actorName?: string; action: string; entity: string; entityId?: number; oldValue?: unknown; newValue?: unknown }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values({ actorId: input.actorId, actorName: input.actorName, action: input.action, entity: input.entity, entityId: input.entityId, oldValue: input.oldValue ? JSON.stringify(input.oldValue) : undefined, newValue: input.newValue ? JSON.stringify(input.newValue) : undefined });
}
