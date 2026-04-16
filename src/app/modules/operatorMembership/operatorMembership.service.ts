import { prisma } from '../../../helpers.ts/prisma.js';

/**
 * Builds the base operator orders where clause filtering by operatorOrders relation.
 */
function buildBaseWhere(operatorId: string, startDate?: Date, endDate?: Date) {
  const dateFilter =
    startDate && endDate ? { gte: startDate, lte: endDate } : undefined;

  return {
    operatorOrders: {
      some: { operatorId },
    },
    ...(dateFilter ? { createdAt: dateFilter } : {}),
  };
}

/**
 * API 1: Membership vs Non-Membership order counts with trend vs last month.
 */
const getMembershipStats = async (
  operatorId: string,
  startDate?: Date,
  endDate?: Date,
) => {
  const now = new Date();
  const thisMonthStart = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = endDate || now;
  const lastMonthStart = new Date(thisMonthStart.getFullYear(), thisMonthStart.getMonth() - 1, 1);
  const lastMonthEnd = new Date(thisMonthStart.getFullYear(), thisMonthStart.getMonth(), 0);

  const baseCurrentWhere = buildBaseWhere(operatorId, thisMonthStart, thisMonthEnd);
  const baseLastWhere = buildBaseWhere(operatorId, lastMonthStart, lastMonthEnd);

  const [membershipCurrent, nonMembershipCurrent, membershipLast, nonMembershipLast] =
    await Promise.all([
      prisma.order.count({ where: { ...baseCurrentWhere, isSubscription: true } }),
      prisma.order.count({ where: { ...baseCurrentWhere, isSubscription: false } }),
      prisma.order.count({ where: { ...baseLastWhere, isSubscription: true } }),
      prisma.order.count({ where: { ...baseLastWhere, isSubscription: false } }),
    ]);

  const calcTrend = (curr: number, prev: number) => {
    if (prev === 0) return 0;
    return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
  };

  return {
    membershipOrders: {
      count: membershipCurrent,
      trend: calcTrend(membershipCurrent, membershipLast),
      direction: membershipCurrent >= membershipLast ? 'up' : 'down',
    },
    nonMembershipOrders: {
      count: nonMembershipCurrent,
      trend: calcTrend(nonMembershipCurrent, nonMembershipLast),
      direction: nonMembershipCurrent >= nonMembershipLast ? 'up' : 'down',
    },
  };
};

/**
 * API 2: Order Distribution - pie chart data for membership vs non-membership.
 */
const getOrderDistribution = async (
  operatorId: string,
  startDate?: Date,
  endDate?: Date,
) => {
  const baseWhere = buildBaseWhere(operatorId, startDate, endDate);

  const [membership, nonMembership] = await Promise.all([
    prisma.order.count({ where: { ...baseWhere, isSubscription: true } }),
    prisma.order.count({ where: { ...baseWhere, isSubscription: false } }),
  ]);

  const total = membership + nonMembership;

  return [
    {
      label: 'Membership Orders',
      value: membership,
      percentage: total > 0 ? Math.round((membership / total) * 100) : 0,
    },
    {
      label: 'Non-Membership Orders',
      value: nonMembership,
      percentage: total > 0 ? Math.round((nonMembership / total) * 100) : 0,
    },
  ];
};

/**
 * API 3: Orders Over Time - bar chart with monthly membership vs non-membership counts.
 * Returns last 6 months by default.
 */
const getOrdersOverTime = async (operatorId: string, months: number = 6) => {
  const now = new Date();
  const result = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const baseWhere = buildBaseWhere(operatorId, monthStart, monthEnd);

    const [membership, nonMembership] = await Promise.all([
      prisma.order.count({ where: { ...baseWhere, isSubscription: true } }),
      prisma.order.count({ where: { ...baseWhere, isSubscription: false } }),
    ]);

    result.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      membershipOrders: membership,
      nonMembershipOrders: nonMembership,
    });
  }

  return result;
};

/**
 * API 4: Order Summary Table - all operator orders with membership + ad flags.
 */
const getOrderSummary = async (operatorId: string, startDate?: Date, endDate?: Date) => {
  const baseWhere = buildBaseWhere(operatorId, startDate, endDate);

  const orders = await prisma.order.findMany({
    where: baseWhere,
    select: {
      id: true,
      orderNumber: true,
      isSubscription: true,
      isFromAd: true,
      adId: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      subtotal: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      ad: {
        select: {
          id: true,
          status: true,
          storeService: {
            select: {
              service: { select: { name: true } },
            },
          },
          storeBundle: {
            select: {
              bundle: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Aggregate summary rows
  const membershipOrders = orders.filter((o) => o.isSubscription);
  const nonMembershipOrders = orders.filter((o) => !o.isSubscription);

  const sumRevenue = (list: typeof orders) =>
    list.reduce((acc, o) => acc + Number(o.subtotal), 0);

  const avgOrderValue = (list: typeof orders) =>
    list.length > 0
      ? parseFloat((sumRevenue(list) / list.length).toFixed(2))
      : 0;

  const total = orders.length;
  const totalRevenue = sumRevenue(orders);

  const summary = [
    {
      type: 'Membership Orders',
      totalOrders: membershipOrders.length,
      percentage: total > 0 ? Math.round((membershipOrders.length / total) * 100) : 0,
      revenue: parseFloat(sumRevenue(membershipOrders).toFixed(2)),
      avgOrderValue: avgOrderValue(membershipOrders),
    },
    {
      type: 'Non-Membership Orders',
      totalOrders: nonMembershipOrders.length,
      percentage: total > 0 ? Math.round((nonMembershipOrders.length / total) * 100) : 0,
      revenue: parseFloat(sumRevenue(nonMembershipOrders).toFixed(2)),
      avgOrderValue: avgOrderValue(nonMembershipOrders),
    },
    {
      type: 'Total',
      totalOrders: total,
      percentage: 100,
      revenue: parseFloat(totalRevenue.toFixed(2)),
      avgOrderValue: avgOrderValue(orders),
    },
  ];

  return { orders, summary };
};

export const OperatorMembershipService = {
  getMembershipStats,
  getOrderDistribution,
  getOrdersOverTime,
  getOrderSummary,
};
