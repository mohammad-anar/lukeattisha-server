import { Prisma } from "@prisma/client";
import { paginationHelper } from "src/helpers.ts/paginationHelper.js";
import { prisma } from "src/helpers.ts/prisma.js";
import { IPaginationOptions } from "src/types/pagination.js";

interface BlogContentInput {
  heading: string;
  details: string;
}

interface BlogPayload {
  title: string;
  subTitle: string;
  readTime: Date;
  images: string[];
  authorId: string;
  categoryId: string;
  contents: BlogContentInput[];
}

/* ---------------- CREATE BLOG ---------------- */

const createBlog = async (payload: BlogPayload) => {
  const { contents, ...blogData } = payload;

  const result = await prisma.blog.create({
    data: {
      ...blogData,
      contents: {
        create: contents,
      },
    },
    include: {
      contents: true,
      category: true,
      author: true,
    },
  });

  return result;
};

/* ---------------- GET ALL BLOGS ---------------- */

const getAllBlogs = async (
  filter: { searchTerm?: string },
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const andConditions: Prisma.BlogWhereInput[] = [];

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

  const whereConditions: Prisma.BlogWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.blog.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      contents: true,
      category: true,
      author: true,
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

  const total = await prisma.blog.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

/* ---------------- GET SINGLE BLOG ---------------- */

const getBlogById = async (id: string) => {
  const result = await prisma.blog.findUnique({
    where: { id },
    include: {
      contents: true,
      category: true,
      author: true,
    },
  });

  return result;
};

/* ---------------- UPDATE BLOG ---------------- */

const updateBlog = async (id: string, payload: Partial<BlogPayload>) => {
  const { contents, ...blogData } = payload;

  const result = await prisma.blog.update({
    where: { id },
    data: {
      ...blogData,

      ...(contents && {
        contents: {
          deleteMany: {},
          create: contents,
        },
      }),
    },
    include: {
      contents: true,
      category: true,
      author: true,
    },
  });

  return result;
};

/* ---------------- DELETE BLOG ---------------- */

const deleteBlog = async (id: string) => {
  const result = await prisma.$transaction(async (tx) => {
    await tx.blogContent.deleteMany({
      where: { blogId: id },
    });

    const deletedBlog = await tx.blog.delete({
      where: { id },
    });

    return deletedBlog;
  });

  return result;
};

export const BlogService = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
