import express from 'express';
import { UserController } from './user.controller.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { UserValidation } from './user.validation.js';

const router = express.Router();

router.post('/', UserController.create);
router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.patch('/:id', UserController.update);
router.delete('/:id', UserController.deleteById);

export const UserRouter = router;
