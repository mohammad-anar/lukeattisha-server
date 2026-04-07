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

const getAllUsers = async (filters: any, options: any) => {
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
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      addresses: true,
      isDeleted: true,
      status: true,
      lat: true,
      lng: true,
      stripeCustomerId: true,
      isSubscribed: true,
      userId: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          orders: true,
        },
      },
      orders: {
        select: {
          payments: {
            where: {
              status: 'PAID',
            },
            select: {
              amount: true,
            },
          },
        },
      },
    },

    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });

  const userData = result.map((user: any) => {
    const totalOrders = user._count?.orders || 0;
    const totalSpent = user.orders?.reduce((acc: number, order: any) => {
      const orderPaidAmount = order.payments?.reduce(
        (pAcc: number, payment: any) => pAcc + Number(payment.amount),
        0
      ) || 0;
      return acc + orderPaidAmount;
    }, 0) || 0;

    const avgOrderValue = totalOrders > 0 ? Number((totalSpent / totalOrders).toFixed(2)) : 0;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { orders, _count, ...userWithoutRelations } = user;

    return {
      ...userWithoutRelations,
      totalSpent: Number(totalSpent.toFixed(2)),
      totalOrders,
      avgOrderValue,
    };
  });

  const total = await prisma.user.count({ where: whereConditions });



  return {
    meta: {
      total,
      totalPage: Math.ceil(total / limit),
      page,
      limit,
    },
    data: userData,
  };
};
const getAllAdmins = async (filters: any, options: any) => {
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
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      addresses: true,
      isDeleted: true,
      lat: true,
      lng: true,
      isTwoFactorEnabled: true,
      adminWallet: true,
      createdBy: true,

      createdById: true,
      stripeCustomerId: true,
      isSubscribed: true,
      userId: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,

    },

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
const getAllOperators = async (filters: any, options: any) => {
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
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      addresses: true,
      isDeleted: true,
      lat: true,
      lng: true,
      stripeCustomerId: true,
      isSubscribed: true,
      userId: true,
      operatorProfile: {
        select: {
          id: true,
          stores: true,
          userId: true,
          operatorId: true,
          approvalStatus: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              stores: true,
              services: true,
              bundles: true

            }
          }
        }
      },

      isTwoFactorEnabled: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,

    },

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
      isVerified: true,
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
        isVerified: true,
        createdById: creatorId,
        userId: customUserId,
      }
    });

    const operator = await tx.operator.create({
      data: {
        userId: user.id,
        stripeConnectedAccountId: stripeConnectId,
        approvalStatus: 'APPROVED',
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

// approve operator
const approveOperator = async (id: string) => {
  const result = await prisma.user.update({
    where: { id },
    data: {
      operatorProfile: {
        update: {
          approvalStatus: 'APPROVED',
        },
      },
    },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      addresses: true,
      isDeleted: true,
      lat: true,
      lng: true,
      isTwoFactorEnabled: true,
      adminWallet: true,
      operatorProfile: true,
      createdBy: true,
      createdById: true,
      stripeCustomerId: true,
      isSubscribed: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  return result;
};

const getById = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      addresses: true,
      isDeleted: true,
      status: true,
      lat: true,
      lng: true,
      isTwoFactorEnabled: true,
      adminWallet: true,
      createdBy: true,
      createdById: true,
      stripeCustomerId: true,
      isSubscribed: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          orders: true,
        },
      },
      orders: {
        select: {
          payments: {
            where: {
              status: 'PAID',
            },
            select: {
              amount: true,
            },
          },
        },
      },
    },
  });

  // 1. Check if result exists FIRST
  if (!result) {
    throw new ApiError(404, 'User not found');
  }

  // 2. Process the single object (No .map() needed)
  const user = result as any;
  const totalOrders = user._count?.orders || 0;
  const totalSpent =
    user.orders?.reduce((acc: number, order: any) => {
      const orderPaidAmount =
        order.payments?.reduce(
          (pAcc: number, payment: any) => pAcc + Number(payment.amount),
          0
        ) || 0;
      return acc + orderPaidAmount;
    }, 0) || 0;

  const avgOrderValue = totalOrders > 0 ? Number((totalSpent / totalOrders).toFixed(2)) : 0;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { orders, _count, ...userWithoutRelations } = user;

  const userData = {
    ...userWithoutRelations,
    totalSpent: Number(totalSpent.toFixed(2)),
    totalOrders,
    avgOrderValue,
  };

  // 3. Return the transformed data
  return userData;
};


const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.user.update({
    where: { id },
    data: payload,
  });
  return result;
};

const banUser = async (id: string) => {
  const user = await getById(id);
  const result = await prisma.user.update({
    where: { id },
    data: { status: 'BANNED' },
  });
  return result;
};

const unbanUser = async (id: string) => {
  const user = await getById(id);
  const result = await prisma.user.update({
    where: { id },
    data: { status: 'ACTIVE' },
  });
  return result;
};

const getMe = async (id: string, role: string) => {
  let result;
  if (role === 'USER') {
    result = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        addresses: true,
        isDeleted: true,
        lat: true,
        lng: true,
        isTwoFactorEnabled: true,
        userSubscriptions: {
          include: { plan: true },
          where: { status: 'ACTIVE' },
        },
        stripeCustomerId: true,
        isSubscribed: true,
        userId: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  } else if (role === 'OPERATOR') {
    result = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        addresses: true,
        isDeleted: true,
        lat: true,
        lng: true,
        isTwoFactorEnabled: true,
        operatorProfile: {
          include: {
            stores: true,
            operatorWallet: true,
          },
        },
        stripeCustomerId: true,
        isSubscribed: true,
        userId: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    result = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        addresses: true,
        isDeleted: true,
        lat: true,
        lng: true,
        isTwoFactorEnabled: true,
        adminWallet: true,
        createdBy: true,
        createdById: true,
        stripeCustomerId: true,
        isSubscribed: true,
        userId: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      }

    });
  } else {
    result = await prisma.user.findUnique({
      where: { id },
    });
  }

  if (!result) {
    throw new ApiError(404, 'User not found');
  }
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.user.update({
    where: { id },
    data: { isDeleted: true },
  });
  return result;
};
const revertDelete = async (id: string) => {
  await getById(id);
  const result = await prisma.user.update({
    where: { id },
    data: { isDeleted: false },
  });
  return result;
};

export const UserService = {
  create,
  createAdmin,
  createOperator,
  approveOperator,
  getAllUsers,
  getAllOperators,
  getAllAdmins,
  getById,
  getMe,
  update,
  banUser,
  unbanUser,
  deleteById,
  revertDelete,
};
