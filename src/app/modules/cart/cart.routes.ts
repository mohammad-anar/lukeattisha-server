import express from 'express';
import { CartController } from './cart.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { CartValidation } from './cart.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.USER), validateRequest(CartValidation.createSchema), CartController.create);
router.get('/', auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN), CartController.getAll);
router.get('/:id', auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN), CartController.getById);
router.patch('/:id', auth(UserRole.USER), validateRequest(CartValidation.updateSchema), CartController.update);
router.delete('/:id', auth(UserRole.USER), CartController.deleteById);

export const CartRouter = router;
