import express from 'express';
import { AdminAnalyticsController } from './adminAnalytics.controller.js';
import auth from 'app/middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

// All routes restricted to ADMIN and SUPER_ADMIN
router.get(
  '/stats',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminAnalyticsController.getStatsSummary,
);

router.get(
  '/revenue-chart',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminAnalyticsController.getMonthlyRevenueChart,
);

router.get(
  '/orders-chart',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminAnalyticsController.getOrdersChart,
);

router.get(
  '/order-status',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminAnalyticsController.getOrderStatusChart,
);

router.get(
  '/top-operators',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminAnalyticsController.getTopOperators,
);

router.get(
  '/store-performance',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminAnalyticsController.getStorePerformance,
);

export const AdminAnalyticsRouter = router;
