import express from "express";
import validateRequest from "../../middlewares/validateRequest.js";

import { Role } from "@prisma/client";
import auth from "src/app/middlewares/auth.js";
import { CategoryController } from "./category.controller.js";
import { CreateCategorySchema } from "./category.validation.js";

const router = express.Router();

router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(CreateCategorySchema),
  CategoryController.createCategory,
);

export const CategoryRouter = router;
