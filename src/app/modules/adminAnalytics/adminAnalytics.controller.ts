import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { AdminAnalyticsService } from './adminAnalytics.service.js';

// GET /api/v1/admin-analytics/stats
const getStatsSummary = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminAnalyticsService.getStatsSummary();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Admin analytics stats fetched successfully',
    data: result,
  });
});

// GET /api/v1/admin-analytics/revenue-chart?filter=weekly|monthly|3|6|12
const getMonthlyRevenueChart = catchAsync(async (req: Request, res: Response) => {
  const filter = (req.query.filter as string) || '12';
  const validFilters = ['weekly', 'monthly', '3', '6', '12'];
  if (!validFilters.includes(filter)) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: 'Invalid filter. Use weekly, monthly, 3, 6, or 12.',
      data: null,
    });
  }
  const result = await AdminAnalyticsService.getMonthlyRevenueChart(filter as 'weekly' | 'monthly' | '3' | '6' | '12');
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Monthly revenue chart data fetched successfully',
    data: result,
  });
});

// GET /api/v1/admin-analytics/orders-chart?period=weekly|monthly|yearly
const getOrdersChart = catchAsync(async (req: Request, res: Response) => {
  const period = (req.query.period as string) || 'monthly';
  if (!['weekly', 'monthly', 'yearly'].includes(period)) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: 'Invalid period. Use weekly, monthly, or yearly.',
      data: null,
    });
  }
  const result = await AdminAnalyticsService.getOrdersChart(period as 'weekly' | 'monthly' | 'yearly');
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Orders chart data fetched successfully',
    data: result,
  });
});

// GET /api/v1/admin-analytics/order-status
const getOrderStatusChart = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminAnalyticsService.getOrderStatusChart();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Order status pie chart data fetched successfully',
    data: result,
  });
});

// GET /api/v1/admin-analytics/top-operators?limit=10
const getTopOperators = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const result = await AdminAnalyticsService.getTopOperators(limit);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Top operators by success rate fetched successfully',
    data: result,
  });
});

// GET /api/v1/admin-analytics/store-performance?month=4&year=2026
const getStorePerformance = catchAsync(async (req: Request, res: Response) => {
  const now = new Date();
  const month = req.query.month ? parseInt(req.query.month as string) : now.getMonth() + 1;
  const year = req.query.year ? parseInt(req.query.year as string) : now.getFullYear();

  if (month < 1 || month > 12) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: 'Invalid month. Must be between 1 and 12.',
      data: null,
    });
  }

  const result = await AdminAnalyticsService.getStorePerformance(month, year);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Store performance data fetched successfully',
    data: result,
  });
});

export const AdminAnalyticsController = {
  getStatsSummary,
  getMonthlyRevenueChart,
  getOrdersChart,
  getOrderStatusChart,
  getTopOperators,
  getStorePerformance,
};
