import validateRequest from '../../middlewares/validateRequest.js';
import express from 'express';
import { AdSubscriptionController } from './adSubscription.controller.js';
import { AdSubscriptionValidation } from './adSubscription.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.ADMIN), AdSubscriptionController.create);
router.get('/', auth(UserRole.ADMIN, UserRole.OPERATOR, UserRole.SUPER_ADMIN), AdSubscriptionController.getAll);
router.get('/:id', auth(UserRole.ADMIN, UserRole.OPERATOR, UserRole.SUPER_ADMIN), AdSubscriptionController.getById);
// create checkout session
router.post('/checkout-session', auth(UserRole.OPERATOR), validateRequest(AdSubscriptionValidation.createCheckoutSessionSchema), AdSubscriptionController.createCheckoutSession);
router.post('/cancel/:id', auth(UserRole.OPERATOR), AdSubscriptionController.cancelSubscription);
router.patch('/:id', auth(UserRole.ADMIN), AdSubscriptionController.update);

export const AdSubscriptionRouter = router;
