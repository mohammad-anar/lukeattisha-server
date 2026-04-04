import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (userId: string, payload: any) => {
  const result = await prisma.address.create({
    data: { ...payload, userId },
  });
  return result;
};

// const getAll = async (filters: any, options: any) => {
//   const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
//   const { searchTerm, ...filterData } = filters;

//   const andConditions = [];

//   if (searchTerm) {
//     andConditions.push({
//       OR: ["streetAddress","city","country"].map((field) => ({
//         [field]: {
//           contains: searchTerm,
//           mode: 'insensitive',
//         },
//       })),
//     });
//   }

//   if (Object.keys(filterData).length > 0) {
//     andConditions.push({
//       AND: Object.keys(filterData).map((key) => ({
//         [key]: {
//           equals: (filterData as any)[key],
//         },
//       })),
//     });
//   }

//   const whereConditions: Prisma.AddressWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

//   const result = await prisma.address.findMany({
//     where: whereConditions,
//     skip,
//     take: limit,
//     orderBy:
//       sortBy && sortOrder
//         ? { [sortBy]: sortOrder }
//         : { createdAt: 'desc' },
//   });
//   const total = await prisma.address.count({ where: whereConditions });

//   return {
//     meta: {
//       total,
//       page,
//       limit,
//     },
//     data: result,
//   };
// };

const getById = async (id: string) => {
  const result = await prisma.address.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'Address not found');
  }
  return result;
};

const update = async (userId: string, id: string, payload: any) => {
  const userAddress = await getById(id);
  if (userAddress.userId !== userId) {
    throw new ApiError(403, 'You are not authorized to update this address');
  }

  const result = await prisma.address.update({
    where: { id },
    data: payload,
  });
  return result;
};

const setDefault = async (userId: string, id: string) => {
  const userAddresses = await getMyAddresses(userId);
  if (userAddresses.length === 0) {
    throw new ApiError(404, 'Address not found');
  }
  await prisma.address.updateMany({
    where: { userId, id },
    data: { isDefault: false },
  });
  const result = await prisma.address.update({
    where: { id },
    data: { isDefault: true },
  });

  await prisma.address.updateMany({
    where: { userId, id: { not: id } },
    data: { isDefault: false },
  });
  return result;
};

const deleteById = async (userId: string, id: string) => {
  const userAddress = await getById(id);
  if (userAddress.userId !== userId) {
    throw new ApiError(403, 'You are not authorized to delete this address');
  }
  const result = await prisma.address.delete({
    where: { id },
  });
  return result;
};

const getMyAddresses = async (userId: string) => {
  const result = await prisma.address.findMany({
    where: { userId },
  });
  return result;
};

export const AddressService = {
  create,
  getById,
  update,
  deleteById,
  getMyAddresses,
  setDefault
};
