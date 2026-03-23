import express from "express";
import auth from "src/app/middlewares/auth.js";
import { Role } from "@prisma/client";
import { NotificationController } from "./notification.controller.js";

const router = express.Router();

router.get("/", auth(Role.USER, Role.OPERATOR, Role.ADMIN), NotificationController.getMyNotifications);

router.get("/all", auth(Role.ADMIN), NotificationController.getAllNotifications);

router.patch("/:id/sent", auth(Role.ADMIN), NotificationController.markAsSent);

router.delete("/:id", auth(Role.USER, Role.OPERATOR, Role.ADMIN), NotificationController.deleteNotification);

export const NotificationRouter = router;
