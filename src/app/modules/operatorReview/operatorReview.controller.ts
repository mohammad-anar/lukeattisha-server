import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import pick from '../../../helpers.ts/pick.js';
import { OperatorReviewService } from './operatorReview.service.js';

const resolveOperatorId = async (req: Request): Promise<string> => {
  const userId = (req.user as any).id as string;
  const operator = await prisma.operator.findUnique({ where: { userId } });
  if (!operator) {
    throw new ApiError(404, 'Operator profile not found for this user');
  }
  return operator.id;
};

const getReviews = catchAsync(async (req: Request, res: Response) => {
  const operatorId = await resolveOperatorId(req);
  const filters = pick(req.query, ['rating', 'serviceType', 'sortBy', 'sortOrder']);
  const paginationOptions = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await OperatorReviewService.getReviews(operatorId, filters as any, paginationOptions);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Operator reviews fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getRatingStats = catchAsync(async (req: Request, res: Response) => {
  const operatorId = await resolveOperatorId(req);
  const storeId = req.query.storeId as string | undefined;

  const result = await OperatorReviewService.getRatingStats(operatorId, storeId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Operator rating stats fetched successfully',
    data: result,
  });
});

export const OperatorReviewController = {
  getReviews,
  getRatingStats,
};
