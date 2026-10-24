import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const teamMembers = mysqlTable("teamMembers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 40 }),
  role: mysqlEnum("role", ["admin", "employee", "marketer"]).default("employee").notNull(),
  employeeCode: varchar("employeeCode", { length: 32 }).notNull().unique(),
  permissions: text("permissions"),
  commissionRate: decimal("commissionRate", { precision: 6, scale: 2 }).default("5.00").notNull(),
  monthlySales: decimal("monthlySales", { precision: 12, scale: 2 }).default("0.00").notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  nameAr: varchar("nameAr", { length: 120 }),
  nameEn: varchar("nameEn", { length: 120 }),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  sku: varchar("sku", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 220 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 120 }).notNull(),
  size: varchar("size", { length: 80 }),
  sourceType: mysqlEnum("sourceType", ["china", "handmade", "local", "dropship"]).default("local").notNull(),
  sourceName: varchar("sourceName", { length: 180 }),
  imageUrl: text("imageUrl"),
  costPrice: decimal("costPrice", { precision: 12, scale: 2 }).default("0.00").notNull(),
  sellingPrice: decimal("sellingPrice", { precision: 12, scale: 2 }).default("0.00").notNull(),
  stock: int("stock").default(0).notNull(),
  minStock: int("minStock").default(5).notNull(),
  status: mysqlEnum("status", ["active", "draft", "archived"]).default("active").notNull(),
  isFeatured: int("isFeatured").default(0).notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 40 }).notNull().unique(),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 40 }).notNull(),
  customerAddress: text("customerAddress"),
  status: mysqlEnum("status", ["new", "confirmed", "shipping", "delivered", "cancelled"]).default("new").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "cod", "refunded"]).default("pending").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0.00").notNull(),
  deliveryFee: decimal("deliveryFee", { precision: 12, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).default("0.00").notNull(),
  referralCode: varchar("referralCode", { length: 60 }),
  referralMemberId: int("referralMemberId"),
  supplierOrderId: varchar("supplierOrderId", { length: 120 }),
  dropshipStatus: varchar("dropshipStatus", { length: 60 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 220 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).default("0.00").notNull(),
  costPrice: decimal("costPrice", { precision: 12, scale: 2 }).default("0.00").notNull(),
});

export const inventoryTransactions = mysqlTable("inventoryTransactions", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  type: mysqlEnum("type", ["receive", "issue", "adjustment", "return"]).notNull(),
  quantity: int("quantity").notNull(),
  source: varchar("source", { length: 120 }),
  reference: varchar("reference", { length: 120 }),
  note: text("note"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const commissionSettings = mysqlTable("commissionSettings", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  value: decimal("value", { precision: 8, scale: 2 }).notNull(),
  unit: mysqlEnum("unit", ["percentage", "fixed"]).default("percentage").notNull(),
  description: text("description"),
  updatedBy: int("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const commissionLedger = mysqlTable("commissionLedger", {
  id: int("id").autoincrement().primaryKey(),
  memberId: int("memberId").notNull(),
  orderId: int("orderId"),
  saleAmount: decimal("saleAmount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  commissionAmount: decimal("commissionAmount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  period: varchar("period", { length: 7 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "paid"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const financeEntries = mysqlTable("financeEntries", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["capital", "revenue", "cost", "expense", "salary", "commission", "withdrawal"]).notNull(),
  description: varchar("description", { length: 220 }).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  reference: varchar("reference", { length: 120 }),
  entryDate: timestamp("entryDate").defaultNow().notNull(),
  createdBy: int("createdBy"),
});

export const customerReviews = mysqlTable("customerReviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  orderId: int("orderId"),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  rating: int("rating").default(5).notNull(),
  comment: text("comment"),
  imageUrl: text("imageUrl"),
  discountGranted: decimal("discountGranted", { precision: 8, scale: 2 }).default("0.00").notNull(),
  status: mysqlEnum("status", ["pending", "published", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  actorId: int("actorId"),
  actorName: varchar("actorName", { length: 160 }),
  action: varchar("action", { length: 120 }).notNull(),
  entity: varchar("entity", { length: 120 }).notNull(),
  entityId: int("entityId"),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const dropshipWebhookEvents = mysqlTable("dropshipWebhookEvents", {
  id: int("id").autoincrement().primaryKey(),
  provider: varchar("provider", { length: 80 }).notNull(),
  eventId: varchar("eventId", { length: 180 }).notNull().unique(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  orderNumber: varchar("orderNumber", { length: 40 }),
  supplierOrderId: varchar("supplierOrderId", { length: 120 }),
  status: varchar("status", { length: 60 }),
  payload: text("payload").notNull(),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type Order = typeof orders.$inferSelect;
