import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { ChatRoomService } from './chatRoom.service.js';
import pick from '../../../helpers.ts/pick.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatRoomService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'ChatRoom created successfully',
    data: result,
  });
});

const getMyRooms = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = (req as any).user;
  const result = await ChatRoomService.getMyRooms(userId, role);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'My ChatRooms fetched successfully',
    data: result,
  });
});

const createSupportRoom = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = (req as any).user;
  const result = await ChatRoomService.getOrCreateSupportRoom(userId);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Support chat room ready',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); // Customize filters as needed
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await ChatRoomService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatRoom fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatRoomService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatRoom fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatRoomService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatRoom updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatRoomService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatRoom deleted successfully',
    data: result,
  });
});

export const ChatRoomController = {
  create,
  getMyRooms,
  createSupportRoom,
  getAll,
  getById,
  update,
  deleteById,
};
