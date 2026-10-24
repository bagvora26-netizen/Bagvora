import { describe, expect, it } from "vitest";
import { categoryInputSchema, productInputSchema, teamMemberInputSchema } from "../shared/adminSchemas";

describe("admin form schemas", () => {
  it("accepts a complete product with size and image URL", () => {
    const result = productInputSchema.safeParse({
      sku: "BV-001",
      name: "حقيبة جلد",
      category: "جلود",
      size: "متوسط",
      sourceType: "local",
      imageUrl: "https://example.com/bag.jpg",
      costPrice: 400,
      sellingPrice: 650,
      stock: 10,
      minStock: 5,
      isFeatured: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing product code, invalid image URL, and invalid team email", () => {
    expect(productInputSchema.safeParse({ name: "حقيبة", category: "جلود", sourceType: "local", costPrice: 1, sellingPrice: 2, stock: 0 }).success).toBe(false);
    expect(productInputSchema.safeParse({ sku: "BV-001", name: "حقيبة", category: "جلود", sourceType: "local", imageUrl: "not-a-url", costPrice: 1, sellingPrice: 2, stock: 0 }).success).toBe(false);
    expect(teamMemberInputSchema.safeParse({ name: "موظف", email: "invalid", role: "employee", employeeCode: "EMP-1", commissionRate: 5 }).success).toBe(false);
  });

  it("accepts marketer role and preserves commission rate", () => {
    const result = teamMemberInputSchema.parse({ name: "مسوق BagVora", email: "marketer@example.com", phone: "01000000000", role: "marketer", employeeCode: "MK-1001", commissionRate: 7.5 });
    expect(result.role).toBe("marketer");
    expect(result.commissionRate).toBe(7.5);
  });

  it("requires bilingual category names and a safe slug", () => {
    expect(categoryInputSchema.safeParse({ nameAr: "حقائب", nameEn: "Bags", slug: "bags", descriptionAr: "وصف", descriptionEn: "Description" }).success).toBe(true);
    expect(categoryInputSchema.safeParse({ nameAr: "حقائب", nameEn: "Bags", slug: "حقائب" }).success).toBe(false);
  });
});
