import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { OperatorService } from './operator.service.js';
import pick from '../../../helpers.ts/pick.js';

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
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); 
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await OperatorService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Operator fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Operator fetched successfully',
    data: result,
  });
});



const update = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Operator updated successfully',
    data: result,
  });
});

const setupConnectAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorService.setupConnectAccount(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Stripe Connect setup initiated successfully',
    data: result,
  });
});

const verifyOnboardingStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorService.verifyOnboardingStatus(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Onboarding status verified successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorService.deleteById(req.params.id as string);
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
  setupConnectAccount,
  verifyOnboardingStatus,
};
