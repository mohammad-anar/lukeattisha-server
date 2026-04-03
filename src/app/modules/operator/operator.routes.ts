import express from 'express';
import { OperatorController } from './operator.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { OperatorValidation } from './operator.validation.js';

const router = express.Router();

router.post('/', OperatorController.create);
router.get('/', OperatorController.getAll);
router.get('/:id', OperatorController.getById);
router.patch('/:id', OperatorController.update);
router.delete('/:id', OperatorController.deleteById);

export const OperatorRouter = router;
