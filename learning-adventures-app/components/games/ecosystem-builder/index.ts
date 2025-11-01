import { createGameRegistration } from '@/lib/gameLoader';

// Register the Ecosystem Builder game
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
  () => import('./EcosystemBuilder')
);

export { default } from './EcosystemBuilder';
