import express from "express";
import { AuthController } from "./auth.controller.js";
import { AuthValidation } from "./auth.validation.js";
import fileUploadHandler from "../../middlewares/fileUploadHandler.js";
import auth from "../../middlewares/auth.js";
import validateRequest from "app/middlewares/validateRequest.js";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post("/register", fileUploadHandler(), validateRequest(AuthValidation.registerSchema), AuthController.register);
router.post("/register/operator", fileUploadHandler(), validateRequest(AuthValidation.registerOperatorSchema), AuthController.registerOperator);

router.post("/login", validateRequest(AuthValidation.loginSchema), AuthController.login);

router.post("/verify-user", validateRequest(AuthValidation.verifyEmailSchema), AuthController.verifyUser);

router.post("/resend-otp", AuthController.resendOTP);

router.post("/forget-password", validateRequest(AuthValidation.forgetPasswordSchema), AuthController.forgetPassword);

router.post("/forget-password-otp", validateRequest(AuthValidation.forgetPasswordSchema), AuthController.forgetPasswordOTP);

router.post("/verify-otp", validateRequest(AuthValidation.verifyEmailSchema), AuthController.verifyOTP);
router.post(
  "/reset-password",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.OPERATOR),
  validateRequest(AuthValidation.resetPasswordSchema),
  AuthController.resetPassword,
);

router.post(
  "/change-password",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.OPERATOR),
  AuthController.changePassword,
);

router.post(
  "/refresh",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.OPERATOR),
  AuthController.refreshToken,
);

router.post(
  "/logout",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.OPERATOR),
  AuthController.logout,
);

export const AuthRouter = router;
