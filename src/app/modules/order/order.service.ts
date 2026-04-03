import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';
import { StripeHelpers } from '../../../helpers.ts/stripeHelpers.js';
import { config } from '../../../config/index.js';

const create = async (payload: any) => {
  const { userId, storeId, totalAmount, ...rest } = payload;

  // 1. Fetch Store and verify operator connection status
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { operator: true }
  });

  if (!store) {
    throw new ApiError(404, "Store not found.");
  }

  // STRICT CHECK: Prevent order if operator hasn't connected Stripe
  if (!store.operator.stripeConnectedAccountId || !store.operator.onboardingComplete) {
    throw new ApiError(400, "Store is currently not accepting payments. (Operator Stripe onboarding incomplete).");
  }

  // 2. ECONOMICS: Calculate platform fee and operator amount using config
  const feePercent = config.economics.platform_fee_percent;
  const totalInCents = Math.round(Number(totalAmount) * 100);
  const platformFeeInCents = Math.round(totalInCents * (feePercent / 100));
  const operatorAmountInCents = totalInCents - platformFeeInCents;

  const platformFee = platformFeeInCents / 100;
  const operatorAmount = operatorAmountInCents / 100;

  // 3. Create local Order record
  const orderNumber = `ORD-${Date.now()}`;
  const result = await prisma.order.create({
    data: {
      ...rest,
      orderNumber,
      userId,
      storeId,
      totalAmount,
      platformFee,
      operatorAmount,
      status: "PENDING",
      paymentStatus: "UNPAID",
    },
  });

  // 4. Generate Stripe Payment URL
  const paymentUrl = await StripeHelpers.createOrderPaymentSession(
    result.id,
    Number(totalAmount), // full subtotal
    0, // delivery fee if not in subtotal
    platformFee, // our commission
    userId,
    store.operator.stripeConnectedAccountId
  );

  return { order: result, paymentUrl };
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["orderNumber"].map((field) => ({
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

  const whereConditions: Prisma.OrderWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.order.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      store: { select: { name: true } },
    }
  });
  const total = await prisma.order.count({ where: whereConditions });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getById = async (id: string) => {
  const result = await prisma.order.findUnique({
    where: { id },
    include: { 
      orderItems: true, 
      payments: true,
      user: { select: { name: true, email: true, phone: true } },
      store: { select: { name: true, address: true, lat: true, lng: true } }
    }
  });
  if (!result) {
    throw new ApiError(404, 'Order not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.order.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.order.delete({
    where: { id },
  });
  return result;
};

export const OrderService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
