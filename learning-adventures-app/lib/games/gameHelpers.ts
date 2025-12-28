/**
 * Game Helper Functions
 *
 * Functions for filtering, searching, and retrieving games from catalogData
 */

import { getAllAdventures } from '../catalogData';
import type { Adventure } from '../catalogData';

/**
 * Get all games (filter for type === 'game')
 */
export function getGames(): Adventure[] {
  return getAllAdventures().filter((adv) => adv.type === 'game');
}

/**
 * Get games for a specific subject
 */
export function getGamesBySubject(subject: string): Adventure[] {
  return getGames().filter((game) => game.category === subject);
}

/**
 * Get featured games only
 */
export function getFeaturedGames(): Adventure[] {
  return getGames().filter((game) => game.featured === true);
}

/**
 * Search games by title, description, or skills
 */
export function searchGames(games: Adventure[], query: string): Adventure[] {
  if (!query || query.trim() === '') {
    return games;
  }

  const q = query.toLowerCase().trim();
  return games.filter(
    (game) =>
      game.title.toLowerCase().includes(q) ||
      game.description.toLowerCase().includes(q) ||
      game.skills.some((skill) => skill.toLowerCase().includes(q))
  );
}

/**
 * Filter games by subject and difficulty
 */
export function filterGames(
  games: Adventure[],
  subject: string,
  difficulty: string
): Adventure[] {
  return games.filter((game) => {
    // Subject filter
    if (subject !== 'all' && game.category !== subject) {
      return false;
    }

    // Difficulty filter
    if (difficulty !== 'all' && game.difficulty !== difficulty) {
      return false;
    }

    return true;
  });
}

/**
 * Get unique subjects from games
 */
export function getUniqueSubjects(games: Adventure[]): string[] {
  const subjects = games.map((game) => game.category);
  return Array.from(new Set(subjects)).sort();
}

/**
 * Get game URL for opening (handles both HTML and component games)
 */
export function getGameUrl(game: Adventure): string {
  // HTML games have htmlPath
  if (game.htmlPath) {
    return game.htmlPath; // e.g., '/games/math-race-rally.html'
  }

  // Component games use dynamic routing
  if (game.componentGame) {
    return `/games/${game.id}`; // e.g., '/games/math-adventure'
  }

  // Fallback
  return '#';
}

/**
 * Check if game should open in new tab
 * (HTML games should open in new tab for better UX)
 */
export function shouldOpenInNewTab(game: Adventure): boolean {
  return !!game.htmlPath; // HTML games open in new tab
}

/**
 * Get subject display name with emoji
 */
export function getSubjectDisplay(subject: string): { name: string; emoji: string } {
  const subjectMap: Record<string, { name: string; emoji: string }> = {
    math: { name: 'Mathematics', emoji: '🔢' },
    science: { name: 'Science', emoji: '🔬' },
    english: { name: 'English', emoji: '📚' },
    history: { name: 'History', emoji: '🏛️' },
    interdisciplinary: { name: 'Interdisciplinary', emoji: '🌈' },
  };

  return subjectMap[subject] || { name: subject, emoji: '📖' };
}

/**
 * Get difficulty display with emoji
 */
export function getDifficultyDisplay(difficulty: string): { label: string; emoji: string } {
  const difficultyMap: Record<string, { label: string; emoji: string }> = {
    easy: { label: 'Easy', emoji: '🌱' },
    medium: { label: 'Medium', emoji: '☀️' },
    hard: { label: 'Hard', emoji: '🔥' },
  };

  return difficultyMap[difficulty] || { label: difficulty, emoji: '📊' };
}
