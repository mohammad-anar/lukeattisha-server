import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { EmailSupportService } from './emailSupport.service.js';
import pick from '../../../helpers.ts/pick.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await EmailSupportService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Support email sent successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'email', 'userId', 'orderId']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await EmailSupportService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Support emails fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await EmailSupportService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Support email fetched successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await EmailSupportService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Support email deleted successfully',
    data: result,
  });
});

export const EmailSupportController = {
  create,
  getAll,
  getById,
  deleteById,
};
