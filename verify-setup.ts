import { prisma } from './backend/db';

async function verifySetup() {
  console.log('🔍 Verifying database setup...\n');

  try {
    console.log('Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful\n');

    const userCount = await prisma.user.count();
    const exerciseCount = await prisma.exercise.count();
    const foodCount = await prisma.food.count();
    const offerCount = await prisma.programOffer.count();
    const goalCount = await prisma.goal.count();

    console.log('📊 Database Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Exercises: ${exerciseCount}`);
    console.log(`   Foods: ${foodCount}`);
    console.log(`   Program Offers: ${offerCount}`);
    console.log(`   Goals: ${goalCount}\n`);

    if (userCount === 0) {
      console.log('⚠️  No users found. Run: bun run prisma/seed.ts');
    } else {
      const users = await prisma.user.findMany({
        select: {
          email: true,
          role: true,
          name: true,
        },
      });
      console.log('👥 Users in database:');
      users.forEach((user: { name: string; email: string; role: string }) => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    console.log('\n✅ Database setup verified successfully!');
    console.log('\n🚀 You can now:');
    console.log('   1. Start the app with your normal start command');
    console.log('   2. Login with coach@example.com or client@example.com (password: password123)');
    console.log('   3. View database with: bunx prisma studio');
  } catch (error) {
    console.error('❌ Database setup verification failed:', error);
    if (error instanceof Error) {
      if (error.message.includes('PrismaClient')) {
        console.log('\n💡 Fix: Run "bunx prisma generate" to generate Prisma client');
      } else if (error.message.includes('connect')) {
        console.log('\n💡 Fix: Check your DATABASE_URL in .env file');
      } else {
        console.log('\n💡 Fix: Run "bunx prisma db push" to sync your schema');
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

verifySetup();
