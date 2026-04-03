import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { AdminWalletService } from './adminWallet.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminWalletService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'AdminWallet created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminWalletService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminWallet fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminWalletService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminWallet fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminWalletService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminWallet updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminWalletService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminWallet deleted successfully',
    data: result,
  });
});

export const AdminWalletController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
