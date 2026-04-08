import express from 'express';
import { AdController } from './ad.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { AdValidation } from './ad.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), validateRequest(AdValidation.createSchema), AdController.create);
router.get('/', AdController.getAll);
router.get('/:id', AdController.getById);
// router.patch('/:id', auth(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), validateRequest(AdValidation.updateSchema), AdController.update);
// router.delete('/:id', auth(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), AdController.deleteById);

export const AdRouter = router;
