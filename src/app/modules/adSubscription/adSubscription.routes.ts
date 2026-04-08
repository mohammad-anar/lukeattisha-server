import validateRequest from 'app/middlewares/validateRequest.js';
import express from 'express';
import { AdSubscriptionController } from './adSubscription.controller.js';
import { AdSubscriptionValidation } from './adSubscription.validation.js';
import auth from 'app/middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', AdSubscriptionController.create);
router.get('/', AdSubscriptionController.getAll);
router.get('/:id', AdSubscriptionController.getById);
// create checkout session
router.post('/checkout-session', auth(UserRole.OPERATOR), validateRequest(AdSubscriptionValidation.createCheckoutSessionSchema), AdSubscriptionController.createCheckoutSession);
router.patch('/:id', AdSubscriptionController.update);
router.delete('/:id', AdSubscriptionController.deleteById);

export const AdSubscriptionRouter = router;
