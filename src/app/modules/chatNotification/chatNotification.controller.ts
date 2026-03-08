import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { ChatNotificationService } from "./chatNotification.services.js";

/* ---------- CREATE ---------- */
const createChatNotification = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ChatNotificationService.createChatNotification(
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Chat notification created successfully",
      data: result,
    });
  },
);

/* ---------- GET ALL ---------- */
const getAllChatNotifications = catchAsync(
  async (_req: Request, res: Response) => {
    const result = await ChatNotificationService.getAllChatNotifications();

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "All chat notifications retrieved successfully",
      data: result,
    });
  },
);

/* ---------- GET BY USER ID ---------- */
const getChatNotificationsByUserId = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result =
      await ChatNotificationService.getChatNotificationsByUserId(userId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Chat notifications retrieved for user",
      data: result,
    });
  },
);

/* ---------- GET BY CHAT ROOM ID ---------- */
const getChatNotificationsByRoomId = catchAsync(
  async (req: Request, res: Response) => {
    const { chatRoomId } = req.params;
    const result =
      await ChatNotificationService.getChatNotificationsByRoomId(chatRoomId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Chat notifications retrieved for room",
      data: result,
    });
  },
);

/* ---------- MARK AS READ ---------- */
const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ChatNotificationService.markChatNotificationAsRead(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Chat notification marked as read",
    data: result,
  });
});

/* ---------- DELETE ---------- */
const deleteChatNotification = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ChatNotificationService.deleteChatNotification(id);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Chat notification deleted successfully",
      data: result,
    });
  },
);

export const ChatNotificationController = {
  createChatNotification,
  getAllChatNotifications,
  getChatNotificationsByUserId,
  getChatNotificationsByRoomId,
  markAsRead,
  deleteChatNotification,
};
