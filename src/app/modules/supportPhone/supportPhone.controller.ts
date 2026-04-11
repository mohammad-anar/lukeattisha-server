import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { SupportPhoneService } from './supportPhone.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportPhoneService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Support phone created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportPhoneService.getAll();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Support phones fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportPhoneService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Support phone fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportPhoneService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Support phone updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportPhoneService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Support phone deleted successfully',
    data: result,
  });
});

export const SupportPhoneController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
