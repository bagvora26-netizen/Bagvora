import { z } from "zod";

export const productInputSchema = z.object({
  sku: z.string().min(2),
  name: z.string().min(2),
  category: z.string().min(2),
  size: z.string().max(80).optional(),
  description: z.string().optional(),
  sourceType: z.enum(["china", "handmade", "local", "dropship"]),
  sourceName: z.string().optional(),
  imageUrl: z.string().url().optional(),
  costPrice: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative().default(5),
  isFeatured: z.number().int().min(0).max(1).default(0),
});

export const teamMemberInputSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(["admin", "employee", "marketer"]),
  employeeCode: z.string().min(2),
  permissions: z.array(z.enum(["products", "orders", "inventory", "commissions", "finance"])).default([]),
  commissionRate: z.number().nonnegative(),
});

export const categoryInputSchema = z.object({
  nameAr: z.string().min(2).max(120),
  nameEn: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).regex(/^[a-z0-9-]+$/),
  descriptionAr: z.string().max(500).optional(),
  descriptionEn: z.string().max(500).optional(),
});
