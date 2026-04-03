import express from 'express';
import { AdSubscriptionPlanController } from './adSubscriptionPlan.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { AdSubscriptionPlanValidation } from './adSubscriptionPlan.validation.js';

const router = express.Router();

router.post('/', AdSubscriptionPlanController.create);
router.get('/', AdSubscriptionPlanController.getAll);
router.get('/:id', AdSubscriptionPlanController.getById);
router.patch('/:id', AdSubscriptionPlanController.update);
router.delete('/:id', AdSubscriptionPlanController.deleteById);

export const AdSubscriptionPlanRouter = router;
