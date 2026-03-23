import { prisma } from "src/helpers.ts/prisma.js";
import { PayoutStatus } from "@prisma/client";

const createPayout = async (
  operatorId: string,
  walletId: string,
  amount: number,
) => {
  return prisma.payout.create({
    data: { operatorId, walletId, amount, status: PayoutStatus.PENDING },
  });
};

const getPayoutsByOperator = async (operatorId: string) => {
  return prisma.payout.findMany({ where: { operatorId } });
};

const updatePayoutStatus = async (id: string, status: PayoutStatus) => {
  return prisma.payout.update({ where: { id }, data: { status } });
};

export const PayoutService = {
  createPayout,
  getPayoutsByOperator,
  updatePayoutStatus,
};
