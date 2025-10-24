import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import db from '../../../../db';

export const todayTasksProcedure = publicProcedure
  .input(
    z.object({
      clientId: z.string(),
      date: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    console.log('[Today Tasks] Fetching tasks for client:', input.clientId);

    const targetDate = input.date ? new Date(input.date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const tasks = await db.task.findMany({
        where: {
          clientId: input.clientId,
          scheduledDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: [
          { type: 'asc' },
          { scheduledDate: 'asc' },
        ],
      });

      console.log(`[Today Tasks] Found ${tasks.length} tasks for ${targetDate.toDateString()}`);

      return tasks.map((task: typeof tasks[number]) => ({
        id: task.id,
        type: task.type,
        name: task.name,
        description: task.description,
        status: task.status,
        scheduledDate: task.scheduledDate.toISOString(),
        exercises: task.exercises,
        mealType: task.mealType,
        calories: task.calories,
        completedAt: task.completedAt?.toISOString(),
        notes: task.notes,
        mediaUrls: task.mediaUrls,
      }));
    } catch (error) {
      console.error('[Today Tasks] Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  });
