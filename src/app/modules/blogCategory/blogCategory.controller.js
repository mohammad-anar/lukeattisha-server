import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { BlogCategoryService } from "./blogCategory.services.js";
import pick from "src/helpers.ts/pick.js";
/* -------- CREATE CATEGORY -------- */
const createCategory = catchAsync(async (req, res) => {
    const result = await BlogCategoryService.createCategory(req.body);
    sendResponse(res, {
        success: true,
        message: "Category created successfully",
        statusCode: 201,
        data: result,
    });
});
/* -------- GET ALL CATEGORIES -------- */
const getAllCategories = catchAsync(async (req, res) => {
    const filters = pick(req.query, ["searchTerm"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await BlogCategoryService.getAllCategories(filters, options);
    sendResponse(res, {
        success: true,
        message: "Categories retrieved successfully",
        statusCode: 200,
        data: result,
    });
});
/* -------- GET CATEGORY BY ID -------- */
const getCategoryById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await BlogCategoryService.getCategoryById(id);
    sendResponse(res, {
        success: true,
        message: "Category retrieved successfully",
        statusCode: 200,
        data: result,
    });
});
/* -------- UPDATE CATEGORY -------- */
const updateCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await BlogCategoryService.updateCategory(id, req.body);
    sendResponse(res, {
        success: true,
        message: "Category updated successfully",
        statusCode: 200,
        data: result,
    });
});
/* -------- DELETE CATEGORY -------- */
const deleteCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await BlogCategoryService.deleteCategory(id);
    sendResponse(res, {
        success: true,
        message: "Category deleted successfully",
        statusCode: 200,
        data: result,
    });
});
export const BlogCategoryController = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
