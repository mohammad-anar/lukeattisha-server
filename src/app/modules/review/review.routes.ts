import express from 'express';
import { ReviewController } from './review.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { ReviewValidation } from './review.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.USER), validateRequest(ReviewValidation.createSchema), ReviewController.create);
router.get('/stats', ReviewController.getReviewStats);
router.get('/', ReviewController.getAll);
router.get('/operator/:operatorId', ReviewController.getByOperatorId);
router.get('/user/:userId', ReviewController.getByUserId);
router.get('/store/:storeId', ReviewController.getByStoreId);
router.get('/store-service/:storeServiceId', ReviewController.getByStoreServiceId);
router.get('/store-bundle/:storeBundleId', ReviewController.getByStoreBundleId);
router.get('/:id', ReviewController.getById);
router.patch('/:id', auth(UserRole.USER, UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), validateRequest(ReviewValidation.updateSchema), ReviewController.update);
router.delete('/:id', auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN), ReviewController.deleteById);

export const ReviewRouter = router;
