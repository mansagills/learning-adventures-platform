import * as THREE from 'three';

/**
 * Pixel-perfect 2.5D rendering.
 *
 * The camera looks down at 45 degrees. World depth (z) and heights (y) are
 * both stretched by K = sqrt(2), which cancels the 45-degree foreshortening:
 * one tile of ground and one tile of wall each come out exactly 16 screen
 * pixels. The scene renders into a small canvas (e.g. 427x240) that the
 * browser scales up by a whole number with nearest-neighbor filtering, so
 * pixels stay square and sharp. UI is HTML on top and stays crisp.
 */

export const K = Math.SQRT2;
export const PX = 16;

export function worldX(tx: number): number {
  return tx;
}
export function worldZ(ty: number): number {
  return ty * K;
}

export class PixelRenderer {
  readonly renderer: THREE.WebGLRenderer;
  readonly camera: THREE.OrthographicCamera;
  readonly canvas: HTMLCanvasElement;
  internalW = 320;
  /** Bigger than 1 shows fewer, larger pixels (a closer camera for action games). */
  zoom = 1;
  internalH = 180;
  scale = 1;
  private cssW = 0;
  private cssH = 0;
  private offsetX = 0;
  private offsetY = 0;
  private mapW = 40;
  private mapH = 30;
  private target = new THREE.Vector2(0, 0);
  private readonly ray = new THREE.Raycaster();
  private readonly groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  constructor(private readonly host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'default' });
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

  /**
   * Pick a whole-number scale so the view shows roughly 14-27 tiles across:
   * large pixels on a phone, a wider town view on a laptop.
   */
  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    this.cssW = this.host.clientWidth || window.innerWidth;
    this.cssH = this.host.clientHeight || window.innerHeight;
    const devW = Math.round(this.cssW * dpr);
    const devH = Math.round(this.cssH * dpr);
    const s = Math.max(1, Math.round(Math.min(devW / 220, devH / 250) * this.zoom));
    this.scale = s;
    // Even sizes keep the camera's center on a whole pixel. With an odd size
    // every texel sits half a pixel off and nearest-neighbor sampling drops
    // whole columns (a 9 painted on a stone could read as a 3).
    const even = (n: number) => n + (n % 2);
    this.internalW = even(Math.ceil(devW / s));
    this.internalH = even(Math.ceil(devH / s));
    this.renderer.setSize(this.internalW, this.internalH, false);
    const w = (this.internalW * s) / dpr;
    const h = (this.internalH * s) / dpr;
    this.offsetX = Math.floor((this.cssW - w) / 2);
    this.offsetY = Math.floor((this.cssH - h) / 2);
    Object.assign(this.canvas.style, {
      width: `${w}px`,
      height: `${h}px`,
      left: `${this.offsetX}px`,
      top: `${this.offsetY}px`,
    });
    const vw = this.internalW / PX;
    const vh = this.internalH / PX;
    this.camera.left = -vw / 2;
    this.camera.right = vw / 2;
    this.camera.top = vh / 2;
    this.camera.bottom = -vh / 2;
    this.camera.updateProjectionMatrix();
    this.applyCamera();
  }

  /** View size in tiles. */
  get viewTiles(): { w: number; h: number } {
    return { w: this.internalW / PX, h: this.internalH / PX };
  }

  /** Follow a point (tile coordinates), clamped to the map and snapped to whole pixels. */
  lookAt(tx: number, ty: number, smooth = 0): void {
    const { w, h } = this.viewTiles;
    const clamp = (v: number, size: number, view: number) => (view >= size ? size / 2 : Math.min(size - view / 2, Math.max(view / 2, v)));
    const cx = clamp(tx, this.mapW, w);
    const cy = clamp(ty, this.mapH, h);
    if (smooth > 0) {
      this.target.x += (cx - this.target.x) * smooth;
      this.target.y += (cy - this.target.y) * smooth;
    } else this.target.set(cx, cy);
    this.applyCamera();
  }

  private applyCamera(): void {
    const sx = Math.round(this.target.x * PX) / PX;
    const sy = Math.round(this.target.y * PX) / PX;
    const x = worldX(sx);
    const z = worldZ(sy);
    const d = 100;
    this.camera.position.set(x, d * Math.SQRT1_2, z + d * Math.SQRT1_2);
    this.camera.lookAt(x, 0, z);
    this.camera.updateMatrixWorld();
  }

  render(scene: THREE.Scene): void {
    this.renderer.render(scene, this.camera);
  }

  /** World position → CSS pixel position inside the host element. */
  project(v: THREE.Vector3): { x: number; y: number; visible: boolean } {
    const p = v.clone().project(this.camera);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const x = this.offsetX + ((p.x + 1) / 2) * w;
    const y = this.offsetY + ((1 - p.y) / 2) * h;
    return { x, y, visible: x >= 0 && y >= 0 && x <= this.cssW && y <= this.cssH };
  }

  /** CSS pixel position (host-relative) → ground tile coordinates. */
  screenToTile(cx: number, cy: number): { x: number; y: number } | null {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const ndc = new THREE.Vector2(((cx - this.offsetX) / w) * 2 - 1, -(((cy - this.offsetY) / h) * 2 - 1));
    this.ray.setFromCamera(ndc, this.camera);
    const hit = new THREE.Vector3();
    if (!this.ray.ray.intersectPlane(this.groundPlane, hit)) return null;
    return { x: hit.x, y: hit.z / K };
  }

  get hostSize(): { w: number; h: number } {
    return { w: this.cssW, h: this.cssH };
  }
}
