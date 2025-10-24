import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

let unreadCounts: Record<number, number> = {
  1: 1,
  2: 0,
};

export const getUnreadCountProcedure = publicProcedure
  .input(
    z.object({
      userId: z.number(),
    })
  )
  .query(async ({ input }) => {
    return {
      count: unreadCounts[input.userId] || 0,
    };
  });

export const markMessagesAsReadProcedure = publicProcedure
  .input(
    z.object({
      userId: z.number(),
      chatId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    unreadCounts[input.userId] = 0;
    return { success: true };
  });
