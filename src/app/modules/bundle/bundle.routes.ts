import express from 'express';
import { BundleController } from './bundle.controller.js';
import auth from '../../middlewares/auth.js';
import { requireOperatorOnboarding } from '../../middlewares/requireOperatorOnboarding.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { BundleValidation } from './bundle.validation.js';
import fileUploadHandler from '../../middlewares/fileUploadHandler.js';

const router = express.Router();

router.get('/', BundleController.getAll);
router.get('/my-bundle', auth('OPERATOR'), BundleController.getMyBundle);
router.get('/:id', BundleController.getById);

// Restricted operator actions
router.post('/', auth('OPERATOR', 'ADMIN', 'SUPER_ADMIN'), requireOperatorOnboarding, fileUploadHandler(), validateRequest(BundleValidation.createSchema), BundleController.create);
router.patch('/:id',
    auth('OPERATOR', 'ADMIN', 'SUPER_ADMIN'),
    // requireOperatorOnboarding,
    fileUploadHandler(),
    validateRequest(BundleValidation.updateSchema), BundleController.update);
router.delete('/:id', auth('OPERATOR', 'ADMIN', 'SUPER_ADMIN'), requireOperatorOnboarding, BundleController.deleteById);

export const BundleRouter = router;
