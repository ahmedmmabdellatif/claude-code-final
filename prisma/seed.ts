import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting minimal database seed (test accounts only)...');

  // Test password for both accounts: "password123"
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create test coach
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
          bio: 'Test coach account for development',
          specialty: 'General Fitness',
          yearsExp: 5,
          certification: 'Certified Personal Trainer',
        },
      },
    },
  });

  console.log('✅ Created coach: coach@test.com / password123');

  // Create test client
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
          planStatus: 'active',
          adherence: 0,
          lastCheckin: new Date(),
        },
      },
    },
  });

  console.log('✅ Created client: client@test.com / password123');

  // Link client to coach
  const clientProfile = await prisma.clientProfile.findFirst({
    where: { userId: client.id },
  });

  const coachProfile = await prisma.coachProfile.findFirst({
    where: { userId: coach.id },
  });

  if (clientProfile && coachProfile) {
    await prisma.clientProfile.update({
      where: { id: clientProfile.id },
      data: { coachId: coachProfile.id },
    });
    console.log('✅ Linked client to coach');
  }

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('   Coach:  coach@test.com / password123');
  console.log('   Client: client@test.com / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
