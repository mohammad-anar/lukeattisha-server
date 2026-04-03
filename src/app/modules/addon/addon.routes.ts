import express from 'express';
import { AddonController } from './addon.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { AddonValidation } from './addon.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), validateRequest(AddonValidation.createSchema), AddonController.create);
router.get('/', AddonController.getAll);
router.get('/:id', AddonController.getById);
router.patch('/:id', auth(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), validateRequest(AddonValidation.updateSchema), AddonController.update);
router.delete('/:id', auth(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), AddonController.deleteById);

export const AddonRouter = router;
