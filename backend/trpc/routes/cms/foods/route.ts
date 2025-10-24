import { publicProcedure } from "../../../create-context";
import { z } from "zod";

interface Food {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
  dietaryTags?: string[];
}

let mockFoods: Food[] = [
  {
    id: 1,
    name: 'Chicken Breast',
    category: 'Protein',
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
    servingSize: '100g',
    dietaryTags: [],
  },
  {
    id: 2,
    name: 'Brown Rice',
    category: 'Carbs',
    calories: 112,
    protein: 2.6,
    carbs: 24,
    fats: 0.9,
    servingSize: '100g',
    dietaryTags: ['vegan', 'vegetarian'],
  },
  {
    id: 3,
    name: 'Greek Yogurt',
    category: 'Protein',
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fats: 0.4,
    servingSize: '100g',
    dietaryTags: ['vegetarian'],
  },
];

let nextId = 4;

export const listFoodsProcedure = publicProcedure.query(async () => {
  return { foods: mockFoods };
});

export const createFoodProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      category: z.string(),
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fats: z.number(),
      servingSize: z.string(),
      dietaryTags: z.array(z.string()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    const newFood: Food = {
      id: nextId++,
      ...input,
    };
    mockFoods.unshift(newFood);
    return { success: true, food: newFood };
  });

export const updateFoodProcedure = publicProcedure
  .input(
    z.object({
      id: z.number(),
      name: z.string(),
      category: z.string(),
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fats: z.number(),
      servingSize: z.string(),
      dietaryTags: z.array(z.string()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    const index = mockFoods.findIndex((f) => f.id === input.id);
    if (index === -1) {
      throw new Error('Food not found');
    }
    mockFoods[index] = { ...mockFoods[index], ...input };
    return { success: true, food: mockFoods[index] };
  });

export const deleteFoodProcedure = publicProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input }) => {
    const index = mockFoods.findIndex((f) => f.id === input.id);
    if (index === -1) {
      throw new Error('Food not found');
    }
    mockFoods = mockFoods.filter((f) => f.id !== input.id);
    return { success: true };
  });
