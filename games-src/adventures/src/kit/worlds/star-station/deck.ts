import { K } from '../../render/pixelRenderer';
import { pixelTexture } from '../../world/sceneKit';
import { swapFrame as wallSwap } from '../figure';
import { placer } from '../place';
import { billboard, glow, groundPiece, lightPool, shadow } from '../stage';
import type { SceneCtx, Setting, SettingScene } from '../types';
import {
  STAR_LAYOUT as L,
  WALL_TILES,
  WINDOW,
  paintAlienPlant,
  paintBench,
  paintBollard,
  paintConsole,
  paintCrates,
  paintDome,
  paintDrone,
  paintHoloTable,
  paintKiosk,
  paintTelescope,
  paintSpace,
  paintStarFloor,
  paintStarWall,
} from './art';

/** Star Station setting: the observation deck (the W0 test scene). */
export const STATION_DECK: Setting = {
  id: 'station-deck',
  world: 'star-station',
  name: 'Observation deck',
  inspiredBy: 'Space stations and science fiction; the ringed planet is made up.',
  build: buildDeck,
};

function buildDeck(ctx: SceneCtx): SettingScene {
  const { lighting, px: T } = ctx;
  const { add, prop } = placer(ctx);
  // solid props: their footprint (as wide as the picture, `depth` tiles deep) goes into `blocks`, so a walking player goes round them
  const blocks: Array<{ x: number; y: number; w: number; h: number }> = [];
  const solid = (cv: HTMLCanvasElement, x: number, y: number, depth = 0.5, shadowW = 0) => {
    const w = cv.width / T;
    blocks.push({ x: x - w / 2 + 0.1, y: y - depth, w: Math.max(0.4, w - 0.2), h: depth });
    return prop(cv, x, y, shadowW);
  };

  add(groundPiece(lighting, T, paintStarFloor(T).toCanvas(), 0, 0));

  // space behind the window (not tinted: it is lit by the stars), with parallax
  const spaceW = L.w + 12;
  const spaceFrames = [0, 1, 2].map((f) => pixelTexture(paintSpace(T, spaceW, WALL_TILES + 1, f).toCanvas()));
  const space = billboard(null, T, paintSpace(T, spaceW, WALL_TILES + 1, 0).toCanvas(), L.w / 2, L.floorTop - 0.3);
  add(space);

  const wallFrames = [0, 1].map((f) => pixelTexture(paintStarWall(T, f).toCanvas()));
  const wall = billboard(lighting, T, paintStarWall(T, 0).toCanvas(), L.w / 2, L.floorTop);
  add(wall);
  // window neon and ceiling lights glow on the night shift
  for (let x = WINDOW.x0 + 1; x < WINDOW.x1; x += 3) add(glow(lighting, T, Math.round(T * 1.2), '#ff7fc8', x, L.floorTop + 0.1, WALL_TILES - WINDOW.y1 - 0.15, 0.5));
  add(glow(lighting, T, Math.round(T * 1.5), '#8dffb0', 24, L.floorTop + 0.1, WALL_TILES - 1.25, 0.7));

  // light strips along the walkways
  for (const [r0, r1] of L.walkways)
    for (let x = 2; x < L.w - 1; x += 3) {
      add(lightPool(lighting, T, x, r0 + 0.1, 0.8, '#5fe3ff', 0.3));
      add(lightPool(lighting, T, x, r1 + 0.9, 0.8, '#5fe3ff', 0.3));
    }

  // consoles by the wall, and a hologram table
  const consoles = [solid(paintConsole(T, 0).toCanvas(), 3.6, 6.4, 0.8), solid(paintConsole(T, 1).toCanvas(), 6.4, 6.4, 0.8)];
  const consoleTex = [0, 1, 2].map((f) => pixelTexture(paintConsole(T, f).toCanvas()));
  for (const x of [3.6, 6.4]) add(glow(lighting, T, Math.round(T * 1.6), '#5fe3ff', x, 6.2, 1.3, 0.5));
  const holo = solid(paintHoloTable(T, 0).toCanvas(), 17.2, 6.9, 0.8, 1.6);
  const holoTex = [0, 1, 2, 3].map((f) => pixelTexture(paintHoloTable(T, f).toCanvas()));
  add(glow(lighting, T, Math.round(T * 3), '#5fe3ff', 17.2, 6.9, 1.6, 0.6));
  add(lightPool(lighting, T, 17.2, 7.1, 1.6, '#5fe3ff', 0.4));

  // plants, crates, a bench, light posts
  solid(paintAlienPlant(T, 0).toCanvas(), 10.2, 4.6);
  solid(paintAlienPlant(T, 1).toCanvas(), 21.6, 4.6);
  solid(paintDome(T).toCanvas(), 22.6, 12.2, 1, 2.4);
  solid(paintDome(T).toCanvas(), 5.2, 22.4, 1, 2.4);
  solid(paintCrates(T).toCanvas(), 2.6, 14.6, 0.8, 2.2);
  solid(paintCrates(T).toCanvas(), 23.4, 22.6, 0.8, 2.2);
  solid(paintBench(T).toCanvas(), 8.6, 15.2);
  solid(paintBench(T).toCanvas(), 14.4, 22.6);
  for (const [x, y] of [
    [1.6, 8.6],
    [24.4, 8.6],
    [1.6, 11.4],
    [24.4, 11.4],
    [1.6, 17.6],
    [24.4, 20.4],
  ]) {
    solid(paintBollard(T).toCanvas(), x, y, 0.4);
    add(glow(lighting, T, Math.round(T * 0.9), '#5fe3ff', x, y, 0.75, 0.6));
  }
  solid(paintAlienPlant(T, 1).toCanvas(), 11.8, 15.4);
  const kioskTex = [0, 1, 2, 3].map((f) => pixelTexture(paintKiosk(T, f).toCanvas()));
  const kiosk = solid(paintKiosk(T, 0).toCanvas(), 3.2, 20.2, 0.6, 1.1);
  add(glow(lighting, T, Math.round(T * 1.6), '#5fe3ff', 3.2, 20.2, 1.4, 0.5));
  solid(paintTelescope(T).toCanvas(), 13.2, 6.2, 0.6, 1.4);
  solid(paintAlienPlant(T, 0).toCanvas(), 17.6, 16.4);
  solid(paintAlienPlant(T, 1).toCanvas(), 9.4, 21.8);
  solid(paintAlienPlant(T, 0).toCanvas(), 19.8, 21.4);

  // the helper drone hovers and bobs (a game can leave it out with omit: ['drone'])
  const droneTex = [0, 1].map((f) => pixelTexture(paintDrone(T, f).toCanvas()));
  const hasDrone = !ctx.omit?.includes('drone');
  const drone = prop(paintDrone(T, 0).toCanvas(), 15.9, 12.2, 0, 0.9);
  drone.visible = hasDrone;
  if (hasDrone) {
    const droneShadow = shadow(T, 0.7);
    droneShadow.position.set(15.9, 0.015, 12.2 * K);
    add(droneShadow);
    add(glow(lighting, T, Math.round(T * 1.1), '#5fe3ff', 15.9, 12.2, 0.85, 0.7));
  }

  return {
    map: { w: L.w, h: L.h },
    focus: { x: 13, feet: 12.2, top: -1.2 },
    clear: '#141729',
    walk: { x0: 1.2, y0: 4.9, x1: 24.8, y1: 23.4 },
    blocks,
    spots: { player: { x: 12.2, y: 11.4 }, host: { x: 14.0, y: 10.9 } },
    update(t, camX) {
      const f = Math.floor(t * 2);
      wallSwap(wall, wallFrames[f % 2]);
      wallSwap(space, spaceFrames[Math.floor(t * 1.5) % 3]);
      consoles.forEach((c, i) => wallSwap(c, consoleTex[(f + i) % 3]));
      wallSwap(holo, holoTex[Math.floor(t * 6) % 4]);
      wallSwap(kiosk, kioskTex[Math.floor(t * 3) % 4]);
      wallSwap(drone, droneTex[Math.floor(t * 8) % 2]);
      drone.position.y = (0.9 + Math.round(Math.sin(t * 2.4) * 2) / T) * K;
      // the far scene drifts slower than the deck: a sense of depth
      space.position.x = L.w / 2 + (camX - L.w / 2) * 0.55;
    },
  };
}
