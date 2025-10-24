import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import prisma from "../../../../db";

export const listFoodNutritionProcedure = publicProcedure.query(async () => {
  try {
    const foods = await prisma.foodNutrition.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { foods };
  } catch (error) {
    console.error('[CMS] Error listing food nutrition:', error);
    throw new Error('Failed to fetch food nutrition');
  }
});

export const createFoodNutritionProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      category: z.string(),
      servingSize: z.string(),
      calories: z.number(),
      proteinG: z.number(),
      carbsG: z.number(),
      fatG: z.number(),
      fiberG: z.number().optional(),
      omega3G: z.number().optional(),
      micronutrients: z.any().optional(),
      dietCompatibility: z.array(z.string()),
      allergens: z.array(z.string()),
      preparationMethods: z.array(z.string()),
      costRating: z.string().optional(),
      bioavailabilityScore: z.number().optional(),
      scientificNotes: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const food = await prisma.foodNutrition.create({
        data: input,
      });
      console.log('[CMS] Created food nutrition:', food.id, food.name);
      return { success: true, food };
    } catch (error) {
      console.error('[CMS] Error creating food nutrition:', error);
      throw new Error('Failed to create food nutrition');
    }
  });

export const updateFoodNutritionProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
      servingSize: z.string(),
      calories: z.number(),
      proteinG: z.number(),
      carbsG: z.number(),
      fatG: z.number(),
      fiberG: z.number().optional(),
      omega3G: z.number().optional(),
      micronutrients: z.any().optional(),
      dietCompatibility: z.array(z.string()),
      allergens: z.array(z.string()),
      preparationMethods: z.array(z.string()),
      costRating: z.string().optional(),
      bioavailabilityScore: z.number().optional(),
      scientificNotes: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { id, ...data } = input;
      const food = await prisma.foodNutrition.update({
        where: { id },
        data,
      });
      console.log('[CMS] Updated food nutrition:', food.id, food.name);
      return { success: true, food };
    } catch (error) {
      console.error('[CMS] Error updating food nutrition:', error);
      throw new Error('Food nutrition not found or update failed');
    }
  });

export const deleteFoodNutritionProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    try {
      await prisma.foodNutrition.delete({
        where: { id: input.id },
      });
      console.log('[CMS] Deleted food nutrition:', input.id);
      return { success: true };
    } catch (error) {
      console.error('[CMS] Error deleting food nutrition:', error);
      throw new Error('Food nutrition not found or delete failed');
    }
  });
