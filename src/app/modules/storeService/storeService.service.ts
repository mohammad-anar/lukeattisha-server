import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (operatorId: string, payload: any) => {
  const { storeId, serviceIds } = payload;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });
  if (!store) {
    throw new ApiError(404, 'Store not found');
  }
  if (store.operatorId !== operatorId) {
    throw new ApiError(403, 'You are not authorized to perform this action');
  }

  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
  });
  if (services.length !== serviceIds.length) {
    throw new ApiError(404, 'One or more services not found');
  }

  const existingServices = await prisma.storeService.findMany({
    where: {
      storeId,
      serviceId: { in: serviceIds },
    },
  });

  if (existingServices.length > 0) {
    throw new ApiError(400, 'One or more services already exist in the store');
  }

  const data = serviceIds.map((serviceId: string) => ({
    storeId,
    serviceId,
  }));

  const result = await prisma.storeService.createMany({
    data,
  });
  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, userLat, userLng, categoryId, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ['name', 'description'].map((field) => ({
        service: {
          [field]: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      })),
    });
  }

  if (categoryId) {
    andConditions.push({
      service: {
        categoryId: categoryId,
      },
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

  const whereConditions: Prisma.StoreServiceWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  let result;
  let total;

  if (userLat && userLng) {
    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);
    let searchString = searchTerm ? `%${searchTerm}%` : null;

    result = await prisma.$queryRaw`
      SELECT ss.*, 
             row_to_json(s.*) as service,
             row_to_json(st.*) as store,
             ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat)) as distance_meters,
             ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat)) / 1609.34 as "distanceMile"
      FROM "StoreService" ss
      LEFT JOIN "Service" s ON ss."serviceId" = s.id
      LEFT JOIN "Store" st ON ss."storeId" = st.id
      WHERE 1 = 1
      ${searchTerm ? Prisma.sql`AND (s.name ILIKE ${searchString} OR s.description ILIKE ${searchString})` : Prisma.empty}
      ${categoryId ? Prisma.sql`AND s."categoryId" = ${categoryId}` : Prisma.empty}
      ORDER BY distance_meters ASC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const totalResult: any = await prisma.$queryRaw`
      SELECT COUNT(ss.id)::int as count FROM "StoreService" ss
      LEFT JOIN "Service" s ON ss."serviceId" = s.id
      LEFT JOIN "Store" st ON ss."storeId" = st.id
      WHERE 1 = 1
      ${searchTerm ? Prisma.sql`AND (s.name ILIKE ${searchString} OR s.description ILIKE ${searchString})` : Prisma.empty}
      ${categoryId ? Prisma.sql`AND s."categoryId" = ${categoryId}` : Prisma.empty}
    `;
    total = totalResult[0]?.count || 0;
  } else {
    result = await prisma.storeService.findMany({
      where: whereConditions,
      skip,
      take: limit,
      include: {
        service: {
          select: {
            id: true,
            serviceId: true,
            name: true,
            basePrice: true,
            description: true,
            image: true,
            category: true,
            categoryId: true,
            serviceAddons: true,
            storeServices: true,
            isActive: true,
            operatorId: true,
            operator: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        store: true,

      },
      orderBy:
        sortBy && sortOrder
          ? { [sortBy]: sortOrder }
          : { createdAt: 'desc' },
    });
    total = await prisma.storeService.count({ where: whereConditions });
  }

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getAllByStoreId = async (storeId: string) => {
  const result = await prisma.storeService.findMany({
    where: { storeId: storeId },
    include: {
      service: true,
      store: true,
    },
  });
  return result;
};

const getAllByOperatorId = async (operatorId: string) => {
  const result = await prisma.storeService.findMany({
    where: { store: { operatorId } },
    include: {
      service: true,
      store: true,
    },
  });
  return result;
};

const getById = async (id: string) => {
  const result = await prisma.storeService.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'StoreService not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.storeService.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.storeService.delete({
    where: { id },
  });
  return result;
};

export const StoreServiceService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  getAllByStoreId,
  getAllByOperatorId,
};
