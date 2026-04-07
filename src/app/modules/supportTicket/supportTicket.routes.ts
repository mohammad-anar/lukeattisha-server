import express from 'express';
import { SupportTicketController } from './supportTicket.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { SupportTicketValidation } from './supportTicket.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.USER), validateRequest(SupportTicketValidation.createSchema), SupportTicketController.create);
router.get('/', auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR), SupportTicketController.getAll);
router.get('/:id', auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR), SupportTicketController.getById);
router.patch('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), validateRequest(SupportTicketValidation.updateSchema), SupportTicketController.updateStatus);
router.delete('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), SupportTicketController.deleteById);

export const SupportTicketRouter = router;
