import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';

const create = async (payload: any) => {
  const result = await prisma.storeService.create({
    data: payload,
  });
  return result;
};

const getAll = async (query: any) => {
  const result = await prisma.storeService.findMany();
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
};
