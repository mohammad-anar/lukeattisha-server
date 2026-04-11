import { z } from 'zod';

const sendMessageValidation = z.object({

    roomId: z.string({
      message: 'Room ID is required',
    }),
    content: z.string({
      message: 'Content is required',
    }),
    images: z.array(z.string()).optional(),

});

export const LiveSupportValidation = {
  sendMessageValidation,
};
