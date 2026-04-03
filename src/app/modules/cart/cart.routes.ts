import express from 'express';
import { CartController } from './cart.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { CartValidation } from './cart.validation.js';

const router = express.Router();

router.post('/', CartController.create);
router.get('/', CartController.getAll);
router.get('/:id', CartController.getById);
router.patch('/:id', CartController.update);
router.delete('/:id', CartController.deleteById);

export const CartRouter = router;
