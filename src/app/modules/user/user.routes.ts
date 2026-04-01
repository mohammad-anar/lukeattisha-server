import express from "express";
import { Role } from "@prisma/client";
import { UserController } from "./user.controller.js";
import { UserValidation } from "./user.validation.js";
import auth from "app/middlewares/auth.js";
import fileUploadHandler from "app/middlewares/fileUploadHandler.js";
import validateRequest from "app/middlewares/validateRequest.js";

const router = express.Router();

router.get("/me", auth(Role.USER, Role.ADMIN, Role.OPERATOR), UserController.getMe);

router.get("/", auth(Role.ADMIN), UserController.getAllUsers);

router.get("/:id", auth(Role.ADMIN), UserController.getUserById);

router.patch(
  "/:id",
  auth(Role.ADMIN, Role.USER, Role.OPERATOR),
  fileUploadHandler(),
  validateRequest(UserValidation.updateUserSchema),
  UserController.updateUser,
);

router.patch("/:id/ban", auth(Role.ADMIN), UserController.banUser);

router.patch("/:id/unban", auth(Role.ADMIN), UserController.unBanUser);

router.delete("/:id", auth(Role.ADMIN), UserController.deleteUser);

export const UserRouter = router;
