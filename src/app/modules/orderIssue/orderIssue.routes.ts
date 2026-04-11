import express from 'express';
import { OrderIssueController } from './orderIssue.controller.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.USER), OrderIssueController.create);
router.get('/', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), OrderIssueController.getAll);
router.get('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER), OrderIssueController.getById);
router.patch('/:id/status', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), OrderIssueController.updateStatus);

export const OrderIssueRouter = router;
