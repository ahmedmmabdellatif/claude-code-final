import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import prisma from "../../../../db";

export const listWorkoutExercisesProcedure = publicProcedure.query(async () => {
  try {
    const exercises = await prisma.workoutExercise.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { exercises };
  } catch (error) {
    console.error('[CMS] Error listing workout exercises:', error);
    throw new Error('Failed to fetch workout exercises');
  }
});

export const createWorkoutExerciseProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      category: z.string(),
      movementType: z.string().optional(),
      primaryMuscles: z.array(z.string()),
      secondaryMuscles: z.array(z.string()),
      difficulty: z.string(),
      equipment: z.array(z.string()),
      instructions: z.array(z.string()),
      formCues: z.array(z.string()),
      commonMistakes: z.array(z.string()),
      contraindications: z.array(z.string()),
      modifications: z.any().optional(),
      repRanges: z.any().optional(),
      tempo: z.string().optional(),
      restSeconds: z.number().optional(),
      scientificNotes: z.array(z.any()).optional(),
      videoUrl: z.string().optional(),
      videoThumbnail: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const exercise = await prisma.workoutExercise.create({
        data: {
          ...input,
          modifications: input.modifications || {},
          repRanges: input.repRanges || {},
          scientificNotes: input.scientificNotes || [],
        },
      });
      console.log('[CMS] Created workout exercise:', exercise.id, exercise.name);
      return { success: true, exercise };
    } catch (error) {
      console.error('[CMS] Error creating workout exercise:', error);
      throw new Error('Failed to create workout exercise');
    }
  });

export const updateWorkoutExerciseProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
      movementType: z.string().optional(),
      primaryMuscles: z.array(z.string()),
      secondaryMuscles: z.array(z.string()),
      difficulty: z.string(),
      equipment: z.array(z.string()),
      instructions: z.array(z.string()),
      formCues: z.array(z.string()),
      commonMistakes: z.array(z.string()),
      contraindications: z.array(z.string()),
      modifications: z.any().optional(),
      repRanges: z.any().optional(),
      tempo: z.string().optional(),
      restSeconds: z.number().optional(),
      scientificNotes: z.array(z.any()).optional(),
      videoUrl: z.string().optional(),
      videoThumbnail: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { id, ...data } = input;
      const exercise = await prisma.workoutExercise.update({
        where: { id },
        data: {
          ...data,
          modifications: data.modifications || {},
          repRanges: data.repRanges || {},
          scientificNotes: data.scientificNotes || [],
        },
      });
      console.log('[CMS] Updated workout exercise:', exercise.id, exercise.name);
      return { success: true, exercise };
    } catch (error) {
      console.error('[CMS] Error updating workout exercise:', error);
      throw new Error('Workout exercise not found or update failed');
    }
  });

export const deleteWorkoutExerciseProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    try {
      await prisma.workoutExercise.delete({
        where: { id: input.id },
      });
      console.log('[CMS] Deleted workout exercise:', input.id);
      return { success: true };
    } catch (error) {
      console.error('[CMS] Error deleting workout exercise:', error);
      throw new Error('Workout exercise not found or delete failed');
    }
  });
