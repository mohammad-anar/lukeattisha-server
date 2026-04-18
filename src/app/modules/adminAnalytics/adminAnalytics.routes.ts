import express from 'express';
import { AdminAnalyticsController } from './adminAnalytics.controller.js';
import auth from '../../middlewares/auth.js';
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

router.get(
  '/user-stats',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminAnalyticsController.getUserStats,
);

router.get(
  '/user-roles-chart',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminAnalyticsController.getUsersByRoleChart,
);

router.get(
  '/user-growth-chart',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminAnalyticsController.getUserGrowthChart,
);

router.get(
  '/revenue-analytics',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminAnalyticsController.getRevenueAnalytics,
);

router.get(
  '/order-volume-chart',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminAnalyticsController.getOrderVolumeChart,
);

router.get(
  '/payment-success-chart',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminAnalyticsController.getPaymentSuccessRateChart,
);

router.get(
  '/operator-activity',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminAnalyticsController.getOperatorActivityOverview,
);

export const AdminAnalyticsRouter = router;
