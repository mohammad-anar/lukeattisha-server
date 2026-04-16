import { OrderStatus } from '@prisma/client';
import { prisma } from '../../../helpers.ts/prisma.js';

/**
 * Get statistics for operator orders.
 * @param operatorId - The ID of the operator.
 * @param storeId - Optional store ID to filter by.
 */
const getStats = async (operatorId: string, storeId?: string) => {
  const where: any = { operatorId };
  if (storeId) where.storeId = storeId;

  // Total orders assigned to this operator/store
  const totalOrders = await prisma.operatorOrder.count({ where });

  // Cancelled orders
  const cancelledOrders = await prisma.operatorOrder.count({
    where: {
      ...where,
      order: { status: OrderStatus.CANCELLED },
    },
  });

  // Completed orders
  const completedOrders = await prisma.operatorOrder.count({
    where: {
      ...where,
      order: { status: OrderStatus.DELIVERED },
    },
  });

  // 1. Cancellation Rate
  const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

  // 2. Repeated Customer Rate
  const orders = await prisma.operatorOrder.findMany({
    where,
    select: {
      order: {
        select: { userId: true },
      },
    },
  });

  const userOrderCounts = new Map<string, number>();
  orders.forEach((o) => {
    const userId = o.order.userId;
    userOrderCounts.set(userId, (userOrderCounts.get(userId) || 0) + 1);
  });

  const uniqueUsers = Array.from(userOrderCounts.keys()).length;
  const repeatedUsers = Array.from(userOrderCounts.values()).filter((count) => count > 1).length;
  const repeatedCustomerRate = uniqueUsers > 0 ? (repeatedUsers / uniqueUsers) * 100 : 0;

  // 3. Ontime Completion
  // For now, we'll treat all delivered orders as on time unless there's more specific data.
  // We can calculate this more accurately if we have a deadline vs delivery comparison.
  const ontimeCompletion = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  // 4. Average Order Value (A suited stat for this API)
  const aggregateResult = await prisma.operatorOrder.aggregate({
    where,
    _avg: {
      subtotal: true,
    },
  });
  const avgOrderValue = aggregateResult._avg.subtotal || 0;

  return {
    totalOrders,
    cancellationRate: parseFloat(cancellationRate.toFixed(2)),
    repeatedCustomerRate: parseFloat(repeatedCustomerRate.toFixed(2)),
    ontimeCompletion: parseFloat(ontimeCompletion.toFixed(2)),
    avgOrderValue: parseFloat(Number(avgOrderValue).toFixed(2)),
  };
};

/**
 * Get newly placed orders for the operator, optionally filtered by store.
 * @param operatorId - The ID of the operator.
 * @param storeId - Optional store ID to filter by.
 */
const getNewlyPlacedOrders = async (operatorId: string, storeId?: string) => {
  const where: any = {
    operatorId,
    order: {
      status: OrderStatus.PENDING,
    },
  };
  if (storeId) where.storeId = storeId;

  const orders = await prisma.operatorOrder.findMany({
    where,
    include: {
      order: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          pickupAddress: true,
          deliveryAddress: true,
        },
      },
      items: {
        include: {
          orderAddons: {
            include: { addon: true },
          },
        },
      },
      store: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders;
};

export const OperatorOrdersService = {
  getStats,
  getNewlyPlacedOrders,
};
