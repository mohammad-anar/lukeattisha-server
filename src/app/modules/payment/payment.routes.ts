import express from 'express';
import { PaymentController } from './payment.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { PaymentValidation } from './payment.validation.js';

const router = express.Router();

router.post('/', PaymentController.create);
router.get('/', PaymentController.getAll);
router.get('/:id', PaymentController.getById);
router.patch('/:id', PaymentController.update);
router.delete('/:id', PaymentController.deleteById);

export const PaymentRouter = router;
