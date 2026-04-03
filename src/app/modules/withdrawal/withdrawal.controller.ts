import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { WithdrawalService } from './withdrawal.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await WithdrawalService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Withdrawal created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await WithdrawalService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Withdrawal fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await WithdrawalService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Withdrawal fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await WithdrawalService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Withdrawal updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await WithdrawalService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Withdrawal deleted successfully',
    data: result,
  });
});

export const WithdrawalController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
