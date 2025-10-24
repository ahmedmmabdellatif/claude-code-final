import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const deleteGoalSchema = z.object({
  id: z.string(),
});

export const deleteGoalProcedure = publicProcedure
  .input(deleteGoalSchema)
  .mutation(async () => {
    return {
      success: true,
      message: 'Goal deleted successfully',
    };
  });
