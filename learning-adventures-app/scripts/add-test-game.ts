#!/usr/bin/env tsx
/**
 * Utility script to add a game to the test games database
 *
 * Usage:
 *   npm run add-test-game -- --file=game-name.html
 *   npm run add-test-game -- --component=ecosystem-builder
 *   npm run add-test-game -- --interactive (interactive mode)
 *
 * This adds games to the testing system WITHOUT adding them to the catalog.
 * Once approved via /internal/testing, they can be promoted to the catalog.
 */

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline/promises';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface GameMetadata {
  gameId: string;
  title: string;
  description: string;
  category: 'math' | 'science' | 'english' | 'history' | 'interdisciplinary';
  type: 'game' | 'lesson';
  gradeLevel: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  skills: string[];
  estimatedTime: string;
  filePath: string;
  isHtmlGame: boolean;
  isReactComponent: boolean;
}

// Helper to create readline interface
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Parse command line arguments
function parseArgs(): { mode: 'file' | 'component' | 'interactive'; value?: string } {
  const args = process.argv.slice(2);

  for (const arg of args) {
    if (arg.startsWith('--file=')) {
      return { mode: 'file', value: arg.split('=')[1] };
    }
    if (arg.startsWith('--component=')) {
      return { mode: 'component', value: arg.split('=')[1] };
    }
    if (arg === '--interactive' || arg === '-i') {
      return { mode: 'interactive' };
    }
  }

  return { mode: 'interactive' };
}

// Interactive mode - ask user for all metadata
async function interactiveMode(): Promise<GameMetadata> {
  const rl = createInterface();

  console.log('\n🎮 Add New Test Game - Interactive Mode\n');

  const isReactComponent = (await rl.question('Is this a React component game? (y/n): ')).toLowerCase() === 'y';

  let filePath: string;
  let gameId: string;

  if (isReactComponent) {
    gameId = await rl.question('Component name (e.g., "ecosystem-builder"): ');
    filePath = `/games/${gameId}`;
  } else {
    const fileName = await rl.question('HTML file name (e.g., "math-race.html"): ');
    gameId = fileName.replace('.html', '');
    filePath = `/games/${fileName}`;
  }

  const title = await rl.question('Game title: ');
  const description = await rl.question('Description: ');

  console.log('\nCategories: math, science, english, history, interdisciplinary');
  const category = await rl.question('Category: ') as any;

  console.log('\nTypes: game, lesson');
  const type = await rl.question('Type: ') as any;

  const gradeLevelInput = await rl.question('Grade levels (comma-separated, e.g., "K,1,2,3"): ');
  const gradeLevel = gradeLevelInput.split(',').map(g => g.trim());

  console.log('\nDifficulty: easy, medium, hard');
  const difficulty = await rl.question('Difficulty: ') as any;

  const skillsInput = await rl.question('Skills (comma-separated): ');
  const skills = skillsInput.split(',').map(s => s.trim());

  const estimatedTime = await rl.question('Estimated time (e.g., "10-15 mins"): ');

  rl.close();

  return {
    gameId,
    title,
    description,
    category,
    type,
    gradeLevel,
    difficulty,
    skills,
    estimatedTime,
    filePath,
    isHtmlGame: !isReactComponent,
    isReactComponent
  };
}

// Quick mode for HTML files - derive metadata from file name
async function quickFileMode(fileName: string): Promise<GameMetadata> {
  const rl = createInterface();

  console.log(`\n🎮 Adding HTML game: ${fileName}\n`);

  const gameId = fileName.replace('.html', '');
  const filePath = `/games/${fileName}`;

  // Check if file exists
  const fullPath = path.join(process.cwd(), 'public', 'games', fileName);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Error: File not found at ${fullPath}`);
    process.exit(1);
  }

  const title = await rl.question('Game title: ');
  const description = await rl.question('Description: ');

  console.log('\nCategories: math, science, english, history, interdisciplinary');
  const category = await rl.question('Category: ') as any;

  const gradeLevelInput = await rl.question('Grade levels (comma-separated, e.g., "3,4,5"): ');
  const gradeLevel = gradeLevelInput.split(',').map(g => g.trim());

  console.log('\nDifficulty: easy, medium, hard');
  const difficulty = await rl.question('Difficulty: ') as any;

  const skillsInput = await rl.question('Skills (comma-separated): ');
  const skills = skillsInput.split(',').map(s => s.trim());

  const estimatedTime = await rl.question('Estimated time (e.g., "10-15 mins"): ');

  rl.close();

  return {
    gameId,
    title,
    description,
    category,
    type: 'game',
    gradeLevel,
    difficulty,
    skills,
    estimatedTime,
    filePath,
    isHtmlGame: true,
    isReactComponent: false
  };
}

// Quick mode for React components
async function quickComponentMode(componentName: string): Promise<GameMetadata> {
  const rl = createInterface();

  console.log(`\n🎮 Adding React component game: ${componentName}\n`);

  const gameId = componentName;
  const filePath = `/games/${componentName}`;

  const title = await rl.question('Game title: ');
  const description = await rl.question('Description: ');

  console.log('\nCategories: math, science, english, history, interdisciplinary');
  const category = await rl.question('Category: ') as any;

  const gradeLevelInput = await rl.question('Grade levels (comma-separated, e.g., "3,4,5,6"): ');
  const gradeLevel = gradeLevelInput.split(',').map(g => g.trim());

  console.log('\nDifficulty: easy, medium, hard');
  const difficulty = await rl.question('Difficulty: ') as any;

  const skillsInput = await rl.question('Skills (comma-separated): ');
  const skills = skillsInput.split(',').map(s => s.trim());

  const estimatedTime = await rl.question('Estimated time (e.g., "15-20 mins"): ');

  rl.close();

  return {
    gameId,
    title,
    description,
    category,
    type: 'game',
    gradeLevel,
    difficulty,
    skills,
    estimatedTime,
    filePath,
    isHtmlGame: false,
    isReactComponent: true
  };
}

// Add game to database
async function addGameToDatabase(metadata: GameMetadata) {
  console.log('\n📝 Adding game to test games database...\n');

  // Check if already exists
  const existing = await prisma.testGame.findUnique({
    where: { gameId: metadata.gameId }
  });

  if (existing) {
    console.error(`❌ Error: Game with ID "${metadata.gameId}" already exists in the database.`);
    console.log('\n💡 Tip: Use a different game ID or remove the existing entry first.');
    process.exit(1);
  }

  // Create test game
  const testGame = await prisma.testGame.create({
    data: {
      ...metadata,
      status: 'NOT_TESTED'
    }
  });

  console.log('✅ Game added successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - ID: ${testGame.gameId}`);
  console.log(`   - Title: ${testGame.title}`);
  console.log(`   - Category: ${testGame.category}`);
  console.log(`   - Type: ${testGame.isReactComponent ? 'React Component' : 'HTML'}`);
  console.log(`   - File Path: ${testGame.filePath}`);
  console.log(`   - Status: ${testGame.status}`);

  console.log('\n🔗 Next Steps:');
  console.log('   1. Start your dev server: npm run dev');
  console.log(`   2. Test the game at: http://localhost:3000${testGame.filePath}`);
  console.log('   3. Review and approve at: http://localhost:3000/internal/testing');
  console.log('   4. Once approved, promote to catalog from the testing page');

  return testGame;
}

async function main() {
  try {
    const { mode, value } = parseArgs();

    let metadata: GameMetadata;

    switch (mode) {
      case 'file':
        if (!value) {
          console.error('❌ Error: Please provide a file name with --file=game-name.html');
          process.exit(1);
        }
        metadata = await quickFileMode(value);
        break;

      case 'component':
        if (!value) {
          console.error('❌ Error: Please provide a component name with --component=component-name');
          process.exit(1);
        }
        metadata = await quickComponentMode(value);
        break;

      case 'interactive':
      default:
        metadata = await interactiveMode();
        break;
    }

    await addGameToDatabase(metadata);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
