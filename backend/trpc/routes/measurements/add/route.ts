import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const addMeasurementProcedure = publicProcedure
  .input(
    z.object({
      weight: z.number().optional(),
      chest: z.number().optional(),
      waist: z.number().optional(),
      arms: z.number().optional(),
      thighs: z.number().optional(),
      date: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('Measurement added:', input);

    return {
      success: true,
      measurement: {
        id: Date.now(),
        ...input,
        createdAt: new Date().toISOString(),
      },
    };
  });
