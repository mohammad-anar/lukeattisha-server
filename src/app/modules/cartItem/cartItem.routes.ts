import express from 'express';
import { CartItemController } from './cartItem.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { CartItemValidation } from './cartItem.validation.js';

const router = express.Router();

router.post('/', CartItemController.create);
router.get('/', CartItemController.getAll);
router.get('/:id', CartItemController.getById);
router.patch('/:id', CartItemController.update);
router.delete('/:id', CartItemController.deleteById);

export const CartItemRouter = router;
