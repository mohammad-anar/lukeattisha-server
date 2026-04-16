import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import pick from '../../../helpers.ts/pick.js';
import { OperatorAnalyticsStatsService } from './operatorAnalytics.stats.service.js';
import { OperatorAnalyticsPayoutService } from './operatorAnalytics.payout.service.js';
import { OperatorAnalyticsRevenueService } from './operatorAnalytics.revenue.service.js';
import { OperatorAnalyticsServicesService } from './operatorAnalytics.services.service.js';
import { OperatorAnalyticsPerformanceService } from './operatorAnalytics.performance.service.js';

import ApiError from '../../../errors/ApiError.js';
import { prisma } from '../../../helpers.ts/prisma.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolves the Operator.id from the authenticated user's JWT (which carries User.id).
 * Throws 404 if no operator profile exists for this user.
 */
async function resolveOperatorId(req: Request): Promise<string> {
  const userId = (req.user as any).id as string;
  const operator = await prisma.operator.findUnique({ where: { userId } });
  if (!operator) {
    throw new ApiError(404, 'Operator profile not found for this user');
  }
  return operator.id;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

// GET /api/v1/operator-analytics/stats
const getStats = catchAsync(async (req: Request, res: Response) => {
  const operatorId = await resolveOperatorId(req);
  const storeId = req.query.storeId as string | undefined;
  const result = await OperatorAnalyticsStatsService.getStats(operatorId, storeId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Operator analytics stats fetched successfully',
    data: result,
  });
});

// ─── Payout History ───────────────────────────────────────────────────────────

// GET /api/v1/operator-analytics/payout-history
const getPayoutHistory = catchAsync(async (req: Request, res: Response) => {
  const operatorId = await resolveOperatorId(req);
  const options = pick(req.query, ['limit', 'page', 'month', 'year', 'status', 'storeId']);
  const result = await OperatorAnalyticsPayoutService.getPayoutHistory(operatorId, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Payout history fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

// ─── Monthly Revenue Chart ─────────────────────────────────────────────────────

// GET /api/v1/operator-analytics/revenue-chart?filter=3|6|12
const getMonthlyRevenue = catchAsync(async (req: Request, res: Response) => {
  const operatorId = await resolveOperatorId(req);
  const filter = (req.query.filter as string) || '12';
  const storeId = req.query.storeId as string | undefined;

  if (!['3', '6', '12'].includes(filter)) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: 'Invalid filter. Use 3, 6, or 12.',
      data: null,
    });
  }

  const result = await OperatorAnalyticsRevenueService.getMonthlyRevenue(
    operatorId,
    filter as '3' | '6' | '12',
    storeId,
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Monthly revenue chart data fetched successfully',
    data: result,
  });
});

// ─── Top Selling Services ──────────────────────────────────────────────────────

// GET /api/v1/operator-analytics/top-services?limit=10
const getTopServices = catchAsync(async (req: Request, res: Response) => {
  const operatorId = await resolveOperatorId(req);
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const storeId = req.query.storeId as string | undefined;

  const result = await OperatorAnalyticsServicesService.getTopServices(operatorId, limit, storeId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Top selling services fetched successfully',
    data: result,
  });
});

// ─── Performance Metrics ───────────────────────────────────────────────────────
// GET /api/v1/operator-analytics/performance-metrics
const getPerformanceMetrics = catchAsync(async (req: Request, res: Response) => {
  const operatorId = await resolveOperatorId(req);
  const storeId = req.query.storeId as string | undefined;

  const result = await OperatorAnalyticsPerformanceService.getPerformanceMetrics(operatorId, storeId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Operator performance metrics fetched successfully',
    data: result,
  });
});

export const OperatorAnalyticsController = {
  getStats,
  getPayoutHistory,
  getMonthlyRevenue,
  getTopServices,
  getPerformanceMetrics,
};
