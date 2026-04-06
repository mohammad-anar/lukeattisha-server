import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (payload: any) => {
  const { serviceIds, ...bundleData } = payload;

  const result = await prisma.bundle.create({
    data: {
      ...bundleData,

      bundleServices: {
        create: serviceIds.map((serviceId: string) => ({
          serviceId,
        })),
      },
    },
    include: {
      bundleServices: true,
    },
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

  const whereConditions: Prisma.BundleWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  let result;
  let total;

  if (userLat && userLng) {
    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);

    // Raw SQL to handle PostGIS distance sorting
    result = await prisma.$queryRaw`
      SELECT b.*, 
             MIN(ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat))) as distance_meters,
             MIN(ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat))) / 1609.34 as "distanceMile",
             (MIN(ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat))) / 40000.0) * 60.0 as "estimatedTimeMinutes"
      FROM "Bundle" b
      LEFT JOIN "StoreBundle" sb ON b.id = sb."bundleId"
      LEFT JOIN "Store" st ON sb."storeId" = st.id
      WHERE b."isActive" = true
      GROUP BY b.id
      ORDER BY distance_meters ASC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const totalResult: any = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT b.id)::int as count 
      FROM "Bundle" b
      WHERE b."isActive" = true
    `;
    total = totalResult[0]?.count || 0;
  } else {
    result = await prisma.bundle.findMany({
      where: whereConditions,
      skip,
      take: limit,
      include: {
        bundleServices: {
          select: {
            serviceId: true,
            service: {
              select: {
                id: true,
                name: true,
                basePrice: true,
                image: true,
                description: true,
                category: true,
                operator: true,
                reviews: true,
                bundleServices: true,
                storeServices: true,
              }
            },
            store: true
          }
        }
      },
      orderBy:
        sortBy && sortOrder
          ? { [sortBy]: sortOrder }
          : { createdAt: 'desc' },
    });
    total = await prisma.bundle.count({ where: whereConditions });
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
  const result = await prisma.bundle.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'Bundle not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const { serviceIds, ...bundleData } = payload;

  const updateData: any = { ...bundleData };

  if (serviceIds) {
    updateData.bundleServices = {
      deleteMany: {},
      create: serviceIds.map((serviceId: string) => ({
        serviceId,
      })),
    };
  }

  const result = await prisma.bundle.update({
    where: { id },
    data: updateData,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.bundle.delete({
    where: { id },
  });
  return result;
};

export const BundleService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
