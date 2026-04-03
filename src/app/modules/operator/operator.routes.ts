import express from 'express';
import { OperatorController } from './operator.controller.js';
import auth from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { OperatorValidation } from './operator.validation.js';

const router = express.Router();

router.get('/', OperatorController.getAll);
router.get('/:id', OperatorController.getById);

// Stripe Connect Onboarding
router.post('/setup-connect/:id', auth('OPERATOR', 'ADMIN', 'SUPER_ADMIN'), OperatorController.setupConnectAccount);

router.post('/', validateRequest(OperatorValidation.createSchema), OperatorController.create);
router.patch('/:id', validateRequest(OperatorValidation.updateSchema), OperatorController.update);
router.delete('/:id', OperatorController.deleteById);

export const OperatorRouter = router;
