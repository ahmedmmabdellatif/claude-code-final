import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

interface TypingStatus {
  userId: number;
  chatId: string;
  isTyping: boolean;
  timestamp: number;
}

const typingStatuses: Map<string, TypingStatus> = new Map();

const TYPING_TIMEOUT = 3000;

export const setTypingStatusProcedure = publicProcedure
  .input(
    z.object({
      userId: z.number(),
      chatId: z.string(),
      isTyping: z.boolean(),
    })
  )
  .mutation(async ({ input }) => {
    const key = `${input.chatId}-${input.userId}`;
    
    if (input.isTyping) {
      typingStatuses.set(key, {
        userId: input.userId,
        chatId: input.chatId,
        isTyping: true,
        timestamp: Date.now(),
      });
    } else {
      typingStatuses.delete(key);
    }

    return { success: true };
  });

export const getTypingStatusProcedure = publicProcedure
  .input(
    z.object({
      chatId: z.string(),
      excludeUserId: z.number(),
    })
  )
  .query(async ({ input }) => {
    const now = Date.now();
    const activeTyping: number[] = [];

    typingStatuses.forEach((status, key) => {
      if (
        status.chatId === input.chatId &&
        status.userId !== input.excludeUserId &&
        status.isTyping &&
        now - status.timestamp < TYPING_TIMEOUT
      ) {
        activeTyping.push(status.userId);
      } else if (now - status.timestamp >= TYPING_TIMEOUT) {
        typingStatuses.delete(key);
      }
    });

    return {
      isTyping: activeTyping.length > 0,
      userIds: activeTyping,
    };
  });
