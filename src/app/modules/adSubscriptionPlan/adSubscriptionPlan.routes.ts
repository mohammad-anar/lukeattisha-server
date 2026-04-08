import express from 'express';
import { AdSubscriptionPlanController } from './adSubscriptionPlan.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { AdSubscriptionPlanValidation } from './adSubscriptionPlan.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), validateRequest(AdSubscriptionPlanValidation.createSchema), AdSubscriptionPlanController.create);
router.get('/', AdSubscriptionPlanController.getAll);

router.get('/:id', AdSubscriptionPlanController.getById);
router.patch('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), validateRequest(AdSubscriptionPlanValidation.updateSchema), AdSubscriptionPlanController.update);
router.delete('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), AdSubscriptionPlanController.deleteById);

export const AdSubscriptionPlanRouter = router;
