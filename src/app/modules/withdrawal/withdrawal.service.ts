import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';
import { config } from '../../../config/index.js';

const create = async (payload: { operatorId: string, amount: number }) => {
  const { operatorId, amount } = payload;
  const minPayout = config.economics.min_payout || 50;

  if (amount < minPayout) {
    throw new ApiError(400, `Minimum withdrawal amount is $${minPayout}`);
  }

  const operator = await prisma.operator.findUnique({
    where: { id: operatorId },
    include: { operatorWallet: true },
  });

  if (!operator) throw new ApiError(404, "Operator not found.");
  if (!operator.stripeAccountId || operator.stripeAccountStatus !== 'ACTIVE') {
    throw new ApiError(400, "Please complete Stripe onboarding before requesting withdrawals.");
  }

  if (!operator.operatorWallet || Number(operator.operatorWallet.balance) < amount) {
    throw new ApiError(400, "Insufficient wallet balance.");
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Deduct from wallet balance
    const wallet = await tx.operatorWallet.update({
      where: { operatorId },
      data: { balance: { decrement: amount } },
    });

    // 2. Create withdrawal record
    const withdrawal = await tx.withdrawal.create({
      data: {
        operatorId,
        amount,
        status: "HELD_IN_ESCROW",
      },
    });

    // 3. Create wallet transaction record
    await tx.operatorWalletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: "WITHDRAWAL",
        withdrawalId: withdrawal.id,
        note: `Withdrawal request of $${amount} (Held in escrow)`,
      },
    });

    return withdrawal;
  });

  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: [].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.WithdrawalWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.withdrawal.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.withdrawal.count({ where: whereConditions });

  return {
    meta: {
      total,
      totalPage: Math.ceil(total / limit),
      page,
      limit,
    },
    data: result,
  };
};

const getById = async (id: string) => {
  const result = await prisma.withdrawal.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'Withdrawal not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.withdrawal.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.withdrawal.delete({
    where: { id },
  });
  return result;
};

export const WithdrawalService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
