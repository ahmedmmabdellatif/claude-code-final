import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const clientDetailProcedure = publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    return {
      client: {
        id: input.id,
        name: 'Ahmed Hassan',
        membershipNumber: '#1234',
        email: 'ahmed@example.com',
        age: 39,
        height: 178,
        currentWeight: 71.2,
        startWeight: 73,
        goal: 'Body Recomposition',
        experience: 'Beginner',
        trainingDays: 4,
        location: 'Gym',
        planStatus: 'active' as const,
        adherence: 85,
        streakDays: 15,
        startDate: 'Jan 1, 2025',
        injuries: ['Lower Back', 'Knee'],
        diet: 'Pescatarian',
        weightHistory: [
          { date: 'Jan 1', weight: 73 },
          { date: 'Jan 8', weight: 72.5 },
          { date: 'Jan 15', weight: 72.2 },
          { date: 'Jan 22', weight: 71.8 },
          { date: 'Jan 29', weight: 71.5 },
          { date: 'Feb 5', weight: 71.2 },
        ],
      },
    };
  });
