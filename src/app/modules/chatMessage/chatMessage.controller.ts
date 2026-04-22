import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { ChatMessageService } from './chatMessage.service.js';
import pick from '../../../helpers.ts/pick.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatMessageService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'ChatMessage created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); // Customize filters as needed
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await ChatMessageService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatMessage fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatMessageService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatMessage fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatMessageService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatMessage updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatMessageService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatMessage deleted successfully',
    data: result,
  });
});

const getByRoomId = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await ChatMessageService.getByRoomId(req.params.roomId as string, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Chat messages for room fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAdminUnreadMessages = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as { id: string };
  const roomId = req.query.roomId as string | undefined;
  const result = await ChatMessageService.getAdminUnreadMessages(id, roomId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Unread messages fetched successfully',
    meta: result.meta as any,
    data: result.data,
  });
});

const markRoomMessagesAsRead = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const roomId = req.params.roomId as string;
  const result = await ChatMessageService.markRoomMessagesAsRead(user, roomId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Messages marked as read successfully',
    data: result,
  });
});

export const ChatMessageController = {
  create,
  getAll,
  getById,
  getByRoomId,
  getAdminUnreadMessages,
  markRoomMessagesAsRead,
  update,
  deleteById,
};
