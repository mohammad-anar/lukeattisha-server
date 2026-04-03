import express from 'express';
import { AdminWalletTransactionController } from './adminWalletTransaction.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { AdminWalletTransactionValidation } from './adminWalletTransaction.validation.js';

const router = express.Router();

router.post('/', AdminWalletTransactionController.create);
router.get('/', AdminWalletTransactionController.getAll);
router.get('/:id', AdminWalletTransactionController.getById);
router.patch('/:id', AdminWalletTransactionController.update);
router.delete('/:id', AdminWalletTransactionController.deleteById);

export const AdminWalletTransactionRouter = router;
