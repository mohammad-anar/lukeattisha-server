import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { FAQService } from './faq.service.js';
import pick from '../../../helpers.ts/pick.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await FAQService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'FAQ created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await FAQService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'FAQs fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await FAQService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'FAQ fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await FAQService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'FAQ updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await FAQService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'FAQ deleted successfully',
    data: result,
  });
});

export const FAQController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
