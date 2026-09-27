import * as THREE from 'three';
import { K, PX } from '../render/pixelRenderer';
import { paintGround } from '../art/tiles';
import { paintFurniture, paintProp, paintSchool, paintSprout } from '../art/props';
import { PixelBuffer } from '../art/pixel';
import { paintingCanvas } from '../art/sceneArt';
import { P } from '../art/palette';
import { hash2, mulberry32 } from '../core/rng';
import { CollisionGrid, propFootprint } from './collision';
import { SCHOOL_EASEL_ART, SCHOOL_EASELS, buildHubMap, buildRoomMap, buildSchoolMap, type MapDef, type PropDef, type SceneId } from './map';
import { Lighting, billboard, buildBuilding, glowSprite, lightPool, pixelTexture } from './sceneKit';

export interface WorldScene {
  id: SceneId;
  map: MapDef;
  scene: THREE.Scene;
  grid: CollisionGrid;
  lighting: Lighting;
  /** Per-frame ambient animation (water, fireflies, butterflies). */
  update(dt: number, time: number, night: number, reducedMotion: boolean): void;
  /** Room only: show or hide the planted seed pot. */
  setPotPlanted?(planted: boolean): void;
  /** Interior light differs from outdoors. */
  interior: boolean;
}

function groundMesh(lighting: Lighting, map: MapDef): THREE.Mesh {
  const cv = paintGround(map);
  const geo = new THREE.PlaneGeometry(map.w, map.h * K);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, lighting.add(new THREE.MeshBasicMaterial({ map: pixelTexture(cv) })));
  mesh.position.set(map.w / 2, 0, (map.h / 2) * K);
  mesh.name = 'ground';
  return mesh;
}

/** Fences on the left/right sides of a pen use the end-on post sprite. */
function fenceVariant(p: PropDef, map: MapDef): number {
  const isFence = (x: number, y: number) => map.props.some((q) => q.kind === 'fence' && q.x === x && q.y === y);
  const horiz = isFence(p.x - 1, p.y) || isFence(p.x + 1, p.y);
  return horiz ? 0 : 1;
}

const propCanvasCache = new Map<string, HTMLCanvasElement>();
function propCanvas(kind: PropDef['kind'], variant: number): HTMLCanvasElement {
  const key = `${kind}:${variant}`;
  let cv = propCanvasCache.get(key);
  if (!cv) {
    cv = paintProp(kind, variant).toCanvas();
    propCanvasCache.set(key, cv);
  }
  return cv;
}

export function buildHubScene(): WorldScene {
  const map = buildHubMap();
  const scene = new THREE.Scene();
  const lighting = new Lighting();
  const bg = new THREE.Color(P.grassDeep);
  scene.background = bg.clone();
  scene.add(groundMesh(lighting, map));
  map.buildings.forEach((b) => scene.add(buildBuilding(lighting, b)));

  for (const p of map.props) {
    const variant = p.kind === 'fence' ? fenceVariant(p, map) : (p.variant ?? 0);
    const cv = propCanvas(p.kind, variant);
    const fp = propFootprint({ ...p, solid: true });
    const fw = Math.max(1, ...fp.map(([dx]) => dx + 1));
    const fd = Math.max(1, ...fp.map(([, dy]) => dy + 1));
    const cx = p.x + fw / 2;
    const baseY = p.y + fd - (p.kind === 'crop' ? 0.25 : 0.4);
    // Tiny per-prop depth nudge avoids z-fighting between neighbours.
    const m = billboard(lighting, cv, cx, baseY + hash2(p.x, p.y, 2) * 0.01, { name: `prop:${p.kind}` });
    scene.add(m);
    if (p.kind === 'lamp') {
      scene.add(glowSprite(lighting, 26, '#ffd98a', cx, baseY + 0.05, (cv.height - 5) / PX, 0.7));
      scene.add(lightPool(lighting, cx, baseY + 0.3, 1.9, '#ffc56b', 0.3));
    }
  }

  // Warm light spilling from doors and windows at night.
  map.buildings.forEach((b) => {
    if (b.style === 'greenhouse') scene.add(lightPool(lighting, b.x + b.w / 2, b.y + b.d + 0.6, 2.5, '#bff0c0', 0.18));
    else scene.add(lightPool(lighting, b.doorX + 0.5, b.y + b.d + 0.5, 1.4, '#ffcf73', 0.22));
  });

  const life = new AmbientLife(scene, lighting, map);
  return {
    id: 'hub',
    map,
    scene,
    grid: new CollisionGrid(map),
    lighting,
    interior: false,
    update: (dt, time, night, rm) => {
      bg.set(P.grassDeep).multiplyScalar(1 - night * 0.45);
      (scene.background as THREE.Color).copy(bg);
      life.update(dt, time, night, rm);
    },
  };
}

/** Pond sparkles, fireflies at night and butterflies by day. */
class AmbientLife {
  private sparkles: THREE.Mesh[] = [];
  private flies: Array<{ m: THREE.Mesh; x: number; y: number; ph: number }> = [];
  private butterflies: Array<{ m: THREE.Mesh; x: number; y: number; ph: number; tex: THREE.CanvasTexture }> = [];

  constructor(scene: THREE.Scene, lighting: Lighting, map: MapDef) {
    const rnd = mulberry32(42);
    // Water sparkles: tiny flat highlights that twinkle.
    const sparkleCv = new PixelBuffer(4, 1);
    sparkleCv.hline(0, 3, 0, '#e8f7ff');
    const sparkTex = pixelTexture(sparkleCv.toCanvas());
    for (let y = 0; y < map.h; y++)
      for (let x = 0; x < map.w; x++) {
        if (map.ground[y][x] !== 'water' || rnd() > 0.45) continue;
        const geo = new THREE.PlaneGeometry(4 / PX, (1 / PX) * K);
        geo.rotateX(-Math.PI / 2);
        const m = new THREE.Mesh(geo, lighting.add(new THREE.MeshBasicMaterial({ map: sparkTex, transparent: true })));
        m.position.set(x + 0.2 + rnd() * 0.6, 0.02, (y + 0.2 + rnd() * 0.6) * K);
        m.userData.phase = rnd() * 6;
        this.sparkles.push(m);
        scene.add(m);
      }

    // Fireflies near the pond and garden (night only).
    const spots = [
      [15, 20], [24, 21], [18, 24], [22, 19], [10, 6], [13, 7], [26, 5], [6, 11], [34, 11], [8, 23],
    ];
    spots.forEach(([x, y], i) => {
      const glow = glowSprite(lighting, 6, '#d8ff8a', x, y, 0.6 + (i % 3) * 0.3, 1);
      this.flies.push({ m: glow, x, y, ph: i * 1.7 });
      scene.add(glow);
    });

    // Butterflies (day only): two tiny 2-frame sprites near the garden and pond.
    [[12, 10], [23, 19], [7, 8]].forEach(([x, y], i) => {
      const cv = document.createElement('canvas');
      cv.width = 14;
      cv.height = 6;
      const bf = new PixelBuffer(14, 6);
      const col = i % 2 ? P.flowerYellow : '#f2f2ff';
      // frame 0: wings open; frame 1: wings up
      bf.rect(1, 1, 2, 2, col);
      bf.rect(4, 1, 2, 2, col);
      bf.set(3, 2, P.outline);
      bf.rect(9, 0, 1, 3, col);
      bf.rect(11, 0, 1, 3, col);
      bf.set(10, 2, P.outline);
      bf.drawTo(cv.getContext('2d')!, 0, 0);
      const tex = pixelTexture(cv);
      tex.repeat.set(0.5, 1);
      const geo = new THREE.PlaneGeometry(7 / PX, (6 / PX) * K * 0.707);
      const m = new THREE.Mesh(geo, lighting.add(new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5 })));
      m.rotation.x = -Math.PI / 4;
      this.butterflies.push({ m, x, y, ph: i * 2.1, tex });
      scene.add(m);
    });
  }

  update(_dt: number, time: number, night: number, reducedMotion: boolean): void {
    this.sparkles.forEach((m) => {
      m.visible = reducedMotion ? true : Math.sin(time * 1.6 + (m.userData.phase as number)) > 0.3;
    });
    this.flies.forEach((f) => {
      const t = reducedMotion ? f.ph : time * 0.5 + f.ph;
      f.m.position.x = f.x + Math.sin(t) * 0.9;
      f.m.position.z = (f.y + Math.cos(t * 0.7) * 0.6) * K;
      f.m.position.y = (0.8 + Math.sin(t * 1.3) * 0.3) * K;
    });
    this.butterflies.forEach((b) => {
      b.m.visible = night < 0.4;
      const t = reducedMotion ? b.ph : time * 0.6 + b.ph;
      b.m.position.set(b.x + Math.sin(t) * 1.6, (1.2 + Math.sin(t * 2.3) * 0.25) * K, (b.y + Math.sin(t * 0.8) * 1.0) * K);
      b.tex.offset.x = !reducedMotion && Math.sin(time * 18 + b.ph) > 0 ? 0.5 : 0;
    });
  }
}

// ------------------------------------------------------------ room

function paintBackWall(night: boolean): HTMLCanvasElement {
  const W = 160;
  const H = 40;
  const b = new PixelBuffer(W, H);
  b.rect(0, 0, W, H, '#efe0bf');
  for (let x = 4; x < W; x += 8) b.vline(x, 0, H - 12, '#e2cfa6');
  for (let x = 8; x < W; x += 16) for (let y = 5; y < H - 14; y += 9) b.set(x, y, '#d9826a');
  b.rect(0, H - 12, W, 12, P.wood1);
  b.hline(0, W - 1, H - 12, P.wood3);
  for (let x = 0; x < W; x += 10) b.vline(x, H - 11, H - 1, P.wood2);
  b.rect(0, 0, W, 2, P.woodDark);
  // window with sill (the pot sits on this sill)
  const wx = 112;
  const wy = 6;
  b.rect(wx, wy, 28, 20, P.wood2);
  b.rect(wx + 2, wy + 2, 24, 16, night ? '#2b3a66' : '#9fd3ee');
  if (night) {
    [[4, 4], [15, 7], [20, 3], [9, 11]].forEach(([x, y]) => b.set(wx + 2 + x, wy + 2 + y, '#fff6c8'));
    b.ellipse(wx + 17, wy + 8, 5, 5, '#f3e3b5');
  } else {
    b.ellipse(wx + 2, wy + 11, 10, 8, '#7cb356');
    b.ellipse(wx + 10, wy + 12, 14, 7, '#6aa24a');
    b.rect(wx + 5, wy + 4, 5, 2, P.white);
  }
  b.vline(wx + 13, wy + 2, wy + 17, P.wood2);
  b.hline(wx + 2, wx + 25, wy + 9, P.wood2);
  b.rect(wx - 2, wy + 20, 32, 3, P.wood3);
  // a framed picture of a sweet gum leaf
  b.rect(64, 7, 16, 14, P.wood2);
  b.rect(66, 9, 12, 10, P.paper);
  b.ellipse(68, 10, 8, 8, '#c9483f');
  b.vline(72, 14, 18, P.woodDark);
  return b.toCanvas();
}

export function buildRoomScene(): WorldScene {
  const map = buildRoomMap();
  const scene = new THREE.Scene();
  const lighting = new Lighting();
  scene.background = new THREE.Color('#1e1622');
  scene.add(groundMesh(lighting, map));

  // Back wall (a standing plane across the top of the room).
  const dayTex = pixelTexture(paintBackWall(false));
  const nightTex = pixelTexture(paintBackWall(true));
  const wallMat = lighting.add(new THREE.MeshBasicMaterial({ map: dayTex }));
  const wallGeo = new THREE.PlaneGeometry(10, 2.5 * K);
  wallGeo.translate(0, (2.5 * K) / 2, 0);
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(5, 0, 2 * K);
  scene.add(wall);

  const add = (kind: Parameters<typeof paintFurniture>[0], x: number, y: number, lift = 0) => {
    const m = billboard(lighting, paintFurniture(kind).toCanvas(), x, y, { lift, name: kind });
    scene.add(m);
    return m;
  };
  add('bed', 2, 3.95);
  add('wardrobe', 4.5, 2.95);
  add('shelf', 6.5, 2.95);
  add('desk', 8, 2.95);
  add('lampdesk', 8.85, 2.96, 22 / PX);
  add('plantstand', 1.5, 7.8);
  // Doormat
  const mat = new PixelBuffer(32, 10);
  mat.rect(1, 1, 30, 8, '#8a5a3a');
  mat.rect(3, 3, 26, 4, '#a4553d');
  const matGeo = new THREE.PlaneGeometry(2, (10 / PX) * K);
  matGeo.rotateX(-Math.PI / 2);
  const doormat = new THREE.Mesh(matGeo, lighting.add(new THREE.MeshBasicMaterial({ map: pixelTexture(mat.toCanvas()), alphaTest: 0.5 })));
  doormat.position.set(5, 0.01, 8.4 * K);
  scene.add(doormat);

  // The seed pot on the windowsill (appears after the practice quest).
  const pot = billboard(lighting, paintSprout().toCanvas(), 8.3, 2.03, { lift: 11 / PX, name: 'pot' });
  pot.visible = false;
  scene.add(pot);

  // A warm desk-lamp glow at night.
  scene.add(glowSprite(lighting, 40, '#ffd88a', 8.85, 3.0, 1.6, 0.55));

  return {
    id: 'room',
    map,
    scene,
    grid: new CollisionGrid(map),
    lighting,
    interior: true,
    update: (_dt, _t, night) => {
      const want = night > 0.5 ? nightTex : dayTex;
      if (wallMat.map !== want) {
        wallMat.map = want;
        wallMat.needsUpdate = true;
      }
    },
    setPotPlanted: (planted) => {
      pot.visible = planted;
    },
  };
}

// ------------------------------------------------------------ schoolhouse

function paintSchoolWall(night: boolean): HTMLCanvasElement {
  const W = 224;
  const H = 40;
  const b = new PixelBuffer(W, H);
  b.rect(0, 0, W, H, '#e8dcc2');
  for (let x = 6; x < W; x += 12) b.vline(x, 0, H - 13, '#dccfb2');
  b.rect(0, H - 12, W, 12, P.wood2);
  b.hline(0, W - 1, H - 12, P.wood3);
  for (let x = 0; x < W; x += 12) b.vline(x, H - 11, H - 1, P.wood1);
  b.rect(0, 0, W, 2, P.woodDark);
  // chalkboard with a chalk timeline (dots on a line)
  const cx = 72;
  b.rect(cx, 5, 80, 22, P.wood2);
  b.rect(cx + 2, 7, 76, 18, '#2f5a45');
  b.hline(cx + 8, cx + 70, 18, '#e8f0e8');
  for (let i = 0; i < 7; i++) {
    const x = cx + 10 + i * 10;
    b.rect(x, 16, 3, 5, '#e8f0e8');
    b.hline(x - 1, x + 3, 12 - (i % 2) * 2, '#cfe0cf');
  }
  b.rect(cx + 30, 26, 20, 2, P.wood3); // chalk ledge
  b.set(cx + 34, 25, P.white);
  // windows either side
  for (const wx of [18, 176]) {
    b.rect(wx, 6, 28, 20, P.wood2);
    b.rect(wx + 2, 8, 24, 16, night ? '#2b3a66' : '#9fd3ee');
    if (night) b.set(wx + 8, 11, '#fff6c8');
    else b.ellipse(wx + 4, 16, 12, 8, '#7cb356');
    b.vline(wx + 13, 8, 23, P.wood2);
    b.hline(wx + 2, wx + 25, 15, P.wood2);
  }
  // clock
  b.ellipse(158, 6, 10, 10, P.white);
  b.set(163, 9, P.outline);
  b.set(163, 10, P.outline);
  b.set(164, 11, P.outline);
  return b.toCanvas();
}

export function buildSchoolScene(): WorldScene {
  const map = buildSchoolMap();
  const scene = new THREE.Scene();
  const lighting = new Lighting();
  scene.background = new THREE.Color('#1e1622');
  scene.add(groundMesh(lighting, map));
  const dayTex = pixelTexture(paintSchoolWall(false));
  const nightTex = pixelTexture(paintSchoolWall(true));
  const wallMat = lighting.add(new THREE.MeshBasicMaterial({ map: dayTex }));
  const wallGeo = new THREE.PlaneGeometry(14, 2.5 * K);
  wallGeo.translate(0, (2.5 * K) / 2, 0);
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(7, 0, 2 * K);
  scene.add(wall);

  const desk = paintSchool('desk').toCanvas();
  for (const [x, y] of [
    [4, 4.95],
    [10, 4.95],
    [4, 6.95],
    [10, 6.95],
  ])
    scene.add(billboard(lighting, desk, x, y, { name: 'desk' }));
  SCHOOL_EASELS.forEach(([x, y], i) => scene.add(billboard(lighting, easelWithPicture(i), x + 0.5, y + 0.8, { name: 'easel' })));
  scene.add(billboard(lighting, paintSchool('globe').toCanvas(), 12.5, 7.8, { name: 'globe' }));
  scene.add(glowSprite(lighting, 48, '#ffd88a', 7, 3.0, 1.9, 0.35));

  return {
    id: 'school',
    map,
    scene,
    grid: new CollisionGrid(map),
    lighting,
    interior: true,
    update: (_dt, _t, night) => {
      const want = night > 0.5 ? nightTex : dayTex;
      if (wallMat.map !== want) {
        wallMat.map = want;
        wallMat.needsUpdate = true;
      }
    },
  };
}

/**
 * An easel showing a tiny copy of its own storybook painting, so each
 * display looks different from across the room. The painting is shrunk in
 * two steps, which averages it into flat 14x11 pixels.
 */
function easelWithPicture(i: number): HTMLCanvasElement {
  const cv = paintSchool('easel', i).toCanvas();
  const art = SCHOOL_EASEL_ART[i];
  if (!art) return cv;
  const half = document.createElement('canvas');
  half.width = 28;
  half.height = 22;
  const hg = half.getContext('2d')!;
  hg.imageSmoothingEnabled = true;
  hg.imageSmoothingQuality = 'high';
  hg.drawImage(paintingCanvas(art), 0, 0, 28, 22);
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = true;
  g.drawImage(half, 3, 4, 14, 11);
  return cv;
}
