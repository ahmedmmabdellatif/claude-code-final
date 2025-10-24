import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import db from "../db";

const exerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().min(1).max(10),
  reps: z.string(),
  rest: z.number(),
  notes: z.string().optional(),
});

const workoutDaySchema = z.object({
  day: z.string(),
  name: z.string(),
  description: z.string().optional(),
  exercises: z.array(exerciseSchema),
});

const mealSchema = z.object({
  name: z.string(),
  time: z.string(),
  foods: z.array(
    z.object({
      foodId: z.string(),
      servings: z.number(),
      notes: z.string().optional(),
    })
  ),
  totalCalories: z.number(),
  totalProtein: z.number(),
  totalCarbs: z.number(),
  totalFat: z.number(),
});

const aiPlanSchema = z.object({
  planName: z.string(),
  description: z.string(),
  durationWeeks: z.number().min(1).max(52),
  workoutDays: z.array(workoutDaySchema),
  mealPlan: z.object({
    dailyMeals: z.array(mealSchema),
    targetCalories: z.number(),
    targetProtein: z.number(),
    targetCarbs: z.number(),
    targetFat: z.number(),
    notes: z.string().optional(),
  }),
  reasoning: z.array(z.string()),
  modifications: z.array(
    z.object({
      category: z.string(),
      items: z.array(z.string()),
    })
  ),
});

type ClientLabel = {
  category: string;
  key: string;
  value: string;
  confidence: number;
};

type OnboardingData = {
  age: number | null;
  height: number | null;
  weight: number | null;
  heightUnit: string | null;
  weightUnit: string | null;
  goal: string | null;
  experience: string | null;
  location: string | null;
  frequency: number | null;
  injuries: string[];
  medicalConditions: string[];
  dietaryRestrictions: string[];
  dietType: string | null;
};

export async function generateAIPlan(params: {
  clientId: string;
  onboarding: OnboardingData;
  labels: ClientLabel[];
}) {
  const { clientId, onboarding, labels } = params;

  console.log("[AI Plan Generator] Starting plan generation for client:", clientId);

  const exercises = await db.exercise.findMany({
    orderBy: { name: "asc" },
  });

  const foods = await db.food.findMany({
    orderBy: { name: "asc" },
  });

  if (exercises.length === 0) {
    throw new Error("No exercises found in CMS. Please add exercises before generating a plan.");
  }

  if (foods.length === 0) {
    throw new Error("No foods found in CMS. Please add foods before generating a plan.");
  }

  console.log(`[AI Plan Generator] Found ${exercises.length} exercises and ${foods.length} foods in CMS`);

  const goalLabels = labels.filter((l) => l.category === "goal");
  const healthLabels = labels.filter((l) => l.category === "health");
  const preferenceLabels = labels.filter((l) => l.category === "preference");
  const experienceLabel = labels.find((l) => l.category === "experience" && l.key === "training_level");
  const constraintLabels = labels.filter((l) => l.category === "constraint");

  const primaryGoal = goalLabels.find((l) => l.key === "primary_goal")?.value || onboarding.goal || "general_fitness";
  const trainingLevel = experienceLabel?.value || onboarding.experience || "beginner";
  const trainingDays = onboarding.frequency || 3;
  const trainingLocation = preferenceLabels.find((l) => l.key === "training_location")?.value || onboarding.location || "gym";
  const injuries = healthLabels.filter((l) => l.key === "injury").map((l) => l.value);
  const medicalConditions = healthLabels.filter((l) => l.key === "medical_condition").map((l) => l.value);
  const dietaryConstraints = constraintLabels.filter((l) => l.key === "dietary").map((l) => l.value);

  type Exercise = typeof exercises[number];
  type Food = typeof foods[number];

  const filteredExercises = exercises.filter((ex: Exercise) => {
    const isContraindicated = ex.contraindicatedConditions.some(
      (condition: string) =>
        injuries.some((injury) => injury.toLowerCase().includes(condition.toLowerCase())) ||
        medicalConditions.some((medCond) => medCond.toLowerCase().includes(condition.toLowerCase()))
    );
    return !isContraindicated;
  });

  console.log(`[AI Plan Generator] Filtered to ${filteredExercises.length} safe exercises (avoiding contraindications)`);

  const exercisesByDifficulty = {
    Beginner: filteredExercises.filter((ex: Exercise) => ex.difficulty === "Beginner"),
    Intermediate: filteredExercises.filter((ex: Exercise) => ex.difficulty === "Intermediate"),
    Advanced: filteredExercises.filter((ex: Exercise) => ex.difficulty === "Advanced"),
  };

  const appropriateExercises =
    trainingLevel === "beginner"
      ? [...exercisesByDifficulty.Beginner, ...exercisesByDifficulty.Intermediate.slice(0, 5)]
      : trainingLevel === "intermediate"
      ? [...exercisesByDifficulty.Beginner.slice(0, 3), ...exercisesByDifficulty.Intermediate, ...exercisesByDifficulty.Advanced.slice(0, 5)]
      : filteredExercises;

  console.log(`[AI Plan Generator] Selected ${appropriateExercises.length} exercises appropriate for ${trainingLevel} level`);

  const filteredFoods = foods.filter((food: Food) => {
    const foodNameLower = food.name.toLowerCase();
    const categoryLower = food.category.toLowerCase();

    return !dietaryConstraints.some((constraint) => {
      const constraintLower = constraint.toLowerCase();
      if (constraintLower.includes("vegetarian") && (categoryLower.includes("meat") || categoryLower.includes("poultry"))) {
        return true;
      }
      if (constraintLower.includes("vegan") && (categoryLower.includes("dairy") || categoryLower.includes("meat") || categoryLower.includes("egg"))) {
        return true;
      }
      if (constraintLower.includes("gluten") && (categoryLower.includes("bread") || categoryLower.includes("pasta") || foodNameLower.includes("wheat"))) {
        return true;
      }
      if (constraintLower.includes("lactose") && categoryLower.includes("dairy")) {
        return true;
      }
      return false;
    });
  });

  console.log(`[AI Plan Generator] Filtered to ${filteredFoods.length} foods matching dietary restrictions`);

  const prompt = `You are an expert fitness coach creating a personalized workout and nutrition plan.

CLIENT PROFILE:
- Goal: ${primaryGoal}
- Experience Level: ${trainingLevel}
- Training Days per Week: ${trainingDays}
- Location: ${trainingLocation}
- Age: ${onboarding.age || "Not provided"}
- Weight: ${onboarding.weight || "Not provided"} ${onboarding.weightUnit || "kg"}
- Height: ${onboarding.height || "Not provided"} ${onboarding.heightUnit || "cm"}
- Diet Type: ${onboarding.dietType || "No specific diet"}

LABELS EXTRACTED:
${labels.map((l) => `- ${l.category}: ${l.key} = ${l.value} (confidence: ${l.confidence})`).join("\n")}

HEALTH CONSIDERATIONS:
${injuries.length > 0 ? `- Injuries: ${injuries.join(", ")}` : "- No injuries reported"}
${medicalConditions.length > 0 ? `- Medical Conditions: ${medicalConditions.join(", ")}` : "- No medical conditions reported"}
${dietaryConstraints.length > 0 ? `- Dietary Restrictions: ${dietaryConstraints.join(", ")}` : "- No dietary restrictions"}

AVAILABLE EXERCISES (already filtered for safety):
${appropriateExercises
  .map(
    (ex: Exercise) =>
      `- ID: ${ex.id}, Name: ${ex.name}, Muscle: ${ex.muscleGroup}, Equipment: ${ex.equipment}, Difficulty: ${ex.difficulty}${
        ex.description ? `, Description: ${ex.description}` : ""
      }`
  )
  .join("\n")}

AVAILABLE FOODS (already filtered for dietary restrictions):
${filteredFoods
  .map(
    (f: Food) =>
      `- ID: ${f.id}, Name: ${f.name}, Category: ${f.category}, Calories: ${f.calories}, Protein: ${f.protein}g, Carbs: ${f.carbs}g, Fat: ${f.fat}g, Serving: ${f.servingSize} ${f.servingUnit}`
  )
  .join("\n")}

INSTRUCTIONS:
1. Create a workout plan with exactly ${trainingDays} workout days per week
2. Select exercises from the available list using their IDs
3. Choose appropriate sets, reps, and rest periods based on the goal and experience level
4. Create a daily meal plan using foods from the available list using their IDs
5. Calculate macros to match the goal (e.g., calorie deficit for fat loss, surplus for muscle gain)
6. Provide clear reasoning for your choices
7. Include modifications and progression strategies
8. Ensure all exercise IDs and food IDs exist in the provided lists

IMPORTANT:
- Only use exerciseId values from the provided exercise list
- Only use foodId values from the provided food list
- All exercises are already safe for this client (contraindications filtered)
- All foods are already compatible with dietary restrictions
- Plan should be progressive and sustainable
- Include rest days in the weekly schedule`;

  console.log("[AI Plan Generator] Sending request to Claude AI...");

  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await client.messages.create({
      model: process.env.AI_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse the JSON response
    const generatedPlan = JSON.parse(content.text);

    // Validate with Zod
    const validatedPlan = aiPlanSchema.parse(generatedPlan);

    console.log("[AI Plan Generator] AI plan generated successfully");
    console.log(`[AI Plan Generator] Plan: "${validatedPlan.planName}" - ${validatedPlan.durationWeeks} weeks`);
    console.log(`[AI Plan Generator] Workout days: ${validatedPlan.workoutDays.length}`);
    console.log(`[AI Plan Generator] Daily meals: ${validatedPlan.mealPlan.dailyMeals.length}`);

    return {
      success: true,
      plan: validatedPlan,
      metadata: {
        exercisesAvailable: appropriateExercises.length,
        foodsAvailable: filteredFoods.length,
        labelsUsed: labels.length,
      },
    };
  } catch (error: any) {
    console.error("[AI Plan Generator] Error generating plan:", error);
    throw new Error(`Failed to generate AI plan: ${error.message || "Unknown error"}`);
  }

  /* Original code using Rork SDK - commented out for reference:
  try {
    const generatedPlan = await generateObject({
      messages: [{ role: "user", content: prompt }],
      schema: aiPlanSchema,
    });

    console.log("[AI Plan Generator] AI plan generated successfully");
    console.log(`[AI Plan Generator] Plan: "${generatedPlan.planName}" - ${generatedPlan.durationWeeks} weeks`);
    console.log(`[AI Plan Generator] Workout days: ${generatedPlan.workoutDays.length}`);
    console.log(`[AI Plan Generator] Daily meals: ${generatedPlan.mealPlan.dailyMeals.length}`);

    return {
      success: true,
      plan: generatedPlan,
      metadata: {
        exercisesAvailable: appropriateExercises.length,
        foodsAvailable: filteredFoods.length,
        labelsUsed: labels.length,
      },
    };
  } catch (error) {
    console.error("[AI Plan Generator] Error generating plan:", error);
    throw new Error(`Failed to generate AI plan: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
  */
}
