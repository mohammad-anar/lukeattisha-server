import express from 'express';
import { OperatorCategoryController } from './operatorCategory.controller.js';
import auth from 'app/middlewares/auth.js';
import { UserRole } from '@prisma/client';
import { OperatorCategoryValidation } from './operatorCategory.validation.js';
import validateRequest from 'app/middlewares/validateRequest.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { OperatorCategoryValidation } from './operatorCategory.validation.js';

const router = express.Router();

router.post('/', auth(UserRole.OPERATOR), validateRequest(OperatorCategoryValidation.createSchema), OperatorCategoryController.create);
router.get('/:operatorId', auth(UserRole.OPERATOR, UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN), OperatorCategoryController.getAll);
router.get('/:id', auth(UserRole.OPERATOR, UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN), OperatorCategoryController.getById);
router.patch('/:id', auth(UserRole.OPERATOR), validateRequest(OperatorCategoryValidation.updateSchema), OperatorCategoryController.update);
router.delete('/:id', auth(UserRole.OPERATOR), OperatorCategoryController.deleteById);

export const OperatorCategoryRouter = router;
