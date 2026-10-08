import { DEFAULT_APPEARANCE, lookFromAppearance, paintCharacter, type CharacterLook } from '../kit/art/characters';
import type { PixelBuffer } from '../kit/art/pixel';
import { SKIN_TONES } from '../kit/art/palette';
import { paintPortrait, type Expression } from '../kit/art/portraits';
import { ANCIENT_HOST, PLAYER16, STATION_HOST, paintHero, paintPortrait16, richen, type Look16, type Mood } from './hero';

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

export function castFor(world: 'star' | 'ancient', level: Level): Cast {
  const host16: Look16 = world === 'star' ? STATION_HOST : ANCIENT_HOST;
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
