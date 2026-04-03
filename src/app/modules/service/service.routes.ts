import express from 'express';
import { ServiceController } from './service.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { ServiceValidation } from './service.validation.js';

const router = express.Router();

router.post('/', ServiceController.create);
router.get('/', ServiceController.getAll);
router.get('/:id', ServiceController.getById);
router.patch('/:id', ServiceController.update);
router.delete('/:id', ServiceController.deleteById);

export const ServiceRouter = router;
