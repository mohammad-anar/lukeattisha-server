import express from "express";
import auth from "src/app/middlewares/auth.js";
import validateRequest from "src/app/middlewares/validateRequest.js";
import fileUploadHandler from "src/app/middlewares/fileUploadHandler.js";
import { Role } from "@prisma/client";
import { AuthController } from "./auth.controller.js";
import { AuthValidation } from "./auth.validation.js";

const router = express.Router();

router.post("/register", fileUploadHandler(), AuthController.register);

router.post("/login", AuthController.login);

router.post("/verify-user", AuthController.verifyUser);

router.post("/resend-otp", AuthController.resendOTP);

router.post("/forget-password", AuthController.forgetPassword);

router.post(
  "/reset-password",
  auth(Role.USER, Role.ADMIN, Role.OPERATOR),
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
