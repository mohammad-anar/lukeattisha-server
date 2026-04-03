import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (payload: any) => {
  const result = await prisma.service.create({
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
      OR: ["name", "description"].map((field) => ({
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

  const whereConditions: Prisma.ServiceWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  let result;
  let total;

  if (userLat && userLng) {
    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);

    // Raw SQL to handle PostGIS distance sorting
    // We join with StoreService and Store to find the minimum distance to any store offering this service
    result = await prisma.$queryRaw`
      SELECT s.*, 
             MIN(ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat))) as distance_meters,
             MIN(ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat))) / 1609.34 as "distanceMile",
             (MIN(ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat))) / 40000.0) * 60.0 as "estimatedTimeMinutes"
      FROM "Service" s
      LEFT JOIN "StoreService" ss ON s.id = ss."serviceId"
      LEFT JOIN "Store" st ON ss."storeId" = st.id
      WHERE s."isDeleted" = false
      GROUP BY s.id
      ORDER BY distance_meters ASC
      LIMIT ${limit} OFFSET ${skip}
    `;
    
    const totalResult: any = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT s.id)::int as count 
      FROM "Service" s
      WHERE s."isDeleted" = false
    `;
    total = totalResult[0]?.count || 0;
  } else {
    result = await prisma.service.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy:
        sortBy && sortOrder
          ? { [sortBy]: sortOrder }
          : { createdAt: 'desc' },
    });
    total = await prisma.service.count({ where: whereConditions });
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

const getById = async (id: string) => {
  const result = await prisma.service.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'Service not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.service.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.service.delete({
    where: { id },
  });
  return result;
};

export const ServiceService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
