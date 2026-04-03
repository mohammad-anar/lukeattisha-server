import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { OperatorWalletService } from './operatorWallet.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorWalletService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'OperatorWallet created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorWalletService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorWallet fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorWalletService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorWallet fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorWalletService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorWallet updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorWalletService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorWallet deleted successfully',
    data: result,
  });
});

export const OperatorWalletController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
