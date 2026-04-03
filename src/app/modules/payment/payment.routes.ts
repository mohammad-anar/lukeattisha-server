import express from 'express';
import { PaymentController } from './payment.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { PaymentValidation } from './payment.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.USER), validateRequest(PaymentValidation.createSchema), PaymentController.create);
router.get('/', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), PaymentController.getAll);
router.get('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER, UserRole.OPERATOR), PaymentController.getById);
router.patch('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), validateRequest(PaymentValidation.updateSchema), PaymentController.update);
router.delete('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), PaymentController.deleteById);

export const PaymentRouter = router;
