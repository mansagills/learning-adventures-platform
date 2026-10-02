import { mix } from '../../kit/art/pixel';
import type { CharacterLook } from '../../kit/art/characters';
import type { GearGroup } from '../../kit/ui/customize';

/**
 * Ninja gear: the gi (top and trousers in one color, with a crossed collar),
 * a mask (none, a face mask, or a full hood) and a headband. These replace
 * the shared "Outfit color" and "Accessory" choices in this game.
 */

export const GI_COLORS = [
  { id: 'black', name: 'Shadow black', base: '#2e2e3c', shade: '#1f1f2a', trim: '#6b6b84' },
  { id: 'navy', name: 'Midnight blue', base: '#2c4478', shade: '#1f3158', trim: '#8fa8d8' },
  { id: 'crimson', name: 'Crimson', base: '#a8302c', shade: '#82231f', trim: '#e7a39d' },
  { id: 'forest', name: 'Forest green', base: '#2f6e41', shade: '#22532f', trim: '#9cd0a6' },
  { id: 'white', name: 'Snow white', base: '#e9e6dd', shade: '#c9c4b6', trim: '#8f97a8' },
  { id: 'purple', name: 'Royal purple', base: '#5f3a92', shade: '#462a6e', trim: '#c2a6e6' },
  { id: 'orange', name: 'Sunset orange', base: '#cf6a2a', shade: '#a6521e', trim: '#f6c49a' },
  { id: 'teal', name: 'River teal', base: '#23736d', shade: '#195752', trim: '#93d6cf' },
] as const;

export const MASKS = [
  { id: 'none', name: 'No mask' },
  { id: 'face', name: 'Face mask' },
  { id: 'hood', name: 'Ninja hood' },
] as const;

export const HEADBANDS = [
  { id: 'none', name: 'No headband' },
  { id: 'red', name: 'Red', base: '#d23b33' },
  { id: 'gold', name: 'Gold', base: '#f0b83a' },
  { id: 'sky', name: 'Sky blue', base: '#4f9bdf' },
  { id: 'leaf', name: 'Leaf green', base: '#52a845' },
  { id: 'white', name: 'White', base: '#f4f1e8' },
  { id: 'pink', name: 'Blossom pink', base: '#e47aa6' },
  { id: 'black', name: 'Black', base: '#26262e' },
] as const;

export type Gear = { gi: string; mask: string; headband: string };

export const DEFAULT_GEAR: Gear = { gi: 'navy', mask: 'none', headband: 'red' };

export const GEAR_GROUPS: GearGroup[] = [
  { key: 'gi', legend: 'Gi color', options: GI_COLORS.map((g) => ({ id: g.id, name: g.name, color: g.base })) },
  { key: 'mask', legend: 'Ninja mask', options: MASKS.map((m) => ({ id: m.id, name: m.name })) },
  {
    key: 'headband',
    legend: 'Headband',
    options: HEADBANDS.map((b) => ({ id: b.id, name: b.name, color: 'base' in b ? b.base : undefined })),
    random: HEADBANDS.filter((b) => b.id !== 'none').map((b) => b.id),
  },
];

/** Keep only known gear ids (from an old or hand-edited save). */
export function cleanGear(raw: unknown): Gear {
  const r = (typeof raw === 'object' && raw ? raw : {}) as Record<string, unknown>;
  const pick = (v: unknown, list: readonly { id: string }[], d: string) => (list.some((x) => x.id === v) ? (v as string) : d);
  return {
    gi: pick(r.gi, GI_COLORS, DEFAULT_GEAR.gi),
    mask: pick(r.mask, MASKS, DEFAULT_GEAR.mask),
    headband: pick(r.headband, HEADBANDS, DEFAULT_GEAR.headband),
  };
}

/** Put the gear (and the earned belt) on a character look. */
export function dressNinja(look: CharacterLook, gear: Record<string, string>, belt: string): CharacterLook {
  const g = cleanGear(gear);
  const gi = GI_COLORS.find((x) => x.id === g.gi)!;
  const band = HEADBANDS.find((x) => x.id === g.headband)!;
  // A light belt on a light gi gets a darker edge so it still shows.
  const beltColor = gi.id === 'white' && (belt === '#f4f1e8' || belt === '#a8977c') ? mix(belt, '#2b1d1e', 0.25) : belt;
  return {
    ...look,
    shirt: { base: gi.base, shade: gi.shade },
    pants: gi.shade,
    shoes: '#2b2b33',
    // ninjas wear their headband instead of a hat or glasses
    accessory: 'none',
    extras: {
      ...(look.extras ?? {}),
      ...(look.extras?.skirt ? { skirt: { base: gi.base, shade: gi.shade } } : {}),
      belt: beltColor,
      gi: { trim: gi.trim },
      mask: g.mask === 'none' ? undefined : { style: g.mask as 'face' | 'hood', base: gi.id === 'black' ? '#3a3a4c' : gi.shade, shade: mix(gi.shade, '#2b1d1e', 0.35) },
      headband: 'base' in band ? { base: band.base, shade: mix(band.base, '#2b1d1e', 0.3) } : undefined,
    },
  };
}
