import express from 'express';
import { ReviewController } from './review.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { ReviewValidation } from './review.validation.js';

const router = express.Router();

router.post('/', ReviewController.create);
router.get('/', ReviewController.getAll);
router.get('/:id', ReviewController.getById);
router.patch('/:id', ReviewController.update);
router.delete('/:id', ReviewController.deleteById);

export const ReviewRouter = router;
