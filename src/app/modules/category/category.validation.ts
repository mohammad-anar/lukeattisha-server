import { z } from "zod";

const createCategoryZodSchema = z.object({
 
    name: z.string().min(1, "Category name is required"),

});

const updateCategoryZodSchema = z.object({

    name: z.string().optional(),

});

export const CategoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
};
