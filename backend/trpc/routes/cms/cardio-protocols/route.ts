import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import prisma from "../../../../db";

export const listCardioProtocolsProcedure = publicProcedure.query(async () => {
  try {
    const protocols = await prisma.cardioProtocol.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { protocols };
  } catch (error) {
    console.error('[CMS] Error listing cardio protocols:', error);
    throw new Error('Failed to fetch cardio protocols');
  }
});

export const createCardioProtocolProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      type: z.string(),
      intensity: z.string(),
      targetHeartRatePercentage: z.string().optional(),
      durationMinutes: z.number(),
      frequencyPerWeek: z.string(),
      caloriesBurnedEstimate: z.string().optional(),
      equipment: z.any(),
      instructions: z.array(z.string()),
      benefits: z.array(z.string()),
      bestFor: z.array(z.string()),
      contraindications: z.array(z.string()),
      progression: z.string().optional(),
      scientificNotes: z.array(z.any()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const protocol = await prisma.cardioProtocol.create({
        data: {
          ...input,
          scientificNotes: input.scientificNotes || [],
        },
      });
      console.log('[CMS] Created cardio protocol:', protocol.id, protocol.name);
      return { success: true, protocol };
    } catch (error) {
      console.error('[CMS] Error creating cardio protocol:', error);
      throw new Error('Failed to create cardio protocol');
    }
  });

export const updateCardioProtocolProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      intensity: z.string(),
      targetHeartRatePercentage: z.string().optional(),
      durationMinutes: z.number(),
      frequencyPerWeek: z.string(),
      caloriesBurnedEstimate: z.string().optional(),
      equipment: z.any(),
      instructions: z.array(z.string()),
      benefits: z.array(z.string()),
      bestFor: z.array(z.string()),
      contraindications: z.array(z.string()),
      progression: z.string().optional(),
      scientificNotes: z.array(z.any()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { id, ...data } = input;
      const protocol = await prisma.cardioProtocol.update({
        where: { id },
        data: {
          ...data,
          scientificNotes: data.scientificNotes || [],
        },
      });
      console.log('[CMS] Updated cardio protocol:', protocol.id, protocol.name);
      return { success: true, protocol };
    } catch (error) {
      console.error('[CMS] Error updating cardio protocol:', error);
      throw new Error('Cardio protocol not found or update failed');
    }
  });

export const deleteCardioProtocolProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    try {
      await prisma.cardioProtocol.delete({
        where: { id: input.id },
      });
      console.log('[CMS] Deleted cardio protocol:', input.id);
      return { success: true };
    } catch (error) {
      console.error('[CMS] Error deleting cardio protocol:', error);
      throw new Error('Cardio protocol not found or delete failed');
    }
  });
