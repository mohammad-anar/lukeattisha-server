import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { FavouriteServiceService } from './favouriteService.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await FavouriteServiceService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'FavouriteService created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await FavouriteServiceService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'FavouriteService fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await FavouriteServiceService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'FavouriteService fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await FavouriteServiceService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'FavouriteService updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await FavouriteServiceService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'FavouriteService deleted successfully',
    data: result,
  });
});

export const FavouriteServiceController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
