import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning database and reseeding with production data...\n');

  // Delete all data except Users (to keep coach/client accounts)
  console.log('Deleting all mock data...');

  await prisma.payment.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.pushToken.deleteMany({});
  await prisma.measurement.deleteMany({});
  await prisma.typingStatus.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.questionnaireResponse.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.food.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.clientLabel.deleteMany({});
  await prisma.onboardingData.deleteMany({});
  await prisma.presenceStatus.deleteMany({});
  await prisma.alert.deleteMany({});
  await prisma.programOffer.deleteMany({});
  await prisma.uploadedFile.deleteMany({});
  await prisma.plan.deleteMany({});
  await prisma.progressPhoto.deleteMany({});

  // Delete exercise library (we'll repopulate)
  await prisma.exercise.deleteMany({});

  console.log('✅ All mock data deleted\n');

  // Verify test users exist
  const hashedPassword = await bcrypt.hash('password123', 10);

  const coach = await prisma.user.upsert({
    where: { email: 'coach@test.com' },
    update: {},
    create: {
      email: 'coach@test.com',
      password: hashedPassword,
      name: 'Test Coach',
      role: 'coach',
      coachProfile: {
        create: {
          bio: 'Professional fitness coach',
          specialty: 'Strength & Conditioning',
          yearsExp: 5,
          certification: 'Certified Personal Trainer',
        },
      },
    },
    include: { coachProfile: true },
  });

  const client = await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {},
    create: {
      email: 'client@test.com',
      password: hashedPassword,
      name: 'Test Client',
      role: 'client',
      clientProfile: {
        create: {
          membershipNumber: '#TEST001',
          startDate: new Date(),
          planStatus: 'pending',
          adherence: 0,
          lastCheckin: new Date(),
          coachId: coach.coachProfile!.id,
        },
      },
    },
    include: { clientProfile: true },
  });

  console.log('✅ Test users verified\n');

  // Populate Exercise Library with real data
  console.log('Populating Exercise Library...');

  const exercises = [
    // Chest
    { name: 'Barbell Bench Press', category: 'chest', muscleGroup: 'chest', difficulty: 'Intermediate', equipment: 'Barbell, Bench', contraindicatedConditions: ['shoulder_injury'] },
    { name: 'Dumbbell Bench Press', category: 'chest', muscleGroup: 'chest', difficulty: 'Beginner', equipment: 'Dumbbells, Bench', contraindicatedConditions: ['shoulder_injury'] },
    { name: 'Push-ups', category: 'chest', muscleGroup: 'chest', difficulty: 'Beginner', equipment: 'Bodyweight', contraindicatedConditions: ['wrist_injury', 'shoulder_injury'] },
    { name: 'Incline Dumbbell Press', category: 'chest', muscleGroup: 'chest', difficulty: 'Intermediate', equipment: 'Dumbbells, Incline Bench', contraindicatedConditions: ['shoulder_injury'] },
    { name: 'Cable Chest Fly', category: 'chest', muscleGroup: 'chest', difficulty: 'Intermediate', equipment: 'Cable Machine', contraindicatedConditions: ['shoulder_injury'] },

    // Back
    { name: 'Pull-ups', category: 'back', muscleGroup: 'back', difficulty: 'Intermediate', equipment: 'Pull-up Bar', contraindicatedConditions: ['shoulder_injury', 'elbow_injury'] },
    { name: 'Barbell Rows', category: 'back', muscleGroup: 'back', difficulty: 'Intermediate', equipment: 'Barbell', contraindicatedConditions: ['lower_back_pain'] },
    { name: 'Lat Pulldowns', category: 'back', muscleGroup: 'back', difficulty: 'Beginner', equipment: 'Cable Machine', contraindicatedConditions: ['shoulder_injury'] },
    { name: 'Deadlifts', category: 'back', muscleGroup: 'back', difficulty: 'Advanced', equipment: 'Barbell', contraindicatedConditions: ['lower_back_pain', 'herniated_disc'] },
    { name: 'Seated Cable Rows', category: 'back', muscleGroup: 'back', difficulty: 'Beginner', equipment: 'Cable Machine', contraindicatedConditions: [] },

    // Legs
    { name: 'Barbell Squats', category: 'legs', muscleGroup: 'legs', difficulty: 'Intermediate', equipment: 'Barbell, Squat Rack', contraindicatedConditions: ['knee_injury', 'lower_back_pain'] },
    { name: 'Leg Press', category: 'legs', muscleGroup: 'legs', difficulty: 'Beginner', equipment: 'Leg Press Machine', contraindicatedConditions: ['knee_injury'] },
    { name: 'Romanian Deadlifts', category: 'legs', muscleGroup: 'hamstrings', difficulty: 'Intermediate', equipment: 'Barbell', contraindicatedConditions: ['lower_back_pain', 'hamstring_injury'] },
    { name: 'Leg Curls', category: 'legs', muscleGroup: 'hamstrings', difficulty: 'Beginner', equipment: 'Leg Curl Machine', contraindicatedConditions: ['hamstring_injury'] },
    { name: 'Leg Extensions', category: 'legs', muscleGroup: 'quadriceps', difficulty: 'Beginner', equipment: 'Leg Extension Machine', contraindicatedConditions: ['knee_injury'] },
    { name: 'Walking Lunges', category: 'legs', muscleGroup: 'legs', difficulty: 'Beginner', equipment: 'Dumbbells (optional)', contraindicatedConditions: ['knee_injury'] },
    { name: 'Calf Raises', category: 'legs', muscleGroup: 'calves', difficulty: 'Beginner', equipment: 'Calf Raise Machine', contraindicatedConditions: ['ankle_injury'] },

    // Shoulders
    { name: 'Overhead Press', category: 'shoulders', muscleGroup: 'shoulders', difficulty: 'Intermediate', equipment: 'Barbell', contraindicatedConditions: ['shoulder_injury', 'rotator_cuff_injury'] },
    { name: 'Dumbbell Shoulder Press', category: 'shoulders', muscleGroup: 'shoulders', difficulty: 'Beginner', equipment: 'Dumbbells', contraindicatedConditions: ['shoulder_injury', 'rotator_cuff_injury'] },
    { name: 'Lateral Raises', category: 'shoulders', muscleGroup: 'shoulders', difficulty: 'Beginner', equipment: 'Dumbbells', contraindicatedConditions: ['shoulder_injury'] },
    { name: 'Front Raises', category: 'shoulders', muscleGroup: 'shoulders', difficulty: 'Beginner', equipment: 'Dumbbells', contraindicatedConditions: ['shoulder_injury'] },
    { name: 'Face Pulls', category: 'shoulders', muscleGroup: 'shoulders', difficulty: 'Beginner', equipment: 'Cable Machine', contraindicatedConditions: [] },

    // Arms
    { name: 'Barbell Curls', category: 'arms', muscleGroup: 'biceps', difficulty: 'Beginner', equipment: 'Barbell', contraindicatedConditions: ['elbow_injury'] },
    { name: 'Tricep Dips', category: 'arms', muscleGroup: 'triceps', difficulty: 'Intermediate', equipment: 'Dip Station', contraindicatedConditions: ['shoulder_injury', 'elbow_injury'] },
    { name: 'Hammer Curls', category: 'arms', muscleGroup: 'biceps', difficulty: 'Beginner', equipment: 'Dumbbells', contraindicatedConditions: ['elbow_injury'] },
    { name: 'Tricep Pushdowns', category: 'arms', muscleGroup: 'triceps', difficulty: 'Beginner', equipment: 'Cable Machine', contraindicatedConditions: ['elbow_injury'] },
    { name: 'Overhead Tricep Extension', category: 'arms', muscleGroup: 'triceps', difficulty: 'Beginner', equipment: 'Dumbbell', contraindicatedConditions: ['shoulder_injury', 'elbow_injury'] },

    // Core
    { name: 'Planks', category: 'core', muscleGroup: 'core', difficulty: 'Beginner', equipment: 'Bodyweight', contraindicatedConditions: ['lower_back_pain', 'wrist_injury'] },
    { name: 'Cable Crunches', category: 'core', muscleGroup: 'abs', difficulty: 'Beginner', equipment: 'Cable Machine', contraindicatedConditions: ['neck_injury'] },
    { name: 'Russian Twists', category: 'core', muscleGroup: 'obliques', difficulty: 'Beginner', equipment: 'Medicine Ball (optional)', contraindicatedConditions: ['lower_back_pain'] },
    { name: 'Hanging Leg Raises', category: 'core', muscleGroup: 'abs', difficulty: 'Advanced', equipment: 'Pull-up Bar', contraindicatedConditions: ['shoulder_injury', 'lower_back_pain'] },
    { name: 'Ab Wheel Rollouts', category: 'core', muscleGroup: 'abs', difficulty: 'Intermediate', equipment: 'Ab Wheel', contraindicatedConditions: ['lower_back_pain', 'shoulder_injury'] },

    // Cardio
    { name: 'Treadmill Running', category: 'cardio', muscleGroup: 'cardiovascular', difficulty: 'Beginner', equipment: 'Treadmill', contraindicatedConditions: ['knee_injury', 'ankle_injury'] },
    { name: 'Cycling', category: 'cardio', muscleGroup: 'cardiovascular', difficulty: 'Beginner', equipment: 'Stationary Bike', contraindicatedConditions: [] },
    { name: 'Rowing Machine', category: 'cardio', muscleGroup: 'cardiovascular', difficulty: 'Intermediate', equipment: 'Rowing Machine', contraindicatedConditions: ['lower_back_pain'] },
    { name: 'Jump Rope', category: 'cardio', muscleGroup: 'cardiovascular', difficulty: 'Beginner', equipment: 'Jump Rope', contraindicatedConditions: ['knee_injury', 'ankle_injury'] },
    { name: 'Burpees', category: 'cardio', muscleGroup: 'full-body', difficulty: 'Intermediate', equipment: 'Bodyweight', contraindicatedConditions: ['knee_injury', 'wrist_injury'] },
  ] as const;

  for (const exercise of exercises) {
    await prisma.exercise.create({
      data: exercise,
    });
  }

  console.log(`✅ Added ${exercises.length} exercises to library\n`);

  // Populate Food Library with basic items
  console.log('Populating Food Library...');

  const foods = [
    // Proteins
    { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: '100', servingUnit: 'g', category: 'protein' },
    { name: 'Salmon', calories: 206, protein: 22, carbs: 0, fat: 13, servingSize: '100', servingUnit: 'g', category: 'protein' },
    { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11, servingSize: '2', servingUnit: 'large', category: 'protein' },
    { name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0.7, servingSize: '170', servingUnit: 'g', category: 'protein' },
    { name: 'Lean Beef', calories: 250, protein: 26, carbs: 0, fat: 15, servingSize: '100', servingUnit: 'g', category: 'protein' },

    // Carbs
    { name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8, servingSize: '1', servingUnit: 'cup cooked', category: 'carbs' },
    { name: 'Sweet Potato', calories: 112, protein: 2, carbs: 26, fat: 0.1, servingSize: '1', servingUnit: 'medium', category: 'carbs' },
    { name: 'Oatmeal', calories: 154, protein: 6, carbs: 27, fat: 2.5, servingSize: '1', servingUnit: 'cup cooked', category: 'carbs' },
    { name: 'Whole Wheat Bread', calories: 80, protein: 4, carbs: 14, fat: 1, servingSize: '1', servingUnit: 'slice', category: 'carbs' },
    { name: 'Quinoa', calories: 222, protein: 8, carbs: 39, fat: 3.6, servingSize: '1', servingUnit: 'cup cooked', category: 'carbs' },

    // Vegetables
    { name: 'Broccoli', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, servingSize: '1', servingUnit: 'cup', category: 'vegetables' },
    { name: 'Spinach', calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, servingSize: '1', servingUnit: 'cup raw', category: 'vegetables' },
    { name: 'Bell Peppers', calories: 24, protein: 1, carbs: 6, fat: 0.2, servingSize: '1', servingUnit: 'medium', category: 'vegetables' },
    { name: 'Carrots', calories: 25, protein: 0.6, carbs: 6, fat: 0.1, servingSize: '1', servingUnit: 'medium', category: 'vegetables' },
    { name: 'Asparagus', calories: 20, protein: 2.2, carbs: 3.7, fat: 0.2, servingSize: '5', servingUnit: 'spears', category: 'vegetables' },

    // Healthy Fats
    { name: 'Avocado', calories: 234, protein: 3, carbs: 12, fat: 21, servingSize: '1', servingUnit: 'medium', category: 'fats' },
    { name: 'Almonds', calories: 164, protein: 6, carbs: 6, fat: 14, servingSize: '1', servingUnit: 'oz', category: 'fats' },
    { name: 'Olive Oil', calories: 119, protein: 0, carbs: 0, fat: 13.5, servingSize: '1', servingUnit: 'tbsp', category: 'fats' },
    { name: 'Peanut Butter', calories: 96, protein: 4, carbs: 3.5, fat: 8, servingSize: '1', servingUnit: 'tbsp', category: 'fats' },

    // Fruits
    { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, servingSize: '1', servingUnit: 'medium', category: 'fruits' },
    { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, servingSize: '1', servingUnit: 'medium', category: 'fruits' },
    { name: 'Blueberries', calories: 84, protein: 1.1, carbs: 21, fat: 0.5, servingSize: '1', servingUnit: 'cup', category: 'fruits' },
    { name: 'Orange', calories: 62, protein: 1.2, carbs: 15, fat: 0.2, servingSize: '1', servingUnit: 'medium', category: 'fruits' },
  ] as const;

  for (const food of foods) {
    await prisma.food.create({
      data: food,
    });
  }

  console.log(`✅ Added ${foods.length} foods to library\n`);

  console.log('🎉 Database cleaned and reseeded successfully!\n');
  console.log('📝 Test Credentials:');
  console.log('   Coach:  coach@test.com / password123');
  console.log('   Client: client@test.com / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
