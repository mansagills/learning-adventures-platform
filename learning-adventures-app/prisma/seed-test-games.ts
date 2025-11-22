/**
 * Seed script for test games and admin users
 * Run with: npx tsx prisma/seed-test-games.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TEST_GAMES = [
  {
    gameId: 'number-monster-feeding',
    title: 'Number Monster Feeding',
    description: 'Feed hungry monsters the correct numbers! Practice counting, addition, and subtraction with cute monster friends.',
    category: 'math',
    type: 'game',
    gradeLevel: ['K', '1', '2', '3'],
    difficulty: 'easy',
    skills: ['Counting', 'Addition', 'Subtraction', 'Number Recognition'],
    estimatedTime: '10-15 mins',
    filePath: '/games/number-monster-feeding.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  {
    gameId: 'treasure-hunt-calculator',
    title: 'Treasure Hunt Calculator',
    description: 'Solve math problems to find buried treasure! Navigate a pirate map and unlock treasure chests with your math skills.',
    category: 'math',
    type: 'game',
    gradeLevel: ['2', '3', '4', '5'],
    difficulty: 'medium',
    skills: ['Addition', 'Subtraction', 'Multiplication', 'Mixed Operations'],
    estimatedTime: '15-20 mins',
    filePath: '/games/treasure-hunt-calculator.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  {
    gameId: 'pizza-fraction-frenzy',
    title: 'Pizza Fraction Frenzy',
    description: 'Fast-paced fraction ordering game! Serve customers the correct pizza slice sizes before time runs out.',
    category: 'math',
    type: 'game',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Fractions', 'Visual Math', 'Comparison', 'Speed Math'],
    estimatedTime: '10-15 mins',
    filePath: '/games/pizza-fraction-frenzy.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  {
    gameId: 'multiplication-bingo-bonanza',
    title: 'Multiplication Bingo Bonanza',
    description: 'Interactive bingo with multiplication tables! Solve problems to mark squares and get BINGO!',
    category: 'math',
    type: 'game',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Multiplication', 'Multiplication Tables', 'Mental Math'],
    estimatedTime: '15-20 mins',
    filePath: '/games/multiplication-bingo-bonanza.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  {
    gameId: 'shape-sorting-arcade',
    title: 'Shape Sorting Arcade',
    description: 'Sort shapes based on their properties! Fast-paced geometry game with increasing difficulty.',
    category: 'math',
    type: 'game',
    gradeLevel: ['K', '1', '2', '3', '4'],
    difficulty: 'easy',
    skills: ['Geometry', 'Shapes', 'Properties', 'Pattern Recognition'],
    estimatedTime: '10-15 mins',
    filePath: '/games/shape-sorting-arcade.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  {
    gameId: 'math-jeopardy-junior',
    title: 'Math Jeopardy Junior',
    description: 'Game show format with math categories! Answer questions for points in this exciting quiz game.',
    category: 'math',
    type: 'game',
    gradeLevel: ['2', '3', '4', '5'],
    difficulty: 'medium',
    skills: ['Addition', 'Subtraction', 'Multiplication', 'Division', 'Mixed Operations'],
    estimatedTime: '15-20 mins',
    filePath: '/games/math-jeopardy-junior.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  {
    gameId: 'number-line-ninja',
    title: 'Number Line Ninja',
    description: 'Jump along the number line to solve problems! Collect coins and dodge obstacles.',
    category: 'math',
    type: 'game',
    gradeLevel: ['1', '2', '3', '4'],
    difficulty: 'easy',
    skills: ['Number Line', 'Addition', 'Subtraction', 'Number Sense'],
    estimatedTime: '10-15 mins',
    filePath: '/games/number-line-ninja.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  {
    gameId: 'equation-balance-scale',
    title: 'Equation Balance Scale',
    description: 'Interactive balance to solve equations! Visual representation of algebraic concepts.',
    category: 'math',
    type: 'game',
    gradeLevel: ['3', '4', '5', '6'],
    difficulty: 'medium',
    skills: ['Algebra', 'Equations', 'Balance', 'Problem Solving'],
    estimatedTime: '15-20 mins',
    filePath: '/games/equation-balance-scale.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  {
    gameId: 'math-memory-match',
    title: 'Math Memory Match',
    description: 'Match math problems with their answers! Time-based challenges and different categories.',
    category: 'math',
    type: 'game',
    gradeLevel: ['1', '2', '3', '4'],
    difficulty: 'easy',
    skills: ['Addition', 'Subtraction', 'Multiplication', 'Memory', 'Speed Math'],
    estimatedTime: '10-15 mins',
    filePath: '/games/math-memory-match.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  {
    gameId: 'counting-carnival',
    title: 'Counting Carnival',
    description: 'Carnival-themed counting games! Ring toss, duck pond, and ball throwing - each practicing different skills.',
    category: 'math',
    type: 'game',
    gradeLevel: ['K', '1', '2'],
    difficulty: 'easy',
    skills: ['Counting', 'Number Recognition', 'One-to-One Correspondence'],
    estimatedTime: '10-15 mins',
    filePath: '/games/counting-carnival.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  {
    gameId: 'geometry-builder-challenge',
    title: 'Geometry Builder Challenge',
    description: 'Build structures using geometric shapes! Constraints require specific calculations.',
    category: 'math',
    type: 'game',
    gradeLevel: ['2', '3', '4', '5'],
    difficulty: 'medium',
    skills: ['Geometry', 'Shapes', 'Spatial Reasoning', 'Counting'],
    estimatedTime: '15-20 mins',
    filePath: '/games/geometry-builder-challenge.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  {
    gameId: 'money-market-madness',
    title: 'Money Market Madness',
    description: 'Buy and sell items with virtual money! Calculate totals and make change in different scenarios.',
    category: 'math',
    type: 'game',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'medium',
    skills: ['Money', 'Addition', 'Subtraction', 'Real-world Math'],
    estimatedTime: '15-20 mins',
    filePath: '/games/money-market-madness.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  {
    gameId: 'time-attack-clock',
    title: 'Time Attack Clock',
    description: 'Race against the clock to solve time problems! Set analog clocks to match digital times.',
    category: 'math',
    type: 'game',
    gradeLevel: ['1', '2', '3'],
    difficulty: 'easy',
    skills: ['Time', 'Analog Clock', 'Digital Clock', 'Reading Time'],
    estimatedTime: '10-15 mins',
    filePath: '/games/time-attack-clock.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  // Previously created games
  {
    gameId: 'math-race-rally',
    title: 'Math Race Rally',
    description: 'Race car moves forward by solving problems. Multiple difficulty levels with addition, subtraction, and multiplication.',
    category: 'math',
    type: 'game',
    gradeLevel: ['2', '3', '4', '5'],
    difficulty: 'medium',
    skills: ['Addition', 'Subtraction', 'Multiplication', 'Speed Math'],
    estimatedTime: '10-15 mins',
    filePath: '/games/math-race-rally.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  {
    gameId: 'multiplication-space-quest',
    title: 'Multiplication Space Quest',
    description: 'Space-themed multiplication game for grades 3-4. Single HTML file, WCAG 2.1 AA compliant.',
    category: 'math',
    type: 'game',
    gradeLevel: ['3', '4'],
    difficulty: 'medium',
    skills: ['Multiplication', 'Multiplication Tables', 'Space Theme'],
    estimatedTime: '15-20 mins',
    filePath: '/games/multiplication-space-quest.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  {
    gameId: 'solar-system-explorer',
    title: 'Solar System Explorer',
    description: 'Science game about planets and their properties. 8 planets to explore, quiz format, streak system. WCAG 2.1 AA compliant.',
    category: 'science',
    type: 'game',
    gradeLevel: ['3', '4', '5', '6'],
    difficulty: 'medium',
    skills: ['Astronomy', 'Planets', 'Solar System', 'Science Facts'],
    estimatedTime: '15-20 mins',
    filePath: '/games/solar-system-explorer.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  {
    gameId: 'math-adventure-island',
    title: 'Math Adventure Island',
    description: 'Pirate-themed addition/subtraction game. 3 difficulty levels, treasure hunt format, streak bonuses. WCAG 2.1 AA compliant.',
    category: 'math',
    type: 'game',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'easy',
    skills: ['Addition', 'Subtraction', 'Pirate Theme', 'Adventure'],
    estimatedTime: '15-20 mins',
    filePath: '/games/math-adventure-island.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  {
    gameId: 'ocean-conservation-heroes',
    title: 'Ocean Conservation Heroes',
    description: 'Science/environmental game about ocean conservation. Learn about marine ecosystems and environmental protection.',
    category: 'science',
    type: 'game',
    gradeLevel: ['3', '4', '5', '6'],
    difficulty: 'medium',
    skills: ['Environmental Science', 'Ocean Ecosystems', 'Conservation', 'Marine Biology'],
    estimatedTime: '15-20 mins',
    filePath: '/games/ocean-conservation-heroes.html',
    isHtmlGame: true,
    isReactComponent: false
  },
  // React Component Games
  {
    gameId: 'ecosystem-builder',
    title: 'Ecosystem Builder',
    description: 'Science game about food chains and ecosystem balance. Uses useGameState hook, real-time simulation.',
    category: 'science',
    type: 'game',
    gradeLevel: ['3', '4', '5', '6'],
    difficulty: 'medium',
    skills: ['Food Chains', 'Ecosystem Balance', 'Predator-Prey', 'Environmental Science'],
    estimatedTime: '15-20 mins',
    filePath: '/games/ecosystem-builder',
    isHtmlGame: false,
    isReactComponent: true
  }
];

async function main() {
  console.log('🌱 Starting seed for test games and admin users...\n');

  // Create admin users (3 team members)
  console.log('👥 Creating admin users...');

  const adminEmails = [
    { email: 'admin1@learningadventures.org', name: 'Admin One' },
    { email: 'admin2@learningadventures.org', name: 'Admin Two' },
    { email: 'admin3@learningadventures.org', name: 'Admin Three' }
  ];

  const hashedPassword = await bcrypt.hash('admin123', 10); // Change this password!

  for (const admin of adminEmails) {
    const existingUser = await prisma.user.findUnique({
      where: { email: admin.email }
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: admin.email,
          name: admin.name,
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: new Date()
        }
      });
      console.log(`  ✅ Created admin: ${admin.email}`);
    } else {
      console.log(`  ⏭️  Admin already exists: ${admin.email}`);
    }
  }

  console.log('\n🎮 Seeding test games...');

  for (const gameData of TEST_GAMES) {
    const existing = await prisma.testGame.findUnique({
      where: { gameId: gameData.gameId }
    });

    if (!existing) {
      await prisma.testGame.create({
        data: {
          ...gameData,
          status: 'NOT_TESTED'
        }
      });
      console.log(`  ✅ Added: ${gameData.title}`);
    } else {
      console.log(`  ⏭️  Already exists: ${gameData.title}`);
    }
  }

  console.log('\n✨ Seed completed!');
  console.log('\n📊 Summary:');
  console.log(`   - Admin users: ${adminEmails.length}`);
  console.log(`   - Test games: ${TEST_GAMES.length}`);
  console.log(`   - HTML games: ${TEST_GAMES.filter(g => g.isHtmlGame).length}`);
  console.log(`   - React component games: ${TEST_GAMES.filter(g => g.isReactComponent).length}`);
  console.log('\n🔐 Admin Login Credentials:');
  console.log('   Email: admin1@learningadventures.org (or admin2/admin3)');
  console.log('   Password: admin123 (CHANGE THIS IN PRODUCTION!)');
  console.log('\n🎮 Access test games at:');
  console.log('   - Local: http://localhost:3000/internal/testing');
  console.log('   - Production: https://app.learningadventures.org/internal/testing');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
