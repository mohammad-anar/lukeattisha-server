import express from 'express';
import { ServiceController } from './service.controller.js';
import auth from '../../middlewares/auth.js';
import { requireOperatorOnboarding } from '../../middlewares/requireOperatorOnboarding.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { ServiceValidation } from './service.validation.js';
import fileUploadHandler from '../../middlewares/fileUploadHandler.js';

const router = express.Router();

router.get('/', ServiceController.getAll);
router.get('/:id', ServiceController.getById);

// Restricted operator actions
router.post('/', auth('OPERATOR', 'ADMIN', 'SUPER_ADMIN'), requireOperatorOnboarding, fileUploadHandler(), validateRequest(ServiceValidation.createSchema), ServiceController.create);
router.patch('/:id', auth('OPERATOR', 'ADMIN', 'SUPER_ADMIN'), requireOperatorOnboarding, fileUploadHandler(), validateRequest(ServiceValidation.updateSchema), ServiceController.update);
router.delete('/:id', auth('OPERATOR', 'ADMIN', 'SUPER_ADMIN'), requireOperatorOnboarding, ServiceController.deleteById);

export const ServiceRouter = router;
