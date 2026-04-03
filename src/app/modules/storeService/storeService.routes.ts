import express from 'express';
import { StoreServiceController } from './storeService.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { StoreServiceValidation } from './storeService.validation.js';

const router = express.Router();

router.post('/', StoreServiceController.create);
router.get('/', StoreServiceController.getAll);
router.get('/:id', StoreServiceController.getById);
router.patch('/:id', StoreServiceController.update);
router.delete('/:id', StoreServiceController.deleteById);

export const StoreServiceRouter = router;
