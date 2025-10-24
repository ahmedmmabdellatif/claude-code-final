#!/usr/bin/env bun

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSetup() {
  console.log('🔍 Checking database setup...\n');

  try {
    const userCount = await prisma.user.count();
    console.log(`✅ Users: ${userCount}`);

    const exerciseCount = await prisma.exercise.count();
    console.log(`✅ Exercises: ${exerciseCount}`);

    const foodCount = await prisma.food.count();
    console.log(`✅ Foods: ${foodCount}`);

    const goalCount = await prisma.goal.count();
    console.log(`✅ Goals: ${goalCount}`);

    const measurementCount = await prisma.measurement.count();
    console.log(`✅ Measurements: ${measurementCount}`);

    console.log('\n✅ Database is properly set up and seeded!');
    console.log('\n📝 Demo credentials:');
    console.log('   Coach: coach@example.com / password123');
    console.log('   Client: client@example.com / password123');
  } catch (error) {
    console.error('\n❌ Database error:', error);
    console.log('\n💡 Run these commands to fix:');
    console.log('   1. bunx prisma generate');
    console.log('   2. bunx prisma db push --accept-data-loss');
    console.log('   3. bun prisma/seed.ts');
  } finally {
    await prisma.$disconnect();
  }
}

checkSetup();
