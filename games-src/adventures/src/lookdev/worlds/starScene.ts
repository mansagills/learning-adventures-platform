import * as THREE from 'three';
import { K } from '../../kit/render/pixelRenderer';
import { pixelTexture } from '../../kit/world/sceneKit';
import type { Cast } from '../cast';
import { Figure, type SceneParts, type WorldScene } from '../scene';
import { billboard, glow, groundPiece, lightPool, shadow } from '../stage';
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
} from './star';

/** Star Station's observation deck, the W0 test scene. */
export function buildStar(parts: SceneParts, cast: Cast): WorldScene {
  const { scene, lighting, px: T } = parts;
  const add = (o: THREE.Object3D) => scene.add(o);

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

  const prop = (canvas: HTMLCanvasElement, x: number, y: number, shadowW = 0, lift = 0) => {
    const m = billboard(lighting, T, canvas, x, y, lift);
    add(m);
    if (shadowW) {
      const sh = shadow(T, shadowW);
      sh.position.set(x, 0.015, y * K);
      add(sh);
    }
    return m;
  };

  // consoles by the wall, and a hologram table
  const consoles = [prop(paintConsole(T, 0).toCanvas(), 3.6, 6.4), prop(paintConsole(T, 1).toCanvas(), 6.4, 6.4)];
  const consoleTex = [0, 1, 2].map((f) => pixelTexture(paintConsole(T, f).toCanvas()));
  for (const x of [3.6, 6.4]) add(glow(lighting, T, Math.round(T * 1.6), '#5fe3ff', x, 6.2, 1.3, 0.5));
  const holo = prop(paintHoloTable(T, 0).toCanvas(), 17.2, 6.9, 1.6);
  const holoTex = [0, 1, 2, 3].map((f) => pixelTexture(paintHoloTable(T, f).toCanvas()));
  add(glow(lighting, T, Math.round(T * 3), '#5fe3ff', 17.2, 6.9, 1.6, 0.6));
  add(lightPool(lighting, T, 17.2, 7.1, 1.6, '#5fe3ff', 0.4));

  // plants, crates, a bench, light posts
  prop(paintAlienPlant(T, 0).toCanvas(), 10.2, 4.6);
  prop(paintAlienPlant(T, 1).toCanvas(), 21.6, 4.6);
  prop(paintDome(T).toCanvas(), 22.6, 12.2, 2.4);
  prop(paintDome(T).toCanvas(), 5.2, 22.4, 2.4);
  prop(paintCrates(T).toCanvas(), 2.6, 14.6, 2.2);
  prop(paintCrates(T).toCanvas(), 23.4, 22.6, 2.2);
  prop(paintBench(T).toCanvas(), 8.6, 15.2);
  prop(paintBench(T).toCanvas(), 14.4, 22.6);
  for (const [x, y] of [
    [1.6, 8.6],
    [24.4, 8.6],
    [1.6, 11.4],
    [24.4, 11.4],
    [1.6, 17.6],
    [24.4, 20.4],
  ]) {
    prop(paintBollard(T).toCanvas(), x, y);
    add(glow(lighting, T, Math.round(T * 0.9), '#5fe3ff', x, y, 0.75, 0.6));
  }
  prop(paintAlienPlant(T, 1).toCanvas(), 11.8, 15.4);
  const kioskTex = [0, 1, 2, 3].map((f) => pixelTexture(paintKiosk(T, f).toCanvas()));
  const kiosk = prop(paintKiosk(T, 0).toCanvas(), 3.2, 20.2, 1.1);
  add(glow(lighting, T, Math.round(T * 1.6), '#5fe3ff', 3.2, 20.2, 1.4, 0.5));
  prop(paintTelescope(T).toCanvas(), 13.2, 6.2, 1.4);
  prop(paintAlienPlant(T, 0).toCanvas(), 17.6, 16.4);
  prop(paintAlienPlant(T, 1).toCanvas(), 9.4, 21.8);
  prop(paintAlienPlant(T, 0).toCanvas(), 19.8, 21.4);

  // the helper drone hovers and bobs
  const droneTex = [0, 1].map((f) => pixelTexture(paintDrone(T, f).toCanvas()));
  const drone = prop(paintDrone(T, 0).toCanvas(), 15.9, 12.2, 0, 0.9);
  const droneShadow = shadow(T, 0.7);
  droneShadow.position.set(15.9, 0.015, 12.2 * K);
  add(droneShadow);
  add(glow(lighting, T, Math.round(T * 1.1), '#5fe3ff', 15.9, 12.2, 0.85, 0.7));

  // the people
  const player = new Figure(parts, cast.player, 12.2, 11.4);
  const host = new Figure(parts, cast.host, 14.0, 10.9);

  return {
    name: 'Star Station',
    map: { w: L.w, h: L.h },
    focus: { x: 13, feet: 12.2, top: -1.2 },
    clear: '#141729',
    tint: { day: [1, 1, 1], evening: [0.6, 0.64, 0.92] },
    line: 'Welcome aboard Star Station! This is the observation deck. That ringed planet out the window is where our next mission goes.',
    speakerName: 'Engineer Kemi',
    speakerRole: 'Test host · Star Station crew',
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
      const blink = t % 3.6 > 3.45;
      player.frame(blink ? 1 : 0);
      host.frame(t % 4.3 > 4.15 ? 1 : 0);
    },
  };
}

/** Show another animation frame on a billboard. */
export function wallSwap(m: THREE.Mesh, tex: THREE.Texture): void {
  const mat = m.material as THREE.MeshBasicMaterial;
  if (mat.map !== tex) {
    mat.map = tex;
    mat.needsUpdate = true;
  }
}
