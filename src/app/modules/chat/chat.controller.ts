import { Request, Response } from "express";
import { ChatService } from "./chat.service.js";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import { emitToRoom } from "../../../helpers.ts/socketHelper.js";

const createOrGetRoom = catchAsync(async (req: any, res: Response) => {
  // body requires 'opponentId' or similar
  const { opponentId } = req.body;
  const result = await ChatService.createOrGetRoom(req.user.id, opponentId);
  sendResponse(res, { success: true, statusCode: 200, message: "Room resolved", data: result });
});

const getMyRooms = catchAsync(async (req: any, res: Response) => {
  const result = await ChatService.getMyRooms(req.user.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Rooms retrieved", data: result });
});

const getMessages = catchAsync(async (req: any, res: Response) => {
  const { roomId } = req.params;
  const result = await ChatService.getMessages(roomId, req.user.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Messages retrieved", data: result });
});

const sendMessage = catchAsync(async (req: any, res: Response) => {
  const { roomId } = req.params;
  const { content } = req.body;
  
  const result = await ChatService.sendMessage(roomId, req.user.id, content);
  
  // Real-time broadcast
  emitToRoom(`room:${roomId}`, "new-message", result);

  sendResponse(res, { success: true, statusCode: 201, message: "Message sent", data: result });
});

const editMessage = catchAsync(async (req: any, res: Response) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const result = await ChatService.editMessage(messageId, req.user.id, content);
  
  emitToRoom(`room:${result.roomId}`, "message-edited", result);
  sendResponse(res, { success: true, statusCode: 200, message: "Message updated", data: result });
});

const deleteMessage = catchAsync(async (req: any, res: Response) => {
  const { messageId } = req.params;
  const result = await ChatService.deleteMessage(messageId, req.user.id);

  emitToRoom(`room:${result.roomId}`, "message-deleted", result);
  sendResponse(res, { success: true, statusCode: 200, message: "Message deleted", data: result });
});

export const ChatController = {
  createOrGetRoom,
  getMyRooms,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
};
