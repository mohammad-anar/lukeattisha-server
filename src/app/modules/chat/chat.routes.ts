import express from "express";
import auth from "src/app/middlewares/auth.js";
import validateRequest from "src/app/middlewares/validateRequest.js";
import { Role } from "@prisma/client";
import { ChatController } from "./chat.controller.js";
import { ChatValidation } from "./chat.validation.js";

const router = express.Router();

router.post(
  "/tickets",
  auth(Role.USER, Role.OPERATOR),
  validateRequest(ChatValidation.createTicketSchema),
  ChatController.createTicket
);

router.get("/tickets", auth(Role.USER, Role.OPERATOR), ChatController.getMyTickets);

router.get("/tickets/:id", auth(Role.USER, Role.OPERATOR, Role.ADMIN), ChatController.getTicketById);

router.post(
  "/tickets/:id/messages",
  auth(Role.USER, Role.OPERATOR, Role.ADMIN),
  validateRequest(ChatValidation.sendMessageSchema),
  ChatController.sendMessage
);

router.patch("/tickets/:id/close", auth(Role.USER), ChatController.closeTicket);

export const ChatRouter = router;
