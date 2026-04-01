import express from "express";
import { Role } from "@prisma/client";
import { CategoryController } from "./category.controller.js";
import { CategoryValidation } from "./category.validation.js";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";

const router = express.Router();

router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(CategoryValidation.createCategoryZodSchema),
  CategoryController.createCategory
);

router.get(
  "/",
  CategoryController.getAllCategories
);

router.get(
  "/:id",
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
