import express from 'express';
import { FAQController } from './faq.controller.js';
import auth from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { FAQValidation } from './faq.validation.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.get('/', FAQController.getAll);
router.get('/:id', FAQController.getById);

router.post('/', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), validateRequest(FAQValidation.createSchema), FAQController.create);
router.patch('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), validateRequest(FAQValidation.updateSchema), FAQController.update);
router.delete('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), FAQController.deleteById);

export const FAQRouter = router;
