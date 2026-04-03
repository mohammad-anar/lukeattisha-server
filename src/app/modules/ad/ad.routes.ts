import express from 'express';
import { AdController } from './ad.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { AdValidation } from './ad.validation.js';

const router = express.Router();

router.post('/', AdController.create);
router.get('/', AdController.getAll);
router.get('/:id', AdController.getById);
router.patch('/:id', AdController.update);
router.delete('/:id', AdController.deleteById);

export const AdRouter = router;
