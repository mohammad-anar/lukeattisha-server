import express from 'express';
import { OrderController } from './order.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { OrderValidation } from './order.validation.js';

const router = express.Router();

router.post('/', OrderController.create);
router.get('/', OrderController.getAll);
router.get('/:id', OrderController.getById);
router.patch('/:id', OrderController.update);
router.delete('/:id', OrderController.deleteById);

export const OrderRouter = router;
