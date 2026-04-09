import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';
import { OperatorService } from '../operator/operator.service.js';

const calculateDistanceInMiles = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const create = async (payload: any) => {
  if (payload.operatorId) {
    await OperatorService.assertPaymentActivated(payload.operatorId);
  }
  const result = await prisma.store.create({
    data: payload,
  });
  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, userLat, userLng, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["name", "address", "city"].map((field) => ({
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

  const whereConditions: Prisma.StoreWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.store.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      operator: { select: { user: { select: { name: true, email: true, phone: true, avatar: true } } } },
    },
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.store.count({ where: whereConditions });

  return {
    meta: {
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    },
    data: result.map((store: any) => {
      if (userLat && userLng && store.lat && store.lng) {
        return {
          ...store,
          distanceMile: calculateDistanceInMiles(
            parseFloat(userLat),
            parseFloat(userLng),
            store.lat,
            store.lng
          ),
        };
      }
      return store;
    }),
  };
};
const getByOperatorId = async (filters: any, options: any, operatorId: string) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, isActive, userLat, userLng, ...filterData } = filters;

  const andConditions: any[] = [{ operatorId }];

  if (searchTerm) {
    andConditions.push({
      OR: ["name", "address", "city"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (isActive !== undefined) {
    andConditions.push({
      isActive: isActive === 'true' || isActive === true,
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

  const whereConditions: Prisma.StoreWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.store.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: { operator: { select: { user: { select: { name: true, email: true, phone: true, avatar: true } } } } },
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.store.count({ where: whereConditions });

  return {
    meta: {
      total,
      totalPage: Math.ceil(total / limit),
      page,
      limit,
    },
    data: result.map((store: any) => {
      if (userLat && userLng && store.lat && store.lng) {
        return {
          ...store,
          distanceMile: calculateDistanceInMiles(
            parseFloat(userLat),
            parseFloat(userLng),
            store.lat,
            store.lng
          ),
        };
      }
      return store;
    }),
  };
};


const getById = async (id: string) => {
  const result = await prisma.store.findUnique({
    where: { id },
    include: {
      operator: { select: { user: { select: { name: true, email: true, phone: true, avatar: true } } } },
      _count: true,
    }
  });
  if (!result) {
    throw new ApiError(404, 'Store not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  const store = await prisma.store.findUnique({
    where: { id },
    include: { operator: true }
  });

  if (!store) {
    throw new ApiError(404, 'Store not found');
  }

  // Business Validation: Prevent store activation if onboarding is not complete
  // if (payload.isActive === true) {
  //   if (!store.operator.onboardingComplete) {
  //     throw new ApiError(400, "Cannot activate store. Please complete Stripe onboarding first.");
  //   }
  // }

  const result = await prisma.store.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.store.delete({
    where: { id },
  });
  return result;
};

export const StoreService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  getByOperatorId
};
