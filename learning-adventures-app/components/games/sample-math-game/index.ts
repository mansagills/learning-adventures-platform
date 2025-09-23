import { createGameRegistration } from '@/lib/gameLoader';

// Register this game component
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
  () => import('./SampleMathGame')
);

export { default } from './SampleMathGame';