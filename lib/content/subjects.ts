/**
 * The five subject areas on the public site.
 *
 * Theme values are full Tailwind class names (not built from pieces) so
 * Tailwind's scanner can find them. `lib/content` is listed in
 * `tailwind.config.js` `content` for the same reason.
 */

export type SubjectId =
  | 'math'
  | 'science'
  | 'english'
  | 'history'
  | 'interdisciplinary';

export interface SubjectTheme {
  /** Solid background for tiles, badges and headers */
  solid: string;
  /** Light tinted background for page sections and card art */
  soft: string;
  /** Text color that reads on the soft background */
  text: string;
  /** Border color for chips and outlines */
  border: string;
  /** Text color that meets contrast on the solid color */
  onSolid: string;
}

export interface Subject {
  id: SubjectId;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  theme: SubjectTheme;
}

export const subjects: Subject[] = [
  {
    id: 'math',
    name: 'Math',
    emoji: '🔢',
    tagline: 'Numbers, patterns and puzzles',
    description:
      'Race, build, sort and solve your way through counting, fractions, times tables, money, time and more.',
    theme: {
      solid: 'bg-pg-violet',
      soft: 'bg-brand-50',
      text: 'text-brand-700',
      border: 'border-pg-violet',
      onSolid: 'text-white',
    },
  },
  {
    id: 'science',
    name: 'Science',
    emoji: '🔬',
    tagline: 'Experiments, space and nature',
    description:
      'Dive into oceans, blast off to the planets, mix crystals and discover how the world works.',
    theme: {
      solid: 'bg-pg-mint',
      soft: 'bg-grass-50',
      text: 'text-grass-700',
      border: 'border-pg-mint',
      onSolid: 'text-ink-900',
    },
  },
  {
    id: 'english',
    name: 'English',
    emoji: '📚',
    tagline: 'Words, spelling and stories',
    description:
      'Build vocabulary, practice spelling and explore the power of stories.',
    theme: {
      solid: 'bg-pg-pink',
      soft: 'bg-coral-50',
      text: 'text-coral-700',
      border: 'border-pg-pink',
      onSolid: 'text-ink-900',
    },
  },
  {
    id: 'history',
    name: 'History',
    emoji: '🏛️',
    tagline: 'People, places and the past',
    description:
      'Travel back in time to ancient civilizations and the people who shaped our world.',
    theme: {
      solid: 'bg-pg-yellow',
      soft: 'bg-sunshine-50',
      text: 'text-sunshine-700',
      border: 'border-pg-yellow',
      onSolid: 'text-ink-900',
    },
  },
  {
    id: 'interdisciplinary',
    name: 'Mixed Skills',
    emoji: '🧩',
    tagline: 'Where subjects team up',
    description:
      'Adventures that mix math, science, reading and history into one big challenge.',
    theme: {
      solid: 'bg-ocean-600',
      soft: 'bg-ocean-50',
      text: 'text-ocean-700',
      border: 'border-ocean-600',
      onSolid: 'text-white',
    },
  },
];

export function getSubject(id: string): Subject | undefined {
  return subjects.find((subject) => subject.id === id);
}
