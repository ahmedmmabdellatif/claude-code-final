import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const resolveAlertSchema = z.object({
  alertId: z.string(),
  action: z.enum(['contacted', 'plan_adjusted', 'resolved', 'dismissed']).optional(),
  notes: z.string().optional(),
});

export const resolveAlertProcedure = publicProcedure
  .input(resolveAlertSchema)
  .mutation(async ({ input }) => {
    return {
      success: true,
      message: 'Alert resolved successfully',
      alert: {
        id: input.alertId,
        resolved: true,
        resolvedAt: new Date().toISOString(),
        action: input.action || 'resolved',
        notes: input.notes,
      },
    };
  });
