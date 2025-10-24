import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const completeGoalSchema = z.object({
  id: z.string(),
  completedValue: z.number(),
});

export const completeGoalProcedure = publicProcedure
  .input(completeGoalSchema)
  .mutation(async ({ input }) => {
    try {
      const goals = [
        {
          id: '1',
          clientId: 'client-1',
          type: 'weight',
          title: 'Reach Target Weight',
          description: 'Lose weight gradually and sustainably',
          targetValue: 70,
          currentValue: 73,
          unit: 'kg',
          deadline: '2025-12-31',
          createdAt: new Date('2025-10-01').toISOString(),
          status: 'active',
          progress: 50,
        },
      ];

      const goalIndex = goals.findIndex((g) => g.id === input.id);
      
      if (goalIndex === -1) {
        throw new Error('Goal not found');
      }

      const goal = { ...goals[goalIndex] };
      goal.currentValue = input.completedValue;
      goal.status = 'completed';
      goal.progress = 100;
      (goal as any).completedAt = new Date().toISOString();

      goals[goalIndex] = goal;

      return {
        success: true,
        goal,
        message: '🎉 Goal achieved! Amazing work!',
      };
    } catch (_error) {
      throw new Error('Failed to complete goal');
    }
  });
