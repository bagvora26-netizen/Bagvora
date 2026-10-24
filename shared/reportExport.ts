export type OrderRow = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: string | number | null;
  status: string;
  paymentStatus: string;
  referralCode: string | null;
  createdAt: string | Date | null;
};

export type OrderReportFilters = { dateFrom?: string; dateTo?: string; status?: string };

export function filterOrdersForReport(rows: OrderRow[], filters: OrderReportFilters) {
  const from = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
  const to = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59.999`).getTime() : Number.POSITIVE_INFINITY;
  return rows.filter(row => {
    const createdAt = new Date(row.createdAt ?? 0).getTime();
    return createdAt >= from && createdAt <= to && (!filters.status || filters.status === "all" || row.status === filters.status);
  });
}

type InventoryRow = {
  sku: string;
  name: string;
  category: string;
  sourceType: string;
  stock: number;
  minStock: number;
  sellingPrice: string | number | null;
  status: string;
};

const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] ?? character));
const amount = (value: string | number | null | undefined) => Number(value ?? 0).toFixed(2);
const dateValue = (value: string | Date | null | undefined) => value ? new Date(value).toLocaleString("ar-EG") : "";
const orderStatuses: Record<string, string> = { new: "جديد", confirmed: "مؤكد", shipping: "قيد الشحن", delivered: "تم التسليم", cancelled: "ملغى" };
const paymentStatuses: Record<string, string> = { pending: "معلق", paid: "مدفوع", cod: "دفع عند الاستلام", refunded: "مسترد" };
const sourceLabels: Record<string, string> = { handmade: "صناعة يدوية", china: "الصين", local: "السوق المحلي", dropship: "دروبشيبنج" };

export function buildOrdersExcelHtml(rows: OrderRow[]) {
  const body = rows.map(row => `<tr><td>${escapeHtml(row.orderNumber)}</td><td>${escapeHtml(row.customerName)}</td><td>${escapeHtml(row.customerPhone)}</td><td>${amount(row.total)}</td><td>${escapeHtml(orderStatuses[row.status] ?? row.status)}</td><td>${escapeHtml(paymentStatuses[row.paymentStatus] ?? row.paymentStatus)}</td><td>${escapeHtml(row.referralCode ?? "")}</td><td>${escapeHtml(dateValue(row.createdAt))}</td></tr>`).join("");
  return `<!doctype html><html lang="ar"><head><meta charset="UTF-8"></head><body dir="rtl"><table border="1"><thead><tr><th>رقم الطلب</th><th>العميل</th><th>الهاتف</th><th>الإجمالي</th><th>حالة الطلب</th><th>حالة الدفع</th><th>كود الإحالة</th><th>تاريخ الطلب</th></tr></thead><tbody>${body || "<tr><td colspan=\"8\">لا توجد طلبات</td></tr>"}</tbody></table></body></html>`;
}

export function buildInventoryExcelHtml(rows: InventoryRow[]) {
  const body = rows.map(row => { const inventoryStatus = row.stock <= row.minStock ? "مخزون منخفض" : "متوفر"; return `<tr><td>${escapeHtml(row.sku)}</td><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.category)}</td><td>${escapeHtml(sourceLabels[row.sourceType] ?? row.sourceType)}</td><td>${row.stock}</td><td>${row.minStock}</td><td>${inventoryStatus}</td><td>${amount(row.sellingPrice)}</td><td>${escapeHtml(row.status === "active" ? "نشط" : row.status)}</td></tr>`; }).join("");
  return `<!doctype html><html lang="ar"><head><meta charset="UTF-8"></head><body dir="rtl"><table border="1"><thead><tr><th>الكود</th><th>المنتج</th><th>التصنيف</th><th>المصدر</th><th>الكمية الحالية</th><th>حد إعادة الطلب</th><th>حالة المخزون</th><th>سعر البيع</th><th>حالة المنتج</th></tr></thead><tbody>${body || "<tr><td colspan=\"9\">لا توجد منتجات</td></tr>"}</tbody></table></body></html>`;
}
