
import ApiError from "../../../errors/ApiError.js";
import { prisma } from "../../../helpers.ts/prisma.js";
import { ICategoryCreatePayload, ICategoryFilterRequest, ICategoryUpdatePayload } from "./category.interface.js";

import httpStatus from "http-status";
import { IPaginationOptions } from "../../../types/pagination.js";
import { Prisma } from "@prisma/client";
import { paginationHelper } from "../../../helpers.ts/paginationHelper.js";

const createCategory = async (payload: ICategoryCreatePayload) => {
  const result = await prisma.category.create({
    data: payload,
  });
  return result;
};

const getAllCategories = async (filter: ICategoryFilterRequest, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const thisLimit = 1000;
  const { searchTerm, ...filterData } = filter;
  const conditions: Prisma.CategoryWhereInput[] = [];

  if (searchTerm) {
    conditions.push({
      OR: ["name"].map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    conditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  const where = { AND: conditions };

  const result = await prisma.category.findMany({
    where,
    skip,
    take: thisLimit,
    orderBy: options.sortBy && options.sortOrder ? { [options.sortBy]: options.sortOrder } : { createdAt: "desc" },
  });

  const total = await prisma.category.count({ where });

  return {
    meta: { page, limit: thisLimit, total, totalPage: Math.ceil(total / thisLimit) },
    data: result,
  };
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
