import express from 'express';
import { OperatorAnalyticsController } from './operatorAnalytics.controller.js';
import auth from 'app/middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

// All routes: OPERATOR only (operatorId is derived from req.user inside controller)

// GET /api/v1/operator-analytics/stats?storeId=<optional>
router.get(
  '/stats',
  auth(UserRole.OPERATOR),
  OperatorAnalyticsController.getStats,
);

// GET /api/v1/operator-analytics/payout-history?page=1&limit=10
router.get(
  '/payout-history',
  auth(UserRole.OPERATOR),
  OperatorAnalyticsController.getPayoutHistory,
);

// GET /api/v1/operator-analytics/revenue-chart?filter=3|6|12&storeId=<optional>
router.get(
  '/revenue-chart',
  auth(UserRole.OPERATOR),
  OperatorAnalyticsController.getMonthlyRevenue,
);

// GET /api/v1/operator-analytics/top-services?limit=10&storeId=<optional>
router.get(
  '/top-services',
  auth(UserRole.OPERATOR),
  OperatorAnalyticsController.getTopServices,
);

export const OperatorAnalyticsRouter = router;
