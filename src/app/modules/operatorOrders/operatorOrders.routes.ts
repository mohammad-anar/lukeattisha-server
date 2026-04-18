import express from 'express';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';
import { OperatorOrdersController } from './operatorOrders.controller.js';

const router = express.Router();

// All routes are for OPERATOR only
// Operator ID is derived from req.user inside the controller

// GET /api/v1/operator-orders/stats?storeId=<optional>
router.get(
  '/stats',
  auth(UserRole.OPERATOR),
  OperatorOrdersController.getStats,
);

// GET /api/v1/operator-orders/newly-placed?storeId=<optional>
router.get(
  '/newly-placed',
  auth(UserRole.OPERATOR),
  OperatorOrdersController.getNewlyPlacedOrders,
);

export const OperatorOrdersRouter = router;
