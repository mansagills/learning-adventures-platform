import { pixelTexture } from '../../world/sceneKit';
import { swapFrame as wallSwap } from '../figure';
import { placer } from '../place';
import { billboard, glow, groundPiece, lightPool } from '../stage';
import type { SceneCtx, Setting, SettingScene } from '../types';
import { ANC_LAYOUT as L, paintAncientGround, paintAncientSky, paintBoat, paintCat, paintHouses, paintMat, paintObelisk, paintPalm, paintPots, paintReeds, paintRiver, paintStall, paintTorch, paintWell } from './art';

/** Ancient Kingdoms setting: a river market (the W0 test scene). */
export const RIVER_MARKET: Setting = {
  id: 'river-market',
  world: 'ancient-kingdoms',
  name: 'River market',
  inspiredBy: 'Market towns on the Niger in old Mali (the Great Mosque of Djenné) and the pyramids of Meroë in Kush.',
  sources: [
    'UNESCO World Heritage: Old Towns of Djenné (whc.unesco.org/en/list/116)',
    'UNESCO World Heritage: Archaeological Sites of the Island of Meroe (whc.unesco.org/en/list/1336)',
  ],
  build: buildMarket,
};

function buildMarket(ctx: SceneCtx): SettingScene {
  const { lighting, px: T, time } = ctx;
  const { add, prop } = placer(ctx);

  add(groundPiece(lighting, T, paintAncientGround(T).toCanvas(), 0, 0));
  const riverTex = [0, 1, 2].map((f) => pixelTexture(paintRiver(T, f).toCanvas()));
  const river = groundPiece(lighting, T, paintRiver(T, 0).toCanvas(), 0, L.river[0]);
  add(river);

  // the sky and far horizon (painted for day or dusk, not tinted), with parallax
  const skyW = L.w + 12;
  const sky = billboard(null, T, paintAncientSky(T, skyW, 9, time).toCanvas(), L.w / 2, L.floorTop - 0.4);
  add(sky);
  add(billboard(lighting, T, paintHouses(T).toCanvas(), L.w / 2, L.floorTop));


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

  return {
    map: { w: L.w, h: L.h },
    focus: { x: 13, feet: 11.2, top: -3.2 },
    clear: '#d9a462',
    spots: { player: { x: 12.4, y: 10.9 }, host: { x: 14.1, y: 10.5 } },
    update(t, camX) {
      wallSwap(river, riverTex[Math.floor(t * 2.5) % 3]);
      torches.forEach((m, i) => wallSwap(m, torchTex[(Math.floor(t * 7) + i) % 3]));
      wallSwap(cat, catTex[t % 5 > 4.8 ? 1 : 0]);
      sky.position.x = L.w / 2 + (camX - L.w / 2) * 0.5;
    },
  };
}
