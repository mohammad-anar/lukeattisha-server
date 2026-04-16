import express from 'express';
import { AdminReviewController } from './adminReview.controller.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.get(
  '/stats',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminReviewController.getReviewStats,
);

router.get(
  '/rating-chart',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminReviewController.getReviewsByRatingChart,
);

router.get(
  '/trend-chart',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminReviewController.getReviewTrendChart,
);

router.get(
  '/top-operators',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminReviewController.getTopOperatorsByRating,
);

export const AdminReviewRoutes = router;
