import { Prisma } from "@prisma/client";
import { prisma } from "src/helpers.ts/prisma.js";

const createCategory = async (payload: Prisma.CategoryCreateInput) => {
  const result = await prisma.category.create({
    data: payload,
  });

  return result;
};

export const CategoryService = {
  createCategory,
};
