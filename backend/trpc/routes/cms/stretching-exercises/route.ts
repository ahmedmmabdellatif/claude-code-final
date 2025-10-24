import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import prisma from "../../../../db";

export const listStretchingExercisesProcedure = publicProcedure.query(async () => {
  try {
    const exercises = await prisma.stretchingExercise.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { exercises };
  } catch (error) {
    console.error('[CMS] Error listing stretching exercises:', error);
    throw new Error('Failed to fetch stretching exercises');
  }
});

export const createStretchingExerciseProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      category: z.string(),
      targetMuscles: z.array(z.string()),
      durationSeconds: z.number(),
      sets: z.number(),
      difficulty: z.string(),
      equipment: z.string(),
      instructions: z.array(z.string()),
      formCues: z.array(z.string()),
      benefits: z.array(z.string()),
      contraindications: z.array(z.string()),
      bestTime: z.string().optional(),
      videoUrl: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const exercise = await prisma.stretchingExercise.create({
        data: input,
      });
      console.log('[CMS] Created stretching exercise:', exercise.id, exercise.name);
      return { success: true, exercise };
    } catch (error) {
      console.error('[CMS] Error creating stretching exercise:', error);
      throw new Error('Failed to create stretching exercise');
    }
  });

export const updateStretchingExerciseProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
      targetMuscles: z.array(z.string()),
      durationSeconds: z.number(),
      sets: z.number(),
      difficulty: z.string(),
      equipment: z.string(),
      instructions: z.array(z.string()),
      formCues: z.array(z.string()),
      benefits: z.array(z.string()),
      contraindications: z.array(z.string()),
      bestTime: z.string().optional(),
      videoUrl: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { id, ...data } = input;
      const exercise = await prisma.stretchingExercise.update({
        where: { id },
        data,
      });
      console.log('[CMS] Updated stretching exercise:', exercise.id, exercise.name);
      return { success: true, exercise };
    } catch (error) {
      console.error('[CMS] Error updating stretching exercise:', error);
      throw new Error('Stretching exercise not found or update failed');
    }
  });

export const deleteStretchingExerciseProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    try {
      await prisma.stretchingExercise.delete({
        where: { id: input.id },
      });
      console.log('[CMS] Deleted stretching exercise:', input.id);
      return { success: true };
    } catch (error) {
      console.error('[CMS] Error deleting stretching exercise:', error);
      throw new Error('Stretching exercise not found or delete failed');
    }
  });
