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

  const [totalOrders, cancelledOrders, completedOrders, aggregateResult] = await Promise.all([
    prisma.operatorOrder.count({ where }),
    prisma.operatorOrder.count({
      where: { ...where, order: { status: OrderStatus.CANCELLED } },
    }),
    prisma.operatorOrder.count({
      where: { ...where, order: { status: OrderStatus.DELIVERED } },
    }),
    prisma.operatorOrder.aggregate({
      where,
      _avg: { subtotal: true },
    }),
  ]);

  const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;
  const ontimeCompletion = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
  const avgOrderValue = aggregateResult._avg.subtotal || 0;

  return {
    totalOrders,
    cancellationRate: parseFloat(cancellationRate.toFixed(2)),
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
