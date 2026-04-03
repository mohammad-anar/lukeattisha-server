import express from 'express';
import { BannerController } from './banner.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { BannerValidation } from './banner.validation.js';

const router = express.Router();

router.post('/', BannerController.create);
router.get('/', BannerController.getAll);
router.get('/:id', BannerController.getById);
router.patch('/:id', BannerController.update);
router.delete('/:id', BannerController.deleteById);

export const BannerRouter = router;
