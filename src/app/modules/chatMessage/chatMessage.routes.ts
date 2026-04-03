import express from 'express';
import { ChatMessageController } from './chatMessage.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { ChatMessageValidation } from './chatMessage.validation.js';

const router = express.Router();

router.post('/', ChatMessageController.create);
router.get('/', ChatMessageController.getAll);
router.get('/:id', ChatMessageController.getById);
router.patch('/:id', ChatMessageController.update);
router.delete('/:id', ChatMessageController.deleteById);

export const ChatMessageRouter = router;
