import express from 'express';
import { UserController } from './user.controller.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest.js';
import { UserValidation } from './user.validation.js';
import fileUploadHandler from '../../middlewares/fileUploadHandler.js';

const router = express.Router();

router.post('/create-admin', auth(UserRole.SUPER_ADMIN), fileUploadHandler(), validateRequest(UserValidation.createAdminSchema), UserController.createAdmin);
router.post('/create-operator', auth(UserRole.SUPER_ADMIN), fileUploadHandler(), validateRequest(UserValidation.createOperatorSchema), UserController.createOperator);
router.patch('/approve-operator/:id', auth(UserRole.SUPER_ADMIN), UserController.approveOperator);

router.get('/admins', auth(UserRole.SUPER_ADMIN), UserController.getAllAdmins);
router.get('/operators', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), UserController.getAllOperators);
router.get('/get-me', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER, UserRole.OPERATOR), UserController.getMe);
router.get('/notification-preferences', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER, UserRole.OPERATOR), UserController.getNotificationPreferences);
router.patch('/notification-preferences', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER, UserRole.OPERATOR), validateRequest(UserValidation.updateNotificationPreferencesSchema), UserController.updateNotificationPreferences);
router.get('/', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), UserController.getAll);
router.get('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER, UserRole.OPERATOR), UserController.getById);
router.patch('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER, UserRole.OPERATOR), fileUploadHandler(), validateRequest(UserValidation.updateSchema), UserController.update);
// ban user
router.patch('/:id/ban', auth(UserRole.SUPER_ADMIN), UserController.banUser);
// unban user
router.patch('/:id/unban', auth(UserRole.SUPER_ADMIN), UserController.unbanUser);
// revert delete
router.patch('/:id/make-active', auth(UserRole.SUPER_ADMIN), UserController.revertDelete);
router.patch('/:id/delete', auth(UserRole.SUPER_ADMIN), UserController.deleteById);

export const UserRouter = router;
