import { describe, expect, it } from "vitest";
import { aggregatePerformance } from "../shared/analytics";

describe("dashboard performance analytics", () => {
  it("totals non-cancelled sales and commissions per member", () => {
    const result = aggregatePerformance(
      [
        { status: "delivered", total: "1000", referralMemberId: 1 },
        { status: "confirmed", total: 500, referralMemberId: 2 },
        { status: "cancelled", total: "900", referralMemberId: 1 },
      ],
      [
        { memberId: 1, saleAmount: "1000", commissionAmount: "75" },
        { memberId: 2, saleAmount: 500, commissionAmount: 25 },
      ],
      [
        { id: 1, name: "سارة", role: "marketer", employeeCode: "MK-1", commissionRate: "7.5" },
        { id: 2, name: "أحمد", role: "employee", employeeCode: "EMP-2", commissionRate: 5 },
      ],
    );

    expect(result.totalSales).toBe(1500);
    expect(result.totalCommissions).toBe(100);
    expect(result.totalOrders).toBe(2);
    expect(result.memberPerformance[0]).toMatchObject({ name: "سارة", sales: 1000, commissions: 75, orders: 1 });
  });

  it("returns an empty performance list without team members", () => {
    expect(aggregatePerformance([], [], [])).toEqual({ totalSales: 0, totalCommissions: 0, totalOrders: 0, memberPerformance: [] });
  });
});
