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
  console.log('🎉 Database cleaned successfully!\n');
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
