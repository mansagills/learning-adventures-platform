import { PixelBuffer } from './pixel';

/** A twinkling four-point star marking a spot to investigate (two frames). */
export function paintSparkle(frame: number): PixelBuffer {
  const b = new PixelBuffer(11, 11);
  const gold = '#ffd35e';
  const white = '#fffbe8';
  const r = frame === 0 ? 4 : 3;
  for (let i = -r; i <= r; i++) {
    b.set(5 + i, 5, Math.abs(i) < 2 ? white : gold);
    b.set(5, 5 + i, Math.abs(i) < 2 ? white : gold);
  }
  if (frame === 1) {
    b.set(3, 3, gold);
    b.set(7, 3, gold);
    b.set(3, 7, gold);
    b.set(7, 7, gold);
  }
  b.set(5, 5, white);
  return b.outline('#8a5a0e');
}
