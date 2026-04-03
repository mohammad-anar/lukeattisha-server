import express from 'express';
import { OperatorWalletTransactionController } from './operatorWalletTransaction.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { OperatorWalletTransactionValidation } from './operatorWalletTransaction.validation.js';

const router = express.Router();

router.post('/', OperatorWalletTransactionController.create);
router.get('/', OperatorWalletTransactionController.getAll);
router.get('/:id', OperatorWalletTransactionController.getById);
router.patch('/:id', OperatorWalletTransactionController.update);
router.delete('/:id', OperatorWalletTransactionController.deleteById);

export const OperatorWalletTransactionRouter = router;
