import express from 'express';
import { UserSubscriptionPlanController } from './userSubscriptionPlan.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { UserSubscriptionPlanValidation } from './userSubscriptionPlan.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), validateRequest(UserSubscriptionPlanValidation.createSchema), UserSubscriptionPlanController.create);
router.get('/', UserSubscriptionPlanController.getAll);
router.get('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER, UserRole.OPERATOR), UserSubscriptionPlanController.getById);
router.patch('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), validateRequest(UserSubscriptionPlanValidation.updateSchema), UserSubscriptionPlanController.update);
router.delete('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), UserSubscriptionPlanController.deleteById);

export const UserSubscriptionPlanRouter = router;
