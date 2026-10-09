import { DEFAULT_APPEARANCE, lookFromAppearance, paintCharacter, type CharacterLook } from '../kit/art/characters';
import type { PixelBuffer } from '../kit/art/pixel';
import { SKIN_TONES } from '../kit/art/palette';
import { paintPortrait, type Expression } from '../kit/art/portraits';
import { ANCIENT_HOST, FORUM_HOST, PLAYER16, STATION_HOST, paintHero, paintPortrait16, richen, type Look16, type Mood } from '../kit/worlds/hero16';

export type Level = 'a' | 'b' | 'c';

/** The player and the world's test host, painted at one level. */
export interface Cast {
  /** [standing, blinking] facing the camera. */
  player: HTMLCanvasElement[];
  host: HTMLCanvasElement[];
  portrait(e: Expression): string;
}

/** Today's kit looks for the hosts, used by level (a). */
const KIT_HOSTS: Record<'star' | 'ancient', CharacterLook> = {
  star: {
    build: 'adult',
    skin: { base: SKIN_TONES[2].base, shade: SKIN_TONES[2].shade },
    hair: { style: 'locs', base: '#3b2a24', shade: '#2a1d19', light: '#56403a' },
    shirt: { base: '#e9edf5', shade: '#c4cad8' },
    pants: '#e9edf5',
    shoes: '#5b6478',
    accessory: 'none',
    accent: '#ff8a3d',
    extras: { belt: '#4a5266' },
  },
  ancient: {
    build: 'adult',
    skin: { base: SKIN_TONES[0].base, shade: SKIN_TONES[0].shade },
    hair: { style: 'wrap', base: '#2f4f9e', shade: '#233c7a', light: '#4467b8' },
    shirt: { base: '#efe2c4', shade: '#d6c49f' },
    pants: '#efe2c4',
    shoes: '#8a5a3a',
    accessory: 'none',
    accent: '#f2b53a',
  },
};

const MOOD: Record<Expression, Mood> = { neutral: 'neutral', smile: 'smile', curious: 'curious', proud: 'smile', thinking: 'thinking' };

/** The test host for each setting (placeholders: each game has its own host). */
export const TEST_HOSTS: Record<string, { look: Look16; name: string; role: string; line: string }> = {
  'station-deck': {
    look: STATION_HOST,
    name: 'Engineer Kemi',
    role: 'Test host · Star Station crew',
    line: 'Welcome aboard Star Station! This is the observation deck. That ringed planet out the window is where our next mission goes.',
  },
  'alien-planet': {
    look: STATION_HOST,
    name: 'Engineer Kemi',
    role: 'Test host · Star Station crew',
    line: 'We made it to the moon outpost! Mind the steam vent, and say hello to the little fuzzy one. It loves the glowing crystals.',
  },
  'river-market': {
    look: ANCIENT_HOST,
    name: 'Storyteller Awa',
    role: 'Test host · Ancient Kingdoms',
    line: 'Welcome to the river market! Traders bring salt, gold and stories from all along the river. Shall we see what is for sale?',
  },
  'roman-forum': {
    look: FORUM_HOST,
    name: 'Merchant Felix',
    role: 'Test host · Ancient Kingdoms',
    line: 'Salve! Welcome to the Forum. Fresh bread, olives and figs here. Later we can walk the Via Sacra to the great arch.',
  },
};

export function castFor(settingId: string, level: Level): Cast {
  const host16: Look16 = TEST_HOSTS[settingId].look;
  const world = settingId === 'station-deck' || settingId === 'alien-planet' ? 'star' : 'ancient';
  if (level === 'a') {
    const kidLook = lookFromAppearance(DEFAULT_APPEARANCE);
    const still = (l: CharacterLook): HTMLCanvasElement[] => [richen(paintCharacter(l, 'down', 0)).toCanvas()];
    return {
      player: still(kidLook),
      host: still(KIT_HOSTS[world]),
      portrait: (e) => richen(paintPortrait(KIT_HOSTS[world], e)).toDataURL(),
    };
  }
  const u = level === 'b' ? 1.5 : 2;
  const frames = (l: Look16) => [paintHero(l, u, 'down'), paintHero(l, u, 'down', { blink: true })].map((b: PixelBuffer) => b.toCanvas());
  const cache = new Map<Mood, string>();
  return {
    player: frames(PLAYER16),
    host: frames(host16),
    portrait: (e) => {
      const m = MOOD[e];
      if (!cache.has(m)) cache.set(m, paintPortrait16(host16, m).toDataURL());
      return cache.get(m)!;
    },
  };
}
