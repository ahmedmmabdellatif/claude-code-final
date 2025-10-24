import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import prisma from '../../../../db';

export const listGoalsProcedure = publicProcedure
  .input(
    z.object({
      clientId: z.string().optional(),
      status: z.enum(['active', 'completed', 'abandoned', 'all']).optional().default('active'),
    })
  )
  .query(async ({ input }) => {
    try {
      const where: any = {};

      if (input.clientId) {
        where.clientId = input.clientId;
      }

      if (input.status && input.status !== 'all') {
        where.status = input.status;
      }

      const goals = await prisma.goal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      const goalsWithProgress = goals.map((goal: any) => ({
        ...goal,
        deadline: goal.deadline.toISOString(),
        createdAt: goal.createdAt.toISOString(),
        completedAt: goal.completedAt?.toISOString(),
      }));

      return {
        goals: goalsWithProgress,
        total: goalsWithProgress.length,
      };
    } catch (error) {
      console.error('[Goals] Error listing goals:', error);
      throw new Error('Failed to fetch goals');
    }
  });
