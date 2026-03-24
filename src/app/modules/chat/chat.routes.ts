import express from "express";
import { Role } from "@prisma/client";
import { ChatController } from "./chat.controller.js";
import auth from "../../middlewares/auth.js";

const router = express.Router();

router.post(
  "/room",
  auth(Role.USER, Role.ADMIN, Role.OPERATOR),
  ChatController.createOrGetRoom
);

router.get(
  "/my-rooms",
  auth(Role.USER, Role.ADMIN, Role.OPERATOR),
  ChatController.getMyRooms
);

router.get(
  "/room/:roomId/messages",
  auth(Role.USER, Role.ADMIN, Role.OPERATOR),
  ChatController.getMessages
);

router.post(
  "/room/:roomId/message",
  auth(Role.USER, Role.ADMIN, Role.OPERATOR),
  ChatController.sendMessage
);

router.patch(
  "/message/:messageId",
  auth(Role.USER, Role.ADMIN, Role.OPERATOR),
  ChatController.editMessage
);

router.delete(
  "/message/:messageId",
  auth(Role.USER, Role.ADMIN, Role.OPERATOR),
  ChatController.deleteMessage
);

export const ChatRouter = router;
