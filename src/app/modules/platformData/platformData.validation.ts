import { z } from "zod";

const update = z.object({
  body: z.object({
    platformFee: z
      .number()
      .min(0, "Platform fee cannot be negative")
      .optional(),
    maximumJobRadius: z
      .number()
      .min(0, "Maximum job radius cannot be negative")
      .optional(),
  }),
});

export const PlatformDataValidation = {
  update,
};
