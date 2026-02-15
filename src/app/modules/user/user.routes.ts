import express from "express";
import { UserController } from "./user.controller";
import validateRequest from "src/app/middlewares/validateRequest";
import { createUserSchema } from "./user.validation";

const router = express.Router();

router.post("/", validateRequest(createUserSchema), UserController.createUser);

export const UserRouter = router;
