import express from 'express';
import { LegalController } from './legal.controller.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), LegalController.createOrUpdate);
router.get('/:type', LegalController.getByType);
router.get('/', LegalController.getAll);

export const LegalRouter = router;
