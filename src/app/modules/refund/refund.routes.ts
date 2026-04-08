import express from 'express';
import { RefundController } from './refund.controller.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/request',
  auth(UserRole.USER),
  RefundController.requestRefund
);

router.patch(
  '/operator/:id',
  auth(UserRole.OPERATOR),
  RefundController.processRefundByOperator
);

router.patch(
  '/admin/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  RefundController.processRefundByAdmin
);

export const RefundRoutes = router;
