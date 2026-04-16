import express from 'express';
import auth from 'app/middlewares/auth.js';
import { UserRole } from '@prisma/client';
import { OperatorReportingController } from './operatorReporting.controller.js';

const router = express.Router();

// GET /api/v1/operator-reporting/stats
router.get(
  '/stats',
  auth(UserRole.OPERATOR),
  OperatorReportingController.getStats,
);

// GET /api/v1/operator-reporting/weekly-chart
router.get(
  '/weekly-chart',
  auth(UserRole.OPERATOR),
  OperatorReportingController.getWeeklyChart,
);

// GET /api/v1/operator-reporting/status-distribution
router.get(
  '/status-distribution',
  auth(UserRole.OPERATOR),
  OperatorReportingController.getStatusDistribution,
);

// GET /api/v1/operator-reporting/performance-summary
router.get(
  '/performance-summary',
  auth(UserRole.OPERATOR),
  OperatorReportingController.getPerformanceSummary,
);

export const OperatorReportingRouter = router;
