import express from 'express';
import { AddressController } from './address.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { AddressValidation } from './address.validation.js';

const router = express.Router();

router.post('/', AddressController.create);
router.get('/', AddressController.getAll);
router.get('/:id', AddressController.getById);
router.patch('/:id', AddressController.update);
router.delete('/:id', AddressController.deleteById);

export const AddressRouter = router;
