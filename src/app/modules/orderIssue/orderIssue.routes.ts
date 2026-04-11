import express from 'express';
import { OrderIssueController } from './orderIssue.controller.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';
import fileUploadHandler from '../../middlewares/fileUploadHandler.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { OrderIssueValidation } from './orderIssue.validation.js';

const router = express.Router();

router.post(
    '/',
    auth(UserRole.USER),
    fileUploadHandler(),
    validateRequest(OrderIssueValidation.createOrderIssueValidation),
    OrderIssueController.create
);

router.get('/', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR, UserRole.USER), OrderIssueController.getAll);
router.get('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER, UserRole.OPERATOR), OrderIssueController.getById);

// Operator response route
router.patch(
    '/:id/respond',
    auth(UserRole.OPERATOR),
    validateRequest(OrderIssueValidation.updateOrderIssueValidation),
    OrderIssueController.respondToIssue
);

// Admin resolution route for escalated issues
router.patch(
    '/:id/resolve',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    validateRequest(OrderIssueValidation.updateOrderIssueValidation),
    OrderIssueController.resolveEscalatedIssue
);

export const OrderIssueRouter = router;
