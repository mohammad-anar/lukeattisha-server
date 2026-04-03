import express from 'express';
import { AdminSettingController } from './adminSetting.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { AdminSettingValidation } from './adminSetting.validation.js';

const router = express.Router();

router.post('/', AdminSettingController.create);
router.get('/', AdminSettingController.getAll);
router.get('/:id', AdminSettingController.getById);
router.patch('/:id', AdminSettingController.update);
router.delete('/:id', AdminSettingController.deleteById);

export const AdminSettingRouter = router;
