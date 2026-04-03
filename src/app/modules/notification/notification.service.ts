import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';

const create = async (payload: any) => {
  const result = await prisma.notification.create({
    data: payload,
  });
  return result;
};

const getAll = async (query: any) => {
  const result = await prisma.notification.findMany();
  return result;
};

const getById = async (id: string) => {
  const result = await prisma.notification.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'Notification not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.notification.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.notification.delete({
    where: { id },
  });
  return result;
};

export const NotificationService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
