import express from 'express';
import { ChatParticipantController } from './chatParticipant.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { ChatParticipantValidation } from './chatParticipant.validation.js';

const router = express.Router();

router.post('/', ChatParticipantController.create);
router.get('/', ChatParticipantController.getAll);
router.get('/:id', ChatParticipantController.getById);
router.patch('/:id', ChatParticipantController.update);
router.delete('/:id', ChatParticipantController.deleteById);

export const ChatParticipantRouter = router;
