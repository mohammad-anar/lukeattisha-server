import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { ChatRoomService } from './chatRoom.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatRoomService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'ChatRoom created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatRoomService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatRoom fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatRoomService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatRoom fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatRoomService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatRoom updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatRoomService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatRoom deleted successfully',
    data: result,
  });
});

export const ChatRoomController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
