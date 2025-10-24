import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import prisma from "../../../../db";

export const listWarmupExercisesProcedure = publicProcedure.query(async () => {
  try {
    const exercises = await prisma.warmupExercise.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { exercises };
  } catch (error) {
    console.error('[CMS] Error listing warmup exercises:', error);
    throw new Error('Failed to fetch warmup exercises');
  }
});

export const createWarmupExerciseProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      category: z.string(),
      targetAreas: z.array(z.string()),
      durationSeconds: z.number().optional(),
      reps: z.number().optional(),
      sets: z.number(),
      difficulty: z.string(),
      equipment: z.string(),
      instructions: z.array(z.string()),
      formCues: z.array(z.string()),
      benefits: z.array(z.string()),
      contraindications: z.array(z.string()),
      videoUrl: z.string().optional(),
      thumbnailUrl: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const exercise = await prisma.warmupExercise.create({
        data: input,
      });
      console.log('[CMS] Created warmup exercise:', exercise.id, exercise.name);
      return { success: true, exercise };
    } catch (error) {
      console.error('[CMS] Error creating warmup exercise:', error);
      throw new Error('Failed to create warmup exercise');
    }
  });

export const updateWarmupExerciseProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
      targetAreas: z.array(z.string()),
      durationSeconds: z.number().optional(),
      reps: z.number().optional(),
      sets: z.number(),
      difficulty: z.string(),
      equipment: z.string(),
      instructions: z.array(z.string()),
      formCues: z.array(z.string()),
      benefits: z.array(z.string()),
      contraindications: z.array(z.string()),
      videoUrl: z.string().optional(),
      thumbnailUrl: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { id, ...data } = input;
      const exercise = await prisma.warmupExercise.update({
        where: { id },
        data,
      });
      console.log('[CMS] Updated warmup exercise:', exercise.id, exercise.name);
      return { success: true, exercise };
    } catch (error) {
      console.error('[CMS] Error updating warmup exercise:', error);
      throw new Error('Warmup exercise not found or update failed');
    }
  });

export const deleteWarmupExerciseProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    try {
      await prisma.warmupExercise.delete({
        where: { id: input.id },
      });
      console.log('[CMS] Deleted warmup exercise:', input.id);
      return { success: true };
    } catch (error) {
      console.error('[CMS] Error deleting warmup exercise:', error);
      throw new Error('Warmup exercise not found or delete failed');
    }
  });
