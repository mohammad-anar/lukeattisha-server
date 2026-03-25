import express from "express";
import { Role } from "@prisma/client";
import { AuthController } from "./auth.controller.js";
import { AuthValidation } from "./auth.validation.js";
import fileUploadHandler from "../../middlewares/fileUploadHandler.js";
import auth from "../../middlewares/auth.js";
import validateRequest from "app/middlewares/validateRequest.js";

const router = express.Router();

router.post("/register", fileUploadHandler(), validateRequest(AuthValidation.registerSchema), AuthController.register);
router.post("/register/operator", fileUploadHandler(), validateRequest(AuthValidation.registerOperatorSchema), AuthController.registerOperator);

router.post("/login", validateRequest(AuthValidation.loginSchema), AuthController.login);

router.post("/verify-user", validateRequest(AuthValidation.verifyEmailSchema), AuthController.verifyUser);

router.post("/resend-otp", AuthController.resendOTP);

router.post("/forget-password", validateRequest(AuthValidation.forgetPasswordSchema), AuthController.forgetPassword);

router.post(
  "/reset-password",
  auth(Role.USER, Role.ADMIN, Role.OPERATOR),
  validateRequest(AuthValidation.resetPasswordSchema),
  AuthController.resetPassword,
);

router.post(
  "/change-password",
  auth(Role.USER, Role.ADMIN, Role.OPERATOR),
  AuthController.changePassword,
);

router.post(
  "/refresh",
  auth(Role.USER, Role.ADMIN, Role.OPERATOR),
  AuthController.refreshToken,
);

router.post(
  "/logout",
  auth(Role.USER, Role.ADMIN, Role.OPERATOR),
  AuthController.logout,
);

export const AuthRouter = router;
