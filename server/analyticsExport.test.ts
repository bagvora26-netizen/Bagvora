import { describe, expect, it } from "vitest";
import { buildPerformanceExcelHtml } from "../shared/analyticsExport";

describe("performance Excel export", () => {
  it("creates an Arabic Excel-compatible table with sales and commissions", () => {
    const html = buildPerformanceExcelHtml([{ name: "سارة & فريق", employeeCode: "MK-1", role: "marketer", orders: 3, sales: 1250, commissions: 93.75 }]);
    expect(html).toContain("إجمالي المبيعات");
    expect(html).toContain("عمولات المسوقين");
    expect(html).toContain("سارة &amp; فريق");
    expect(html).toContain("93.75");
  });

  it("includes an empty-state row when there is no performance data", () => {
    expect(buildPerformanceExcelHtml([])).toContain("لا توجد بيانات");
  });
});
