import express from 'express';
import { LiveSupportController } from './liveSupport.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { LiveSupportValidation } from './liveSupport.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';
import fileUploadHandler from '../../middlewares/fileUploadHandler.js';

const router = express.Router();

router.post(
  '/start',
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  LiveSupportController.startChat
);

router.get(
  '/my-room',
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  LiveSupportController.getMyRoom
);

router.post(
  '/message',
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploadHandler(),
  validateRequest(LiveSupportValidation.sendMessageValidation),
  LiveSupportController.sendMessage
);

router.get(
  '/messages/:roomId',
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  LiveSupportController.getMessages
);

router.get(
  '/rooms',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  LiveSupportController.getAllRooms
);

export const LiveSupportRouter = router;
