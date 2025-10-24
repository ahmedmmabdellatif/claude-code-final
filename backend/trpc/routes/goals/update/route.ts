import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const updateGoalSchema = z.object({
  id: z.string(),
  currentValue: z.number().optional(),
  status: z.enum(['active', 'completed', 'abandoned']).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  targetValue: z.number().optional(),
  deadline: z.string().optional(),
});

export const updateGoalProcedure = publicProcedure
  .input(updateGoalSchema)
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

      if (input.currentValue !== undefined) {
        goal.currentValue = input.currentValue;
        const progress = Math.min(
          100,
          Math.round(
            (Math.abs(goal.currentValue - goal.targetValue) /
              Math.abs(goal.currentValue - goal.targetValue)) *
              100
          )
        );
        goal.progress = progress;
      }

      if (input.status) {
        goal.status = input.status;
      }

      if (input.title) {
        goal.title = input.title;
      }

      if (input.description !== undefined) {
        goal.description = input.description;
      }

      if (input.targetValue) {
        goal.targetValue = input.targetValue;
      }

      if (input.deadline) {
        goal.deadline = input.deadline;
      }

      goals[goalIndex] = goal;

      return {
        success: true,
        goal,
        message: goal.status === 'completed' ? 'Goal achieved! 🎉' : 'Goal updated!',
      };
    } catch (_error) {
      throw new Error('Failed to update goal');
    }
  });
