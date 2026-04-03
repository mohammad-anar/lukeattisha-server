import express from 'express';
import { CategoryController } from './category.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { CategoryValidation } from './category.validation.js';

const router = express.Router();

router.post('/', CategoryController.create);
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.patch('/:id', CategoryController.update);
router.delete('/:id', CategoryController.deleteById);

export const CategoryRouter = router;
