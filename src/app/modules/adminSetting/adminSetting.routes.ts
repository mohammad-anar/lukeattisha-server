import express from 'express';
import { AdminSettingController } from './adminSetting.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { AdminSettingValidation } from './adminSetting.validation.js';

const router = express.Router();

router.post('/', validateRequest(AdminSettingValidation.createAdminSettingSchema), AdminSettingController.create);
router.get('/', AdminSettingController.getAll);
router.get('/:id', AdminSettingController.getById);
router.patch('/:id', validateRequest(AdminSettingValidation.updateAdminSettingSchema), AdminSettingController.update);
router.delete('/:id', AdminSettingController.deleteById);

export const AdminSettingRouter = router;
