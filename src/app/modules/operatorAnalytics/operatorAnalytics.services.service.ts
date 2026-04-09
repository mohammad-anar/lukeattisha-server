import { prisma } from '../../../helpers.ts/prisma.js';
import { OrderStatus } from '@prisma/client';

// ─── Top Selling Services ──────────────────────────────────────────────────────
// For a given operator, group their OrderItems by serviceId,
// count total orders and completed orders, compute completion rate %.

const getTopServices = async (operatorId: string, limit = 10) => {
  // Fetch all order items for this operator with order status
  const orderItems = await prisma.orderItem.findMany({
    where: {
      operatorOrder: { operatorId },
      serviceId: { not: null },
    },
    select: {
      serviceId: true,
      serviceName: true,
      operatorOrder: {
        select: {
          order: { select: { status: true } },
        },
      },
    },
  });

  // Group by serviceId
  const serviceMap = new Map<
    string,
    { serviceId: string; serviceName: string; total: number; completed: number }
  >();

  for (const item of orderItems) {
    const sid = item.serviceId!;
    const orderStatus = item.operatorOrder.order.status;

    if (!serviceMap.has(sid)) {
      serviceMap.set(sid, {
        serviceId: sid,
        serviceName: item.serviceName,
        total: 0,
        completed: 0,
      });
    }

    const entry = serviceMap.get(sid)!;
    entry.total += 1;
    if (orderStatus === OrderStatus.COMPLETED) {
      entry.completed += 1;
    }
  }

  // Build result array and sort by total orders desc
  const result = Array.from(serviceMap.values())
    .map((s) => ({
      serviceId: s.serviceId,
      serviceName: s.serviceName,
      totalOrders: s.total,
      completedOrders: s.completed,
      completionRate:
        s.total > 0
          ? parseFloat(((s.completed / s.total) * 100).toFixed(2))
          : 0,
    }))
    .sort((a, b) => b.totalOrders - a.totalOrders)
    .slice(0, limit);

  return result;
};

export const OperatorAnalyticsServicesService = { getTopServices };
