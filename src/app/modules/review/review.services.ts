import { Prisma } from "@prisma/client";
import { paginationHelper } from "src/helpers.ts/paginationHelper.js";
import { prisma } from "src/helpers.ts/prisma.js";
import { IPaginationOptions } from "src/types/pagination.js";

const createReview = async (payload: Prisma.ReviewCreateInput) => {
  const result = await prisma.review.create({
    data: payload,
  });

  return result;
};

const getAllReviews = async (
  filter: { searchTerm?: string },
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const andConditions: Prisma.ReviewWhereInput[] = [];

  if (filter.searchTerm) {
    andConditions.push({
      OR: ["title", "subTitle"].map((field) => ({
        [field]: {
          contains: filter.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereConditions: Prisma.ReviewWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.review.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      booking: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          address: true,
          phone: true,
          country: true,
          updatedAt: true,
        },
      },
    },
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.review.count({
    where: whereConditions,
  });

  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    data: result,
  };
};

const getReviewById = async (id: string) => {
  const result = await prisma.review.findUniqueOrThrow({
    where: { id },
    include: {
      user: true,
      booking: true,
    },
  });

  return result;
};

const updateReview = async (id: string, payload: Prisma.ReviewUpdateInput) => {
  const result = await prisma.review.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteReview = async (id: string) => {
  const result = await prisma.review.delete({
    where: { id },
  });

  return result;
};

const getReviewsByWorkshopId = async (workshopId: string) => {
  const result = await prisma.review.findMany({
    where: {
      booking: {
        workshopId,
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getReviewsByUserId = async (userId: string) => {
  const result = await prisma.review.findMany({
    where: {
      userId,
    },
    include: {
      booking: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

export const ReviewService = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByWorkshopId,
  getReviewsByUserId,
};
