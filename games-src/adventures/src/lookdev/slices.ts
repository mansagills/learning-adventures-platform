import { PixelBuffer } from '../kit/art/pixel';
import type { Version } from './characters';
import { mixHex } from '../kit/worlds/shade';
import { paintConsole, paintStarFloor, paintAlienPlant } from '../kit/worlds/star-station/art';
import { paintAncientGround, paintPots, paintTorch } from '../kit/worlds/ancient-kingdoms/art';

/**
 * Small 2D slices of each new world (6 x 4 tiles) with one version of the
 * child standing in it, painted at that version's pixels per tile. They show
 * what each choice would look like on screen, side by side.
 */
export const SLICE_WORLDS = ['star', 'ancient'] as const;
type World = (typeof SLICE_WORLDS)[number];

const floors = new Map<string, PixelBuffer>();
function floor(world: World, T: number): PixelBuffer {
  const key = `${world}${T}`;
  if (!floors.has(key)) floors.set(key, world === 'star' ? paintStarFloor(T) : paintAncientGround(T));
  return floors.get(key)!;
}

const TINT: Record<World, [number, number, number]> = { star: [0.6, 0.64, 0.92], ancient: [0.92, 0.66, 0.66] };

export function paintSlice(world: World, v: Version, time: 'day' | 'evening'): PixelBuffer {
  const T = v.tile;
  const W = 6 * T;
  const H = 5 * T;
  const out = new PixelBuffer(W, H);
  // the ground: a crop of the real world floor
  const src = floor(world, T);
  const [fx, fy] = world === 'star' ? [9, 7] : [9, 8];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out.set(x, y, src.get(fx * T + x, fy * T + y));
  // one prop behind, one to the side, and the child in front
  const back = world === 'star' ? paintConsole(T, 1) : paintPots(T);
  out.blit(back, Math.round(0.3 * T), Math.round(2.0 * T) - back.h);
  const side = world === 'star' ? paintAlienPlant(T, 1) : paintTorch(T, 0);
  out.blit(side, W - side.w - Math.round(0.4 * T), Math.round(3.6 * T) - side.h);
  const kid = v.sprite('down', 0, false);
  // a soft shadow under the feet
  const sx = Math.round(W / 2 - kid.w / 2);
  const sy = Math.round(4.3 * T) - kid.h;
  for (let y = -2; y <= 2; y++)
    for (let x = -kid.w / 2.6; x <= kid.w / 2.6; x++) {
      const px = Math.round(W / 2 + x);
      const py = sy + kid.h - 1 + y;
      const c = out.get(px, py);
      if (c && (x / (kid.w / 2.6)) ** 2 + (y / 2.5) ** 2 <= 1) out.set(px, py, mixHex(c, '#1a1430', 0.3));
    }
  out.blit(kid, sx, sy);
  if (time === 'evening') {
    const [r, g, b] = TINT[world];
    for (let i = 0; i < out.px.length; i++) {
      const c = out.px[i];
      if (!c) continue;
      const n = parseInt(c.slice(1), 16);
      const f = (k: number, m: number) => Math.round(((n >> k) & 255) * m);
      out.px[i] = '#' + ((1 << 24) | (f(16, r) << 16) | (f(8, g) << 8) | f(0, b)).toString(16).slice(1);
    }
  }
  return out;
}
