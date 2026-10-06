import * as THREE from 'three';
import { K } from '../kit/render/pixelRenderer';
import { glowCanvas, pixelTexture, type Lighting } from '../kit/world/sceneKit';

/**
 * The kit's 45-degree pixel camera with one change for the new worlds: the
 * number of pixels per tile (`px`) is a setting instead of a fixed 16.
 * Sunny Town keeps 16; a richer world can use 24 or 32. The whole-number
 * scale is picked so the view keeps roughly the same number of tiles across
 * (14-28), whatever `px` is. (W1 moves this into the kit itself.)
 */
export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly camera: THREE.OrthographicCamera;
  readonly canvas: HTMLCanvasElement;
  internalW = 320;
  internalH = 180;
  scale = 1;
  private offsetX = 0;
  private offsetY = 0;
  private mapW = 40;
  private mapH = 30;
  readonly target = new THREE.Vector2(0, 0);

  constructor(
    private readonly host: HTMLElement,
    readonly px: number,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.canvas = this.renderer.domElement;
    this.canvas.className = 'game-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(this.canvas);
    this.camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 400);
    this.resize();
  }

  setBounds(w: number, h: number): void {
    this.mapW = w;
    this.mapH = h;
  }

  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const cssW = this.host.clientWidth || window.innerWidth;
    const cssH = this.host.clientHeight || window.innerHeight;
    const devW = Math.round(cssW * dpr);
    const devH = Math.round(cssH * dpr);
    const k = this.px / 16;
    let s = Math.max(1, Math.round(Math.min(devW / (220 * k), devH / (250 * k))));
    // Never show more than 28 tiles across: with fine pixels a laptop would
    // otherwise get a tiny, far-away view.
    while (devW / s / this.px > 28) s++;
    this.scale = s;
    const even = (n: number) => n + (n % 2);
    this.internalW = even(Math.ceil(devW / s));
    this.internalH = even(Math.ceil(devH / s));
    this.renderer.setSize(this.internalW, this.internalH, false);
    const w = (this.internalW * s) / dpr;
    const h = (this.internalH * s) / dpr;
    this.offsetX = Math.floor((cssW - w) / 2);
    this.offsetY = Math.floor((cssH - h) / 2);
    Object.assign(this.canvas.style, { width: `${w}px`, height: `${h}px`, left: `${this.offsetX}px`, top: `${this.offsetY}px` });
    const vw = this.internalW / this.px;
    const vh = this.internalH / this.px;
    this.camera.left = -vw / 2;
    this.camera.right = vw / 2;
    this.camera.top = vh / 2;
    this.camera.bottom = -vh / 2;
    this.camera.updateProjectionMatrix();
    this.apply();
  }

  get viewTiles(): { w: number; h: number } {
    return { w: this.internalW / this.px, h: this.internalH / this.px };
  }

  /** Look at a tile; `keepInside` keeps the view inside the map (off for showing what is above it). */
  lookAt(tx: number, ty: number, keepInside = true): void {
    if (!keepInside) {
      this.target.set(tx, ty);
      this.apply();
      return;
    }
    const { w, h } = this.viewTiles;
    const clamp = (v: number, size: number, view: number) => (view >= size ? size / 2 : Math.min(size - view / 2, Math.max(view / 2, v)));
    this.target.set(clamp(tx, this.mapW, w), clamp(ty, this.mapH, h));
    this.apply();
  }

  private apply(): void {
    const sx = Math.round(this.target.x * this.px) / this.px;
    const sy = Math.round(this.target.y * this.px) / this.px;
    const d = 100;
    this.camera.position.set(sx, d * Math.SQRT1_2, sy * K + d * Math.SQRT1_2);
    this.camera.lookAt(sx, 0, sy * K);
    this.camera.updateMatrixWorld();
  }

  render(scene: THREE.Scene): void {
    this.renderer.render(scene, this.camera);
  }
}

/** A standing sprite at true pixel size for this world's `px`. */
export function billboard(lighting: Lighting | null, px: number, canvas: HTMLCanvasElement, x: number, y: number, lift = 0): THREE.Mesh {
  const w = canvas.width / px;
  const h = (canvas.height / px) * K;
  const geo = new THREE.PlaneGeometry(w, h);
  geo.translate(0, h / 2, 0);
  const mat = new THREE.MeshBasicMaterial({ map: pixelTexture(canvas), alphaTest: 0.5 });
  if (lighting) lighting.add(mat);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, lift * K, y * K);
  return mesh;
}

/** A flat piece of ground (a canvas laid on the floor), `x0, y0` is its top-left tile. */
export function groundPiece(lighting: Lighting, px: number, canvas: HTMLCanvasElement, x0: number, y0: number): THREE.Mesh {
  const w = canvas.width / px;
  const h = canvas.height / px;
  const geo = new THREE.PlaneGeometry(w, h * K);
  geo.rotateX(-Math.PI / 2);
  const mat = lighting.add(new THREE.MeshBasicMaterial({ map: pixelTexture(canvas), alphaTest: 0.5 }));
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x0 + w / 2, 0.01, (y0 + h / 2) * K);
  return m;
}

/** A soft glow that faces the camera and fades in after dark. */
export function glow(lighting: Lighting, px: number, sizePx: number, color: string, x: number, y: number, lift: number, max = 0.8): THREE.Mesh {
  const cv = glowCanvas(sizePx, color);
  const geo = new THREE.PlaneGeometry(sizePx / px, sizePx / px);
  const mat = new THREE.MeshBasicMaterial({ map: pixelTexture(cv), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  lighting.addGlow(mat, max);
  const m = new THREE.Mesh(geo, mat);
  m.rotation.x = -Math.PI / 4;
  m.position.set(x, lift * K, y * K + 0.4);
  m.renderOrder = 5;
  return m;
}

/** A pool of light on the floor. */
export function lightPool(lighting: Lighting, px: number, x: number, y: number, radiusTiles: number, color: string, max = 0.35): THREE.Mesh {
  const size = Math.round(radiusTiles * 2 * px);
  const cv = glowCanvas(size, color);
  const geo = new THREE.PlaneGeometry(radiusTiles * 2, radiusTiles * 2 * K);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ map: pixelTexture(cv), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  lighting.addGlow(mat, max);
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, 0.02, y * K);
  m.renderOrder = 1;
  return m;
}

/** A flat oval shadow under a standing thing, in this world's pixel size. */
export function shadow(px: number, widthTiles: number): THREE.Mesh {
  const w = Math.round(widthTiles * px);
  const hgt = Math.max(4, Math.round(w / 2.4));
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = hgt;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = 'rgba(20, 14, 40, 0.32)';
  for (let y = 0; y < hgt; y++)
    for (let x = 0; x < w; x++) {
      const dx = (x + 0.5 - w / 2) / (w / 2);
      const dy = (y + 0.5 - hgt / 2) / (hgt / 2);
      if (dx * dx + dy * dy <= 1) ctx.fillRect(x, y, 1, 1);
    }
  const geo = new THREE.PlaneGeometry(widthTiles, (hgt / px) * K);
  geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: pixelTexture(cv), transparent: true, depthWrite: false }));
  m.renderOrder = 2;
  return m;
}
