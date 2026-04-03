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
  const result = await ChatMessageService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatMessage fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatMessageService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatMessage updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatMessageService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatMessage deleted successfully',
    data: result,
  });
});

export const ChatMessageController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
