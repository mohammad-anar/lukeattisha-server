import express from 'express';
import { SupportPhoneController } from './supportPhone.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { SupportPhoneValidation } from './supportPhone.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(SupportPhoneValidation.createSupportPhoneValidation),
  SupportPhoneController.create
);

router.get(
  '/',
  SupportPhoneController.getAll
);

router.get(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SupportPhoneController.getById
);

router.patch(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(SupportPhoneValidation.updateSupportPhoneValidation),
  SupportPhoneController.update
);

router.delete(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SupportPhoneController.deleteById
);

export const SupportPhoneRouter = router;
