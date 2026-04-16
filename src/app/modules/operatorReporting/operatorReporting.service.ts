import { OrderStatus } from '@prisma/client';
import { prisma } from '../../../helpers.ts/prisma.js';

/**
 * Helper to calculate stats for a specific date range.
 */
async function getSummaryForPeriod(where: any, startDate?: Date, endDate?: Date) {
  const periodWhere = { ...where };
  if (startDate && endDate) {
    periodWhere.createdAt = { gte: startDate, lte: endDate };
  }

  const now = new Date();

  const [total, completed, pending, delayed] = await Promise.all([
    // Total
    prisma.operatorOrder.count({ where: periodWhere }),
    // Completed
    prisma.operatorOrder.count({
      where: { ...periodWhere, order: { status: OrderStatus.DELIVERED } },
    }),
    // Pending (Active but not delivered/cancelled)
    prisma.operatorOrder.count({
      where: {
        ...periodWhere,
        order: {
          status: {
            in: [
              OrderStatus.PENDING,
              OrderStatus.PROCESSING,
              OrderStatus.OUT_FOR_PICKUP,
              OrderStatus.PICKED_UP,
              OrderStatus.RECEIVED_BY_STORE,
              OrderStatus.IN_PROGRESS,
              OrderStatus.READY_FOR_DELIVERY,
              OrderStatus.OUT_FOR_DELIVERY,
            ],
          },
        },
      },
    }),
    // Delayed (Pending and scheduledDate passed)
    prisma.operatorOrder.count({
      where: {
        ...periodWhere,
        order: {
          status: {
            in: [
              OrderStatus.PENDING,
              OrderStatus.PROCESSING,
              OrderStatus.OUT_FOR_PICKUP,
              OrderStatus.PICKED_UP,
              OrderStatus.RECEIVED_BY_STORE,
              OrderStatus.IN_PROGRESS,
              OrderStatus.READY_FOR_DELIVERY,
              OrderStatus.OUT_FOR_DELIVERY,
            ],
          },
          scheduledDate: { lt: now },
        },
      },
    }),
  ]);

  return { total, completed, pending, delayed };
}

const getStats = async (operatorId: string, storeId?: string) => {
  const where: any = { operatorId };
  if (storeId) where.storeId = storeId;

  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const prev7DaysStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const current = await getSummaryForPeriod(where, last7Days, now);
  const previous = await getSummaryForPeriod(where, prev7DaysStart, last7Days);

  const formatTrend = (curr: number, prev: number) => {
    const diff = curr - prev;
    const percent = prev > 0 ? (diff / prev) * 100 : 0;
    return {
      value: curr,
      trend: parseFloat(Math.abs(percent).toFixed(1)),
      direction: diff >= 0 ? 'up' : 'down',
    };
  };

  return {
    totalOrders: formatTrend(current.total, previous.total),
    completedOrders: formatTrend(current.completed, previous.completed),
    pendingOrders: formatTrend(current.pending, previous.pending),
    delayedOrders: formatTrend(current.delayed, previous.delayed),
  };
};

const getWeeklyChart = async (operatorId: string, storeId?: string) => {
  const where: any = { operatorId };
  if (storeId) where.storeId = storeId;

  const now = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }

  const chartData = await Promise.all(
    days.map(async (date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const count = await prisma.operatorOrder.count({
        where: {
          ...where,
          createdAt: { gte: date, lt: nextDay },
        },
      });

      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      return { day: dayName, count };
    }),
  );

  return chartData;
};

const getStatusDistribution = async (operatorId: string, storeId?: string) => {
  const where: any = { operatorId };
  if (storeId) where.storeId = storeId;

  // Get all possible statuses
  const statuses = Object.values(OrderStatus);

  // Fetch counts for all statuses
  const distribution = await Promise.all(
    statuses.map(async (status) => {
      const count = await prisma.operatorOrder.count({
        where: {
          ...where,
          order: { status },
        },
      });
      return { label: status, value: count };
    }),
  );

  const total = distribution.reduce((acc, curr) => acc + curr.value, 0);

  return distribution.map((item) => ({
    ...item,
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
  }));
};

const getPerformanceSummary = async (operatorId: string, storeId?: string) => {
  const where: any = { operatorId };
  if (storeId) where.storeId = storeId;

  // 1. Efficiency Rate (Delivered / Total)
  const [total, delivered] = await Promise.all([
    prisma.operatorOrder.count({ where }),
    prisma.operatorOrder.count({
      where: { ...where, order: { status: OrderStatus.DELIVERED } },
    }),
  ]);
  const efficiencyRate = total > 0 ? (delivered / total) * 100 : 0;

  // 2. Customer Satisfaction (Average Review Rating)
  // We need to find reviews for services that belong to this operator's stores
  const reviews = await prisma.review.aggregate({
    where: {
      OR: [
        { service: { store: { operatorId } } },
        { bundle: { store: { operatorId } } },
      ],
      ...(storeId
        ? {
            OR: [
              { service: { storeId } },
              { bundle: { storeId } },
            ],
          }
        : {}),
    },
    _avg: { rating: true },
    _count: { id: true },
  });
  const avgRating = reviews._avg?.rating || 0;
  const reviewCount = reviews._count?.id || 0;

  // 3. Revenue Impact (Total sum of subtotal)
  const revenue = await prisma.operatorOrder.aggregate({
    where,
    _sum: { subtotal: true },
  });
  const totalRevenue = Number(revenue._sum.subtotal || 0);

  // Growth/Trend for revenue (checking this month vs last month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const currentMonthRevenue = await prisma.operatorOrder.aggregate({
    where: { ...where, createdAt: { gte: startOfMonth } },
    _sum: { subtotal: true },
  });
  const prevMonthRevenue = await prisma.operatorOrder.aggregate({
    where: { ...where, createdAt: { gte: startOfPrevMonth, lt: startOfMonth } },
    _sum: { subtotal: true },
  });

  const currRevVal = Number(currentMonthRevenue._sum.subtotal || 0);
  const prevRevVal = Number(prevMonthRevenue._sum.subtotal || 0);
  const revDiff = currRevVal - prevRevVal;
  const revTrend = prevRevVal > 0 ? (revDiff / prevRevVal) * 100 : 0;

  return {
    efficiencyRate: {
      value: parseFloat(efficiencyRate.toFixed(1)),
      label: 'Efficiency Rate',
      subtext: 'Completed vs assigned ratio',
    },
    customerSatisfaction: {
      value: parseFloat(avgRating.toFixed(1)),
      label: 'Customer Satisfaction',
      subtext: `Based on ${reviewCount} reviews`,
    },
    revenueImpact: {
      value: totalRevenue,
      label: 'Revenue Impact',
      trend: parseFloat(Math.abs(revTrend).toFixed(1)),
      direction: revTrend >= 0 ? 'up' : 'down',
      subtext: 'Total subtotal processed',
    },
  };
};

export const OperatorReportingService = {
  getStats,
  getWeeklyChart,
  getStatusDistribution,
  getPerformanceSummary,
};
