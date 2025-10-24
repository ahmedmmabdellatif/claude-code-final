import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

interface WarmupExerciseData {
  id: string;
  name: string;
  category: string;
  target_areas: string[];
  duration_seconds?: number;
  reps?: number;
  sets: number;
  difficulty: string;
  equipment: string;
  instructions: string[];
  form_cues: string[];
  benefits: string[];
  contraindications: string[];
  video_url?: string;
  thumbnail_url?: string;
}

interface WorkoutExerciseData {
  id: string;
  name: string;
  category: string;
  movement_type?: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  difficulty: string;
  equipment: string[];
  instructions: string[];
  form_cues: string[];
  common_mistakes: string[];
  contraindications: string[];
  modifications?: any;
  rep_ranges?: any;
  tempo?: string;
  rest_seconds?: number;
  scientific_notes?: any[];
  video_url?: string;
  video_thumbnail?: string;
}

interface StretchingExerciseData {
  id: string;
  name: string;
  category: string;
  target_muscles: string[];
  duration_seconds: number;
  sets: number;
  difficulty: string;
  equipment: string;
  instructions: string[];
  form_cues: string[];
  benefits: string[];
  contraindications: string[];
  best_time?: string;
  video_url?: string;
}

interface CardioProtocolData {
  id: string;
  name: string;
  type: string;
  intensity: string;
  target_heart_rate_percentage?: string;
  duration_minutes: number;
  frequency_per_week: number;
  calories_burned_estimate?: string;
  equipment: string[];
  instructions: string[];
  benefits: string[];
  best_for: string[];
  contraindications: string[];
  progression?: string;
  scientific_notes?: any[];
}

interface FoodNutritionData {
  id: string;
  name: string;
  category: string;
  serving_size: string;
  macros: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g?: number;
    omega3_g?: number;
  };
  micronutrients?: any;
  diet_compatibility: string[];
  allergens: string[];
  preparation_methods: string[];
  cost_rating?: string;
  bioavailability_score?: number;
  scientific_notes?: string;
}

interface RecipeData {
  id: string;
  name: string;
  category: string;
  meal_type: string;
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  total_time_minutes: number;
  difficulty: string;
  diet_compatibility: string[];
  total_macros: any;
  ingredients: any[];
  instructions: string[];
  tips: string[];
  best_time?: string;
  storage?: string;
}

interface SupplementData {
  id: string;
  name: string;
  category: string;
  primary_benefit: string;
  dosage: string;
  timing: string[];
  daily_frequency: number;
  evidence_level: string;
  cost_rating: string;
  necessity_rating: any;
  benefits: string[];
  side_effects: string[];
  contraindications: string[];
  alternatives: string[];
  loading_phase?: any;
  scientific_notes: any[];
}

interface ScientificReferenceData {
  id: string;
  title: string;
  authors: string[];
  journal?: string;
  year: number;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  pmid?: string;
  key_findings: string[];
  relevance?: string;
  organization?: string;
  url?: string;
}

// Function to extract JSON arrays from markdown sections
function extractJSONSection(content: string, sectionTitle: string): any[] {
  const regex = new RegExp(`##.*${sectionTitle}[\\s\\S]*?\\x60\\x60\\x60json\\s*\\n(\\[[\\s\\S]*?\\])\\s*\\n\\x60\\x60\\x60`, 'i');
  const match = content.match(regex);

  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      console.error(`Failed to parse JSON for section: ${sectionTitle}`, error);
      return [];
    }
  }

  return [];
}

// Function to extract single JSON object (for Hydration Guidelines)
function extractJSONObject(content: string, sectionTitle: string): any | null {
  const regex = new RegExp(`##.*${sectionTitle}[\\s\\S]*?\\x60\\x60\\x60json\\s*\\n(\\{[\\s\\S]*?\\})\\s*\\n\\x60\\x60\\x60`, 'i');
  const match = content.match(regex);

  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      console.error(`Failed to parse JSON for section: ${sectionTitle}`, error);
      return null;
    }
  }

  return null;
}

async function main() {
  console.log('🌱 Starting CMS Database Seeding...\\n');

  // Read the markdown file
  const filePath = path.join(__dirname, 'SUPABASE_DATABASE_SEED_BASE.md');
  const content = fs.readFileSync(filePath, 'utf-8');

  console.log('📖 Reading and parsing markdown file...\\n');

  // Extract all sections
  const warmupExercises = extractJSONSection(content, 'WARM-UP EXERCISES') as WarmupExerciseData[];
  const workoutExercises = extractJSONSection(content, 'WORKOUT EXERCISES') as WorkoutExerciseData[];
  const stretchingExercises = extractJSONSection(content, 'STRETCHING EXERCISES') as StretchingExerciseData[];
  const cardioProtocols = extractJSONSection(content, 'CARDIO EXERCISES') as CardioProtocolData[];
  const foodNutrition = extractJSONSection(content, 'NUTRITION DATABASE') as FoodNutritionData[];
  const recipes = extractJSONSection(content, 'RECIPES') as RecipeData[];
  const supplements = extractJSONSection(content, 'SUPPLEMENT PROTOCOLS') as SupplementData[];
  const scientificReferences = extractJSONSection(content, 'SCIENTIFIC REFERENCES') as ScientificReferenceData[];

  console.log(`Found ${warmupExercises.length} warmup exercises`);
  console.log(`Found ${workoutExercises.length} workout exercises`);
  console.log(`Found ${stretchingExercises.length} stretching exercises`);
  console.log(`Found ${cardioProtocols.length} cardio protocols`);
  console.log(`Found ${foodNutrition.length} food items`);
  console.log(`Found ${recipes.length} recipes`);
  console.log(`Found ${supplements.length} supplements`);
  console.log(`Found ${scientificReferences.length} scientific references\\n`);

  // Seed Warmup Exercises
  if (warmupExercises.length > 0) {
    console.log('💪 Seeding warmup exercises...');
    for (const exercise of warmupExercises) {
      await prisma.warmupExercise.create({
        data: {
          name: exercise.name,
          category: exercise.category,
          targetAreas: exercise.target_areas,
          durationSeconds: exercise.duration_seconds,
          reps: exercise.reps,
          sets: exercise.sets,
          difficulty: exercise.difficulty,
          equipment: exercise.equipment,
          instructions: exercise.instructions,
          formCues: exercise.form_cues,
          benefits: exercise.benefits,
          contraindications: exercise.contraindications,
          videoUrl: exercise.video_url,
          thumbnailUrl: exercise.thumbnail_url,
        },
      });
    }
    console.log(`✅ Seeded ${warmupExercises.length} warmup exercises\\n`);
  }

  // Seed Workout Exercises
  if (workoutExercises.length > 0) {
    console.log('🏋️ Seeding workout exercises...');
    for (const exercise of workoutExercises) {
      await prisma.workoutExercise.create({
        data: {
          name: exercise.name,
          category: exercise.category,
          movementType: exercise.movement_type,
          primaryMuscles: exercise.primary_muscles,
          secondaryMuscles: exercise.secondary_muscles,
          difficulty: exercise.difficulty,
          equipment: exercise.equipment,
          instructions: exercise.instructions,
          formCues: exercise.form_cues,
          commonMistakes: exercise.common_mistakes,
          contraindications: exercise.contraindications,
          modifications: exercise.modifications || {},
          repRanges: exercise.rep_ranges || {},
          tempo: exercise.tempo,
          restSeconds: exercise.rest_seconds,
          scientificNotes: exercise.scientific_notes || [],
          videoUrl: exercise.video_url,
          videoThumbnail: exercise.video_thumbnail,
        },
      });
    }
    console.log(`✅ Seeded ${workoutExercises.length} workout exercises\\n`);
  }

  // Seed Stretching Exercises
  if (stretchingExercises.length > 0) {
    console.log('🧘 Seeding stretching exercises...');
    for (const exercise of stretchingExercises) {
      await prisma.stretchingExercise.create({
        data: {
          name: exercise.name,
          category: exercise.category,
          targetMuscles: exercise.target_muscles,
          durationSeconds: exercise.duration_seconds,
          sets: exercise.sets,
          difficulty: exercise.difficulty,
          equipment: exercise.equipment,
          instructions: exercise.instructions,
          formCues: exercise.form_cues,
          benefits: exercise.benefits,
          contraindications: exercise.contraindications,
          bestTime: exercise.best_time,
          videoUrl: exercise.video_url,
        },
      });
    }
    console.log(`✅ Seeded ${stretchingExercises.length} stretching exercises\\n`);
  }

  // Seed Cardio Protocols
  if (cardioProtocols.length > 0) {
    console.log('🏃 Seeding cardio protocols...');
    for (const cardio of cardioProtocols) {
      await prisma.cardioProtocol.create({
        data: {
          name: cardio.name,
          type: cardio.type,
          intensity: cardio.intensity,
          targetHeartRatePercentage: cardio.target_heart_rate_percentage,
          durationMinutes: cardio.duration_minutes,
          frequencyPerWeek: String(cardio.frequency_per_week),
          caloriesBurnedEstimate: cardio.calories_burned_estimate,
          equipment: Array.isArray(cardio.equipment) ? cardio.equipment : [cardio.equipment],
          instructions: cardio.instructions,
          benefits: cardio.benefits,
          bestFor: cardio.best_for,
          contraindications: cardio.contraindications,
          progression: cardio.progression,
          scientificNotes: cardio.scientific_notes || [],
        },
      });
    }
    console.log(`✅ Seeded ${cardioProtocols.length} cardio protocols\\n`);
  }

  // Seed Food Nutrition
  if (foodNutrition.length > 0) {
    console.log('🥗 Seeding food nutrition...');
    for (const food of foodNutrition) {
      await prisma.foodNutrition.create({
        data: {
          name: food.name,
          category: food.category,
          servingSize: food.serving_size,
          calories: food.macros.calories,
          proteinG: food.macros.protein_g,
          carbsG: food.macros.carbs_g,
          fatG: food.macros.fat_g,
          fiberG: food.macros.fiber_g,
          omega3G: food.macros.omega3_g,
          micronutrients: food.micronutrients,
          dietCompatibility: food.diet_compatibility,
          allergens: food.allergens,
          preparationMethods: food.preparation_methods,
          costRating: food.cost_rating,
          bioavailabilityScore: food.bioavailability_score,
          scientificNotes: food.scientific_notes,
        },
      });
    }
    console.log(`✅ Seeded ${foodNutrition.length} food items\\n`);
  }

  // Seed Recipes
  if (recipes.length > 0) {
    console.log('🍳 Seeding recipes...');
    for (const recipe of recipes) {
      await prisma.recipe.create({
        data: {
          name: recipe.name,
          category: recipe.category,
          mealType: recipe.meal_type,
          servings: recipe.servings,
          prepTimeMinutes: recipe.prep_time_minutes,
          cookTimeMinutes: recipe.cook_time_minutes,
          totalTimeMinutes: recipe.total_time_minutes,
          difficulty: recipe.difficulty,
          dietCompatibility: recipe.diet_compatibility,
          totalMacros: recipe.total_macros,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          tips: recipe.tips,
          bestTime: recipe.best_time,
          storage: recipe.storage,
        },
      });
    }
    console.log(`✅ Seeded ${recipes.length} recipes\\n`);
  }

  // Seed Supplements
  if (supplements.length > 0) {
    console.log('💊 Seeding supplements...');
    for (const supplement of supplements) {
      await prisma.supplement.create({
        data: {
          name: supplement.name,
          category: supplement.category,
          primaryBenefit: supplement.primary_benefit,
          dosage: supplement.dosage,
          timing: supplement.timing,
          dailyFrequency: String(supplement.daily_frequency),
          evidenceLevel: supplement.evidence_level,
          costRating: supplement.cost_rating,
          necessityRating: supplement.necessity_rating,
          benefits: supplement.benefits,
          sideEffects: supplement.side_effects,
          contraindications: supplement.contraindications,
          alternatives: supplement.alternatives,
          loadingPhase: supplement.loading_phase,
          scientificNotes: supplement.scientific_notes,
        },
      });
    }
    console.log(`✅ Seeded ${supplements.length} supplements\\n`);
  }

  // Seed Scientific References
  if (scientificReferences.length > 0) {
    console.log('📚 Seeding scientific references...');
    for (const reference of scientificReferences) {
      await prisma.scientificReference.create({
        data: {
          title: reference.title,
          authors: reference.authors,
          journal: reference.journal,
          year: reference.year,
          volume: reference.volume,
          issue: reference.issue,
          pages: reference.pages,
          doi: reference.doi,
          pmid: reference.pmid,
          keyFindings: reference.key_findings,
          relevance: reference.relevance,
          organization: reference.organization,
          url: reference.url,
        },
      });
    }
    console.log(`✅ Seeded ${scientificReferences.length} scientific references\\n`);
  }

  // Seed Hydration Guidelines (single object)
  const hydrationData = extractJSONObject(content, 'WATER INTAKE GUIDELINES');
  if (hydrationData) {
    console.log('💧 Seeding hydration guidelines...');
    await prisma.hydrationGuideline.create({
      data: {
        baselineRecommendations: hydrationData.baseline_recommendations,
        factorsIncreasingNeeds: hydrationData.factors_increasing_needs,
        timingRecommendations: hydrationData.timing_recommendations,
        hydrationAssessment: hydrationData.hydration_assessment,
        specialPopulations: hydrationData.special_populations,
      },
    });
    console.log(`✅ Seeded hydration guidelines\\n`);
  }

  console.log('🎉 CMS Database seeding completed successfully!\\n');
  console.log('📊 Summary:');
  console.log(`   - Warmup Exercises: ${warmupExercises.length}`);
  console.log(`   - Workout Exercises: ${workoutExercises.length}`);
  console.log(`   - Stretching Exercises: ${stretchingExercises.length}`);
  console.log(`   - Cardio Protocols: ${cardioProtocols.length}`);
  console.log(`   - Food Items: ${foodNutrition.length}`);
  console.log(`   - Recipes: ${recipes.length}`);
  console.log(`   - Supplements: ${supplements.length}`);
  console.log(`   - Scientific References: ${scientificReferences.length}`);
  console.log(`   - Hydration Guidelines: ${hydrationData ? 1 : 0}\\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error during CMS seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
