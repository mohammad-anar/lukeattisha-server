import express from 'express';
import auth from 'app/middlewares/auth.js';
import { UserRole } from '@prisma/client';
import { OperatorReviewController } from './operatorReview.controller.js';

const router = express.Router();

// GET /api/v1/operator-review/reviews
router.get(
  '/reviews',
  auth(UserRole.OPERATOR),
  OperatorReviewController.getReviews,
);

// GET /api/v1/operator-review/stats
router.get(
  '/stats',
  auth(UserRole.OPERATOR),
  OperatorReviewController.getRatingStats,
);

export const OperatorReviewRouter = router;
