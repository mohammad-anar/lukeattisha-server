import express from 'express';
import { UserSubscriptionController } from './userSubscription.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { UserSubscriptionValidation } from './userSubscription.validation.js';

import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/activate-iap',
  auth(UserRole.USER),
  UserSubscriptionController.activateIAP
);

router.post('/', UserSubscriptionController.create);
router.get('/', UserSubscriptionController.getAll);
router.get('/:id', UserSubscriptionController.getById);
router.patch('/:id', UserSubscriptionController.update);
router.delete('/:id', UserSubscriptionController.deleteById);

export const UserSubscriptionRouter = router;
