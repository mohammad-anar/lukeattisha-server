import express from 'express';
import { FavouriteServiceController } from './favouriteService.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { FavouriteServiceValidation } from './favouriteService.validation.js';

const router = express.Router();

router.post('/', FavouriteServiceController.create);
router.get('/', FavouriteServiceController.getAll);
router.get('/:id', FavouriteServiceController.getById);
router.patch('/:id', FavouriteServiceController.update);
router.delete('/:id', FavouriteServiceController.deleteById);

export const FavouriteServiceRouter = router;
