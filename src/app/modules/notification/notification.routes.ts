import express from 'express';
import { NotificationController } from './notification.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { NotificationValidation } from './notification.validation.js';

const router = express.Router();

router.post('/', NotificationController.create);
router.get('/', NotificationController.getAll);
router.get('/:id', NotificationController.getById);
router.patch('/:id', NotificationController.update);
router.delete('/:id', NotificationController.deleteById);

export const NotificationRouter = router;
