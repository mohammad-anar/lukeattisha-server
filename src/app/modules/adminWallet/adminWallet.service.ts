import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';

const create = async (payload: any) => {
  const result = await prisma.adminWallet.create({
    data: payload,
  });
  return result;
};

const getAll = async (query: any) => {
  const result = await prisma.adminWallet.findMany();
  return result;
};

const getById = async (id: string) => {
  const result = await prisma.adminWallet.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'AdminWallet not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.adminWallet.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.adminWallet.delete({
    where: { id },
  });
  return result;
};

export const AdminWalletService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
