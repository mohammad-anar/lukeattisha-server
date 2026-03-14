import { z } from "zod";

const subscribe = z.object({
  body: z.object({
    email: z.email({
      message: "Invalid email format",
    }),
  }),
});

export const NewsletterValidation = {
  subscribe,
};
