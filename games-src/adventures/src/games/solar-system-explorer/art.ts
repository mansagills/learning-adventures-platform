import { PixelBuffer } from '../../kit/art/pixel';
import { Paint, hash, mixHex, ramp } from '../../kit/worlds/shade';
import { STAR } from '../../kit/worlds/star-station/art';
import { PLANET_ORDER, paintPlanet, type PlanetId } from '../../kit/worlds/star-station/space-art';
import type { Station } from './problems';

/**
 * Solar System Explorer's own pictures (the shared ones, like the planets,
 * the orrery and the globe, are in the world kit's space-art.ts): the
 * flagpole scene for shadows, the hint pictures, and the HUD icons.
 */

const GRASS = ramp('#5aa84a');

/** Where the Sun is in the sky scene (we face south, so east is on the left and west on the right). */
const SUN_AT: Record<'morning' | 'noon' | 'evening', [number, number]> = { morning: [0.12, 0.62], noon: [0.5, 0.14], evening: [0.88, 0.62] };

/**
 * A flagpole on the grass under the Sun (W x H art pixels). `shadow` draws
 * the pole's shadow; `rays` draws the sunlight skimming past the top of the
 * pole to where the shadow ends (the hint picture). Labels (East, West) are
 * put over it in HTML so they can be read aloud.
 */
export function paintSkyScene(W: number, H: number, sun: 'morning' | 'noon' | 'evening', shadow: boolean, rays = false): PixelBuffer {
  const p = new Paint(W, H);
  const ground = Math.round(H * 0.72);
  const evening = sun === 'evening';
  const morning = sun === 'morning';
  for (let y = 0; y < ground; y++)
    for (let x = 0; x < W; x++) {
      const t = y / ground;
      const base = morning ? mixHex('#78b6ec', '#ffd8a8', t * 0.7) : evening ? mixHex('#6a8ad8', '#ffb07a', t * 0.8) : mixHex('#4f9fe0', '#bfe3f5', t);
      p.pix(x, y, (x + y) % 2 && t > 0.5 ? mixHex(base, '#ffffff', 0.04) : base);
    }
  for (let y = ground; y < H; y++)
    for (let x = 0; x < W; x++) p.dot(x, y, GRASS, y === ground ? 3 : hash(x >> 1, y >> 1, 3) < 0.06 ? 1 : 2);
  // the pole
  const px = Math.round(W / 2);
  const top = Math.round(H * 0.3);
  const [sx, sy] = [SUN_AT[sun][0] * W, SUN_AT[sun][1] * H];
  // where the shadow ends: the line from the Sun past the top of the pole, down to the ground
  // (similar triangles: (px - sx) / (top - sy) = (tip - px) / (ground - top))
  const tipX = Math.max(2, Math.min(W - 3, px + ((px - sx) / Math.max(1, top - sy)) * (ground - top)));
  if (shadow) {
    const x0 = Math.min(px, tipX);
    const x1 = Math.max(px, tipX);
    for (let x = Math.floor(x0); x <= x1; x++) {
      p.pix(x, ground + 1, '#2f6a2a');
      p.pix(x, ground + 2, '#3a7a32');
    }
  }
  if (rays) {
    // two rays: one over the top of the pole to the shadow's tip, one hitting the pole lower down
    const ray = (x2: number, y2: number) => {
      const n = Math.ceil(Math.hypot(x2 - sx, y2 - sy));
      for (let i = 0; i < n; i += 2) p.pix(sx + ((x2 - sx) * i) / n, sy + ((y2 - sy) * i) / n, '#fff3a8');
    };
    ray(tipX, ground);
    ray(px, (top + ground) / 2);
    p.pix(tipX, ground, '#ff8fd0');
    p.pix(tipX, ground - 1, '#ff8fd0');
  }
  p.rect(px - 1, top, 2, ground - top + 1, ramp('#c9d1de'), { form: 'cylV', box: [px - 1, top, 2, ground - top] });
  p.rect(px + 1, top, 9, 6, STAR.magenta, { level: 3 });
  p.rect(px + 1, top + 2, 9, 1, STAR.amber, { level: 3 });
  p.ellipse(px, top - 1, 1.5, 1.5, STAR.amber, { form: 'flat', level: 4 });
  const out = p.toBuffer({ outline: false });
  const sunPic = paintPlanet('sun', Math.max(4, Math.round(H * 0.07)), 0);
  out.blit(sunPic, Math.round(sx - sunPic.w / 2), Math.round(sy - sunPic.h / 2));
  return out;
}

/** The Sun's path across the sky in one day: low in the east, highest at midday, low in the west (a hint picture). */
export function paintSunArc(W: number, H: number): PixelBuffer {
  const p = new Paint(W, H);
  const ground = Math.round(H * 0.78);
  for (let y = 0; y < ground; y++) for (let x = 0; x < W; x++) p.pix(x, y, mixHex('#4f9fe0', '#bfe3f5', y / ground));
  for (let y = ground; y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, GRASS, y === ground ? 3 : 2);
  for (let x = W * 0.1; x < W * 0.9; x += 3) {
    const t = (x - W * 0.1) / (W * 0.8);
    p.pix(x, ground - Math.sin(t * Math.PI) * H * 0.62 - 4, '#fff3a8');
  }
  const out = p.toBuffer({ outline: false });
  for (const [t] of [[0.04], [0.5], [0.96]]) {
    const x = W * 0.1 + W * 0.8 * t;
    const y = ground - Math.sin(t * Math.PI) * H * 0.62 - 4;
    const s = paintPlanet('sun', Math.max(3, Math.round(H * 0.06)), 0);
    out.blit(s, Math.round(x - s.w / 2), Math.round(y - s.h / 2));
  }
  return out;
}

/**
 * The planets in a row, in order from the Sun (a hint picture; not to scale).
 * The planet at `focus` is hidden behind a "?" ring; with `dimAfter`, the
 * planets after it are faded. Returns the x of each planet's middle (for the
 * HTML labels).
 */
export function paintPlanetRow(W: number, H: number, focus = 8, dimAfter = true): { buf: PixelBuffer; xs: number[] } {
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.pix(x, y, (x + y) % 2 ? '#121638' : '#161b44');
  for (let i = 0; i < W * H * 0.004; i++) p.pix(hash(i, 1, 5) * W, hash(i, 2, 5) * H, '#cfe8ff');
  const out = p.toBuffer({ outline: false });
  const sun = paintPlanet('sun', H * 0.42, 0);
  out.blit(sun, Math.round(-sun.w * 0.55), Math.round(H / 2 - sun.h / 2));
  const sizes: Record<PlanetId, number> = { mercury: 0.1, venus: 0.14, earth: 0.15, mars: 0.12, jupiter: 0.3, saturn: 0.25, uranus: 0.2, neptune: 0.2 };
  const xs: number[] = [];
  const x0 = H * 0.55;
  const step = (W - x0 - H * 0.2) / 7.4;
  PLANET_ORDER.forEach((id, i) => {
    const x = x0 + step * (i + (i >= 4 ? 0.4 : 0));
    xs.push(x);
    if (i === focus) {
      for (let a = 0; a < Math.PI * 2; a += 0.12) out.set(Math.round(x + Math.cos(a) * H * 0.16), Math.round(H / 2 + Math.sin(a) * H * 0.16), STAR.neonCyan);
      return;
    }
    const b = paintPlanet(id, Math.max(2, H * sizes[id]), 0);
    if (dimAfter && i > focus) for (let k = 0; k < b.px.length; k++) if (b.px[k]) b.px[k] = mixHex(b.px[k]!, '#20264f', 0.6);
    out.blit(b, Math.round(x - b.w / 2), Math.round(H / 2 - b.h / 2));
  });
  return { buf: out, xs };
}

/** The four telescope lenses for the HUD: lit ones glow in their station's color. */
export function paintLensIcon(lit: boolean[]): PixelBuffer {
  const p = new Paint(40, 12);
  const cols = [STAR.cyan, STAR.amber, STAR.magenta, STAR.lime];
  lit.forEach((on, i) => {
    p.ellipse(5 + i * 10, 6, 4.2, 4.2, on ? cols[i] : STAR.dark, { sep: true, bias: on ? 0.3 : -0.2 });
    p.ellipse(5 + i * 10, 6, 2, 2, on ? ramp('#ffffff') : STAR.wall, { form: 'flat', level: on ? 2 : 1 });
  });
  return p.toBuffer();
}

/** A small icon for each station (the job list). */
export function paintStationIcon(s: Station, open: boolean): PixelBuffer {
  const p = new Paint(24, 24);
  const dim = (c: string) => (open ? c : mixHex(c, '#3a3f58', 0.6));
  if (s === 'orrery') {
    p.ellipse(12, 13, 10, 4, ramp(dim('#d9a648')), { form: 'flat', level: 1 });
    p.ellipse(12, 13, 6, 2.4, ramp(dim('#1a2048')), { form: 'flat', level: 2 });
    p.ellipse(12, 12, 3, 3, ramp(dim('#ffc23a')), { form: 'flat', level: 4 });
    p.ellipse(20, 12, 1.6, 1.6, ramp(dim('#c8643a')), {});
    p.ellipse(5, 14, 2, 2, ramp(dim('#2f7fd0')), {});
  } else if (s === 'sunrise') {
    p.ellipse(10, 13, 8, 8, ramp(dim('#2f7fd0')), {});
    p.ellipse(10, 13, 8, 8, ramp(dim('#4aa65a')), { onlyOver: true, clip: (x, y) => (x + y * 0.4) % 6 < 2.5 });
    p.shape((x) => x < 10, [2, 5, 8, 16], ramp(dim('#1a2048')), { onlyOver: true, form: 'flat', level: 1 });
    p.ellipse(21, 8, 2.6, 2.6, ramp(dim('#ffd65a')), { form: 'flat', level: 4 });
  } else if (s === 'dome') {
    p.ellipse(12, 16, 10, 8, ramp(dim('#1a2048')), { clip: (_x, y) => y < 17 });
    for (let k = 0; k < 7; k++) p.pix(5 + hash(k, 1, 2) * 14, 10 + hash(k, 2, 2) * 6, dim('#fff1c4'));
    p.rect(2, 16, 20, 3, ramp(dim('#8c98bd')), {});
  } else {
    p.ellipse(12, 15, 6, 6, ramp(dim('#8a6ad6')), {});
    for (let a = 0; a < Math.PI * 2; a += 0.4) p.pix(12 + Math.cos(a) * 9, 15 + Math.sin(a) * 9, dim('#7ff0ff'));
    p.rect(11, 3, 5, 3, ramp(dim('#262c45')), {});
  }
  return p.toBuffer();
}

/** A postcard stamp mark: the planet with a little check. */
export function paintPlanetButton(id: PlanetId, visited: boolean): PixelBuffer {
  const p = new Paint(28, 28);
  const out0 = p.toBuffer({ outline: false });
  const b = paintPlanet(id, id === 'saturn' ? 6 : 9, 0);
  out0.blit(b, Math.round(14 - b.w / 2), Math.round(13 - b.h / 2));
  if (visited) {
    const c = new Paint(28, 28);
    c.ellipse(22, 22, 5, 5, STAR.lime, { sep: true });
    c.line(19.5, 22, 21.5, 24, ramp('#1d3a20'), 1);
    c.line(21.5, 24, 24.5, 19.5, ramp('#1d3a20'), 1);
    out0.blit(c.toBuffer(), 0, 0);
  }
  return out0;
}

export { PixelBuffer };
