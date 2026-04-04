import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { BannerService } from './banner.service.js';
import pick from '../../../helpers.ts/pick.js';
import { getSingleFilePath } from '../../shared/getFilePath.js';
import { config } from '../../../config/index.js';

const BANNER_FILTER_FIELDS = ['bannerType', 'isActive'];
const BANNER_PAGINATION_FIELDS = ['limit', 'page', 'sortBy', 'sortOrder'];

const create = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const image = getSingleFilePath(req.files as any, 'image');
  if (image) {
    payload.image = `http://${config.ip_address}:${config.port}${image}`;
  }

  const result = await BannerService.create(payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Banner created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', ...BANNER_FILTER_FIELDS]);
  const options = pick(req.query, BANNER_PAGINATION_FIELDS);
  const result = await BannerService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Banners fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getActiveBanners = catchAsync(async (_req: Request, res: Response) => {
  const result = await BannerService.getActiveBanners();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Active banners fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Banner fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const image = getSingleFilePath(req.files as any, 'image');
  if (image) {
    payload.image = `http://${config.ip_address}:${config.port}${image}`;
  }

  const result = await BannerService.update(req.params.id as string, payload);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Banner updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.deleteById(req.params.id as string);
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
  getActiveBanners,
  getById,
  update,
  deleteById,
};
