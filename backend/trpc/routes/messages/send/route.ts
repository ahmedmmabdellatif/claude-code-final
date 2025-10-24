import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { messageStore, Message } from '../list/route';

let messageIdCounter = 1000;

export const sendMessageProcedure = publicProcedure
  .input(
    z.object({
      chatId: z.string().optional(),
      message: z.string(),
      senderId: z.number(),
      senderName: z.string(),
      senderRole: z.enum(['client', 'coach']),
      attachments: z.array(
        z.object({
          type: z.enum(['image', 'video', 'file']),
          url: z.string(),
          filename: z.string().optional(),
        })
      ).optional(),
    })
  )
  .mutation(async ({ input }) => {
    const chatId = input.chatId || 'default';
    const messages = messageStore.get(chatId) || [];
    
    const now = Date.now();
    const newMessage: Message = {
      id: ++messageIdCounter,
      chatId,
      senderId: input.senderId,
      senderName: input.senderName,
      senderRole: input.senderRole,
      message: input.message,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      timestampMs: now,
      read: false,
      attachments: input.attachments,
    };

    messages.push(newMessage);
    messageStore.set(chatId, messages);

    return newMessage;
  });
