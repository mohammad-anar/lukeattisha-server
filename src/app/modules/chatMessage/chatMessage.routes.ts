import express from 'express';
import { ChatMessageController } from './chatMessage.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { ChatMessageValidation } from './chatMessage.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', ChatMessageController.create);
router.get('/', ChatMessageController.getAll);

// Get unread messages for admin
router.get('/admin/unread-messages', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), ChatMessageController.getAdminUnreadMessages);

router.get('/:id', ChatMessageController.getById);
router.get('/:roomId/messages', ChatMessageController.getByRoomId);

router.patch('/:roomId/mark-read', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER, UserRole.OPERATOR), ChatMessageController.markRoomMessagesAsRead);

router.patch('/:id', ChatMessageController.update);
router.delete('/:id', ChatMessageController.deleteById);

export const ChatMessageRouter = router;
