import express from "express";
import { Role } from "@prisma/client";
import { TicketController } from "./ticket.controller.js";
import { TicketValidation } from "./ticket.validation.js";
import auth from "app/middlewares/auth.js";
import validateRequest from "app/middlewares/validateRequest.js";

const router = express.Router();

router.post(
  "/",
  auth(Role.USER, Role.ADMIN, Role.OPERATOR),
  validateRequest(TicketValidation.createTicketSchema),
  TicketController.createTicket
);

router.get(
  "/my-tickets",
  auth(Role.USER, Role.OPERATOR),
  TicketController.getMyTickets
);

router.get(
  "/",
  auth(Role.ADMIN),
  TicketController.getAllTickets
);

router.get(
  "/:id",
  auth(Role.USER, Role.ADMIN, Role.OPERATOR),
  TicketController.getSingleTicket
);

router.patch(
  "/:id/status",
  auth(Role.ADMIN),
  validateRequest(TicketValidation.updateTicketStatusSchema),
  TicketController.updateTicketStatus
);

router.post(
  "/:id/messages",
  auth(Role.USER, Role.ADMIN, Role.OPERATOR),
  validateRequest(TicketValidation.addMessageSchema),
  TicketController.addMessage
);

export const TicketRouter = router;
