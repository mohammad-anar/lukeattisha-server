import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { ChatService } from "./chat.service.js";

const createTicket = catchAsync(async (req: any, res: Response) => {
  const result = await ChatService.createTicket(req.user.id, req.body);
  sendResponse(res, { success: true, statusCode: 201, message: "Support ticket created", data: result });
});

const getMyTickets = catchAsync(async (req: any, res: Response) => {
  const result = await ChatService.getMyTickets(req.user.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Tickets retrieved", data: result });
});

const getTicketById = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatService.getTicketById(req.params.id as string);
  sendResponse(res, { success: true, statusCode: 200, message: "Ticket retrieved", data: result });
});

const sendMessage = catchAsync(async (req: any, res: Response) => {
  const result = await ChatService.sendMessage(req.params.id as string, req.user.id, req.body);
  sendResponse(res, { success: true, statusCode: 201, message: "Message sent", data: result });
});

const closeTicket = catchAsync(async (req: any, res: Response) => {
  const result = await ChatService.closeTicket(req.user.id, req.params.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Ticket closed", data: result });
});

export const ChatController = {
  createTicket,
  getMyTickets,
  getTicketById,
  sendMessage,
  closeTicket,
};
