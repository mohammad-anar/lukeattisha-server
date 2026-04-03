import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { PaymentService } from './payment.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Payment created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Payment fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Payment fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Payment updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Payment deleted successfully',
    data: result,
  });
});

export const PaymentController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
