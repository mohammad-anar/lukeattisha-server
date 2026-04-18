import express from 'express';
import { StoreBundleController } from './storeBundle.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { StoreBundleValidation } from './storeBundle.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.OPERATOR), validateRequest(StoreBundleValidation.createSchema), StoreBundleController.create);
router.get('/', StoreBundleController.getAll);
router.get('/store/:storeId', StoreBundleController.getAllByStoreId);
router.get("/operator/:operatorId", StoreBundleController.getAllByOperatorId);
router.get('/:id', StoreBundleController.getById);
router.patch('/:id', auth(UserRole.OPERATOR), validateRequest(StoreBundleValidation.updateSchema), StoreBundleController.update);
router.delete('/:id', auth(UserRole.OPERATOR), StoreBundleController.deleteById);

export const StoreBundleRouter = router;
