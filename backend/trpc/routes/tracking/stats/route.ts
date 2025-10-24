import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const statsProcedure = publicProcedure
  .input(
    z
      .object({
        clientId: z.string().optional(),
      })
      .optional()
  )
  .query(async () => {
    return {
      completedCount: 3,
      totalCount: 5,
      streakDays: 15,
      completedWorkouts: 42,
      adherencePercent: 85,
      weightHistory: [
        { date: 'Jan 1', weight: 75 },
        { date: 'Jan 15', weight: 74.5 },
        { date: 'Feb 1', weight: 74 },
        { date: 'Feb 15', weight: 73.5 },
        { date: 'Mar 1', weight: 73 },
      ],
      beforePhoto: 'https://via.placeholder.com/300x400',
      afterPhoto: 'https://via.placeholder.com/300x400',
    };
  });
