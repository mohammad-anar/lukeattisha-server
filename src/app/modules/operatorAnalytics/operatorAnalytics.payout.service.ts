import { prisma } from '../../../helpers.ts/prisma.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';

// ─── Payout History ───────────────────────────────────────────────────────────
// Reads from OperatorWalletTransaction where type = WITHDRAWAL
// A "hook" call — recordPayoutEvent() — should be called after any payout dispatch
// so that the history is always up to date.

/**
 * Hook: Call this from anywhere a payout is triggered to ensure the
 * OperatorWalletTransaction record exists. Idempotent — only inserts if
 * no transaction already references this withdrawalId.
 */
const recordPayoutEvent = async (payload: {
  operatorId: string;
  walletId: string;
  withdrawalId: string;
  amount: number;
  note?: string;
}) => {
  const { operatorId, walletId, withdrawalId, amount, note } = payload;

  // Only insert if not already recorded
  const existing = await prisma.operatorWalletTransaction.findFirst({
    where: { withdrawalId },
  });
  if (existing) return existing;

  return prisma.operatorWalletTransaction.create({
    data: {
      walletId,
      operatorId,
      amount,
      type: 'WITHDRAWAL',
      withdrawalId,
      note: note ?? `Payout of $${amount}`,
    },
  });
};

/**
 * GET payout history for an operator.
 * Returns all WITHDRAWAL transactions from OperatorWalletTransaction
 * joined with Withdrawal status, paginated and sorted newest-first.
 */
const getPayoutHistory = async (
  operatorId: string,
  options: Record<string, any>,
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { storeId } = options;

  const wallet = await prisma.operatorWallet.findUnique({
    where: { operatorId },
  });

  if (!wallet) {
    return {
      meta: { total: 0, totalPages: 0, page, limit },
      data: [],
    };
  }

  // Filtering Logic:
  // 1. If storeId is provided → show earnings (ORDER_REVENUE) filtered by that store.
  // 2. If no storeId         → show withdrawals (WITHDRAWAL) across all stores.
  const whereConditions: any = {
    walletId: wallet.id,
  };

  if (storeId) {
    whereConditions.type = { in: ['ORDER_REVENUE', 'REFUND'] };
    whereConditions.order = {
      operatorOrders: {
        some: { storeId, operatorId },
      },
    };
  } else {
    whereConditions.type = 'WITHDRAWAL';
  }

  const [transactions, total] = await Promise.all([
    prisma.operatorWalletTransaction.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        withdrawal: {
          select: {
            id: true,
            amount: true,
            status: true,
            stripeTransferId: true,
            createdAt: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
          },
        },
      },
    }),
    prisma.operatorWalletTransaction.count({
      where: whereConditions,
    }),
  ]);

  return {
    meta: {
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    },
    data: transactions.map((tx) => ({
      transactionId: tx.id,
      amount: Number(tx.amount),
      type: tx.type,
      note: tx.note,
      orderNumber: tx.order?.orderNumber ?? null,
      payoutStatus: tx.withdrawal?.status ?? (tx.type === 'ORDER_REVENUE' ? 'COMPLETED' : 'UNKNOWN'),
      stripeTransferId: tx.withdrawal?.stripeTransferId ?? null,
      createdAt: tx.createdAt,
      withdrawalId: tx.withdrawalId,
    })),
  };
};

export const OperatorAnalyticsPayoutService = {
  recordPayoutEvent,
  getPayoutHistory,
};
