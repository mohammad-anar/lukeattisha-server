import { prisma } from "src/helpers.ts/prisma.js";
import { ICategoryCreatePayload, ICategoryUpdatePayload } from "./category.interface.js";
import ApiError from "src/errors/ApiError.js";
import httpStatus from "http-status";

const createCategory = async (payload: ICategoryCreatePayload) => {
  const result = await prisma.category.create({
    data: payload,
  });
  return result;
};

const getAllCategories = async () => {
  const result = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const getCategoryById = async (id: string) => {
  const result = await prisma.category.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }
  return result;
};

const updateCategory = async (id: string, payload: ICategoryUpdatePayload) => {
  await getCategoryById(id);
  const result = await prisma.category.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteCategory = async (id: string) => {
  await getCategoryById(id);
  const result = await prisma.category.delete({
    where: { id },
  });
  return result;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
