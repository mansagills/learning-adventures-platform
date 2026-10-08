import type * as THREE from 'three';
import { K } from '../../kit/render/pixelRenderer';
import { pixelTexture } from '../../kit/world/sceneKit';
import type { Cast } from '../cast';
import { Figure, type SceneParts, type WorldScene } from '../scene';
import { billboard, glow, groundPiece, lightPool, shadow } from '../stage';
import { ANC_LAYOUT as L, paintAncientGround, paintAncientSky, paintBoat, paintCat, paintHouses, paintMat, paintObelisk, paintPalm, paintPots, paintReeds, paintRiver, paintStall, paintTorch, paintWell } from './ancient';
import { wallSwap } from './starScene';

/** Ancient Kingdoms' river market, the W0 test scene. */
export function buildAncient(parts: SceneParts, cast: Cast): WorldScene {
  const { scene, lighting, px: T, time } = parts;
  const add = (o: THREE.Object3D) => scene.add(o);

  add(groundPiece(lighting, T, paintAncientGround(T).toCanvas(), 0, 0));
  const riverTex = [0, 1, 2].map((f) => pixelTexture(paintRiver(T, f).toCanvas()));
  const river = groundPiece(lighting, T, paintRiver(T, 0).toCanvas(), 0, L.river[0]);
  add(river);

  // the sky and far horizon (painted for day or dusk, not tinted), with parallax
  const skyW = L.w + 12;
  const sky = billboard(null, T, paintAncientSky(T, skyW, 9, time).toCanvas(), L.w / 2, L.floorTop - 0.4);
  add(sky);
  add(billboard(lighting, T, paintHouses(T).toCanvas(), L.w / 2, L.floorTop));

  const prop = (canvas: HTMLCanvasElement, x: number, y: number, shadowW = 0) => {
    const m = billboard(lighting, T, canvas, x, y);
    add(m);
    if (shadowW) {
      const sh = shadow(T, shadowW);
      sh.position.set(x, 0.015, y * K);
      add(sh);
    }
    return m;
  };

  prop(paintPalm(T, 0).toCanvas(), 1.8, 6.2, 1.4);
  prop(paintPalm(T, 2).toCanvas(), 24.4, 6.6, 1.4);
  prop(paintPalm(T, 1).toCanvas(), 2.4, 16.6, 1.4);
  prop(paintPalm(T, 0).toCanvas(), 23.2, 16.4, 1.4);
  prop(paintPalm(T, 2).toCanvas(), 6.0, 23.6, 1.4);
  prop(paintPalm(T, 1).toCanvas(), 19.5, 23.4, 1.4);
  prop(paintStall(T).toCanvas(), 6.6, 8.2, 3);
  prop(paintPots(T).toCanvas(), 9.8, 8.6, 1.5);
  prop(paintObelisk(T).toCanvas(), 19.8, 7.0, 1.2);
  prop(paintWell(T).toCanvas(), 21.4, 12.6, 1.8);
  prop(paintMat(T).toCanvas(), 15.6, 14.4);
  prop(paintPots(T).toCanvas(), 4.4, 13.6, 1.5);
  for (const [x, y, s] of [
    [1.2, 17.9, 0],
    [8.4, 17.9, 1],
    [16.8, 17.9, 2],
    [25, 17.9, 3],
    [3.6, 22.9, 4],
    [12.8, 22.9, 5],
    [22.4, 22.9, 6],
  ]) prop(paintReeds(T, s).toCanvas(), x, y);
  prop(paintBoat(T).toCanvas(), 9.6, 20.2);

  // torches: the flame flickers, and glows after dark
  const torchTex = [0, 1, 2].map((f) => pixelTexture(paintTorch(T, f).toCanvas()));
  const torches = [
    [10.4, 11.4],
    [16.4, 11.4],
    [3.6, 10.6],
    [12, 16.2],
    [15, 16.2],
  ].map(([x, y]) => {
    add(glow(lighting, T, Math.round(T * 1.8), '#ffb050', x, y, 2.1, 0.7));
    add(lightPool(lighting, T, x, y + 0.2, 1.8, '#ff9a40', 0.32));
    return prop(torchTex[0].image as HTMLCanvasElement, x, y, 0.6);
  });
  // warm light from the house doors at dusk
  for (const x of [1.5, 7.3, 14.7, 19.4, 23.6]) add(lightPool(lighting, T, x, L.floorTop + 0.6, 1.2, '#ffb060', 0.28));

  const catTex = [false, true].map((b) => pixelTexture(paintCat(T, b).toCanvas()));
  const cat = prop(paintCat(T).toCanvas(), 11.2, 11.6, 0.7);

  const player = new Figure(parts, cast.player, 12.4, 10.9);
  const host = new Figure(parts, cast.host, 14.1, 10.5);

  return {
    name: 'Ancient Kingdoms',
    map: { w: L.w, h: L.h },
    focus: { x: 13, feet: 11.2, top: -3.2 },
    clear: '#d9a462',
    tint: { day: [1, 1, 1], evening: [0.92, 0.66, 0.66] },
    line: 'Welcome to the river market! Traders bring salt, gold and stories from all along the river. Shall we see what is for sale?',
    speakerName: 'Storyteller Awa',
    speakerRole: 'Test host · Ancient Kingdoms',
    update(t, camX) {
      wallSwap(river, riverTex[Math.floor(t * 2.5) % 3]);
      torches.forEach((m, i) => wallSwap(m, torchTex[(Math.floor(t * 7) + i) % 3]));
      wallSwap(cat, catTex[t % 5 > 4.8 ? 1 : 0]);
      sky.position.x = L.w / 2 + (camX - L.w / 2) * 0.5;
      player.frame(t % 3.6 > 3.45 ? 1 : 0);
      host.frame(t % 4.3 > 4.15 ? 1 : 0);
    },
  };
}
