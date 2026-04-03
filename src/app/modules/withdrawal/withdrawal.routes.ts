import express from 'express';
import { WithdrawalController } from './withdrawal.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { WithdrawalValidation } from './withdrawal.validation.js';

const router = express.Router();

router.post('/', WithdrawalController.create);
router.get('/', WithdrawalController.getAll);
router.get('/:id', WithdrawalController.getById);
router.patch('/:id', WithdrawalController.update);
router.delete('/:id', WithdrawalController.deleteById);

export const WithdrawalRouter = router;
