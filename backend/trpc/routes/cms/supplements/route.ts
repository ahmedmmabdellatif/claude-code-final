import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import prisma from "../../../../db";

export const listSupplementsProcedure = publicProcedure.query(async () => {
  try {
    const supplements = await prisma.supplement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { supplements };
  } catch (error) {
    console.error('[CMS] Error listing supplements:', error);
    throw new Error('Failed to fetch supplements');
  }
});

export const createSupplementProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      category: z.string(),
      primaryBenefit: z.string(),
      dosage: z.string(),
      timing: z.array(z.string()),
      dailyFrequency: z.string(),
      evidenceLevel: z.string(),
      costRating: z.string(),
      necessityRating: z.any(),
      benefits: z.array(z.string()),
      sideEffects: z.array(z.string()),
      contraindications: z.array(z.string()),
      alternatives: z.array(z.string()),
      loadingPhase: z.any().optional(),
      scientificNotes: z.array(z.any()),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const supplement = await prisma.supplement.create({
        data: input,
      });
      console.log('[CMS] Created supplement:', supplement.id, supplement.name);
      return { success: true, supplement };
    } catch (error) {
      console.error('[CMS] Error creating supplement:', error);
      throw new Error('Failed to create supplement');
    }
  });

export const updateSupplementProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
      primaryBenefit: z.string(),
      dosage: z.string(),
      timing: z.array(z.string()),
      dailyFrequency: z.string(),
      evidenceLevel: z.string(),
      costRating: z.string(),
      necessityRating: z.any(),
      benefits: z.array(z.string()),
      sideEffects: z.array(z.string()),
      contraindications: z.array(z.string()),
      alternatives: z.array(z.string()),
      loadingPhase: z.any().optional(),
      scientificNotes: z.array(z.any()),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { id, ...data } = input;
      const supplement = await prisma.supplement.update({
        where: { id },
        data,
      });
      console.log('[CMS] Updated supplement:', supplement.id, supplement.name);
      return { success: true, supplement };
    } catch (error) {
      console.error('[CMS] Error updating supplement:', error);
      throw new Error('Supplement not found or update failed');
    }
  });

export const deleteSupplementProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    try {
      await prisma.supplement.delete({
        where: { id: input.id },
      });
      console.log('[CMS] Deleted supplement:', input.id);
      return { success: true };
    } catch (error) {
      console.error('[CMS] Error deleting supplement:', error);
      throw new Error('Supplement not found or delete failed');
    }
  });
