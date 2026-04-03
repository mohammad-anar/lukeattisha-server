import express from 'express';
import { StoreController } from './store.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { StoreValidation } from './store.validation.js';

const router = express.Router();

router.post('/', StoreController.create);
router.get('/', StoreController.getAll);
router.get('/:id', StoreController.getById);
router.patch('/:id', StoreController.update);
router.delete('/:id', StoreController.deleteById);

export const StoreRouter = router;
