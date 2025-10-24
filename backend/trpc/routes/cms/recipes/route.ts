import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import prisma from "../../../../db";

export const listRecipesProcedure = publicProcedure.query(async () => {
  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { recipes };
  } catch (error) {
    console.error('[CMS] Error listing recipes:', error);
    throw new Error('Failed to fetch recipes');
  }
});

export const createRecipeProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      category: z.string(),
      mealType: z.string(),
      servings: z.number(),
      prepTimeMinutes: z.number(),
      cookTimeMinutes: z.number(),
      totalTimeMinutes: z.number(),
      difficulty: z.string(),
      dietCompatibility: z.array(z.string()),
      totalMacros: z.any(),
      ingredients: z.array(z.any()),
      instructions: z.array(z.string()),
      tips: z.array(z.string()),
      bestTime: z.string().optional(),
      storage: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const recipe = await prisma.recipe.create({
        data: input,
      });
      console.log('[CMS] Created recipe:', recipe.id, recipe.name);
      return { success: true, recipe };
    } catch (error) {
      console.error('[CMS] Error creating recipe:', error);
      throw new Error('Failed to create recipe');
    }
  });

export const updateRecipeProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
      mealType: z.string(),
      servings: z.number(),
      prepTimeMinutes: z.number(),
      cookTimeMinutes: z.number(),
      totalTimeMinutes: z.number(),
      difficulty: z.string(),
      dietCompatibility: z.array(z.string()),
      totalMacros: z.any(),
      ingredients: z.array(z.any()),
      instructions: z.array(z.string()),
      tips: z.array(z.string()),
      bestTime: z.string().optional(),
      storage: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { id, ...data } = input;
      const recipe = await prisma.recipe.update({
        where: { id },
        data,
      });
      console.log('[CMS] Updated recipe:', recipe.id, recipe.name);
      return { success: true, recipe };
    } catch (error) {
      console.error('[CMS] Error updating recipe:', error);
      throw new Error('Recipe not found or update failed');
    }
  });

export const deleteRecipeProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    try {
      await prisma.recipe.delete({
        where: { id: input.id },
      });
      console.log('[CMS] Deleted recipe:', input.id);
      return { success: true };
    } catch (error) {
      console.error('[CMS] Error deleting recipe:', error);
      throw new Error('Recipe not found or delete failed');
    }
  });
