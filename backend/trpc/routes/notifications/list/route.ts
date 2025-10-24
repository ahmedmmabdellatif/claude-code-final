import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const listNotificationsProcedure = publicProcedure
  .input(
    z
      .object({
        userId: z.string().optional(),
      })
      .optional()
  )
  .query(async () => {
    return [
      {
        id: 1,
        type: 'achievement' as const,
        title: '15 Day Streak! 🔥',
        message: "Congratulations! You've maintained a 15-day training streak.",
        timestamp: '2 hours ago',
        read: false,
      },
      {
        id: 2,
        type: 'message' as const,
        title: 'New message from Coach Sarah',
        message: 'Great progress this week! Keep it up.',
        timestamp: '5 hours ago',
        read: false,
      },
      {
        id: 3,
        type: 'info' as const,
        title: 'Plan Updated',
        message: 'Your coach has updated your workout plan for Week 6.',
        timestamp: '1 day ago',
        read: true,
      },
    ];
  });
