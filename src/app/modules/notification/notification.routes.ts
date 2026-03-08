import express from "express";
import { NotificationController } from "./notification.controller.js";
import auth from "src/app/middlewares/auth.js";
import { Role } from "@prisma/client";

const router = express.Router();

router.get(
  "/",
  auth(Role.ADMIN, Role.USER, Role.WORKSHOP),
  NotificationController.getAllNotifications,
);

router.post(
  "/",
  auth(Role.ADMIN, Role.USER, Role.WORKSHOP),
  NotificationController.createNotification,
);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.USER, Role.WORKSHOP),
  NotificationController.getNotificationById,
);

router.patch(
  "/:id/read",
  auth(Role.ADMIN, Role.USER, Role.WORKSHOP),
  NotificationController.markAsRead,
);

router.delete(
  "/:id",
  auth(Role.ADMIN, Role.USER, Role.WORKSHOP),
  NotificationController.deleteNotification,
);

export const NotificationRouter = router;
