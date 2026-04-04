import express from 'express';
import { AddonController } from './addon.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { AddonValidation } from './addon.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.OPERATOR), AddonController.create);
router.get('/', AddonController.getAll);
router.get('/my-addons', auth(UserRole.OPERATOR), AddonController.getByOperatorId);
router.get('/:id', AddonController.getById);
router.patch('/:id', auth(UserRole.OPERATOR), AddonController.update);
router.delete('/:id', auth(UserRole.OPERATOR), AddonController.deleteById);

export const AddonRouter = router;
