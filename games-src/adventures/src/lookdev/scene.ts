import * as THREE from 'three';
import { K } from '../kit/render/pixelRenderer';
import { Lighting, pixelTexture } from '../kit/world/sceneKit';
import { Talk, type Speaker } from '../kit/ui/talk';
import { h } from '../kit/ui/dom';
import type { Expression } from '../kit/art/portraits';
import { Stage, shadow } from './stage';
import { buildStar } from './worlds/starScene';
import { buildAncient } from './worlds/ancientScene';
import { castFor, type Level } from './cast';
import { currentToken, pageNav } from './nav';

export type TimeOfDay = 'day' | 'evening';

/** What a world's test scene gives back to the page. */
export interface WorldScene {
  name: string;
  map: { w: number; h: number };
  /** Where the camera looks (x), and the lowest row that must stay in view (the characters' feet). */
  focus: { x: number; feet: number; top: number };
  clear: string;
  tint: Record<TimeOfDay, [number, number, number]>;
  /** Called every frame; `t` is seconds since the start. */
  update(t: number, camX: number): void;
  /** The talk-box line used in the screenshots. */
  line: string;
  speakerName: string;
  speakerRole: string;
}

export interface SceneParts {
  scene: THREE.Scene;
  lighting: Lighting;
  px: number;
  level: Level;
  time: TimeOfDay;
}

/** A character standing in the scene, with an idle blink. */
export class Figure {
  readonly mesh: THREE.Mesh;
  private readonly tex: THREE.CanvasTexture[];
  private readonly mat: THREE.MeshBasicMaterial;

  constructor(parts: SceneParts, frames: HTMLCanvasElement[], x: number, y: number) {
    const { px, lighting, scene } = parts;
    this.tex = frames.map((c) => pixelTexture(c));
    const w = frames[0].width / px;
    const hgt = (frames[0].height / px) * K;
    const geo = new THREE.PlaneGeometry(w, hgt);
    geo.translate(0, hgt / 2, 0);
    this.mat = lighting.add(new THREE.MeshBasicMaterial({ map: this.tex[0], alphaTest: 0.5 }));
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.position.set(Math.round(x * px) / px, 0, y * K);
    const sh = shadow(px, Math.min(1.1, w * 0.85));
    sh.position.set(this.mesh.position.x, 0.015, y * K);
    scene.add(this.mesh, sh);
  }

  frame(i: number): void {
    const t = this.tex[i % this.tex.length];
    if (this.mat.map !== t) {
      this.mat.map = t;
      this.mat.needsUpdate = true;
    }
  }
}

export function showScene(host: HTMLElement, q: URLSearchParams): void {
  const worldId = q.get('world') === 'ancient' ? 'ancient' : 'star';
  const level = (['a', 'b', 'c'].includes(q.get('level') ?? '') ? q.get('level') : 'b') as Level;
  const time: TimeOfDay = q.get('time') === 'evening' ? 'evening' : 'day';
  const px = { a: 16, b: 24, c: 32 }[level];
  document.body.classList.add(`world-${worldId}`);

  const stage = new Stage(host, px);
  const parts: SceneParts = { scene: new THREE.Scene(), lighting: new Lighting(), px, level, time };
  const cast = castFor(worldId, level);
  const world = worldId === 'star' ? buildStar(parts, cast) : buildAncient(parts, cast);
  stage.renderer.setClearColor(new THREE.Color(world.clear), 1);
  parts.lighting.set(world.tint[time], time === 'evening' ? 1 : 0);

  // Put the camera where the characters and the back of the world both show.
  const place = () => {
    const { w: vw, h: vh } = stage.viewTiles;
    const cy = Math.min(Math.max(world.focus.top + vh / 2, world.focus.feet + 1.4 - vh / 2), world.map.h - vh / 2);
    const cx = Math.min(Math.max(world.focus.x, vw / 2), world.map.w - vw / 2);
    // not clamped to the map: the test scenes also show what stands above row 0 (the wall, the sky)
    stage.lookAt(vw >= world.map.w ? world.map.w / 2 : cx, cy, false);
  };
  stage.setBounds(world.map.w, world.map.h);
  place();
  window.addEventListener('resize', () => {
    stage.resize();
    place();
  });

  // A label so screenshots say what they show.
  const label = h(
    'div',
    { class: 'ld-label panel' },
    h('strong', { text: `${world.name} test scene` }),
    h('span', { text: `Level (${level}): ${px} pixels per tile · ${time === 'day' ? (worldId === 'star' ? 'day shift' : 'day') : worldId === 'star' ? 'night shift' : 'dusk'}` }),
  );
  label.append(pageNav(currentToken()));
  host.appendChild(label);

  if (q.get('talk')) {
    const talk = new Talk(host);
    const who: Speaker = {
      name: world.speakerName,
      role: world.speakerRole,
      portrait: (e: Expression) => cast.portrait(e),
      voice: 210,
    };
    void talk.say(who, world.line, 'smile');
  }

  const t0 = performance.now();
  const tick = () => {
    const t = (performance.now() - t0) / 1000;
    world.update(t, stage.target.x);
    stage.render(parts.scene);
    requestAnimationFrame(tick);
  };
  tick();
  Object.assign(window, { __lookdev: { stage, world, level, time } });
}
