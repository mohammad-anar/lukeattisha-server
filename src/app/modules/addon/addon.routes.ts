import express from 'express';
import { AddonController } from './addon.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { AddonValidation } from './addon.validation.js';

const router = express.Router();

router.post('/', AddonController.create);
router.get('/', AddonController.getAll);
router.get('/:id', AddonController.getById);
router.patch('/:id', AddonController.update);
router.delete('/:id', AddonController.deleteById);

export const AddonRouter = router;
