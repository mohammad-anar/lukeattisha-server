import { z } from 'zod';

const createSchema = z.union([
  z.object({
    question: z.string({ message: 'Question is required' }),
    answer: z.string({ message: 'Answer is required' }),
    isActive: z.boolean().optional(),
  }),
  z.array(
    z.object({
      question: z.string({ message: 'Question is required' }),
      answer: z.string({ message: 'Answer is required' }),
      isActive: z.boolean().optional(),
    })
  ),
]);

const updateSchema = z.object({
  question: z.string().optional(),
  answer: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const FAQValidation = {
  createSchema,
  updateSchema,
};
