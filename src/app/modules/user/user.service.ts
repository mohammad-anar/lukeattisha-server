import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'config/index.js';
import { generateCustomId } from 'helpers.ts/idGenerator.js';
import { StripeHelpers } from 'helpers.ts/stripeHelpers.js';

const create = async (payload: any) => {
  const result = await prisma.user.create({
    data: payload,
  });
  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, role, ...filterData } = filters;

  const andConditions = [];

  // Default to USER role if no role is specifically provided in filters
  const targetRole = role || 'USER';
  andConditions.push({ role: targetRole });

  if (searchTerm) {
    andConditions.push({
      OR: ["name", "email", "phone"].map((field) => ({
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

  const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.user.count({ where: whereConditions });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const createAdmin = async (payload: any, creatorId: string) => {
  const hashedPassword = await bcrypt.hash(payload.password, Number(config.bcrypt_salt_round));
  const customUserId = await generateCustomId('USER');

  const result = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true, // Manual creation by Super Admin
      createdById: creatorId,
      userId: customUserId,
    },
  });
  return result;
};

const createOperator = async (payload: any, creatorId: string) => {
  const { storeName, address, city, country, ...userData } = payload;
  const hashedPassword = await bcrypt.hash(userData.password, Number(config.bcrypt_salt_round));
  const customUserId = await generateCustomId('USER');

  // Create Stripe Connect Account
  const stripeConnectId = await StripeHelpers.createConnectAccount(userData.email);
  const onboardingLink = await StripeHelpers.generateAccountOnboardingLink(stripeConnectId);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: 'OPERATOR',
        isVerified: true, // Manual creation by Super Admin
        createdById: creatorId,
        userId: customUserId,
      }
    });

    const operator = await tx.operator.create({
      data: {
        userId: user.id,
        stripeConnectedAccountId: stripeConnectId,
        onboardingUrl: onboardingLink.url,
      }
    });

    if (storeName) {
      await tx.store.create({
        data: {
          operatorId: operator.id,
          name: storeName,
          address: address || "Pending",
          city: city || "Pending",
          country: country || "Pending",
        }
      });
    }

    return user;
  });

  return result;
};

const getById = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'User not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.user.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.user.delete({
    where: { id },
  });
  return result;
};

export const UserService = {
  create,
  createAdmin,
  createOperator,
  getAll,
  getById,
  update,
  deleteById,
};
