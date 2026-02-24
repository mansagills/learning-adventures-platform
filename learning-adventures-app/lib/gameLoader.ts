import { GameComponent, GameProps } from '@/components/games/shared/types';
import { ComponentType, lazy } from 'react';

// Registry of all available games
const gameRegistry = new Map<
  string,
  () => Promise<{ default: ComponentType<GameProps> }>
>();

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
export function getGameMetadata(
  gameId: string
): Omit<GameComponent, 'component'> | undefined {
  return gameMetadata.get(gameId);
}

// Get all game metadata
export function getAllGameMetadata(): Array<
  Omit<GameComponent, 'component'> & { id: string }
> {
  return Array.from(gameMetadata.entries()).map(([id, metadata]) => ({
    id,
    ...metadata,
  }));
}

// Auto-register games from the games directory
// This function should be called during app initialization
export async function initializeGameRegistry() {
  // For Next.js, games are registered lazily when accessed
  // Games self-register when their modules are imported via dynamic import
  // This avoids circular dependencies during build time

  // NOTE: Games are now registered on-demand when accessed through
  // the game player. This approach works better with Next.js SSR/SSG
  // and avoids build-time circular dependency issues.

  // The imports below are commented out to prevent circular dependencies
  // Games will auto-register when first loaded via the game player

  // await import('@/components/games/sample-math-game');
  // await import('@/components/games/ecosystem-builder');

  console.log('Game registry ready. Games will register on-demand.');
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
