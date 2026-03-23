import express from "express";
import { Role } from "@prisma/client";
import { AuthController } from "./auth.controller.js";
import { AuthValidation } from "./auth.validation.js";
import fileUploadHandler from "../../middlewares/fileUploadHandler.js";
import auth from "../../middlewares/auth.js";

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
