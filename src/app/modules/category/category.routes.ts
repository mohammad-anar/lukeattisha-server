import express from "express";
import auth from "src/app/middlewares/auth.js";
import validateRequest from "src/app/middlewares/validateRequest.js";
import { Role } from "@prisma/client";
import { CategoryController } from "./category.controller.js";
import { CategoryValidation } from "./category.validation.js";

const router = express.Router();

router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(CategoryValidation.createCategoryZodSchema),
  CategoryController.createCategory
);

router.get(
  "/",
  auth(Role.ADMIN, Role.OPERATOR, Role.USER),
  CategoryController.getAllCategories
);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.OPERATOR, Role.USER),
  CategoryController.getCategoryById
);

router.patch(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(CategoryValidation.updateCategoryZodSchema),
  CategoryController.updateCategory
);

router.delete(
  "/:id",
  auth(Role.ADMIN),
  CategoryController.deleteCategory
);

export const CategoryRouter = router;
