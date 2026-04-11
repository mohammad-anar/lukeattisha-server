import express from 'express';
import { FavouriteServiceController } from './favouriteService.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { FavouriteServiceValidation } from './favouriteService.validation.js';
import auth from 'app/middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', validateRequest(FavouriteServiceValidation.createSchema), auth(UserRole.USER), FavouriteServiceController.create);
router.get('/my-favourites', auth(UserRole.USER), FavouriteServiceController.getMyFavourites);
router.get('/', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), FavouriteServiceController.getAll);
// router.get('/:id', auth(UserRole.USER), FavouriteServiceController.getById);
// router.patch('/:id', validateRequest(FavouriteServiceValidation.updateSchema), auth(UserRole.USER), FavouriteServiceController.update);
// router.delete('/:id', auth(UserRole.USER), FavouriteServiceController.deleteById);

export const FavouriteServiceRouter = router;
