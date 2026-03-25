import { Request, Response } from "express";
import { OperatorService } from "./operator.service.js";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";

const createProfile = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const result = await OperatorService.createOperatorProfile(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Operator profile created successfully",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const result = await OperatorService.getOperatorProfile(userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Operator profile retrieved successfully",
    data: result,
  });
});

const getAllOperators = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorService.getAllOperators();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Operators retrieved successfully",
    data: result,
  });
});

const getOperatorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await OperatorService.getOperatorById(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Operator details retrieved successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const result = await OperatorService.updateOperatorProfile(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Operator profile updated successfully",
    data: result,
  });
});

const assignCategories = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const result = await OperatorService.assignCategories(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Categories assigned successfully",
    data: result,
  });
});

const getOperatorCategories = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const result = await OperatorService.getOperatorCategories(userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Operator categories retrieved successfully",
    data: result,
  });
});

// // remove operator categories
const removeCategory = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const result = await OperatorService.removeCategory(userId, req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Category removed successfully",
    data: result,
  });
});



export const OperatorController = {
  createProfile,
  getMyProfile,
  getAllOperators,
  getOperatorById,
  updateProfile,
  assignCategories,
  getOperatorCategories,
  removeCategory,
};
