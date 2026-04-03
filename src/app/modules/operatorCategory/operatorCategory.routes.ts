import express from 'express';
import { OperatorCategoryController } from './operatorCategory.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { OperatorCategoryValidation } from './operatorCategory.validation.js';

const router = express.Router();

router.post('/', OperatorCategoryController.create);
router.get('/', OperatorCategoryController.getAll);
router.get('/:id', OperatorCategoryController.getById);
router.patch('/:id', OperatorCategoryController.update);
router.delete('/:id', OperatorCategoryController.deleteById);

export const OperatorCategoryRouter = router;
