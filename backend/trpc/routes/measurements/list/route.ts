import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const listMeasurementsProcedure = publicProcedure
  .input(
    z
      .object({
        clientId: z.string().optional(),
        limit: z.number().optional(),
      })
      .optional()
  )
  .query(async () => {
    return [
      {
        id: 1,
        date: 'Feb 5',
        weight: 71.2,
        chest: 102,
        waist: 82,
        arms: 38,
        thighs: 60,
      },
      {
        id: 2,
        date: 'Jan 29',
        weight: 71.5,
        chest: 101,
        waist: 83,
        arms: 37.5,
        thighs: 59.5,
      },
      {
        id: 3,
        date: 'Jan 22',
        weight: 71.8,
        chest: 100.5,
        waist: 84,
        arms: 37,
        thighs: 59,
      },
    ];
  });
