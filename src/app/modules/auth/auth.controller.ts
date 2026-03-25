import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import { getSingleFilePath } from "../../shared/getFilePath.js";
import { config } from "config/index.js";

/* ================= REGISTER ================= */
const register = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const image = getSingleFilePath(req.files, "image") as string;
  if (image)
    payload.avatar = `http://${config.ip_address}:${config.port}${image}`;

  const result = await AuthService.register(payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "User registered successfully",
    data: result,
  });
});
/* ================= REGISTER OPERATOR ================= */
const registerOperator = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const image = getSingleFilePath(req.files, "image") as string;
  if (image)
    payload.avatar = `http://${config.ip_address}:${config.port}${image}`;

  const result = await AuthService.registerOperator(payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Operator registered successfully",
    data: result,
  });
});

/* ================= LOGIN ================= */
const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

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
    statusCode: 200,
    message: "Login successful",
    data: result,
  });
});

/* ================= VERIFY USER ================= */
const verifyUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyUser(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User verified successfully",
    data: result,
  });
});

/* ================= RESEND OTP ================= */
const resendOTP = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resendOTP(req.body.email);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "OTP resent successfully",
    data: result,
  });
});

/* ================= FORGET PASSWORD ================= */
const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgetPassword(req.body.email);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Password reset email sent",
    data: result,
  });
});

/* ================= RESET PASSWORD ================= */
const resetPassword = catchAsync(async (req: any, res: Response) => {
  const result = await AuthService.resetPassword(
    req.user?.email,
    req.body.password,
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Password reset successful",
    data: result,
  });
});

/* ================= CHANGE PASSWORD ================= */
const changePassword = catchAsync(async (req: any, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const result = await AuthService.changePassword(
    req.user?.email,
    oldPassword,
    newPassword,
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Password changed successfully",
    data: result,
  });
});

/* ================= REFRESH TOKEN ================= */
const refreshToken = catchAsync(async (req: any, res: Response) => {
  const result = await AuthService.refreshToken(req.user?.email);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Token refreshed successfully",
    data: result,
  });
});

/* ================= LOGOUT ================= */
const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Logged out successfully",
    data: null,
  });
});

export const AuthController = {
  register,
  registerOperator,
  login,
  verifyUser,
  resendOTP,
  forgetPassword,
  resetPassword,
  changePassword,
  refreshToken,
  logout,
};
