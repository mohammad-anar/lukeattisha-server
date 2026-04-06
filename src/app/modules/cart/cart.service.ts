import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const calculateItemPrice = async (item: any) => {
  let basePrice = 0;
  if (item.serviceId) {
    const service = await prisma.service.findUnique({ where: { id: item.serviceId } });
    basePrice = Number(service?.basePrice || 0);
  } else if (item.bundleId) {
    const bundle = await prisma.bundle.findUnique({ where: { id: item.bundleId } });
    basePrice = Number(bundle?.bundlePrice || 0);
  }

  const addonIds = (item.selectedAddons || []).map((sa: any) => sa.addonId);
  const addons = await prisma.addon.findMany({ where: { id: { in: addonIds } } });
  const addonsPrice = addons.reduce((sum, a) => sum + Number(a.price), 0);

  return (basePrice + addonsPrice) * (item.quantity || 1);
};

const create = async (payload: any) => {
  const { items, ...cartData } = payload;

  const processedItems = await Promise.all(
    (items || []).map(async (item: any) => {
      const price = await calculateItemPrice(item);
      const { selectedAddons, ...rest } = item;
      return {
        ...rest,
        price,
        selectedAddons: {
          create: selectedAddons || [],
        },
      };
    })
  );

  const result = await prisma.cart.create({
    data: {
      ...cartData,
      items: {
        create: processedItems,
      },
    } as any,
    include: {
      items: {
        include: {
          selectedAddons: true,
        },
      },
    },
  });
  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: [].map((field) => ({
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

  const whereConditions: Prisma.CartWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.cart.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
    include: {
      items: {
        include: {
          selectedAddons: true,
          service: true,
          bundle: true,
        },
      },
    },
  });
  const total = await prisma.cart.count({ where: whereConditions });

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
  const result = await prisma.cart.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          selectedAddons: {
             include: {
               addon: true
             }
          },
          service: true,
          bundle: true,
        },
      },
    }
  });
  if (!result) {
    throw new ApiError(404, 'Cart not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  const { items, ...cartData } = payload;

  if (items) {
    return await prisma.$transaction(async (tx) => {
      const currentItems = await tx.cartItem.findMany({
        where: { cartId: id },
      });

      for (const item of currentItems) {
        await tx.selectedAddon.deleteMany({ where: { cartItemId: item.id } });
      }
      await tx.cartItem.deleteMany({ where: { cartId: id } });

      const processedItems = await Promise.all(
        items.map(async (item: any) => {
          const price = await calculateItemPrice(item);
          const { selectedAddons, ...rest } = item;
          return {
            ...rest,
            price,
            selectedAddons: {
              create: selectedAddons || [],
            },
          };
        })
      );

      return await tx.cart.update({
        where: { id },
        data: {
          ...cartData,
          items: {
            create: processedItems,
          },
        } as any,
        include: {
          items: {
            include: {
              selectedAddons: true,
            },
          },
        },
      });
    });
  }

  const result = await prisma.cart.update({
    where: { id },
    data: cartData,
    include: {
      items: {
        include: {
          selectedAddons: true,
        },
      },
    },
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.cart.delete({
    where: { id },
  });
  return result;
};

export const CartService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
