import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';

const create = async (payload: any) => {
  const result = await prisma.userSubscription.create({
    data: payload,
  });
  return result;
};

const getAll = async (query: any) => {
  const result = await prisma.userSubscription.findMany();
  return result;
};

const getById = async (id: string) => {
  const result = await prisma.userSubscription.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'UserSubscription not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.userSubscription.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.userSubscription.delete({
    where: { id },
  });
  return result;
};

export const UserSubscriptionService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
