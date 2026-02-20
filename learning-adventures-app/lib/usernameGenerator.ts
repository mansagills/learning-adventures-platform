import { prisma } from '@/lib/prisma';

const ADJECTIVES = [
  'Brave',
  'Happy',
  'Clever',
  'Swift',
  'Mighty',
  'Gentle',
  'Bright',
  'Bold',
  'Calm',
  'Eager',
  'Fierce',
  'Kind',
  'Lively',
  'Noble',
  'Quick',
  'Smart',
  'Wise',
  'Daring',
  'Joyful',
  'Proud',
  'Shiny',
  'Strong',
  'Wild',
  'Zesty',
];

const ANIMALS = [
  'Eagle',
  'Dolphin',
  'Fox',
  'Tiger',
  'Lion',
  'Bear',
  'Wolf',
  'Hawk',
  'Panda',
  'Owl',
  'Dragon',
  'Phoenix',
  'Turtle',
  'Penguin',
  'Koala',
  'Cheetah',
  'Raccoon',
  'Otter',
  'Falcon',
  'Jaguar',
  'Lynx',
  'Moose',
  'Raven',
  'Shark',
];

/**
 * Generates a unique anonymous username in format: AdjectiveAnimal##
 * Example: "BraveEagle42", "HappyDolphin17"
 *
 * Total combinations: 24 adjectives × 24 animals × 100 numbers = 57,600
 */
export async function generateUniqueUsername(
  maxAttempts = 10
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const number = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, '0');

    const username = `${adjective}${animal}${number}`;

    // Check if username already exists in database
    const existing = await prisma.childProfile.findUnique({
      where: { username },
    });

    if (!existing) {
      return username;
    }
  }

  throw new Error('Failed to generate unique username after multiple attempts');
}

/**
 * Validates username format
 * Format: starts with capital letter, followed by letters, ends with 2 digits
 * Example: "BraveEagle42" - valid, "brave-eagle-42" - invalid
 */
export function isValidChildUsername(username: string): boolean {
  // Format: Capitalized word + Capitalized word + 2 digits
  const pattern = /^[A-Z][a-z]+[A-Z][a-z]+\d{2}$/;
  return pattern.test(username);
}

/**
 * Get available word lists for display/testing
 */
export function getWordLists() {
  return {
    adjectives: ADJECTIVES,
    animals: ANIMALS,
    totalCombinations: ADJECTIVES.length * ANIMALS.length * 100,
  };
}
