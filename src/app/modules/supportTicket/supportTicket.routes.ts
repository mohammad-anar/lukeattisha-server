import express from 'express';
import { SupportTicketController } from './supportTicket.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { SupportTicketValidation } from './supportTicket.validation.js';

const router = express.Router();

router.post('/', SupportTicketController.create);
router.get('/', SupportTicketController.getAll);
router.get('/:id', SupportTicketController.getById);
router.patch('/:id', SupportTicketController.update);
router.delete('/:id', SupportTicketController.deleteById);

export const SupportTicketRouter = router;
