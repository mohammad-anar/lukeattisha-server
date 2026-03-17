import { z } from "zod";
const createFavoriteZodSchema = z.object({
    body: z.object({
        serviceId: z.string({
            message: "Service ID is required",
        }),
    }),
});
export const FavoriteValidation = {
    createFavoriteZodSchema,
};
