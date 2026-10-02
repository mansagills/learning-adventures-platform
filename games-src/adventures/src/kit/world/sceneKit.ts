import * as THREE from 'three';
import { K, PX } from '../render/pixelRenderer';

/**
 * The reusable scene kit: pixel textures, standing billboards, flat ground
 * pieces, glows and the shared light tint. Every game scene is assembled
 * from these pieces.
 */

export function pixelTexture(source: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(source);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

/** Every world material registers here so day/night can tint them together. */
export class Lighting {
  private readonly tinted = new Set<THREE.MeshBasicMaterial>();
  /** Things that glow after dark (lamp halos, lit windows, fireflies). */
  private readonly nightGlow = new Set<{ mat: THREE.Material & { opacity: number }; max: number }>();
  private readonly tint = new THREE.Color(1, 1, 1);
  night = 0;

  add<T extends THREE.MeshBasicMaterial>(m: T): T {
    this.tinted.add(m);
    m.color.copy(this.tint);
    return m;
  }

  addGlow(mat: THREE.Material & { opacity: number }, max = 1): void {
    this.nightGlow.add({ mat, max });
    mat.opacity = this.night * max;
    mat.visible = this.night > 0.02;
  }

  set(tint: [number, number, number], night: number): void {
    this.tint.setRGB(tint[0], tint[1], tint[2], THREE.SRGBColorSpace);
    this.tinted.forEach((m) => m.color.copy(this.tint));
    this.night = night;
    this.nightGlow.forEach(({ mat, max }) => {
      mat.opacity = night * max;
      mat.visible = night > 0.02;
    });
  }
}

/**
 * A standing sprite. Its bottom-centre sits on the ground at (x, y) in tile
 * coordinates; heights are stretched by K so it shows at true pixel size.
 */
export function billboard(
  lighting: Lighting,
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  opts: { lift?: number; name?: string } = {},
): THREE.Mesh {
  const w = canvas.width / PX;
  const h = (canvas.height / PX) * K;
  const geo = new THREE.PlaneGeometry(w, h);
  geo.translate(0, h / 2, 0);
  const mat = lighting.add(new THREE.MeshBasicMaterial({ map: pixelTexture(canvas), alphaTest: 0.5 }));
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, (opts.lift ?? 0) * K, y * K);
  if (opts.name) mesh.name = opts.name;
  return mesh;
}

/** A soft round glow in a few flat bands (the pixel-art way to draw light). */
export function glowCanvas(size: number, color: string): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext('2d')!;
  const r = size / 2;
  const bands: Array<[number, number]> = [
    [0.3, 0.85],
    [0.55, 0.5],
    [0.8, 0.26],
    [1, 0.1],
  ];
  ctx.fillStyle = color;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x + 0.5 - r, y + 0.5 - r) / r;
      const band = bands.find(([edge]) => d <= edge);
      if (!band) continue;
      ctx.globalAlpha = band[1];
      ctx.fillRect(x, y, 1, 1);
    }
  ctx.globalAlpha = 1;
  return cv;
}

/** A glow that faces the camera and only shows after dark. */
export function glowSprite(
  lighting: Lighting,
  sizePx: number,
  color: string,
  x: number,
  y: number,
  lift: number,
  max = 0.8,
): THREE.Mesh {
  const cv = glowCanvas(sizePx, color);
  const geo = new THREE.PlaneGeometry(sizePx / PX, sizePx / PX);
  const mat = new THREE.MeshBasicMaterial({
    map: pixelTexture(cv),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  lighting.addGlow(mat, max);
  const m = new THREE.Mesh(geo, mat);
  // Face the camera (45 degrees down).
  m.rotation.x = -Math.PI / 4;
  m.position.set(x, lift * K, y * K + 0.02);
  m.renderOrder = 5;
  return m;
}

/** A soft pool of light on the ground under a lamp. */
export function lightPool(lighting: Lighting, x: number, y: number, radiusTiles: number, color: string, max = 0.35): THREE.Mesh {
  const px = Math.round(radiusTiles * 2 * PX);
  const cv = glowCanvas(px, color);
  const geo = new THREE.PlaneGeometry(radiusTiles * 2, radiusTiles * 2 * K);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ map: pixelTexture(cv), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  lighting.addGlow(mat, max);
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, 0.02, y * K);
  m.renderOrder = 1;
  return m;
}

/** Flat blob shadow under a standing thing. */
let shadowTex: THREE.CanvasTexture | null = null;
export function blobShadow(widthTiles: number): THREE.Mesh {
  if (!shadowTex) {
    const cv = document.createElement('canvas');
    cv.width = 16;
    cv.height = 8;
    const ctx = cv.getContext('2d')!;
    ctx.fillStyle = 'rgba(30, 20, 30, 0.3)';
    ctx.fillRect(3, 1, 10, 6);
    ctx.fillRect(1, 2, 14, 4);
    shadowTex = pixelTexture(cv);
  }
  const geo = new THREE.PlaneGeometry(widthTiles, (widthTiles / 2) * K);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  const m = new THREE.Mesh(geo, mat);
  m.renderOrder = 2;
  return m;
}
