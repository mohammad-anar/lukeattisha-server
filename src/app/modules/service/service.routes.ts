import express from 'express';
import { ServiceController } from './service.controller.js';
import auth from '../../middlewares/auth.js';
import { requireOperatorOnboarding } from '../../middlewares/requireOperatorOnboarding.js';
import validateRequest from '../../middlewares/validateRequest.js';
import fileUploadHandler from '../../middlewares/fileUploadHandler.js';
import { assignAddonsSchema, createServiceSchema, updateServiceSchema } from './service.validation.js';

const router = express.Router();

router.get('/', ServiceController.getAll);
router.get('/my-service', auth('OPERATOR'), ServiceController.getMyService);
router.get('/:id', ServiceController.getById);
router.get('/operator/:id', auth('OPERATOR', 'ADMIN', 'SUPER_ADMIN'), ServiceController.getByOperatorId);

router.post('/', auth('OPERATOR'),
    requireOperatorOnboarding,
    fileUploadHandler(), validateRequest(createServiceSchema), ServiceController.create);

router.patch('/:id', auth('OPERATOR'), requireOperatorOnboarding, fileUploadHandler(), validateRequest(updateServiceSchema), ServiceController.update);

router.post('/assign-addons', auth('OPERATOR'), requireOperatorOnboarding, validateRequest(assignAddonsSchema), ServiceController.assignAddons);

router.delete('/:id', auth('OPERATOR'), requireOperatorOnboarding, ServiceController.deleteById);

export const ServiceRouter = router;
