import express from 'express';
import { EmailSupportController } from './emailSupport.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { EmailSupportValidation } from './emailSupport.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  validateRequest(EmailSupportValidation.createEmailSupportValidation),
  EmailSupportController.create
);

router.get(
  '/',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  EmailSupportController.getAll
);

router.get(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER),
  EmailSupportController.getById
);

router.delete(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  EmailSupportController.deleteById
);

export const EmailSupportRouter = router;
