import express from 'express';
import { CartController } from './cart.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';
import { CartValidation } from './cart.validation.js';

const router = express.Router();

router.post('/add', auth(UserRole.USER), validateRequest(CartValidation.addItemSchema), CartController.addItem);
router.get('/my-cart', auth(UserRole.USER), CartController.getMyCart);
router.delete('/item/:cartItemId', auth(UserRole.USER), CartController.removeItem);
router.delete('/clear', auth(UserRole.USER), CartController.clearCart);

export const CartRouter = router;
