/**
 * Games built by the Tech Prep team, shown on /tech-prep.
 *
 * These are the deeper, more sophisticated games, separate from the arcade
 * list in `games.ts`.
 *
 * TO ADD A GAME: replace a placeholder (or append an entry), drop its
 * screenshot in `public/images/tech-prep/`, and set `screenshot` and `href`.
 * Delete `placeholder: true` once the game is playable. Entries without a
 * screenshot render a styled placeholder frame.
 */

import type { SubjectId } from './subjects';

export interface TechPrepGame {
  slug: string;
  title: string;
  subject: SubjectId;
  /** Short grade range shown on cards, e.g. "3–5" (K = kindergarten) */
  grades: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  skills: string[];
  estimatedTime: string;
  /** 16:9 screenshot in /public, e.g. '/images/tech-prep/circuit-quest.jpg' */
  screenshot?: string;
  /** Where the game lives: an internal path or an external URL */
  href?: string;
  featured?: boolean;
  /** Shows "Coming soon" and disables the link. Delete when the game ships. */
  placeholder?: boolean;
}

export const techPrepGames: TechPrepGame[] = [
  {
    slug: 'circuit-quest',
    title: 'Circuit Quest',
    subject: 'science',
    grades: '3–5',
    difficulty: 'medium',
    description:
      'Build working circuits to power a city. Place batteries, wires and switches, then watch the lights come on.',
    skills: ['Circuits', 'Problem Solving', 'Cause and Effect'],
    estimatedTime: '45–60 min',
    featured: true,
    placeholder: true,
  },
  {
    slug: 'market-mayor',
    title: 'Market Mayor',
    subject: 'math',
    grades: '4–5',
    difficulty: 'hard',
    description:
      'Run a small-town economy. Set prices, manage supply and balance the budget across several seasons.',
    skills: ['Decimals', 'Budgeting', 'Strategy'],
    estimatedTime: '60+ min',
    featured: true,
    placeholder: true,
  },
  {
    slug: 'code-courier',
    title: 'Code Courier',
    subject: 'interdisciplinary',
    grades: '3–5',
    difficulty: 'medium',
    description:
      'Program a delivery robot with loops and conditionals to get through ever-trickier mazes.',
    skills: ['Coding', 'Logic', 'Sequencing'],
    estimatedTime: '45–60 min',
    placeholder: true,
  },
  {
    slug: 'ecosystem-architect',
    title: 'Ecosystem Architect',
    subject: 'science',
    grades: '4–5',
    difficulty: 'hard',
    description:
      'Design a balanced habitat. Add species and see how the food web responds over time.',
    skills: ['Food Webs', 'Systems Thinking', 'Prediction'],
    estimatedTime: '45–60 min',
    placeholder: true,
  },
  {
    slug: 'time-detectives',
    title: 'Time Detectives',
    subject: 'history',
    grades: '4–5',
    difficulty: 'medium',
    description:
      'Solve historical mysteries by studying primary sources and piecing together the timeline.',
    skills: ['Primary Sources', 'Timelines', 'Evidence'],
    estimatedTime: '45–60 min',
    placeholder: true,
  },
  {
    slug: 'fraction-forge',
    title: 'Fraction Forge',
    subject: 'math',
    grades: '3–4',
    difficulty: 'easy',
    description:
      'Craft legendary gear by combining fractions of materials in a long crafting adventure.',
    skills: ['Fractions', 'Equivalence', 'Crafting'],
    estimatedTime: '30–45 min',
    placeholder: true,
  },
];

export function getFeaturedTechPrepGames(): TechPrepGame[] {
  return techPrepGames.filter((game) => game.featured);
}
