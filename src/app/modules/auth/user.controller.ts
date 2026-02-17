import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import { getSingleFilePath } from "src/app/shared/getFilePath.js";
import config from "src/config/index.js";
import { UserService } from "./user.service.js";
import sendResponse from "src/app/shared/sendResponse.js";
import bcrypt from "bcryptjs";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_round,
  );

  const result = await UserService.createUser({
    ...payload,
    password: hashedPassword,
  });

  sendResponse(res, {
    success: true,
    message: "User registered!",
    statusCode: 201,
    data: result,
  });
});
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers();

  sendResponse(res, {
    success: true,
    message: "Users retrieve successfully",
    statusCode: 200,
    data: result,
  });
});
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getUserById(id as string);

  sendResponse(res, {
    success: true,
    message: "User retrieve successfully",
    statusCode: 200,
    data: result,
  });
});
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const image = getSingleFilePath(req.files, "image") as string;
  const url = `http://${config.ip_address}:${config.port}`.concat(image);
  if (image) {
    payload.profilePhoto = url;
  }
  const result = await UserService.updateUser();

  sendResponse(res, {
    success: true,
    message: "User updated successfully",
    statusCode: 200,
    data: result,
  });
});
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.deleteUser(id as string);

  sendResponse(res, {
    success: true,
    message: "User deleted successfully",
    statusCode: 200,
    data: result,
  });
});
const login = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await UserService.login(payload);

  sendResponse(res, {
    success: true,
    message: "User logged in successfully",
    statusCode: 200,
    data: result,
  });
});

export const UserController = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
};
