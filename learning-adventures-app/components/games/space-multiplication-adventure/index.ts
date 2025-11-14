/**
 * Registration file for Space Multiplication Adventure
 */

import { createGameRegistration } from '@/lib/gameLoader';

// Register this game component
createGameRegistration(
  'space-multiplication-adventure',
  {
    name: 'Space Multiplication Adventure',
    description: 'Help a space explorer collect stars by solving multiplication problems. Each correct answer moves the spaceship forward through different planets.',
    category: 'math',
    gradeLevel: '3-5',
    difficulty: 'medium',
    skills: ['multiplication facts 1-10', 'mental math', 'speed calculation', 'problem solving'],
    estimatedTime: 15,
  },
  () => import('./SpaceMultiplicationAdventure')
);

export { default } from './SpaceMultiplicationAdventure';
