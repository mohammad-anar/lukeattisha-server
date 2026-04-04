import express from 'express';
import { AddressController } from './address.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { AddressValidation } from './address.validation.js';
import auth from '../../middlewares/auth.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/', auth(UserRole.USER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.SUPER_ADMIN), validateRequest(AddressValidation.createSchema), AddressController.create);
router.get('/my-addresses', auth(UserRole.USER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.SUPER_ADMIN), AddressController.getMyAddresses);
router.get('/:id', auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN), AddressController.getById);
router.patch('/:id', auth(UserRole.USER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.SUPER_ADMIN), validateRequest(AddressValidation.updateSchema), AddressController.update);
router.patch('/:id/set-default', auth(UserRole.USER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.SUPER_ADMIN), AddressController.setDefault);
router.delete('/:id', auth(UserRole.USER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.SUPER_ADMIN), AddressController.deleteById);

export const AddressRouter = router;
