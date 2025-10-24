import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const markNotificationReadProcedure = publicProcedure
  .input(
    z.object({
      notificationId: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('Marking notification as read:', input.notificationId);

    return {
      success: true,
      notificationId: input.notificationId,
    };
  });
