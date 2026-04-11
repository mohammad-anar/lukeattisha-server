import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    question: z.string({ message: 'Question is required' }),
    answer: z.string({ message: 'Answer is required' }),
    isActive: z.boolean().optional(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    question: z.string().optional(),
    answer: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const FAQValidation = {
  createSchema,
  updateSchema,
};
