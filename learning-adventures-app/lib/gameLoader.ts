import { GameComponent, GameProps } from '@/components/games/shared/types';
import { ComponentType, lazy } from 'react';

// Registry of all available games
const gameRegistry = new Map<string, () => Promise<{ default: ComponentType<GameProps> }>>();

// Register a game component for dynamic loading
export function registerGame(
  gameId: string,
  loader: () => Promise<{ default: ComponentType<GameProps> }>
) {
  gameRegistry.set(gameId, loader);
}

// Load a game component dynamically
export function loadGameComponent(gameId: string) {
  const loader = gameRegistry.get(gameId);
  if (!loader) {
    throw new Error(`Game with ID "${gameId}" not found in registry`);
  }
  return lazy(loader);
}

// Get all registered game IDs
export function getRegisteredGames(): string[] {
  return Array.from(gameRegistry.keys());
}

// Check if a game is registered
export function isGameRegistered(gameId: string): boolean {
  return gameRegistry.has(gameId);
}

// Game metadata registry
const gameMetadata = new Map<string, Omit<GameComponent, 'component'>>();

// Register game metadata
export function registerGameMetadata(
  gameId: string,
  metadata: Omit<GameComponent, 'component'>
) {
  gameMetadata.set(gameId, metadata);
}

// Get game metadata
export function getGameMetadata(gameId: string): Omit<GameComponent, 'component'> | undefined {
  return gameMetadata.get(gameId);
}

// Get all game metadata
export function getAllGameMetadata(): Array<Omit<GameComponent, 'component'> & { id: string }> {
  return Array.from(gameMetadata.entries()).map(([id, metadata]) => ({
    id,
    ...metadata,
  }));
}

// Auto-register games from the games directory
// This function should be called during app initialization
export async function initializeGameRegistry() {
  // Register games directly to avoid webpack build issues with dynamic imports
  try {
    // Register sample-math-game
    if (!isGameRegistered('sample-math-game')) {
      createGameRegistration(
        'sample-math-game',
        {
          name: 'Math Challenge',
          description: 'Test your math skills with addition, subtraction, and multiplication!',
          category: 'math',
          difficulty: 'easy',
          estimatedTime: 10,
          skills: ['Addition', 'Subtraction', 'Multiplication', 'Mental Math'],
          gradeLevel: '2nd-5th Grade',
        },
        () => import('@/components/games/sample-math-game/SampleMathGame')
      );
    }

    // Register ecosystem-builder
    if (!isGameRegistered('ecosystem-builder')) {
      createGameRegistration(
        'ecosystem-builder',
        {
          name: 'Ecosystem Builder',
          description: 'Build a balanced ecosystem by adding producers, consumers, and decomposers. Learn how organisms interact in nature!',
          category: 'science',
          difficulty: 'medium',
          estimatedTime: 15,
          skills: [
            'Food Chains',
            'Ecosystem Balance',
            'Producers and Consumers',
            'Decomposers',
            'Energy Flow',
            'Scientific Observation'
          ],
          gradeLevel: '3rd-6th Grade',
        },
        () => import('@/components/games/ecosystem-builder/EcosystemBuilder')
      );
    }

    console.log('Game registry initialized with', getRegisteredGames().length, 'games');
  } catch (error) {
    console.warn('Could not initialize game registry:', error);
  }
}

// Helper function to create a game registration
export function createGameRegistration(
  gameId: string,
  metadata: Omit<GameComponent, 'component'>,
  loader: () => Promise<{ default: ComponentType<GameProps> }>
) {
  registerGame(gameId, loader);
  registerGameMetadata(gameId, metadata);
}