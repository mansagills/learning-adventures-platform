export interface AvatarOption {
  id: string;       // Unique identifier (e.g., "tiger", "dragon")
  name: string;     // Display name (e.g., "Tiger", "Dragon")
  emoji: string;    // Emoji character (e.g., "🐯", "🐉")
  color: string;    // Tailwind background color class (e.g., "bg-orange-100")
}

/**
 * Available avatars for child profiles
 * Using emojis for MVP - can be replaced with custom SVG illustrations in v2
 */
export const AVATAR_OPTIONS: AvatarOption[] = [
  // Animals
  { id: 'tiger', name: 'Tiger', emoji: '🐯', color: 'bg-orange-100' },
  { id: 'dragon', name: 'Dragon', emoji: '🐉', color: 'bg-green-100' },
  { id: 'eagle', name: 'Eagle', emoji: '🦅', color: 'bg-blue-100' },
  { id: 'dolphin', name: 'Dolphin', emoji: '🐬', color: 'bg-cyan-100' },
  { id: 'lion', name: 'Lion', emoji: '🦁', color: 'bg-yellow-100' },
  { id: 'panda', name: 'Panda', emoji: '🐼', color: 'bg-gray-100' },
  { id: 'fox', name: 'Fox', emoji: '🦊', color: 'bg-orange-100' },
  { id: 'owl', name: 'Owl', emoji: '🦉', color: 'bg-purple-100' },
  { id: 'penguin', name: 'Penguin', emoji: '🐧', color: 'bg-blue-100' },
  { id: 'koala', name: 'Koala', emoji: '🐨', color: 'bg-gray-100' },

  // Fun Objects
  { id: 'rocket', name: 'Rocket', emoji: '🚀', color: 'bg-red-100' },
  { id: 'star', name: 'Star', emoji: '⭐', color: 'bg-yellow-100' },
  { id: 'rainbow', name: 'Rainbow', emoji: '🌈', color: 'bg-pink-100' },
  { id: 'wizard', name: 'Wizard', emoji: '🧙', color: 'bg-purple-100' },
  { id: 'robot', name: 'Robot', emoji: '🤖', color: 'bg-gray-100' },
  { id: 'unicorn', name: 'Unicorn', emoji: '🦄', color: 'bg-pink-100' },
];

/**
 * Get avatar by ID
 * Returns undefined if not found
 */
export function getAvatarById(id: string): AvatarOption | undefined {
  return AVATAR_OPTIONS.find(avatar => avatar.id === id);
}

/**
 * Get random avatar
 * Useful for generating default avatars
 */
export function getRandomAvatar(): AvatarOption {
  return AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
}

/**
 * Validate avatar ID
 * Returns true if the ID exists in available avatars
 */
export function isValidAvatarId(id: string): boolean {
  return AVATAR_OPTIONS.some(avatar => avatar.id === id);
}
