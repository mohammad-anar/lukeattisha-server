import express from 'express';
import { StoreServiceController } from './storeService.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { StoreServiceValidation } from './storeService.validation.js';
import auth from 'app/middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.OPERATOR), validateRequest(StoreServiceValidation.createSchema), StoreServiceController.create);
router.get('/', StoreServiceController.getAll);
router.get('/store/:storeId', StoreServiceController.getAllByStoreId);
router.get("/operator/:operatorId", StoreServiceController.getAllByOperatorId);
router.get('/:id', StoreServiceController.getById);
router.patch('/:id', auth(UserRole.OPERATOR), validateRequest(StoreServiceValidation.updateSchema), StoreServiceController.update);
router.delete('/:id', auth(UserRole.OPERATOR), StoreServiceController.deleteById);

export const StoreServiceRouter = router;
