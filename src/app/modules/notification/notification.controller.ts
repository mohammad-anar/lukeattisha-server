import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { NotificationService } from './notification.service.js';
import pick from '../../../helpers.ts/pick.js';

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
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status', 'userId']); // Added userId to filters
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await NotificationService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notifications fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const filters = pick(req.query, ['searchTerm', 'status']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  
  const result = await NotificationService.getAll({ ...filters, userId: user.id }, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'My notifications fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.getById(req.params.id as string );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notification fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notification updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notification deleted successfully',
    data: result,
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await NotificationService.markAllAsRead(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'All notifications marked as read',
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await NotificationService.markAsRead(req.params.id as string, userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notification marked as read',
    data: result,
  });
});

export const NotificationController = {
  create,
  getAll,
  getMyNotifications,
  getById,
  update,
  deleteById,
  markAllAsRead,
  markAsRead,
};
