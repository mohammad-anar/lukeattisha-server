import { prisma } from '../../../helpers.ts/prisma.js';

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// ─── Monthly Revenue Chart ─────────────────────────────────────────────────────
// filter: '3' | '6' | '12'
// Returns: monthly buckets with operator's transferAmount only (net revenue)
// y-axis: amount   x-axis: month label e.g. "Apr 2026"

const getMonthlyRevenue = async (
  operatorId: string,
  filter: '3' | '6' | '12',
  storeId?: string,
) => {
  const months = parseInt(filter) as 3 | 6 | 12;
  const now = new Date();
  const results: { month: string; revenue: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date  = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end   = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    // Sum transferAmount (net payout) for operator's orders in this month
    // storeId lives on Order (new relation) — filter via order: { storeId }
    const agg = await prisma.operatorOrder.aggregate({
      where: {
        operatorId,
        createdAt: { gte: start, lte: end },
        ...(storeId ? { storeId } : {}),
      },
      _sum: { transferAmount: true },
    });

    const label = `${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`;
    results.push({
      month: label,
      revenue: parseFloat(Number(agg._sum.transferAmount ?? 0).toFixed(2)),
    });
  }

  return { filter: `last ${filter} months`, data: results };
};

export const OperatorAnalyticsRevenueService = { getMonthlyRevenue };
