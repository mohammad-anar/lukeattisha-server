import express from 'express';
import { CartItemController } from './cartItem.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { CartItemValidation } from './cartItem.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.USER), validateRequest(CartItemValidation.createSchema), CartItemController.create);
router.get('/', auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN), CartItemController.getAll);
router.get('/:id', auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN), CartItemController.getById);
router.patch('/:id', auth(UserRole.USER), validateRequest(CartItemValidation.updateSchema), CartItemController.update);
router.delete('/:id', auth(UserRole.USER), CartItemController.deleteById);

export const CartItemRouter = router;
