import express from 'express';
import { CategoryController } from './category.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { CategoryValidation } from './category.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), validateRequest(CategoryValidation.createSchema), CategoryController.create);
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.patch('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), validateRequest(CategoryValidation.updateSchema), CategoryController.update);
router.delete('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), CategoryController.deleteById);

export const CategoryRouter = router;
