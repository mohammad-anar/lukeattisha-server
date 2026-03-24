import { Request, Response } from "express";
import { TicketService } from "./ticket.service.js";
import catchAsync from "app/shared/catchAsync.js";
import sendResponse from "app/shared/sendResponse.js";
import ApiError from "../../../errors/ApiError.js";
import { Role } from "@prisma/client";

const createTicket = catchAsync(async (req: any, res: Response) => {
  const result = await TicketService.createTicket(req.user.id, req.body);
  sendResponse(res, { success: true, statusCode: 201, message: "Ticket created", data: result });
});

const getMyTickets = catchAsync(async (req: any, res: Response) => {
  const result = await TicketService.getMyTickets(req.user.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Tickets retrieved", data: result });
});

const getAllTickets = catchAsync(async (req: Request, res: Response) => {
  const result = await TicketService.getAllTickets();
  sendResponse(res, { success: true, statusCode: 200, message: "All tickets retrieved", data: result });
});

const getSingleTicket = catchAsync(async (req: any, res: Response) => {
  const id = req.params.id as string;
  const ticket = await TicketService.getSingleTicket(id);
  if (!ticket) throw new ApiError(404, "Ticket not found");
  
  if (req.user.role === Role.USER && ticket.userId !== req.user.id) {
    throw new ApiError(403, "Not authorized to view this ticket");
  }

  sendResponse(res, { success: true, statusCode: 200, message: "Ticket retrieved", data: ticket });
});

const updateTicketStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await TicketService.updateTicket(id, req.body);
  sendResponse(res, { success: true, statusCode: 200, message: "Ticket updated", data: result });
});

const addMessage = catchAsync(async (req: any, res: Response) => {
  const id = req.params.id as string;
  const ticket = await TicketService.getSingleTicket(id);
  if (!ticket) throw new ApiError(404, "Ticket not found");

  if (req.user.role === Role.USER && ticket.userId !== req.user.id) {
    throw new ApiError(403, "Not authorized to post to this ticket");
  }

  const result = await TicketService.addMessage(id, req.user.id, req.body.content);
  sendResponse(res, { success: true, statusCode: 201, message: "Message added", data: result });
});

export const TicketController = {
  createTicket,
  getMyTickets,
  getAllTickets,
  getSingleTicket,
  updateTicketStatus,
  addMessage,
};
