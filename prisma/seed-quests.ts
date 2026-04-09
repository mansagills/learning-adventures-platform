/**
 * Seed script for Quest System (Phase 2A)
 * Run with: npm run db:seed:quests
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Objective = { id: string; label: string; gameId?: string };

const quests: {
  questId: string;
  title: string;
  description: string;
  subject: string;
  buildingId: string;
  xpReward: number;
  coinReward: number;
  objectives: Objective[];
  prerequisites: string[];
  order: number;
}[] = [
  // ── Math Building ──────────────────────────────────────────
  {
    questId: 'fraction-fundamentals',
    title: 'Fraction Fundamentals',
    description:
      'Welcome to the Math Building! Master fractions by completing the Fraction Frenzy game. Fractions are everywhere on campus — from splitting a pizza at lunch to dividing practice time fairly. Score 80% or higher to prove your skills!',
    subject: 'MATH',
    buildingId: 'math-building',
    xpReward: 50,
    coinReward: 25,
    objectives: [
      { id: 'obj1', label: 'Complete the Fraction Frenzy game', gameId: 'fraction-frenzy' },
      { id: 'obj2', label: 'Score 80% or higher' },
    ],
    prerequisites: [],
    order: 1,
  },
  {
    questId: 'multiplication-mastery',
    title: 'Multiplication Mastery',
    description:
      'Level up your math skills with the Times Tables Challenge! Multiplication is the superpower behind everything from science calculations to business profits. Complete 3 rounds and show the campus you mean business!',
    subject: 'MATH',
    buildingId: 'math-building',
    xpReward: 75,
    coinReward: 35,
    objectives: [
      { id: 'obj1', label: 'Complete the Times Tables Challenge', gameId: 'times-tables' },
      { id: 'obj2', label: 'Complete 3 multiplication rounds' },
    ],
    prerequisites: ['fraction-fundamentals'],
    order: 2,
  },
  {
    questId: 'math-champion',
    title: 'Math Champion',
    description:
      'The ultimate Math Building challenge awaits! Take on the Math Arena and defeat all 3 math bosses to earn the legendary Math Champion title. Only the sharpest students on campus have what it takes!',
    subject: 'MATH',
    buildingId: 'math-building',
    xpReward: 150,
    coinReward: 75,
    objectives: [
      { id: 'obj1', label: 'Complete the Math Arena challenge', gameId: 'math-arena' },
      { id: 'obj2', label: 'Defeat all 3 math bosses' },
    ],
    prerequisites: ['multiplication-mastery'],
    order: 3,
  },

  // ── Science Building ───────────────────────────────────────
  {
    questId: 'lab-safety-basics',
    title: 'Lab Safety Basics',
    description:
      'Every great scientist starts with safety! Before you can explore the Science Building labs, you need to pass the Lab Safety Quiz with a perfect score. Safety goggles on — let\'s do this!',
    subject: 'SCIENCE',
    buildingId: 'science-building',
    xpReward: 40,
    coinReward: 20,
    objectives: [
      { id: 'obj1', label: 'Complete the Lab Safety Quiz', gameId: 'lab-safety-quiz' },
      { id: 'obj2', label: 'Pass with 100% score' },
    ],
    prerequisites: [],
    order: 1,
  },
  {
    questId: 'scientific-method-explorer',
    title: 'Scientific Method Explorer',
    description:
      'Real scientists follow a method — hypothesis, experiment, conclusion! Use the Hypothesis Builder to design your own experiments and run 3 virtual experiments in the campus science lab. Discovery awaits!',
    subject: 'SCIENCE',
    buildingId: 'science-building',
    xpReward: 80,
    coinReward: 40,
    objectives: [
      { id: 'obj1', label: 'Complete the Hypothesis Builder activity', gameId: 'hypothesis-builder' },
      { id: 'obj2', label: 'Run 3 virtual experiments' },
    ],
    prerequisites: ['lab-safety-basics'],
    order: 2,
  },

  // ── Business Building ──────────────────────────────────────
  {
    questId: 'entrepreneurship-101',
    title: 'Entrepreneurship 101',
    description:
      'Every big company started with one idea! Learn the core concepts behind entrepreneurship in the Business Building and identify 3 key business ideas. Could you be the next campus entrepreneur?',
    subject: 'BUSINESS',
    buildingId: 'business-building',
    xpReward: 50,
    coinReward: 25,
    objectives: [
      { id: 'obj1', label: 'Complete the Business Basics lesson', gameId: 'business-basics' },
      { id: 'obj2', label: 'Identify 3 business concepts' },
    ],
    prerequisites: [],
    order: 1,
  },
  {
    questId: 'business-plan-basics',
    title: 'Business Plan Basics',
    description:
      'Turn your big idea into a real business plan! Use the Business Plan Builder to map out your product, customers, and strategy. Investors on campus are watching — impress them with your first plan!',
    subject: 'BUSINESS',
    buildingId: 'business-building',
    xpReward: 90,
    coinReward: 45,
    objectives: [
      { id: 'obj1', label: 'Complete the Business Plan Builder', gameId: 'business-plan-builder' },
      { id: 'obj2', label: 'Create your first business plan' },
    ],
    prerequisites: ['entrepreneurship-101'],
    order: 2,
  },
];

async function main() {
  console.log('🗺️  Seeding quest definitions...');

  let created = 0;
  let skipped = 0;

  for (const quest of quests) {
    const existing = await prisma.quest.findUnique({ where: { questId: quest.questId } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.quest.create({ data: quest });
    created++;
    console.log(`  ✅ Created: ${quest.title} [${quest.subject}] (+${quest.xpReward} XP, +${quest.coinReward} coins)`);
  }

  console.log(`\n✨ Done! Created ${created} quests, skipped ${skipped} existing.`);
}

main()
  .catch((e) => {
    console.error('❌ Quest seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
