import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';
import { OperatorService } from '../operator/operator.service.js';

const create = async (payload: any) => {
  const { addonIds, ...serviceData } = payload;

  if (serviceData.operatorId) {
    await OperatorService.assertPaymentActivated(serviceData.operatorId);
  }

  const result = await prisma.service.create({
    data: serviceData,
  });

  if (addonIds && addonIds.length > 0) {
    const addons = addonIds.map((addonId: string) => ({
      serviceId: result.id,
      addonId: addonId,
    }));
    await prisma.serviceAddon.createMany({
      data: addons,
    });
  }

  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, userLat, userLng, ...filterData } = filters;

  // 1. Build standard Prisma conditions for the non-raw query
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      OR: ["name", "description"].map((field) => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
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

    // 2. Handle Raw SQL with dynamic WHERE clause
    // If you need complex search terms in Raw SQL, you must append them to the query string.

    let searchString = searchTerm ? `%${searchTerm}%` : null;

    result = await prisma.$queryRaw`
      SELECT s.*, 
             MIN(ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat))) as distance_meters,
             MIN(ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat))) / 1609.34 as "distanceMile"
      FROM "Service" s
      LEFT JOIN "StoreService" ss ON s.id = ss."serviceId"
      LEFT JOIN "Store" st ON ss."storeId" = st.id
      WHERE 1 = 1
      ${searchTerm ? Prisma.sql`AND (s.name ILIKE ${searchString} OR s.description ILIKE ${searchString})` : Prisma.empty}
      GROUP BY s.id
      ORDER BY distance_meters ASC
      LIMIT ${limit} OFFSET ${skip}
    `;

    // Note: For total count in raw SQL, ensure it matches your filters
    const totalResult: any = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT s.id)::int as count FROM "Service" s 
      WHERE 1 = 1
      ${searchTerm ? Prisma.sql`AND (s.name ILIKE ${searchString} OR s.description ILIKE ${searchString})` : Prisma.empty}
    `;
    total = totalResult[0]?.count || 0;

  } else {
    // 3. Standard Prisma query (Already works fine)
    result = await prisma.service.findMany({
      where: whereConditions,
      skip,
      take: limit,
      include: {
        category: true,
        serviceAddons:true,
        // ... rest of your includes
      },
      orderBy: sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
    });
    total = await prisma.service.count({ where: whereConditions });
  }

  return {
    meta: { total, page, limit },
    data: result,
  };
};

const getById = async (id: string) => {
  const result = await prisma.service.findUnique({
    where: { id },
    include: {
      operator: true,
      category: true,
      ads: true,
      storeServices: true,
      serviceAddons: {
        include: {
          addon: true,
        },
      },
    },
  });
  if (!result) {
    throw new ApiError(404, 'Service not found');
  }
  return result;
};

const getByOperatorId = async (id: string) => {
  const result = await prisma.service.findMany({
    where: { operatorId: id },
    include: {
      operator: true,
      category: true,
      ads: true,
      storeServices: true,
      serviceAddons: {
        include: {
          addon: true,
        },
      },
    },
  });
  if (!result) {
    throw new ApiError(404, 'Service not found');
  }
  return result;
};

// assign addons to service
const assignAddons = async (operatorId: string, payload: any) => {
  console.log(operatorId, payload);
  const service = await prisma.service.findUnique({
    where: { id: payload.serviceId, operatorId: operatorId },
  });
  if (!service) {
    throw new ApiError(401, 'You are not authorized to assign addons to this service');
  }

  const addons = payload.addonIds.map((addonId: string) => ({
    serviceId: payload.serviceId,
    addonId: addonId,
  }));
  const result = await prisma.serviceAddon.createMany({
    data: addons,
  });
  return result;
};

const update = async (id: string, payload: any) => {
  const { addonIds, ...updateData } = payload;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update the core service data
    const updatedService = await tx.service.update({
      where: { id },
      data: updateData,
    });

    // 2. If addonIds are provided, sync them
    if (addonIds) {
      await tx.serviceAddon.deleteMany({
        where: { serviceId: id },
      });

      if (addonIds.length > 0) {
        await tx.serviceAddon.createMany({
          data: addonIds.map((addonId: string) => ({
            serviceId: id,
            addonId: addonId,
          })),
        });
      }
    }

    return updatedService;
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
  getByOperatorId,
  update,
  assignAddons,
  deleteById,
};
