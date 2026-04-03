import express from 'express';
import { AdSubscriptionController } from './adSubscription.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { AdSubscriptionValidation } from './adSubscription.validation.js';

const router = express.Router();

router.post('/', AdSubscriptionController.create);
router.get('/', AdSubscriptionController.getAll);
router.get('/:id', AdSubscriptionController.getById);
router.patch('/:id', AdSubscriptionController.update);
router.delete('/:id', AdSubscriptionController.deleteById);

export const AdSubscriptionRouter = router;
