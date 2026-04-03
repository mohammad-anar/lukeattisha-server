import express from 'express';
import { OrderItemController } from './orderItem.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { OrderItemValidation } from './orderItem.validation.js';

const router = express.Router();

router.post('/', OrderItemController.create);
router.get('/', OrderItemController.getAll);
router.get('/:id', OrderItemController.getById);
router.patch('/:id', OrderItemController.update);
router.delete('/:id', OrderItemController.deleteById);

export const OrderItemRouter = router;
