import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import db from '../../../../db';

export const completeWorkoutProcedure = publicProcedure
  .input(
    z.object({
      taskId: z.string(),
      clientId: z.string(),
      status: z.enum(['complete', 'partial', 'missed']),
      exercises: z.array(
        z.object({
          exerciseId: z.string(),
          sets: z.array(
            z.object({
              weight: z.string(),
              reps: z.string(),
            })
          ),
        })
      ).optional(),
      notes: z.string().optional(),
      mediaUrls: z.array(z.string()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Complete Workout] Completing task:', input.taskId);

    try {
      const task = await db.task.findUnique({
        where: { id: input.taskId },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      if (task.clientId !== input.clientId) {
        throw new Error('Task does not belong to this client');
      }

      const setsCompleted = input.exercises?.reduce(
        (total, ex) => total + ex.sets.length,
        0
      ) || 0;

      const updatedTask = await db.task.update({
        where: { id: input.taskId },
        data: {
          status: input.status,
          completedAt: input.status === 'complete' || input.status === 'partial' ? new Date() : null,
          notes: input.notes,
          mediaUrls: input.mediaUrls || [],
          setsCompleted,
        },
      });

      console.log(`[Complete Workout] Task ${input.taskId} marked as ${input.status}`);

      const totalTasks = await db.task.count({
        where: {
          clientId: input.clientId,
          scheduledDate: {
            lte: new Date(),
          },
        },
      });

      const completedTasks = await db.task.count({
        where: {
          clientId: input.clientId,
          status: {
            in: ['complete', 'partial'],
          },
          scheduledDate: {
            lte: new Date(),
          },
        },
      });

      const adherence = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      await db.clientProfile.update({
        where: { id: input.clientId },
        data: {
          adherence,
          lastCheckin: new Date(),
        },
      });

      console.log(`[Complete Workout] Updated client adherence to ${adherence}%`);

      return {
        success: true,
        task: {
          id: updatedTask.id,
          status: updatedTask.status,
          completedAt: updatedTask.completedAt?.toISOString(),
        },
        adherence,
      };
    } catch (error) {
      console.error('[Complete Workout] Error completing task:', error);
      throw new Error(
        `Failed to complete task: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
