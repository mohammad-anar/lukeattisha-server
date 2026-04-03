import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { AdminWalletTransactionService } from './adminWalletTransaction.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminWalletTransactionService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'AdminWalletTransaction created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminWalletTransactionService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminWalletTransaction fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminWalletTransactionService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminWalletTransaction fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminWalletTransactionService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminWalletTransaction updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminWalletTransactionService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminWalletTransaction deleted successfully',
    data: result,
  });
});

export const AdminWalletTransactionController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
