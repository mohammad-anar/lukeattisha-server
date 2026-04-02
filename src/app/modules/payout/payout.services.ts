
import { PayoutStatus, TransactionType, TransactionStatus } from "@prisma/client";
import { prisma } from "helpers.ts/prisma.js";
import { createStripeTransfer } from "helpers.ts/stripeHelpers.js";
import ApiError from "errors/ApiError.js";
import httpStatus from "http-status";

/**
 * Request a payout from the operator wallet
 */
const createPayout = async (
  operatorId: string,
  walletId: string,
  amount: number,
) => {
  const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
  if (!wallet) throw new ApiError(httpStatus.NOT_FOUND, "Wallet not found");

  if (Number(wallet.balance) < amount) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient wallet balance");
  }

  const operator = await prisma.operatorProfile.findUnique({
    where: { id: operatorId },
  });

  if (!operator?.stripeConnectId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "No Connected Stripe Account found for this operator. Please complete onboarding.",
    );
  }

  return await prisma.payout.create({
    data: { operatorId, walletId, amount, status: PayoutStatus.PENDING },
  });
};

const getPayoutsByOperator = async (operatorId: string) => {
  return prisma.payout.findMany({
    where: { operatorId },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Admin approves or marks payout as PAID
 * This triggers the actual Stripe Transfer
 */
const updatePayoutStatus = async (id: string, status: PayoutStatus) => {
  const payout = await prisma.payout.findUnique({
    where: { id },
    include: { operator: true },
  });

  if (!payout) throw new ApiError(httpStatus.NOT_FOUND, "Payout not found");

  // If already processed, don't repeat
  if (payout.status === PayoutStatus.PAID) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payout is already completed");
  }

  if (status === PayoutStatus.PAID) {
    const { stripeConnectId } = payout.operator;
    if (!stripeConnectId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No connected Stripe ID found.");
    }

    // 1. Trigger Stripe Transfer
    await createStripeTransfer(
      Number(payout.amount), 
      stripeConnectId, 
      {
        payoutId: payout.id,
        operatorId: payout.operatorId,
      },
      { idempotencyKey: payout.id }
    );

    // 2. Update Database (Wallet and Status)
    return await prisma.$transaction(async (tx) => {
      // Deduct from wallet
      await tx.wallet.update({
        where: { id: payout.walletId },
        data: { balance: { decrement: payout.amount } },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: payout.walletId,
          userId: payout.operator.userId,
          amount: payout.amount,
          type: TransactionType.PAYOUT,
          status: TransactionStatus.COMPLETED,
        },
      });

      return await tx.payout.update({
        where: { id },
        data: { status: PayoutStatus.PAID },
      });
    });
  }

  return prisma.payout.update({ where: { id }, data: { status } });
};

export const PayoutService = {
  createPayout,
  getPayoutsByOperator,
  updatePayoutStatus,
};
