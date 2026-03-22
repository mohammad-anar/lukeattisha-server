import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import { getSingleFilePath } from "src/app/shared/getFilePath.js";
import config from "src/config/index.js";
import { UserService } from "./user.service.js";
import sendResponse from "src/app/shared/sendResponse.js";
import pick from "src/helpers.ts/pick.js";
import { Prisma, UserStatus } from "@prisma/client";

/* ================= CREATE USER ================= */
const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload: Prisma.UserCreateInput = req.body;

  const image = getSingleFilePath(req.files, "image") as string;

  if (image) {
    payload.avatar = `http://${config.ip_address}:${config.port}${image}`;
  }

  const result = await UserService.createUser(payload);

  sendResponse(res, {
    success: true,
    message: "User registered successfully",
    statusCode: 201,
    data: result,
  });
});

/* ================= GET ALL USERS ================= */
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    "role",
    "status",
    "isVerified",
    "isDeleted",
    "searchTerm",
  ]);

  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await UserService.getAllUsers(filters, options);

  sendResponse(res, {
    success: true,
    message: "Users retrieved successfully",
    statusCode: 200,
    data: result,
  });
});

/* ================= GET USER ================= */
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await UserService.getUserById(id as string);

  sendResponse(res, {
    success: true,
    message: "User retrieved successfully",
    statusCode: 200,
    data: result,
  });
});

/* ================= ME ================= */
const getMe = catchAsync(async (req: any, res: Response) => {
  const email = req.user?.email;

  const result = await UserService.getMe(email);

  sendResponse(res, {
    success: true,
    message: "User profile retrieved successfully",
    statusCode: 200,
    data: result,
  });
});

/* ================= UPDATE USER ================= */
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const image = getSingleFilePath(req.files, "image") as string;

  if (image) {
    payload.avatar = `http://${config.ip_address}:${config.port}${image}`;
  }

  const result = await UserService.updateUser(id as string, payload);

  sendResponse(res, {
    success: true,
    message: "User updated successfully",
    statusCode: 200,
    data: result,
  });
});

/* ================= BAN USER ================= */
const banUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await UserService.updateUser(id as string, {
    status: UserStatus.BANNED,
  });

  sendResponse(res, {
    success: true,
    message: "User banned successfully",
    statusCode: 200,
    data: result,
  });
});

/* ================= UNBAN USER ================= */
const unBanUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await UserService.updateUser(id as string, {
    status: UserStatus.ACTIVE,
  });

  sendResponse(res, {
    success: true,
    message: "User unbanned successfully",
    statusCode: 200,
    data: result,
  });
});

/* ================= DELETE USER ================= */
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

/* ================= LOGIN ================= */
const login = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.login(req.body);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: config.node_env === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: config.node_env === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    success: true,
    message: "Login successful",
    statusCode: 200,
    data: result,
  });
});

/* ================= VERIFY USER ================= */
const verifyUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.verifyUser(req.body);

  sendResponse(res, {
    success: true,
    message: "User verified successfully",
    statusCode: 200,
    data: result,
  });
});

/* ================= RESEND OTP ================= */
const resendOTP = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.resendOTP(req.body.email);

  sendResponse(res, {
    success: true,
    message: "OTP resent successfully",
    statusCode: 200,
    data: result,
  });
});

/* ================= FORGET PASSWORD ================= */
const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.forgetPassword(req.body.email);

  sendResponse(res, {
    success: true,
    message: "Password reset email sent",
    statusCode: 200,
    data: result,
  });
});

/* ================= RESET PASSWORD ================= */
const resetPassword = catchAsync(async (req: any, res: Response) => {
  const email = req.user?.email;

  const result = await UserService.resetPassword(email, req.body.password);

  sendResponse(res, {
    success: true,
    message: "Password reset successful",
    statusCode: 200,
    data: result,
  });
});

/* ================= CHANGE PASSWORD ================= */
const changePassword = catchAsync(async (req: any, res: Response) => {
  const email = req.user?.email;
  const { oldPassword, newPassword } = req.body;

  const result = await UserService.changePassword(
    email,
    oldPassword,
    newPassword,
  );

  sendResponse(res, {
    success: true,
    message: "Password changed successfully",
    statusCode: 200,
    data: result,
  });
});

/* ================= REFRESH TOKEN ================= */
const refreshToken = catchAsync(async (req: any, res: Response) => {
  const email = req.user?.email;

  const result = await UserService.refreshToken(email);

  sendResponse(res, {
    success: true,
    message: "Token refreshed successfully",
    statusCode: 200,
    data: result,
  });
});

/* ================= LOGOUT ================= */
const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  sendResponse(res, {
    success: true,
    message: "Logged out successfully",
    statusCode: 200,
    data: null,
  });
});

/* ================= EXPORT ================= */
export const UserController = {
  createUser,
  getAllUsers,
  getUserById,
  getMe,
  updateUser,
  banUser,
  unBanUser,
  deleteUser,
  login,
  verifyUser,
  resendOTP,
  forgetPassword,
  resetPassword,
  changePassword,
  refreshToken,
  logout,
};
