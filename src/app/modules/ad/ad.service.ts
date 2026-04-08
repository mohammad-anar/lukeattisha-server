import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (payload: any) => {
  const { operatorId, serviceId, bundleId } = payload;

  const now = new Date();

  // Find an active subscription for this operator
  const activeSubscription = await prisma.adSubscription.findFirst({
    where: {
      operatorId,
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });

  if (!activeSubscription) {
    throw new ApiError(403, "No active Ad Subscription found for this operator. Please purchase a plan first.");
  }

  const result = await prisma.ad.create({
    data: {
      operatorId,
      serviceId,
      bundleId,
      subscriptionId: activeSubscription.id,
      status: "PENDING", // Admins might need to approve the ad content
    },
  });

  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, userLat, userLng, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    // Ad usually doesn't have a name/description directly, but it might have links
    // For now we skip searchTerm unless specific fields are added
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

  const whereConditions: Prisma.AdWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  let result;
  let total;

  if (userLat && userLng) {
    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);

    // Raw SQL to handle PostGIS distance sorting for Ads based on operator stores
    result = await prisma.$queryRaw`
       SELECT a.*, 
              MIN(ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat))) as distance_meters,
              MIN(ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat))) / 1609.34 as "distanceMile",
              (MIN(ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat))) / 40000.0) * 60.0 as "estimatedTimeMinutes"
       FROM "Ad" a
       JOIN "AdSubscription" ads ON a."subscriptionId" = ads.id
       LEFT JOIN "Store" st ON a."operatorId" = st."operatorId"
       WHERE a."status" = 'ACTIVE' 
         AND ads."status" = 'ACTIVE' 
         AND ads."endDate" > NOW()
       GROUP BY a.id
       ORDER BY distance_meters ASC
       LIMIT ${limit} OFFSET ${skip}
     `;
     
     const totalResult: any = await prisma.$queryRaw`
       SELECT COUNT(DISTINCT a.id)::int as count 
       FROM "Ad" a
       JOIN "AdSubscription" ads ON a."subscriptionId" = ads.id
       WHERE a."status" = 'ACTIVE'
         AND ads."status" = 'ACTIVE' 
         AND ads."endDate" > NOW()
     `;
    total = totalResult[0]?.count || 0;
  } else {
    const now = new Date();
    const finalWhere: Prisma.AdWhereInput = {
      ...whereConditions,
      status: 'ACTIVE',
      subscription: {
        status: 'ACTIVE',
        endDate: { gt: now }
      }
    };
    result = await prisma.ad.findMany({
      where: finalWhere,
      skip,
      take: limit,
      orderBy:
        sortBy && sortOrder
          ? { [sortBy]: sortOrder }
          : { createdAt: 'desc' },
      include: {
        subscription: true,
        operator: true
      }
    });
    total = await prisma.ad.count({ where: finalWhere });
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
  const result = await prisma.ad.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'Ad not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.ad.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.ad.delete({
    where: { id },
  });
  return result;
};

export const AdService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
