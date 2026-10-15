import { PixelBuffer } from '../../art/pixel';
import { pixelTexture } from '../../world/sceneKit';
import { swapFrame } from '../figure';
import { placer } from '../place';
import { Paint, hash, mixHex } from '../shade';
import { billboard, glow, groundPiece, lightPool } from '../stage';
import type { SceneCtx, Setting, SettingScene } from '../types';
import { STAR, paintAlienPlant, paintBollard, paintConsole, paintStarFloor, type StarLayout } from './art';
import { paintBigTelescope, paintGlobeLab, paintLaunchCannon, paintOrrery, paintPlanet, paintStarProjector } from './space-art';

/**
 * Star Station setting: the observatory (Solar System Explorer). The same
 * deck plates and neon as the station, under a dome with ribs and a huge
 * arched window looking out at the stars, the Milky Way and Earth below.
 * The big telescope stands on the round platform in the middle; the four
 * hands-on space models stand round it (the orrery, the globe lab, the star
 * projector by the Star Dome door and the launch cannon by the Launch Bay
 * hatch). Kept out of the shared settings list, like the inside-the-body
 * areas, so the other games' builds stay the same.
 */

const U = (T: number) => T / 16;
export const OBS_LAYOUT: StarLayout = { w: 26, h: 16, floorTop: 4, walkways: [[10, 10]], ring: { x: 13, y: 7.3, r: 2 } };
const L = OBS_LAYOUT;
const OBS_WALL = 5;
/** The arched window, in tiles across the wall. */
const WIN = { x0: 6.5, x1: 19.5, top: 0.55, bottom: 3.9 };

/** Where the people and the space models stand (tiles). */
export const OBS_SPOTS = {
  player: { x: 13, y: 12.2 },
  host: { x: 15.4, y: 8.8 },
  telescope: { x: 13, y: 8 },
  orrery: { x: 5.8, y: 13.6 },
  orreryHelper: { x: 9.2, y: 12.8 },
  globe: { x: 20.4, y: 13.4 },
  globeHelper: { x: 17, y: 12.8 },
  projector: { x: 4.2, y: 7.2 },
  projectorHelper: { x: 6.6, y: 7.8 },
  cannon: { x: 22.2, y: 7.6 },
  cannonHelper: { x: 19.4, y: 8.2 },
} as const;

/** The dome wall: curved ribs, the big arched window (left open for the sky behind), the Star Dome door and the Launch Bay hatch. */
export function paintObservatoryWall(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const W = L.w * T;
  const H = OBS_WALL * T;
  const p = new Paint(W, H);
  const s = STAR;
  const wx0 = WIN.x0 * T;
  const wx1 = WIN.x1 * T;
  const wcx = (wx0 + wx1) / 2;
  const half = (wx1 - wx0) / 2;
  const archTop = (x: number) => WIN.top * T + (1 - Math.sqrt(Math.max(0, 1 - ((x - wcx) / half) ** 2))) * 1.6 * T;
  const inWin = (x: number, y: number) => x >= wx0 && x < wx1 && y < WIN.bottom * T && y >= archTop(x);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (inWin(x, y)) continue;
      // the dome's ribs lean in toward the top, like the inside of a real observatory dome
      const lean = ((x - W / 2) / (W / 2)) * (1 - y / H) * 0.8 * T;
      const rib = (x - lean) % (T * 2);
      let lv = 2;
      if (rib < 2 * u) lv = 3;
      else if (rib > T * 2 - 2 * u) lv = 1;
      if (y < 0.4 * T) lv = Math.max(0, lv - 1);
      if (y > H - 0.55 * T) lv = Math.max(0, lv - 1);
      p.dot(x, y, s.wall, lv);
    }
  // the window frame: a thick steel arch with three mullions
  const fw = Math.round(3 * u);
  for (let x = Math.floor(wx0 - fw); x < wx1 + fw; x++) {
    const top = x < wx0 || x >= wx1 ? WIN.top * T + 1.6 * T : archTop(x);
    for (let k = 1; k <= fw; k++) p.dot(x, top - k, s.trim, k === fw ? 1 : 3);
  }
  for (const x of [wx0 - fw, wx1]) p.rect(x, archTop(x < wcx ? wx0 : wx1 - 1), fw, WIN.bottom * T - archTop(x < wcx ? wx0 : wx1 - 1), s.trim, { form: 'cylV', box: [x, 0, fw, H] });
  for (let k = 1; k < 4; k++) {
    const mx = Math.round(wx0 + ((wx1 - wx0) * k) / 4 - fw / 2);
    p.rect(mx, archTop(mx), fw, WIN.bottom * T - archTop(mx), s.trim, { form: 'cylV', box: [mx, 0, fw, H] });
  }
  p.rect(wx0 - fw, WIN.bottom * T, wx1 - wx0 + fw * 2, fw, s.trim, { form: 'cylV', box: [wx0 - fw, WIN.bottom * T, wx1 - wx0 + fw * 2, fw] });
  for (let x = wx0 - fw; x < wx1 + fw; x++) for (let k = 0; k < Math.max(1, Math.round(u)); k++) p.pix(x, WIN.bottom * T + fw + k, STAR.neonCyan);
  // the floor kick plate
  const ky = H - Math.round(0.45 * T);
  for (let y = ky; y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, Math.floor((x + y) / Math.max(3, Math.round(4 * u))) % 2 ? s.hazard : s.dark, y === ky ? 3 : 1);

  // the Star Dome door on the left: a dark arch full of stars
  const dX = 3.2 * T;
  const dW = 2.2 * T;
  const dTop = 1.4 * T;
  p.rect(dX - dW / 2 - fw, dTop - fw, dW + fw * 2, H - dTop, s.trim, { form: 'cylV', box: [dX - dW / 2 - fw, 0, dW + fw * 2, H] });
  for (let y = Math.floor(dTop); y < ky; y++)
    for (let x = Math.floor(dX - dW / 2); x < dX + dW / 2; x++) {
      const ny = (y - dTop) / (0.6 * T);
      const nx = (x - dX) / (dW / 2);
      if (ny < 1 && nx * nx + (1 - ny) ** 2 > 1) continue;
      p.pix(x, y, hash(x, y, 13 + (frame % 2)) < 0.03 ? '#fff6c8' : '#121638');
    }
  p.fillPix(dX - 0.6 * T, dTop - fw - 3 * u, 1.2 * T, 2 * u, frame % 2 ? '#fff1c4' : STAR.neonCyan);
  // the Launch Bay hatch on the right: a round door with hazard stripes
  const hX = 22.8 * T;
  const hY = 2.6 * T;
  const hR = 1.25 * T;
  for (let y = Math.floor(hY - hR - fw); y < hY + hR + fw; y++)
    for (let x = Math.floor(hX - hR - fw); x < hX + hR + fw; x++) {
      const d = Math.hypot(x + 0.5 - hX, y + 0.5 - hY);
      if (d > hR + fw || y >= ky) continue;
      if (d > hR) p.dot(x, y, s.trim, y < hY ? 3 : 1);
      else if (d > hR - 3 * u) p.dot(x, y, Math.floor((x + y) / Math.max(3, Math.round(3 * u))) % 2 ? s.hazard : s.dark, 2);
      else p.dot(x, y, s.white, d < hR * 0.3 ? 3 : 2);
    }
  p.ellipse(hX, hY, 4 * u, 4 * u, s.orange, { sep: true });
  p.fillPix(hX - 3 * u, hY - hR - fw - 3 * u, 6 * u, 2 * u, frame % 2 ? STAR.neonPink : '#ffb547');
  // little ceiling lights along the top
  for (let x = T / 2; x < W; x += T) if (!inWin(x, 0.3 * T)) p.fillPix(x, Math.round(0.2 * T), Math.max(1, Math.round(2 * u)), Math.max(1, Math.round(u)), STAR.neonCyan);
  return p.toBuffer({ outline: false });
}

/** What the window looks out on: stars, the Milky Way, the Moon, and Earth's blue edge far below. */
export function paintObservatorySky(T: number, wTiles: number, hTiles: number, frame = 0): PixelBuffer {
  const u = U(T);
  const W = Math.round(wTiles * T);
  const H = Math.round(hTiles * T);
  const p = new Paint(W, H);
  const sky = ['#070a1e', '#0b0f28', '#0f1432', '#141a3c'];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const t = (y / H) * (sky.length - 1);
      let band = Math.floor(t);
      if (t - band > 0.7 && (x + y) % 2) band++;
      p.pix(x, y, sky[Math.min(sky.length - 1, band)]);
      // the Milky Way: a soft diagonal band of faint stars and glow
      const d = Math.abs(y - (H - 5.2 * T + x * 0.12)) / (0.9 * T);
      if (d < 1 && hash(x >> 1, y >> 1, 4) < 0.5 * (1 - d)) p.pix(x, y, mixHex(sky[Math.min(sky.length - 1, band)], '#6a6aa8', 0.35 * (1 - d)));
    }
  for (let i = 0; i < W * H * 0.005; i++) {
    const x = Math.floor(hash(i, 1, 17) * W);
    const y = Math.floor(hash(i, 2, 17) * H * 0.8);
    const tw = hash(i, 4, 17) > 0.6 && (frame + i) % 3 === 0;
    p.pix(x, y, tw ? '#4a4f88' : ['#ffffff', '#cfe8ff', '#fff1c4', '#ffd8c8'][i % 4]);
  }
  // the Moon, small and far
  const moon = paintPlanet('moon', 0.42 * T, 0);
  // Earth's edge: a big blue curve along the bottom, with clouds and a thin glow of air
  const ex = W * 0.55;
  const R = W * 0.9;
  const ey = H + R - 1.3 * T;
  for (let y = Math.floor(H - 1.6 * T); y < H; y++)
    for (let x = 0; x < W; x++) {
      const d = Math.hypot(x - ex, y - ey);
      if (d > R + 3 * u) continue;
      if (d > R) {
        p.pix(x, y, mixHex(p.color(x, y) ?? sky[3], '#7fd8ff', d > R + 1.5 * u ? 0.35 : 0.7));
        continue;
      }
      const depth = (R - d) / (0.9 * T);
      const cloud = hash(x >> 2, y >> 1, 23) > 0.72 || Math.sin(x / (9 * u) + y / (3 * u)) > 0.9;
      const land = hash(x >> 3, y >> 2, 27) > 0.78;
      const base = cloud ? '#f2f6fa' : land ? '#4aa65a' : '#2f7fd0';
      p.pix(x, y, mixHex(base, '#0b1640', Math.min(0.55, depth * 0.25 + (x > ex + W * 0.25 ? 0.25 : 0))));
    }
  const out = p.toBuffer({ outline: false });
  out.blit(moon, Math.round(W * 0.7), Math.round(H - 4.4 * T));
  return out;
}

export const OBSERVATORY: Setting = {
  id: 'observatory',
  world: 'star-station',
  name: 'The observatory',
  inspiredBy: 'Real observatories (a domed room, a big telescope) and planetariums; the station itself is made up. Earth and the Moon are drawn from NASA pictures.',
  build: buildObservatory,
};

function buildObservatory(ctx: SceneCtx): SettingScene {
  const { lighting, px: T } = ctx;
  const { add, prop } = placer(ctx);
  const blocks: Array<{ x: number; y: number; w: number; h: number }> = [];
  const solid = (cv: HTMLCanvasElement, x: number, y: number, depth = 0.5, shadowW = 0) => {
    const w = cv.width / T;
    blocks.push({ x: x - w / 2 + 0.1, y: y - depth, w: Math.max(0.4, w - 0.2), h: depth });
    return prop(cv, x, y, shadowW);
  };
  const leave = (part: string) => !!ctx.omit?.includes(part);

  add(groundPiece(lighting, T, paintStarFloor(T, L).toCanvas(), 0, 0));
  const skyW = L.w + 12;
  // the sky is painted taller than the window, so a tall phone screen still sees stars above the dome
  const skyH = OBS_WALL + 9;
  const skyFrames = [0, 1, 2].map((f) => pixelTexture(paintObservatorySky(T, skyW, skyH, f).toCanvas()));
  const sky = add(billboard(null, T, paintObservatorySky(T, skyW, skyH, 0).toCanvas(), L.w / 2, L.floorTop - 0.3));
  const wallFrames = [0, 1].map((f) => pixelTexture(paintObservatoryWall(T, f).toCanvas()));
  const wall = add(billboard(lighting, T, paintObservatoryWall(T, 0).toCanvas(), L.w / 2, L.floorTop));
  for (let x = WIN.x0 + 1; x < WIN.x1; x += 3) add(glow(lighting, T, Math.round(T * 1.2), '#7ff0ff', x, L.floorTop + 0.1, OBS_WALL - WIN.bottom - 0.15, 0.45));
  for (const [r0, r1] of L.walkways)
    for (let x = 2; x < L.w - 1; x += 3) {
      add(lightPool(lighting, T, x, r0 + 0.1, 0.8, '#5fe3ff', 0.3));
      add(lightPool(lighting, T, x, r1 + 0.9, 0.8, '#5fe3ff', 0.3));
    }

  // the big telescope on its platform (a game draws its own, with the lenses lit, using omit: ['telescope'])
  if (!leave('telescope')) solid(paintBigTelescope(T, 0).toCanvas(), OBS_SPOTS.telescope.x, OBS_SPOTS.telescope.y, 1.2, 2.6);
  add(lightPool(lighting, T, L.ring.x, L.ring.y, 2.2, '#5fe3ff', 0.35));

  // the four space models (a game can draw its own with omit: ['models'])
  const models = !leave('models');
  const orreryTex = models ? Array.from({ length: 24 }, (_, f) => pixelTexture(paintOrrery(T, f / 6).toCanvas())) : [];
  const orrery = models ? solid(paintOrrery(T, 0).toCanvas(), OBS_SPOTS.orrery.x, OBS_SPOTS.orrery.y, 1.4, 3.4) : null;
  if (models) add(glow(lighting, T, Math.round(T * 2), '#ffd65a', OBS_SPOTS.orrery.x, OBS_SPOTS.orrery.y - 0.6, 1.6, 0.6));
  const globeTex = models ? Array.from({ length: 16 }, (_, f) => pixelTexture(paintGlobeLab(T, f / 16).toCanvas())) : [];
  const globe = models ? solid(paintGlobeLab(T, 0).toCanvas(), OBS_SPOTS.globe.x, OBS_SPOTS.globe.y, 1, 3) : null;
  if (models) add(glow(lighting, T, Math.round(T * 2.4), '#ffd65a', OBS_SPOTS.globe.x - 1.5, OBS_SPOTS.globe.y, 1.8, 0.7));
  const projTex = models ? [0, 1, 2].map((f) => pixelTexture(paintStarProjector(T, f).toCanvas())) : [];
  const proj = models ? solid(paintStarProjector(T, 0).toCanvas(), OBS_SPOTS.projector.x, OBS_SPOTS.projector.y, 0.6, 1.8) : null;
  if (models) add(glow(lighting, T, Math.round(T * 1.6), '#4fd6ff', OBS_SPOTS.projector.x, OBS_SPOTS.projector.y, 1.8, 0.5));
  const cannonTex = models ? Array.from({ length: 12 }, (_, f) => pixelTexture(paintLaunchCannon(T, f).toCanvas())) : [];
  const cannon = models ? solid(paintLaunchCannon(T, 0).toCanvas(), OBS_SPOTS.cannon.x, OBS_SPOTS.cannon.y, 0.8, 2.8) : null;
  if (models) add(glow(lighting, T, Math.round(T * 1.6), '#ff8fd0', OBS_SPOTS.cannon.x, OBS_SPOTS.cannon.y, 1.8, 0.45));

  // consoles, plants and light posts
  const consoleTex = [0, 1, 2].map((f) => pixelTexture(paintConsole(T, f).toCanvas()));
  const consoles = [solid(paintConsole(T, 0).toCanvas(), 9.4, 5.6, 0.8), solid(paintConsole(T, 1).toCanvas(), 16.6, 5.6, 0.8)];
  for (const [x, y, s] of [
    [1.4, 9.8, 0],
    [24.6, 10.4, 1],
    [1.4, 15.4, 1],
    [24.6, 15.6, 0],
  ]) solid(paintAlienPlant(T, s).toCanvas(), x, y);
  for (const [x, y] of [
    [10.2, 9.6],
    [15.8, 9.6],
    [2.6, 12],
    [23.4, 11.6],
  ]) {
    solid(paintBollard(T).toCanvas(), x, y, 0.4);
    add(glow(lighting, T, Math.round(T * 0.9), '#5fe3ff', x, y, 0.75, 0.6));
  }

  return {
    map: { w: L.w, h: L.h },
    focus: { x: 13, feet: 12.2, top: -1.2 },
    clear: '#0b0f28',
    walk: { x0: 1.2, y0: 4.9, x1: 24.8, y1: 15.4 },
    blocks,
    spots: { ...OBS_SPOTS },
    update(t, camX) {
      const f = Math.floor(t * 2);
      swapFrame(sky, skyFrames[Math.floor(t * 1.5) % 3]);
      swapFrame(wall, wallFrames[f % 2]);
      consoles.forEach((c, i) => swapFrame(c, consoleTex[(f + i) % 3]));
      if (orrery) swapFrame(orrery, orreryTex[Math.floor(t * 4) % orreryTex.length]);
      if (globe) swapFrame(globe, globeTex[Math.floor(t * 2) % globeTex.length]);
      if (proj) swapFrame(proj, projTex[Math.floor(t * 3) % 3]);
      if (cannon) swapFrame(cannon, cannonTex[Math.floor(t * 4) % cannonTex.length]);
      sky.position.x = L.w / 2 + (camX - L.w / 2) * 0.55;
    },
  };
}
