import express from 'express';
import { ServiceAddonController } from './serviceAddon.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { ServiceAddonValidation } from './serviceAddon.validation.js';

const router = express.Router();

router.post('/', ServiceAddonController.create);
router.get('/', ServiceAddonController.getAll);
router.get('/:id', ServiceAddonController.getById);
router.patch('/:id', ServiceAddonController.update);
router.delete('/:id', ServiceAddonController.deleteById);

export const ServiceAddonRouter = router;
