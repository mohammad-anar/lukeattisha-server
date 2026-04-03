import express from 'express';
import { UserSubscriptionPlanController } from './userSubscriptionPlan.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { UserSubscriptionPlanValidation } from './userSubscriptionPlan.validation.js';

const router = express.Router();

router.post('/', UserSubscriptionPlanController.create);
router.get('/', UserSubscriptionPlanController.getAll);
router.get('/:id', UserSubscriptionPlanController.getById);
router.patch('/:id', UserSubscriptionPlanController.update);
router.delete('/:id', UserSubscriptionPlanController.deleteById);

export const UserSubscriptionPlanRouter = router;
