import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { CategoryService } from "./category.service.js";
const createCategory = catchAsync(async (req, res) => {
    const result = await CategoryService.createCategory(req.body);
    sendResponse(res, {
        success: true,
        statusCode: 201,
        message: "Category created successfully",
        data: result,
    });
});
const getAllCategories = catchAsync(async (req, res) => {
    const result = await CategoryService.getAllCategories();
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Categories retrieved successfully",
        data: result,
    });
});
const getCategoryById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await CategoryService.getCategoryById(id);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Category retrieved successfully",
        data: result,
    });
});
const updateCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await CategoryService.updateCategory(id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Category updated successfully",
        data: result,
    });
});
const deleteCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await CategoryService.deleteCategory(id);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Category deleted successfully",
        data: result,
    });
});
export const CategoryController = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
