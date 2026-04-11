import express from 'express';
import { NotificationController } from './notification.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { NotificationValidation } from './notification.validation.js';

import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), NotificationController.create);
router.get('/', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), NotificationController.getAll);
router.get('/my-notifications', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER, UserRole.OPERATOR), NotificationController.getMyNotifications);
router.patch('/mark-all-read', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER, UserRole.OPERATOR), NotificationController.markAllAsRead);
router.patch('/:id/mark-read', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER, UserRole.OPERATOR), NotificationController.markAsRead);
router.get('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER, UserRole.OPERATOR), NotificationController.getById);
router.patch('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), NotificationController.update);
// router.delete('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), NotificationController.deleteById);

export const NotificationRouter = router;
