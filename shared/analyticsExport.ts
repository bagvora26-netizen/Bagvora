type PerformanceRow = {
  name: string;
  employeeCode: string;
  role: string;
  orders: number;
  sales: number;
  commissions: number;
};

const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] ?? character));

export function buildPerformanceExcelHtml(rows: PerformanceRow[]) {
  const roleLabels: Record<string, string> = { marketer: "مسوّق", employee: "موظف", admin: "مدير" };
  const body = rows.map(row => `<tr><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.employeeCode)}</td><td>${escapeHtml(roleLabels[row.role] ?? row.role)}</td><td>${row.orders}</td><td>${row.sales.toFixed(2)}</td><td>${row.commissions.toFixed(2)}</td></tr>`).join("");
  return `<!doctype html><html lang="ar"><head><meta charset="UTF-8"></head><body dir="rtl"><table border="1"><thead><tr><th>الاسم</th><th>الكود</th><th>الدور</th><th>عدد الطلبات</th><th>إجمالي المبيعات</th><th>عمولات المسوقين</th></tr></thead><tbody>${body || "<tr><td colspan=\"6\">لا توجد بيانات</td></tr>"}</tbody></table></body></html>`;
}
