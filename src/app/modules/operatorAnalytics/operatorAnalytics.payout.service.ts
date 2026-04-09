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

  const wallet = await prisma.operatorWallet.findUnique({
    where: { operatorId },
  });

  if (!wallet) {
    return {
      meta: { total: 0, totalPages: 0, page, limit },
      data: [],
    };
  }

  const [transactions, total] = await Promise.all([
    prisma.operatorWalletTransaction.findMany({
      where: {
        walletId: wallet.id,
        type: 'WITHDRAWAL',
      },
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
      },
    }),
    prisma.operatorWalletTransaction.count({
      where: { walletId: wallet.id, type: 'WITHDRAWAL' },
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
      note: tx.note,
      payoutStatus: tx.withdrawal?.status ?? 'UNKNOWN',
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
