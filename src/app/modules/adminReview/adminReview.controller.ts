import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { AdminReviewService } from './adminReview.service.js';

const getReviewStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminReviewService.getReviewStats();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Review stats fetched successfully',
    data: result,
  });
});

const getReviewsByRatingChart = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminReviewService.getReviewsByRatingChart();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Reviews by rating chart data fetched successfully',
    data: result,
  });
});

const getReviewTrendChart = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminReviewService.getReviewTrendChart();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Review trend chart data fetched successfully',
    data: result,
  });
});

const getTopOperatorsByRating = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminReviewService.getTopOperatorsByRating();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Top operators by rating fetched successfully',
    data: result,
  });
});

export const AdminReviewController = {
  getReviewStats,
  getReviewsByRatingChart,
  getReviewTrendChart,
  getTopOperatorsByRating,
};
