import express from 'express';
import { UserController } from './user.controller.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest.js';
import { UserValidation } from './user.validation.js';

const router = express.Router();

router.post('/create-admin', auth(UserRole.SUPER_ADMIN), validateRequest(UserValidation.createAdminSchema), UserController.createAdmin);
router.post('/create-operator', auth(UserRole.SUPER_ADMIN), validateRequest(UserValidation.createOperatorSchema), UserController.createOperator);

router.get('/admins', auth(UserRole.SUPER_ADMIN), UserController.getAllAdmins);
router.get('/operators', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), UserController.getAllOperators);
router.get('/', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), UserController.getAll);
router.get('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER, UserRole.OPERATOR), UserController.getById);
router.patch('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER, UserRole.OPERATOR), validateRequest(UserValidation.updateSchema), UserController.update);
router.delete('/:id', auth(UserRole.SUPER_ADMIN), UserController.deleteById);

export const UserRouter = router;
