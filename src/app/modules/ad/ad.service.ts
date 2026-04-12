import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';
import { AdSubscriptionService } from '../adSubscription/adSubscription.service.js';

const create = async (payload: any) => {
  const { operatorId, serviceId, bundleId, planId } = payload;

  const now = new Date();

  // Check if an active Ad already exists for this operator
  const existingActiveAd = await prisma.ad.findFirst({
    where: {
      operatorId,
      status: "ACTIVE",
      subscription: {
        status: "ACTIVE",
        endDate: { gte: now }
      }
    }
  });

  if (existingActiveAd) {
    throw new ApiError(400, "You already have an active ad. Only one active ad is permitted at a time.");
  }

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
    if (!planId) {
      throw new ApiError(400, "No active Ad Subscription found. Please provide a planId to purchase a subscription.");
    }
    // Generate subscription checkout session
    const checkoutResult = await AdSubscriptionService.createCheckoutSession(operatorId, { planId });
    return {
      type: 'PAYMENT_REQUIRED',
      checkoutUrl: checkoutResult.url
    };
  }

  const result = await prisma.ad.create({
    data: {
      operatorId,
      serviceId,
      bundleId,
      subscriptionId: activeSubscription.id,
      status: "ACTIVE",
    },
  });

  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, userLat, userLng, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    // Ad search could be by operator name or service name
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

  let result: any[];
  let total: number;

  const ratingSubQuery = `
    SELECT 
        r_inner."storeServiceId" as ss_id,
        r_inner."storeBundleId" as sb_id,
        AVG(r_inner."rating") as avg_rating,
        COUNT(r_inner."id") as review_count
    FROM "Review" r_inner
    GROUP BY r_inner."storeServiceId", r_inner."storeBundleId"
  `;

  if (userLat && userLng) {
    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);

    // SQL to handle Distance, Avg Rating, Total Review Count
    result = await prisma.$queryRaw`
       SELECT a.*, 
              s.name as "serviceName",
              s.image as "serviceImage",
              b.name as "bundleName",
              b.image as "bundleImage",
              -- Operator with User nested
              json_build_object(
                  'id', op.id,
                  'user', json_build_object('name', u.name, 'avatar', u.avatar)
              ) as "operator",
              -- Closest Store
              (
                  SELECT row_to_json(st_inner)
                  FROM "Store" st_inner
                  WHERE st_inner."operatorId" = a."operatorId"
                  ORDER BY ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st_inner.lng, st_inner.lat)) ASC
                  LIMIT 1
              ) as "store",
              -- Service & Bundle
              CASE WHEN s.id IS NOT NULL THEN row_to_json(s) ELSE NULL END as "service",
              CASE WHEN b.id IS NOT NULL THEN row_to_json(b) ELSE NULL END as "bundle",
              COALESCE(sub.avg_rating, 0)::float as "avgRating",
              COALESCE(sub.review_count, 0)::int as "totalReviewCount",
              MIN(ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat))) as distance_meters,
              MIN(ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat))) / 1609.34 as "distanceMile"
       FROM "Ad" a
       JOIN "AdSubscription" ads ON a."subscriptionId" = ads.id
       JOIN "Operator" op ON a."operatorId" = op.id
       JOIN "User" u ON op."userId" = u.id
       LEFT JOIN "Service" s ON a."serviceId" = s.id
       LEFT JOIN "Bundle" b ON a."bundleId" = b.id
       LEFT JOIN "Store" st ON a."operatorId" = st."operatorId"
       LEFT JOIN (
           SELECT 
               ss."serviceId" as service_id,
               NULL as bundle_id,
               AVG(r."rating") as avg_rating,
               COUNT(r."id") as review_count
           FROM "Review" r
           JOIN "StoreService" ss ON r."storeServiceId" = ss.id
           GROUP BY ss."serviceId"
           UNION ALL
           SELECT 
               NULL as service_id,
               sb."bundleId" as bundle_id,
               AVG(r."rating") as avg_rating,
               COUNT(r."id") as review_count
           FROM "Review" r
           JOIN "StoreBundle" sb ON r."storeBundleId" = sb.id
           GROUP BY sb."bundleId"
       ) sub ON (a."serviceId" = sub.service_id OR a."bundleId" = sub.bundle_id)
       WHERE a."status" = 'ACTIVE' 
         AND ads."status" = 'ACTIVE' 
         AND ads."endDate" > NOW()
       GROUP BY a.id, s.id, b.id, op.id, u.id, sub.avg_rating, sub.review_count
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

    const adsResult = await prisma.ad.findMany({
      where: finalWhere,
      skip,
      take: limit,
      orderBy:
        sortBy && sortOrder
          ? { [sortBy]: sortOrder }
          : { createdAt: 'desc' },
      include: {
        subscription: true,
        operator: {
          include: { 
            user: { select: { name: true, avatar: true } },
            stores: { select: { lat: true, lng: true } }
          }
        },
        service: {
          include: { 
            storeServices: { 
              include: { reviews: { select: { rating: true } } } 
            } 
          }
        },
        bundle: {
          include: { 
            storeBundles: { 
              include: { reviews: { select: { rating: true } } } 
            } 
          }
        }
      }
    });

    total = await prisma.ad.count({ where: finalWhere });

    // Map enriched data for non-SQL path
    result = adsResult.map(ad => {
      let totalRating = 0;
      let reviewCount = 0;

      if (ad.service) {
        ad.service.storeServices.forEach(ss => {
          ss.reviews.forEach(r => {
            totalRating += r.rating;
            reviewCount++;
          });
        });
      }

      if (ad.bundle) {
        ad.bundle.storeBundles.forEach(sb => {
          sb.reviews.forEach(r => {
            totalRating += r.rating;
            reviewCount++;
          });
        });
      }

      return {
        ...ad,
        serviceName: ad.service?.name,
        serviceImage: ad.service?.image,
        bundleName: ad.bundle?.name,
        bundleImage: ad.bundle?.image,
        avgRating: reviewCount > 0 ? totalRating / reviewCount : 0,
        totalReviewCount: reviewCount,
        distanceMile: null // Coordinates not provided
      };
    });
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
    include: {
      subscription: true,
      operator: true,
      service: true,
      bundle: true
    }
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
