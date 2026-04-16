import { OrderStatus } from '@prisma/client';
import { prisma } from '../../../helpers.ts/prisma.js';

/**
 * Helper to calculate stats for a specific date range.
 */
async function calculatePeriodStats(where: any, startDate: Date, endDate: Date) {
  const periodWhere = {
    ...where,
    createdAt: { gte: startDate, lte: endDate },
  };

  const [totalOrders, cancelledOrders, completedOrders, aggregateResult, orders] = await Promise.all([
    prisma.operatorOrder.count({ where: periodWhere }),
    prisma.operatorOrder.count({
      where: { ...periodWhere, order: { status: OrderStatus.CANCELLED } },
    }),
    prisma.operatorOrder.count({
      where: { ...periodWhere, order: { status: { in: [OrderStatus.DELIVERED, OrderStatus.READY_FOR_DELIVERY] } } },
    }),
    prisma.operatorOrder.aggregate({
      where: periodWhere,
      _avg: { subtotal: true },
    }),
    prisma.operatorOrder.findMany({
      where: periodWhere,
      select: { order: { select: { userId: true } } },
    }),
  ]);

  const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

  const userOrderCounts = new Map<string, number>();
  orders.forEach((o) => {
    const userId = o.order.userId;
    userOrderCounts.set(userId, (userOrderCounts.get(userId) || 0) + 1);
  });
  const uniqueUsers = Array.from(userOrderCounts.keys()).length;
  const repeatedUsers = Array.from(userOrderCounts.values()).filter((count) => count > 1).length;
  const repeatedCustomerRate = uniqueUsers > 0 ? (repeatedUsers / uniqueUsers) * 100 : 0;

  const ontimeCompletion = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
  const avgOrderValue = Number(aggregateResult._avg.subtotal || 0);

  return {
    cancellationRate,
    repeatedCustomerRate,
    ontimeCompletion,
    avgOrderValue,
  };
}

const getPerformanceMetrics = async (operatorId: string, storeId?: string) => {
  const where: any = { operatorId };
  if (storeId) where.storeId = storeId;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const currentWeek = await calculatePeriodStats(where, sevenDaysAgo, now);
  const previousWeek = await calculatePeriodStats(where, fourteenDaysAgo, sevenDaysAgo);

  const formatTrend = (current: number, previous: number, isPercentage = true) => {
    const change = current - previous;
    return {
      value: isPercentage ? parseFloat(current.toFixed(1)) : parseFloat(current.toFixed(2)),
      change: parseFloat(Math.abs(change).toFixed(isPercentage ? 1 : 2)),
      direction: change >= 0 ? 'up' : 'down',
    };
  };

  return {
    cancellationRate: formatTrend(currentWeek.cancellationRate, previousWeek.cancellationRate),
    repeatedCustomerRate: formatTrend(currentWeek.repeatedCustomerRate, previousWeek.repeatedCustomerRate),
    ontimeCompletion: formatTrend(currentWeek.ontimeCompletion, previousWeek.ontimeCompletion),
    averageTicket: formatTrend(currentWeek.avgOrderValue, previousWeek.avgOrderValue, false),
  };
};

export const OperatorAnalyticsPerformanceService = { getPerformanceMetrics };
