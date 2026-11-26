import * as THREE from 'three';
import { settings } from '../systems/settings';

/**
 * The low-poly 3D renderer: a lit, shadowed Three.js scene with a
 * city-builder camera (tilted perspective view that pans, zooms and turns in
 * 90-degree steps). It is the modern-looking sibling of `pixelRenderer.ts`
 * (which the pixel-art games keep using) and was made for Kingdom Builders:
 * Africa.
 *
 * Controls: drag to pan, right-drag or Q/E to turn, wheel or pinch to zoom,
 * WASD or the arrow keys to pan. Reduced motion makes turns and zooms snap.
 */

export interface Lighting {
  sky: number;
  fog: number;
  /** Sun color and strength. */
  sun: number;
  sunIntensity: number;
  /** Hemisphere light: sky and ground colors and strength. */
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  /** Sun direction: angle around the map (degrees) and height above the horizon (degrees). */
  sunAzimuth: number;
  sunElevation: number;
  exposure?: number;
}

export const LIGHTING = {
  day: {
    sky: 0xbfe3f2,
    fog: 0xd9ecef,
    sun: 0xfff1d6,
    sunIntensity: 2.6,
    hemiSky: 0xcfe8ff,
    hemiGround: 0xc9a46a,
    hemiIntensity: 1.25,
    sunAzimuth: 35,
    sunElevation: 52,
  },
  evening: {
    sky: 0xf0a36f,
    fog: 0xe8a77c,
    sun: 0xffa060,
    sunIntensity: 2.1,
    hemiSky: 0x8a86c9,
    hemiGround: 0x7a4a30,
    hemiIntensity: 0.9,
    sunAzimuth: 300,
    sunElevation: 14,
    exposure: 1.05,
  },
} satisfies Record<string, Lighting>;

export interface CameraView {
  /** Point on the ground the camera looks at. */
  target: THREE.Vector3;
  /** Distance from the target. */
  distance: number;
  /** Angle around the target (degrees); turns go in 90-degree steps. */
  yaw: number;
  /** Tilt down from the horizon (degrees). */
  pitch: number;
}

export interface LowpolyOptions {
  lighting?: Lighting;
  view?: Partial<CameraView>;
  minDistance?: number;
  maxDistance?: number;
  /** Half the width and depth of the area the camera target may move in. */
  bounds?: number;
  /** Size of the area the sun's shadows cover. */
  shadowSize?: number;
  /** Turn off shadows and antialiasing (the low-detail mode). */
  lowDetail?: boolean;
}

export class LowpolyRenderer {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(32, 1, 0.5, 600);
  readonly sun = new THREE.DirectionalLight();
  readonly hemi = new THREE.HemisphereLight();
  /** Where the camera is heading; `view` eases toward it. */
  readonly goal: CameraView;
  readonly view: CameraView;
  private readonly opts: Required<Omit<LowpolyOptions, 'lighting' | 'view'>>;
  private readonly updaters: Array<(dt: number, t: number) => void> = [];
  private readonly clock = new THREE.Clock();
  private readonly keys = new Set<string>();
  private raf = 0;
  private elapsed = 0;

  constructor(
    readonly host: HTMLElement,
    options: LowpolyOptions = {},
  ) {
    this.opts = {
      minDistance: options.minDistance ?? 14,
      maxDistance: options.maxDistance ?? 70,
      bounds: options.bounds ?? 24,
      shadowSize: options.shadowSize ?? 40,
      lowDetail: options.lowDetail ?? false,
    };
    this.renderer = new THREE.WebGLRenderer({ antialias: !this.opts.lowDetail, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = !this.opts.lowDetail;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.classList.add('lp-canvas');
    this.renderer.domElement.setAttribute('tabindex', '0');
    host.appendChild(this.renderer.domElement);

    const v: CameraView = {
      target: options.view?.target?.clone() ?? new THREE.Vector3(),
      distance: options.view?.distance ?? 40,
      yaw: options.view?.yaw ?? 45,
      pitch: options.view?.pitch ?? 48,
    };
    this.view = { ...v, target: v.target.clone() };
    this.goal = { ...v, target: v.target.clone() };

    this.sun.castShadow = !this.opts.lowDetail;
    this.sun.shadow.mapSize.set(2048, 2048);
    const s = this.opts.shadowSize;
    Object.assign(this.sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 200 });
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.03;
    this.scene.add(this.sun, this.sun.target, this.hemi);
    this.setLighting(options.lighting ?? LIGHTING.day);

    this.bindInput();
    new ResizeObserver(() => this.resize()).observe(host);
    this.resize();
  }

  setLighting(l: Lighting): void {
    this.scene.background = new THREE.Color(l.sky);
    this.scene.fog = new THREE.Fog(l.fog, 70, 190);
    this.sun.color.set(l.sun);
    this.sun.intensity = l.sunIntensity;
    this.hemi.color.set(l.hemiSky);
    this.hemi.groundColor.set(l.hemiGround);
    this.hemi.intensity = l.hemiIntensity;
    this.renderer.toneMappingExposure = l.exposure ?? 1;
    const az = THREE.MathUtils.degToRad(l.sunAzimuth);
    const el = THREE.MathUtils.degToRad(l.sunElevation);
    this.sun.position.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).multiplyScalar(80);
  }

  /** Run `fn` every frame with the frame time and total time in seconds. */
  onFrame(fn: (dt: number, t: number) => void): void {
    this.updaters.push(fn);
  }

  /** Turn the camera a quarter turn (+1 or -1). */
  turn(dir: 1 | -1): void {
    this.goal.yaw += 90 * dir;
  }

  zoom(factor: number): void {
    this.goal.distance = THREE.MathUtils.clamp(this.goal.distance * factor, this.opts.minDistance, this.opts.maxDistance);
  }

  /** Move the camera target by a screen-space amount (in world units). */
  pan(right: number, forward: number): void {
    const yaw = THREE.MathUtils.degToRad(this.view.yaw);
    const r = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const f = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    this.goal.target.addScaledVector(r, right).addScaledVector(f, forward);
    const b = this.opts.bounds;
    this.goal.target.x = THREE.MathUtils.clamp(this.goal.target.x, -b, b);
    this.goal.target.z = THREE.MathUtils.clamp(this.goal.target.z, -b, b);
  }

  /** The point on the ground (y = `height`) under a screen position, or null. */
  groundAt(clientX: number, clientY: number, height = 0): THREE.Vector3 | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const hit = new THREE.Vector3();
    return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -height), hit) ? hit : null;
  }

  /** Screen position (CSS pixels in the host) of a world point, for labels. */
  toScreen(p: THREE.Vector3): { x: number; y: number; visible: boolean } {
    const v = p.clone().project(this.camera);
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, visible: v.z < 1 };
  }

  start(): void {
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.frame();
    };
    this.clock.start();
    loop();
  }

  stop(): void {
    cancelAnimationFrame(this.raf);
  }

  /** Draw one frame now (also used by tests and screenshots). */
  frame(): void {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    this.elapsed += dt;
    this.keyPan(dt);
    this.ease(dt);
    for (const u of this.updaters) u(dt, this.elapsed);
    this.renderer.render(this.scene, this.camera);
  }

  private ease(dt: number): void {
    const snap = settings.reducedMotion;
    const k = snap ? 1 : 1 - Math.exp(-dt * 9);
    const v = this.view;
    const g = this.goal;
    v.target.lerp(g.target, k);
    v.distance += (g.distance - v.distance) * k;
    v.yaw += (g.yaw - v.yaw) * k;
    v.pitch += (g.pitch - v.pitch) * k;
    const yaw = THREE.MathUtils.degToRad(v.yaw);
    const pitch = THREE.MathUtils.degToRad(v.pitch);
    const off = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(v.distance);
    this.camera.position.copy(v.target).add(off);
    this.camera.lookAt(v.target);
    // Keep the shadow area centred on what the player is looking at.
    const sunDir = this.sun.position.clone().sub(this.sun.target.position).normalize();
    this.sun.target.position.copy(v.target);
    this.sun.position.copy(v.target).addScaledVector(sunDir, 80);
  }

  private keyPan(dt: number): void {
    const speed = this.view.distance * 0.9 * dt;
    let r = 0;
    let f = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) r -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) r += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) f += 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) f -= 1;
    if (r || f) this.pan(r * speed, f * speed);
  }

  private resize(): void {
    const w = Math.max(1, this.host.clientWidth);
    const h = Math.max(1, this.host.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // On a tall phone screen, widen the view so the map still fits.
    this.camera.fov = w < h ? 46 : 32;
    this.camera.updateProjectionMatrix();
  }

  private bindInput(): void {
    const el = this.renderer.domElement;
    const pointers = new Map<number, { x: number; y: number; button: number }>();
    let pinch = 0;
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    el.addEventListener('pointerdown', (e) => {
      el.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, button: e.button });
      pinch = 0;
    });
    el.addEventListener('pointermove', (e) => {
      const p = pointers.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      if (pointers.size === 2) {
        p.x = e.clientX;
        p.y = e.clientY;
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) this.zoom(pinch / d);
        pinch = d;
        return;
      }
      p.x = e.clientX;
      p.y = e.clientY;
      if (p.button === 2) {
        this.goal.yaw -= dx * 0.3;
        return;
      }
      const scale = (this.view.distance / el.clientHeight) * 1.1;
      this.pan(-dx * scale, dy * scale);
    });
    const up = (e: PointerEvent) => {
      const p = pointers.get(e.pointerId);
      pointers.delete(e.pointerId);
      // After a free right-drag turn, settle on the nearest quarter turn.
      if (p?.button === 2) this.goal.yaw = Math.round(this.goal.yaw / 90) * 90 + 45;
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12);
      },
      { passive: false },
    );
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'q') this.turn(-1);
      else if (k === 'e') this.turn(1);
      else if (k === '+' || k === '=') this.zoom(1 / 1.15);
      else if (k === '-') this.zoom(1.15);
      else this.keys.add(k);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => this.keys.clear());
  }
}
