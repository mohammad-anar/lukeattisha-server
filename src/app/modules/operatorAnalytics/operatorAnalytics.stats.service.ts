import { prisma } from '../../../helpers.ts/prisma.js';
import { OrderStatus } from '@prisma/client';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Calculate the next payout date based on the platform payout schedule.
 * schedule: 'daily' (24 hours) or 'weekly' (7 days) — read from AdminSetting
 */
function calcNextPayoutDate(schedule: string): Date {
  const now = new Date();
  if (schedule === 'daily') {
    const next = new Date(now);
    next.setDate(now.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    return next;
  }
  // Default: weekly — next Monday
  const next = new Date(now);
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  next.setDate(now.getDate() + daysUntilMonday);
  next.setHours(0, 0, 0, 0);
  return next;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

const getStats = async (operatorId: string) => {
  const now = new Date();
  const monthStart = startOfMonth(now);

  // Fetch admin payout schedule setting
  const adminSetting = await prisma.adminSetting.findFirst();
  const payoutSchedule = adminSetting?.payoutSchedule ?? 'weekly';

  // Operator's wallet
  const wallet = await prisma.operatorWallet.findUnique({
    where: { operatorId },
  });

  // ── Operator orders (this month) ────────────────────────────────────────────
  const [
    totalOrders,
    processingOrders,
    outForDeliveryOrders,
    completedOrders,
    allOperatorOrders,
  ] = await Promise.all([
    // Total orders this month
    prisma.operatorOrder.count({
      where: { operatorId, createdAt: { gte: monthStart } },
    }),
    // Processing = PICKED_UP or PROCESSING
    prisma.operatorOrder.count({
      where: {
        operatorId,
        order: { status: { in: [OrderStatus.PROCESSING, OrderStatus.PICKED_UP] } },
        createdAt: { gte: monthStart },
      },
    }),
    // Out for delivery = READY_FOR_DELIVERY
    prisma.operatorOrder.count({
      where: {
        operatorId,
        order: { status: OrderStatus.READY_FOR_DELIVERY },
        createdAt: { gte: monthStart },
      },
    }),
    // Completed this month
    prisma.operatorOrder.count({
      where: {
        operatorId,
        order: { status: OrderStatus.COMPLETED },
        createdAt: { gte: monthStart },
      },
    }),
    // All operator orders this month with subtotal + transferAmount
    prisma.operatorOrder.findMany({
      where: { operatorId, createdAt: { gte: monthStart } },
      select: { subtotal: true, transferAmount: true },
    }),
  ]);

  // ── Revenue calculations ─────────────────────────────────────────────────────
  // Gross Revenue = sum of subtotals (before commission)
  const grossRevenue = allOperatorOrders.reduce(
    (sum, o) => sum + Number(o.subtotal),
    0,
  );

  // Net Payout = sum of transferAmount (what operator actually receives)
  const netPayout = allOperatorOrders.reduce(
    (sum, o) => sum + Number(o.transferAmount),
    0,
  );

  // Platform commission = grossRevenue - netPayout
  const platformCommission = grossRevenue - netPayout;

  // Total revenue = same as gross revenue (operator perspective)
  const totalRevenue = grossRevenue;

  // ── Next payout ──────────────────────────────────────────────────────────────
  // Next payout amount = current wallet balance (pending disbursement)
  const nextPayoutAmount = Number(wallet?.balance ?? 0);
  const nextPayoutDate = calcNextPayoutDate(payoutSchedule);

  return {
    totalOrders,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    processingOrders,
    outForDeliveryOrders,
    completedOrders,
    grossRevenue: parseFloat(grossRevenue.toFixed(2)),
    platformCommission: parseFloat(platformCommission.toFixed(2)),
    netPayout: parseFloat(netPayout.toFixed(2)),
    walletBalance: parseFloat(nextPayoutAmount.toFixed(2)),
    nextPayout: {
      amount: parseFloat(nextPayoutAmount.toFixed(2)),
      scheduledDate: nextPayoutDate,
      schedule: payoutSchedule,
    },
  };
};

export const OperatorAnalyticsStatsService = { getStats };
