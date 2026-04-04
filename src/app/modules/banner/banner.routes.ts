import express from 'express';
import { BannerController } from './banner.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { BannerValidation } from './banner.validation.js';
import fileUploadHandler from '../../middlewares/fileUploadHandler.js';

const router = express.Router();

router.post('/', fileUploadHandler(), validateRequest(BannerValidation.createSchema), BannerController.create);
router.get('/', BannerController.getAll);
router.get('/active', BannerController.getActiveBanners);
router.get('/:id', BannerController.getById);
router.patch('/:id', fileUploadHandler(), validateRequest(BannerValidation.updateSchema), BannerController.update);
router.delete('/:id', BannerController.deleteById);

export const BannerRouter = router;
