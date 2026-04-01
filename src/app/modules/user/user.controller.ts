import { Role, UserStatus } from "@prisma/client";
import catchAsync from "app/shared/catchAsync.js";
import { getSingleFilePath } from "app/shared/getFilePath.js";
import sendResponse from "app/shared/sendResponse.js";
import { config } from "config/index.js";
import { Request, Response } from "express";
import pick from "helpers.ts/pick.js";
import ApiError from "../../../errors/ApiError.js";
import { UserService } from "./user.service.js";

/* ================= GET ME ================= */
const getMe = catchAsync(async (req: any, res: Response) => {
  const result = await UserService.getMe(req.user?.email);
  sendResponse(res, { success: true, statusCode: 200, message: "User profile retrieved successfully", data: result });
});

/* ================= GET ALL USERS ================= */
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["role", "status", "isVerified", "isDeleted", "searchTerm", "minspent"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await UserService.getAllUsers(filters, options);
  sendResponse(res, { success: true, statusCode: 200, message: "Users retrieved successfully", data: result });
});

/* ================= GET USER BY ID ================= */
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserById(req.params.id as string);
  sendResponse(res, { success: true, statusCode: 200, message: "User retrieved successfully", data: result });
});

/* ================= UPDATE USER ================= */
const updateUser = catchAsync(async (req: any, res: Response) => {
  if (req.user?.role === Role.USER && req.user?.id !== req.params.id) {
    throw new ApiError(403, "You are not authorized to perform this action.");
  }
  
  const payload = req.body;
  const image = getSingleFilePath(req.files, "image") as string;
  if (image) payload.avatar = `http://${config.ip_address}:${config.port}${image}`;

  const result = await UserService.updateUser(req.params.id as string, payload);
  sendResponse(res, { success: true, statusCode: 200, message: "User updated successfully", data: result });
}); 

/* ================= BAN USER ================= */
const banUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateUser(req.params.id as string, { status: UserStatus.BANNED });
  sendResponse(res, { success: true, statusCode: 200, message: "User banned successfully", data: result });
});

/* ================= UNBAN USER ================= */
const unBanUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateUser(req.params.id as string, { status: UserStatus.ACTIVE });
  sendResponse(res, { success: true, statusCode: 200, message: "User unbanned successfully", data: result });
});

/* ================= DELETE USER ================= */
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.deleteUser(req.params.id as string);
  sendResponse(res, { success: true, statusCode: 200, message: "User deleted successfully", data: result });
});

export const UserController = {
  getMe,
  getAllUsers,
  getUserById,
  updateUser,
  banUser,
  unBanUser,
  deleteUser,
};
