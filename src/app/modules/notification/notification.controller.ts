import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { NotificationService } from './notification.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Notification created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notification fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notification fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notification updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notification deleted successfully',
    data: result,
  });
});

export const NotificationController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
