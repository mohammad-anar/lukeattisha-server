import express from 'express';
import { BundleController } from './bundle.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { BundleValidation } from './bundle.validation.js';

const router = express.Router();

router.post('/', BundleController.create);
router.get('/', BundleController.getAll);
router.get('/:id', BundleController.getById);
router.patch('/:id', BundleController.update);
router.delete('/:id', BundleController.deleteById);

export const BundleRouter = router;
