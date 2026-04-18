import express from 'express';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';
import { OperatorMembershipController } from './operatorMembership.controller.js';

const router = express.Router();

// GET /api/v1/operator-membership/stats
router.get('/stats', auth(UserRole.OPERATOR), OperatorMembershipController.getMembershipStats);

// GET /api/v1/operator-membership/order-distribution
router.get('/order-distribution', auth(UserRole.OPERATOR), OperatorMembershipController.getOrderDistribution);

// GET /api/v1/operator-membership/orders-over-time
router.get('/orders-over-time', auth(UserRole.OPERATOR), OperatorMembershipController.getOrdersOverTime);

// GET /api/v1/operator-membership/order-summary
router.get('/order-summary', auth(UserRole.OPERATOR), OperatorMembershipController.getOrderSummary);

export const OperatorMembershipRouter = router;
