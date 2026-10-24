type SaleOrder = {
  status: string;
  total: string | number | null;
  referralMemberId: number | null;
};

type CommissionEntry = {
  memberId: number;
  saleAmount: string | number | null;
  commissionAmount: string | number | null;
};

type TeamMember = {
  id: number;
  name: string;
  role: string;
  employeeCode: string;
  commissionRate: string | number | null;
};

const amount = (value: string | number | null | undefined) => Number(value ?? 0);

export function aggregatePerformance(orders: SaleOrder[], commissions: CommissionEntry[], members: TeamMember[]) {
  const completedOrders = orders.filter(order => order.status !== "cancelled");
  const totalSales = completedOrders.reduce((sum, order) => sum + amount(order.total), 0);
  const totalCommissions = commissions.reduce((sum, entry) => sum + amount(entry.commissionAmount), 0);

  const memberPerformance = members
    .map(member => {
      const memberOrders = completedOrders.filter(order => order.referralMemberId === member.id);
      const memberCommissions = commissions.filter(entry => entry.memberId === member.id);
      return {
        id: member.id,
        name: member.name,
        role: member.role,
        employeeCode: member.employeeCode,
        commissionRate: amount(member.commissionRate),
        sales: memberOrders.reduce((sum, order) => sum + amount(order.total), 0),
        commissions: memberCommissions.reduce((sum, entry) => sum + amount(entry.commissionAmount), 0),
        orders: memberOrders.length,
      };
    })
    .sort((a, b) => b.sales - a.sales || b.commissions - a.commissions);

  return { totalSales, totalCommissions, totalOrders: completedOrders.length, memberPerformance };
}
