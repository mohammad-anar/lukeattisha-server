import express from 'express';
import { OrderController } from './order.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { OrderValidation } from './order.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/checkout', auth(UserRole.USER), validateRequest(OrderValidation.checkoutSchema), OrderController.checkout);
router.get('/', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), OrderController.getAll);
router.get('/my-orders', auth(UserRole.USER, UserRole.OPERATOR), OrderController.getMyOrders);
router.get('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER, UserRole.OPERATOR), OrderController.getById);
router.patch('/update-status/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR), validateRequest(OrderValidation.updateSchema), OrderController.updateOrderStatus);
router.patch('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR), validateRequest(OrderValidation.updateSchema), OrderController.update);
router.delete('/:id', auth(UserRole.SUPER_ADMIN), OrderController.deleteById);

export const OrderRouter = router;
