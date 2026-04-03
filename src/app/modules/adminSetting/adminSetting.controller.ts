import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { AdminSettingService } from './adminSetting.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminSettingService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'AdminSetting created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminSettingService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminSetting fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminSettingService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminSetting fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminSettingService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminSetting updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminSettingService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminSetting deleted successfully',
    data: result,
  });
});

export const AdminSettingController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
