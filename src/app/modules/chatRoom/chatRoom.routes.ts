import express from 'express';
import { ChatRoomController } from './chatRoom.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { ChatRoomValidation } from './chatRoom.validation.js';

const router = express.Router();

router.post('/', ChatRoomController.create);
router.get('/', ChatRoomController.getAll);
router.get('/:id', ChatRoomController.getById);
router.patch('/:id', ChatRoomController.update);
router.delete('/:id', ChatRoomController.deleteById);

export const ChatRoomRouter = router;
