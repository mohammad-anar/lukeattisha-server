import express from 'express';
import { UserPaymentCardController } from './userPaymentCard.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { UserPaymentCardValidation } from './userPaymentCard.validation.js';

const router = express.Router();

router.post('/', UserPaymentCardController.create);
router.get('/', UserPaymentCardController.getAll);
router.get('/:id', UserPaymentCardController.getById);
router.patch('/:id', UserPaymentCardController.update);
router.delete('/:id', UserPaymentCardController.deleteById);

export const UserPaymentCardRouter = router;
