import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@englishbrain.com' },
    update: {},
    create: {
      email: 'demo@englishbrain.com',
      name: 'Demo User',
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Create user analytics
  await prisma.userAnalytics.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      totalPractices: 0,
      totalReviews: 0,
      currentStreak: 0,
      longestStreak: 0,
      commonErrors: {},
    },
  });

  console.log('✅ Created user analytics');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
