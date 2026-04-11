import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';

const create = async (payload: any) => {
  const result = await prisma.supportPhone.create({
    data: payload,
  });
  return result;
};

const getAll = async () => {
  const result = await prisma.supportPhone.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return result;
};

const getById = async (id: string) => {
  const result = await prisma.supportPhone.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'SupportPhone not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  const result = await prisma.supportPhone.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  const result = await prisma.supportPhone.delete({
    where: { id },
  });
  return result;
};

export const SupportPhoneService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
