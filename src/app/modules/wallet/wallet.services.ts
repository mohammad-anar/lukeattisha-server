
import { TransactionType, TransactionStatus } from "@prisma/client";
import { prisma } from "helpers.ts/prisma.js";

const getWalletByUser = async (userId: string) => {
  return await prisma.wallet.findUnique({ where: { userId } });
};

const addFunds = async (userId: string, amount: number) => {
  const wallet = await getWalletByUser(userId);
  if (!wallet) throw new Error("Wallet not found");

  const updatedWallet = await prisma.wallet.update({
    where: { userId },
    data: { balance: Number(wallet.balance) + amount },
  });

  await prisma.transaction.create({
    data: {
      userId,
      walletId: wallet.id,
      amount,
      type: TransactionType.CREDIT,
      status: TransactionStatus.COMPLETED,
    },
  });

  return updatedWallet;
};

const deductFunds = async (userId: string, amount: number) => {
  const wallet = await getWalletByUser(userId);
  if (!wallet || Number(wallet.balance) < amount)
    throw new Error("Insufficient funds");

  const updatedWallet = await prisma.wallet.update({
    where: { userId },
    data: { balance: Number(wallet.balance) - amount },
  });

  await prisma.transaction.create({
    data: {
      userId,
      walletId: wallet.id,
      amount,
      type: TransactionType.DEBIT,
      status: TransactionStatus.COMPLETED,
    },
  });

  return updatedWallet;
};

export const WalletService = { getWalletByUser, addFunds, deductFunds };
