import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import prisma from "../../../../db";

export const listExercisesProcedure = publicProcedure.query(async () => {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { exercises };
  } catch (error) {
    console.error('[CMS] Error listing exercises:', error);
    throw new Error('Failed to fetch exercises');
  }
});

export const createExerciseProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      category: z.string(),
      muscleGroup: z.string(),
      equipment: z.string(),
      difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
      description: z.string().optional(),
      videoUrl: z.string().optional(),
      contraindicatedConditions: z.array(z.string()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const exercise = await prisma.exercise.create({
        data: {
          ...input,
          contraindicatedConditions: input.contraindicatedConditions || [],
        },
      });
      console.log('[CMS] Created exercise:', exercise.id, exercise.name);
      return { success: true, exercise };
    } catch (error) {
      console.error('[CMS] Error creating exercise:', error);
      throw new Error('Failed to create exercise');
    }
  });

export const updateExerciseProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
      muscleGroup: z.string(),
      equipment: z.string(),
      difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
      description: z.string().optional(),
      videoUrl: z.string().optional(),
      contraindicatedConditions: z.array(z.string()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { id, ...data } = input;
      const exercise = await prisma.exercise.update({
        where: { id },
        data: {
          ...data,
          contraindicatedConditions: data.contraindicatedConditions || [],
        },
      });
      console.log('[CMS] Updated exercise:', exercise.id, exercise.name);
      return { success: true, exercise };
    } catch (error) {
      console.error('[CMS] Error updating exercise:', error);
      throw new Error('Exercise not found or update failed');
    }
  });

export const deleteExerciseProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    try {
      await prisma.exercise.delete({
        where: { id: input.id },
      });
      console.log('[CMS] Deleted exercise:', input.id);
      return { success: true };
    } catch (error) {
      console.error('[CMS] Error deleting exercise:', error);
      throw new Error('Exercise not found or delete failed');
    }
  });
