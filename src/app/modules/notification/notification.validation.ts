import { z } from 'zod';

const createSchema = z.object({
  title: z.string({ message: 'Title is required' }),
  message: z.string({ message: 'Message is required' }),
  userId: z.string({ message: 'User ID is required' }),
  type: z.string({ message: 'Type is required' }),
  channel: z.string({ message: 'Channel is required' }),
  isSent: z.boolean().optional(),
  isRead: z.boolean().optional(),
});

const updateSchema = z.object({

  title: z.string().optional(),
  message: z.string().optional(),
  userId: z.string().optional(),
  type: z.string().optional(),
  channel: z.string().optional(),

}).partial();

export const NotificationValidation = {
  createSchema,
  updateSchema,
};
