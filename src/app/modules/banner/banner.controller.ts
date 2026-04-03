import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { BannerService } from './banner.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Banner created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Banner fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Banner fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Banner updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Banner deleted successfully',
    data: result,
  });
});

export const BannerController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
