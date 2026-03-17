import prisma from "src/app/shared/prisma.js";
import ApiError from "src/app/errors/ApiError.js";
import httpStatus from "http-status";
const createCategory = async (payload) => {
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
const getCategoryById = async (id) => {
    const result = await prisma.category.findUnique({
        where: { id },
    });
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }
    return result;
};
const updateCategory = async (id, payload) => {
    await getCategoryById(id);
    const result = await prisma.category.update({
        where: { id },
        data: payload,
    });
    return result;
};
const deleteCategory = async (id) => {
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
