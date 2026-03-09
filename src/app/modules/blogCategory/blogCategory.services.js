import { prisma } from "src/helpers.ts/prisma.js";
import { paginationHelper } from "src/helpers.ts/paginationHelper.js";
/* -------- CREATE CATEGORY -------- */
const createCategory = async (payload) => {
    const result = await prisma.blogCategory.create({
        data: payload,
    });
    return result;
};
/* -------- GET ALL CATEGORIES -------- */
const getAllCategories = async (filter, options) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const andConditions = [];
    if (filter.searchTerm) {
        andConditions.push({
            name: {
                contains: filter.searchTerm,
                mode: "insensitive",
            },
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = await prisma.blogCategory.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            createdAt: "desc",
        },
    });
    const total = await prisma.blogCategory.count({
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
/* -------- GET CATEGORY BY ID -------- */
const getCategoryById = async (id) => {
    const result = await prisma.blogCategory.findUnique({
        where: { id },
        include: {
            blogs: true,
        },
    });
    return result;
};
/* -------- UPDATE CATEGORY -------- */
const updateCategory = async (id, payload) => {
    const result = await prisma.blogCategory.update({
        where: { id },
        data: payload,
    });
    return result;
};
/* -------- DELETE CATEGORY -------- */
const deleteCategory = async (id) => {
    const result = await prisma.blogCategory.delete({
        where: { id },
    });
    return result;
};
export const BlogCategoryService = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
