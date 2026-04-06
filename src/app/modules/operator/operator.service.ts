import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';
import { StripeHelpers } from '../../../helpers.ts/stripeHelpers.js';

const create = async (payload: any) => {
  const result = await prisma.operator.create({
    data: payload,
  });
  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["operatorId"].map((field) => ({
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

  const whereConditions: Prisma.OperatorWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.operator.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true, avatar: true } }
    }
  });
  const total = await prisma.operator.count({ where: whereConditions });

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
  const result = await prisma.operator.findUnique({
    where: { id },
    include: { user: true, stores: true, operatorWallet: true }
  });
  if (!result) {
    throw new ApiError(404, 'Operator not found');
  }
  return result;
};

const setupConnectAccount = async (id: string) => {
  const operator = await getById(id);
  const user = operator.user;

  // 1. Create Connect Account in Stripe if they don't have one
  let connectId = operator.stripeConnectedAccountId;
  if (!connectId) {
    connectId = await StripeHelpers.createConnectAccount(user.email);
  }

  // 2. Generate Link
  const onboardingLink = await StripeHelpers.generateAccountOnboardingLink(connectId);

  // 3. Save Connect ID and Link locally
  const result = await prisma.operator.update({
    where: { id },
    data: { 
      stripeConnectedAccountId: connectId,
      onboardingUrl: onboardingLink.url 
    },
  });

  return { operator: result, onboardingLink: onboardingLink.url };
};

const verifyOnboardingStatus = async (id: string) => {
  const operator = await getById(id);
  if (!operator.stripeConnectedAccountId) {
    throw new ApiError(400, "Stripe Connect account not created yet.");
  }

  // Fetch actual status from Stripe
  const status = await StripeHelpers.getAccountStatus(operator.stripeConnectedAccountId);
  
  // Update local record
  const result = await prisma.operator.update({
    where: { id },
    data: { 
      onboardingComplete: status.details_submitted 
    },
  });

  return { operator: result, stripeStatus: status };
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.operator.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.operator.delete({
    where: { id },
  });
  return result;
};

export const OperatorService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  setupConnectAccount,
  verifyOnboardingStatus,
};
