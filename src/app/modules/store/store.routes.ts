import express from 'express';
import { StoreController } from './store.controller.js';
import auth from 'app/middlewares/auth.js';
import fileUploadHandler from 'app/middlewares/fileUploadHandler.js';
import validateRequest from 'app/middlewares/validateRequest.js';
import { StoreValidation } from './store.validation.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { StoreValidation } from './store.validation.js';

const router = express.Router();

router.post('/', auth("OPERATOR"), fileUploadHandler(), validateRequest(StoreValidation.createSchema), StoreController.create);
router.get('/', StoreController.getAll);
router.get('/operator/:operatorId', auth("OPERATOR", "ADMIN", "SUPER_ADMIN"), StoreController.getByOperatorId);
router.get('/:id', StoreController.getById);
router.patch('/:id', auth("OPERATOR"), fileUploadHandler(), validateRequest(StoreValidation.updateSchema), StoreController.update);
router.get('/:id/operational-settings', auth("OPERATOR"), StoreController.getOperationalSettings);
router.patch('/:id/operational-settings', auth("OPERATOR"), validateRequest(StoreValidation.updateOperationalSettingsSchema), StoreController.updateOperationalSettings);
router.delete('/:id', auth("OPERATOR"), StoreController.deleteById);

export const StoreRouter = router;
