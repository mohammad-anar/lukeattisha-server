import express from 'express';
import { ChatRoomController } from './chatRoom.controller.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

import { ChatMessageController } from '../chatMessage/chatMessage.controller.js';

const router = express.Router();

router.post('/', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), ChatRoomController.create);
router.get('/my-rooms', auth(UserRole.USER, UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), ChatRoomController.getMyRooms);
router.post('/create-support', auth(UserRole.USER), ChatRoomController.createSupportRoom);

router.get('/', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), ChatRoomController.getAll);
router.get('/:id', auth(UserRole.USER, UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), ChatRoomController.getById);
router.get('/:roomId/messages', auth(UserRole.USER, UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), ChatMessageController.getByRoomId);
router.patch('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), ChatRoomController.update);
router.delete('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), ChatRoomController.deleteById);

export const ChatRoomRouter = router;
