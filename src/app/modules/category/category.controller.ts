import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { CategoryService } from "./category.services.js";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await CategoryService.createCategory(payload);

  sendResponse(res, {
    success: true,
    message: "Category created successfully",
    statusCode: 201,
    data: result,
  });
});

export const CategoryController = {
  createCategory,
};
