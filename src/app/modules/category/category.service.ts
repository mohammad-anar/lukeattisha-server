import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';

const create = async (payload: any) => {
  const result = await prisma.category.create({
    data: payload,
  });
  return result;
};

const getAll = async (query: any) => {
  const result = await prisma.category.findMany();
  return result;
};

const getById = async (id: string) => {
  const result = await prisma.category.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'Category not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.category.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.category.delete({
    where: { id },
  });
  return result;
};

export const CategoryService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
