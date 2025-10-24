import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const createGoalSchema = z.object({
  clientId: z.string(),
  type: z.enum(['weight', 'measurement', 'performance', 'habit']),
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  targetValue: z.number(),
  currentValue: z.number(),
  unit: z.string(),
  deadline: z.string(),
  measurementType: z.string().optional(),
});

let goals: any[] = [
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
  {
    id: '2',
    clientId: 'client-1',
    type: 'performance',
    title: 'Bench Press 100kg',
    description: 'Increase bench press strength',
    targetValue: 100,
    currentValue: 80,
    unit: 'kg',
    deadline: '2025-11-30',
    createdAt: new Date('2025-10-05').toISOString(),
    status: 'active',
    progress: 40,
  },
  {
    id: '3',
    clientId: 'client-1',
    type: 'measurement',
    title: 'Build Bigger Arms',
    description: 'Increase arm circumference',
    targetValue: 40,
    currentValue: 38,
    unit: 'cm',
    measurementType: 'biceps',
    deadline: '2025-12-15',
    createdAt: new Date('2025-10-10').toISOString(),
    status: 'active',
    progress: 66,
  },
];

export const createGoalProcedure = publicProcedure
  .input(createGoalSchema)
  .mutation(async ({ input }) => {
    try {
      const newGoal = {
        id: String(goals.length + 1),
        ...input,
        createdAt: new Date().toISOString(),
        status: 'active' as const,
        progress: 0,
      };

      goals.push(newGoal);

      return {
        success: true,
        goal: newGoal,
        message: 'Goal created successfully!',
      };
    } catch (_error) {
      throw new Error('Failed to create goal');
    }
  });
