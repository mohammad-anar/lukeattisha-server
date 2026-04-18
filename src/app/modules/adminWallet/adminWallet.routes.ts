import express from 'express';
import { AdminWalletController } from './adminWallet.controller.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { AdminWalletValidation } from './adminWallet.validation.js';

const router = express.Router();

// router.post('/', AdminWalletController.create);
router.get('/', AdminWalletController.getAll);
router.get('/:id', AdminWalletController.getById);
router.get('/admin/me', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), AdminWalletController.getByAdminId);
// router.patch('/:id', AdminWalletController.update);
// router.delete('/:id', AdminWalletController.deleteById);

export const AdminWalletRouter = router;
