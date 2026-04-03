import express from 'express';
import { OperatorWalletController } from './operatorWallet.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { OperatorWalletValidation } from './operatorWallet.validation.js';

const router = express.Router();

router.post('/', OperatorWalletController.create);
router.get('/', OperatorWalletController.getAll);
router.get('/:id', OperatorWalletController.getById);
router.patch('/:id', OperatorWalletController.update);
router.delete('/:id', OperatorWalletController.deleteById);

export const OperatorWalletRouter = router;
