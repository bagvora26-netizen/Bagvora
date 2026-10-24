import { describe, expect, it } from "vitest";
import { buildInventoryExcelHtml, buildOrdersExcelHtml, filterOrdersForReport } from "../shared/reportExport";

describe("orders and inventory Excel exports", () => {
  it("includes order status, payment status, referral code, and customer data", () => {
    const html = buildOrdersExcelHtml([{ orderNumber: "BV-1", customerName: "عميل & BagVora", customerPhone: "01000000000", total: "650", status: "delivered", paymentStatus: "cod", referralCode: "MK-1", createdAt: "2026-10-21T10:00:00Z" }]);
    expect(html).toContain("حالة الطلب");
    expect(html).toContain("تم التسليم");
    expect(html).toContain("دفع عند الاستلام");
    expect(html).toContain("عميل &amp; BagVora");
  });

  it("marks low inventory and includes product source and reorder level", () => {
    const html = buildInventoryExcelHtml([{ sku: "BV-1", name: "حقيبة", category: "جلود", sourceType: "local", stock: 2, minStock: 5, sellingPrice: 300, status: "active" }]);
    expect(html).toContain("حالة المخزون");
    expect(html).toContain("مخزون منخفض");
    expect(html).toContain("السوق المحلي");
    expect(html).toContain("300.00");
  });

  it("shows an empty row for empty order and inventory reports", () => {
    expect(buildOrdersExcelHtml([])).toContain("لا توجد طلبات");
    expect(buildInventoryExcelHtml([])).toContain("لا توجد منتجات");
  });

  it("filters orders by inclusive date range and status", () => {
    const rows = [
      { orderNumber: "BV-1", customerName: "أ", customerPhone: "1", total: 100, status: "delivered", paymentStatus: "paid", referralCode: null, createdAt: "2026-10-01T08:00:00Z" },
      { orderNumber: "BV-2", customerName: "ب", customerPhone: "2", total: 200, status: "new", paymentStatus: "pending", referralCode: null, createdAt: "2026-10-15T08:00:00Z" },
      { orderNumber: "BV-3", customerName: "ج", customerPhone: "3", total: 300, status: "delivered", paymentStatus: "paid", referralCode: null, createdAt: "2026-11-01T08:00:00Z" },
    ];
    expect(filterOrdersForReport(rows, { dateFrom: "2026-10-01", dateTo: "2026-10-31", status: "delivered" }).map(row => row.orderNumber)).toEqual(["BV-1"]);
    expect(filterOrdersForReport(rows, { status: "all" })).toHaveLength(3);
  });
});
