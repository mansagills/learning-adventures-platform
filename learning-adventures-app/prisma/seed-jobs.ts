/**
 * Seed script for 2D World job definitions
 * Run with: DATABASE_URL="..." npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-jobs.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const jobs = [
  {
    jobId: 'cafeteria-cashier',
    title: 'Cafeteria Cashier',
    description: 'Help out at the school cafeteria! Calculate the correct change for customers ordering lunch.',
    type: 'MINI_GAME' as const,
    iconEmoji: '🍕',
    currencyReward: 30,
    xpReward: 25,
    cooldownHours: 24,
    isActive: true,
    minLevel: 1,
    gamePath: '/games/cafeteria-cashier.html',
  },
  {
    jobId: 'math-tutor',
    title: 'Math Tutor',
    description: 'Teach younger students by answering 10 math questions correctly. Help others learn!',
    type: 'QUIZ' as const,
    iconEmoji: '📐',
    currencyReward: 20,
    xpReward: 20,
    cooldownHours: 12,
    isActive: true,
    minLevel: 1,
    gamePath: null,
  },
  {
    jobId: 'library-organizer',
    title: 'Library Organizer',
    description: 'Sort books by number on the spine! Put numbers in order from smallest to largest.',
    type: 'MINI_GAME' as const,
    iconEmoji: '📚',
    currencyReward: 15,
    xpReward: 15,
    cooldownHours: 8,
    isActive: true,
    minLevel: 1,
    gamePath: '/games/math-dash.html',
  },
  {
    jobId: 'garden-keeper',
    title: 'Campus Garden Keeper',
    description: 'Navigate the school garden maze and collect all the vegetables!',
    type: 'MINI_GAME' as const,
    iconEmoji: '🌻',
    currencyReward: 25,
    xpReward: 20,
    cooldownHours: 16,
    isActive: true,
    minLevel: 2,
    gamePath: '/games/math-dash.html',
  },
];

async function main() {
  console.log('💼 Seeding job definitions...');

  let created = 0;
  let skipped = 0;

  for (const job of jobs) {
    const existing = await prisma.job.findUnique({ where: { jobId: job.jobId } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.job.create({ data: job });
    created++;
    console.log(`  ✅ Created: ${job.iconEmoji} ${job.title} (${job.currencyReward} coins, ${job.xpReward} XP)`);
  }

  console.log(`\n✨ Done! Created ${created} jobs, skipped ${skipped} existing.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
