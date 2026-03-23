import express from "express";
import { Role } from "@prisma/client";
import { ChatController } from "./chat.controller.js";
import { ChatValidation } from "./chat.validation.js";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";

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
