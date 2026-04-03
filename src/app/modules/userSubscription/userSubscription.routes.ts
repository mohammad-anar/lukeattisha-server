import express from 'express';
import { UserSubscriptionController } from './userSubscription.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { UserSubscriptionValidation } from './userSubscription.validation.js';

const router = express.Router();

router.post('/', UserSubscriptionController.create);
router.get('/', UserSubscriptionController.getAll);
router.get('/:id', UserSubscriptionController.getById);
router.patch('/:id', UserSubscriptionController.update);
router.delete('/:id', UserSubscriptionController.deleteById);

export const UserSubscriptionRouter = router;
