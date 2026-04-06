import express from 'express';
import { OperatorController } from './operator.controller.js';
import auth from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { OperatorValidation } from './operator.validation.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.get('/', OperatorController.getAll);
router.get('/:id', OperatorController.getById);

// Stripe Connect Onboarding
router.post('/setup-connect/:id', auth(UserRole.OPERATOR), OperatorController.setupConnectAccount);
router.post('/verify-onboarding/:id', auth(UserRole.OPERATOR), OperatorController.verifyOnboardingStatus);
router.post('/', validateRequest(OperatorValidation.createSchema), OperatorController.create);
router.patch('/:id', validateRequest(OperatorValidation.updateSchema), OperatorController.update);
router.delete('/:id', OperatorController.deleteById);

export const OperatorRouter = router;
