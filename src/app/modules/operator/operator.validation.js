import { z } from "zod";
const createProfileZodSchema = z.object({
    body: z.object({
        storeName: z.string({
            message: "Store name is required",
        }),
        address: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
    }),
});
const updateProfileZodSchema = z.object({
    body: z.object({
        storeName: z.string().optional(),
        address: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
    }),
});
const assignCategoriesZodSchema = z.object({
    body: z.object({
        categoryIds: z.array(z.string()).min(1, "At least one category is required"),
    }),
});
export const OperatorValidation = {
    createProfileZodSchema,
    updateProfileZodSchema,
    assignCategoriesZodSchema,
};
