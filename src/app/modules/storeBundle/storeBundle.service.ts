import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (operatorId: string, payload: any) => {
  const { storeId, bundleIds } = payload;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });
  if (!store) {
    throw new ApiError(404, 'Store not found');
  }
  if (store.operatorId !== operatorId) {
    throw new ApiError(403, 'You are not authorized to perform this action');
  }

  const bundles = await prisma.bundle.findMany({
    where: { id: { in: bundleIds } },
  });
  if (bundles.length !== bundleIds.length) {
    throw new ApiError(404, 'One or more bundles not found');
  }

  const existingBundles = await prisma.storeBundle.findMany({
    where: {
      storeId,
      bundleId: { in: bundleIds },
    },
  });

  if (existingBundles.length > 0) {
    throw new ApiError(400, 'One or more bundles already exist in the store');
  }

  const data = bundleIds.map((bundleId: string) => ({
    storeId,
    bundleId,
  }));

  const result = await prisma.storeBundle.createMany({
    data,
  });
  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, userLat, userLng, categoryId, ...filterData } = filters;

  const andConditions: any[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: ['name', 'description'].map((field) => ({
        bundle: {
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
      bundle: {
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

  const whereConditions: Prisma.StoreBundleWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  let result;
  let total;

  if (userLat && userLng) {
    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);
    const searchString = searchTerm ? `%${searchTerm}%` : null;

    result = await prisma.$queryRaw`
      SELECT sb.*,
             json_build_object(
               'id', b.id,
               'name', b.name,
               'description', b.description,
               'image', b.image,
               'bundlePrice', b."bundlePrice",
               'isActive', b."isActive",
               'operatorId', b."operatorId",
               'createdAt', b."createdAt",
               'updatedAt', b."updatedAt",
               'operator', row_to_json(op.*),
               'bundleServices', (
                 SELECT COALESCE(json_agg(json_build_object('service', row_to_json(svc.*))), '[]'::json)
                 FROM "BundleServices" bs2
                 LEFT JOIN "Service" svc ON bs2."serviceId" = svc.id
                 WHERE bs2."bundleId" = b.id
               )
             ) as bundle,
             row_to_json(st.*) as store,
             ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat)) as distance_meters,
             ST_DistanceSphere(ST_MakePoint(${lng}, ${lat}), ST_MakePoint(st.lng, st.lat)) / 1609.34 as "distanceMile"
      FROM "StoreBundle" sb
      LEFT JOIN "Bundle" b ON sb."bundleId" = b.id
      LEFT JOIN "Store" st ON sb."storeId" = st.id
      LEFT JOIN "Operator" op ON b."operatorId" = op.id
      WHERE 1 = 1
      ${searchTerm ? Prisma.sql`AND (b.name ILIKE ${searchString} OR b.description ILIKE ${searchString})` : Prisma.empty}
      ${categoryId ? Prisma.sql`AND b."categoryId" = ${categoryId}` : Prisma.empty}
      ORDER BY distance_meters ASC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const totalResult: any = await prisma.$queryRaw`
      SELECT COUNT(sb.id)::int as count FROM "StoreBundle" sb
      LEFT JOIN "Bundle" b ON sb."bundleId" = b.id
      LEFT JOIN "Store" st ON sb."storeId" = st.id
      WHERE 1 = 1
      ${searchTerm ? Prisma.sql`AND (b.name ILIKE ${searchString} OR b.description ILIKE ${searchString})` : Prisma.empty}
      ${categoryId ? Prisma.sql`AND b."categoryId" = ${categoryId}` : Prisma.empty}
    `;
    total = totalResult[0]?.count || 0;
  } else {
    result = await prisma.storeBundle.findMany({
      where: whereConditions,
      skip,
      take: limit,
      include: {
        bundle: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            bundlePrice: true,
            bundleServices: {
              select: {
                service: true
              }
            },
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
    total = await prisma.storeBundle.count({ where: whereConditions });
  }

  return {
    meta: {
      total,
      totalPage: Math.ceil(total / limit),
      page,
      limit,
    },
    data: result,
  };
};

const getAllByStoreId = async (storeId: string) => {
  const result = await prisma.storeBundle.findMany({
    where: { storeId },
    include: {
      bundle: true,
      store: true,
    },
  });
  return result;
};

const getAllByOperatorId = async (operatorId: string) => {
  const result = await prisma.storeBundle.findMany({
    where: { store: { operatorId } },
    include: {
      bundle: true,
      store: true,
    },
  });
  return result;
};

const getById = async (id: string) => {
  const result = await prisma.storeBundle.findUnique({
    where: { id },
    include: {
      reviews: {
        include: {
          bundle: true,
          service: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          }
        }
      },
      bundle: {
        include: {
          bundleServices: {
            select: {
              service: true
            }
          },
          operator: true,
          _count: {
            select: {
              storeBundles: true
            }
          }
        }
      },
      store: true,
    },
  });
  if (!result) {
    throw new ApiError(404, 'StoreBundle not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.storeBundle.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.storeBundle.delete({
    where: { id },
  });
  return result;
};

export const StoreBundleService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  getAllByStoreId,
  getAllByOperatorId,
};
