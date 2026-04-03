import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { OperatorService } from './operator.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Operator created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Operator fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Operator fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Operator updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Operator deleted successfully',
    data: result,
  });
});

export const OperatorController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
