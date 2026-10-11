import * as THREE from 'three';
import { K } from '../../kit/render/pixelRenderer';
import { Lighting, pixelTexture } from '../../kit/world/sceneKit';
import { STAR_STATION, Stage, billboard, glow, lightPool, settingById, swapFrame, type SceneCtx, type SettingScene } from '../../kit/worlds';
import type { Look16 } from '../../kit/worlds/hero16';
import { Walker16 } from '../../kit/worlds/walker';
import { paintBlip, paintParkedShip, paintSupply, type PaintId } from './art';
import type { CrewId } from './world';

/**
 * The finale: the rescued fleet lands at the outpost on the alien planet
 * (the world kit's `alien-planet` setting, built at night with its stars and
 * aurora). The player's ship sits on the landing pad, the supply ships park
 * round it with their lights on, and the crew and Blip gather for the
 * night-shift party. It is a short scene with no walking: the talk box tells
 * the story, then the game goes back to the station deck.
 */
export class LandingScene {
  readonly scene = new THREE.Scene();
  readonly lighting = new Lighting();
  readonly stage: Stage;
  readonly ctx: SceneCtx;
  readonly style = STAR_STATION;
  private setting!: SettingScene;
  private people: Walker16[] = [];
  private blip!: THREE.Mesh;
  private blipTex: THREE.CanvasTexture[] = [];
  private ships: THREE.Mesh[] = [];
  private time = 0;
  reducedMotion = false;

  constructor(host: HTMLElement) {
    this.stage = new Stage(host, this.style.px);
    this.stage.maxTilesTall = 22;
    this.stage.resize();
    this.ctx = { scene: this.scene, lighting: this.lighting, px: this.style.px, time: 'evening' };
    this.setVisible(false);
  }

  setVisible(on: boolean): void {
    this.stage.canvas.hidden = !on;
  }

  build(player: Look16, crew: Record<CrewId, Look16>, paint: PaintId, fleet: number): void {
    const T = this.style.px;
    this.setting = settingById('alien-planet').build(this.ctx);
    this.stage.setBounds(this.setting.map.w, this.setting.map.h);
    this.stage.renderer.setClearColor(new THREE.Color(this.setting.clear), 1);
    // the night shift: the world's evening light, with every glow on
    this.lighting.set(this.style.tint.evening, 1);
    const add = (m: THREE.Object3D) => {
      this.scene.add(m);
      return m;
    };
    // the player's ship on the landing pad, lit up
    add(billboard(this.lighting, T, paintParkedShip(paint).toCanvas(), 6.5, 15.9));
    add(glow(this.lighting, T, Math.round(T * 2.6), '#5fe3ff', 6.5, 15.9, 0.5, 0.8));
    add(lightPool(this.lighting, T, 6.5, 15.9, 2.4, '#5fe3ff', 0.4));
    // the rescued supply ships, parked in rows with their lights on (one for every ten rescued, up to 18)
    const n = Math.max(6, Math.min(18, Math.floor(fleet / 10)));
    for (let i = 0; i < n; i++) {
      const x = 2.6 + (i % 6) * 1.25 + (Math.floor(i / 6) % 2) * 0.6;
      const y = 18.6 + Math.floor(i / 6) * 1.3;
      const m = billboard(this.lighting, T, paintSupply(true, i % 5).toCanvas(), x, y);
      this.ships.push(m);
      add(m);
      add(glow(this.lighting, T, Math.round(T * 0.9), '#ffcf6a', x, y, 0.2, 0.6));
    }
    // the crew and the player at the party, in front of the outpost
    const spots: Array<[Look16, number, number]> = [
      [crew.ayo, 11.2, 15.4],
      [crew.mei, 9.8, 16.2],
      [crew.rafi, 12.8, 16.4],
      [crew.dot, 14.2, 15.6],
      [crew.sol, 15.4, 16.6],
      [player, 11.4, 17.2],
    ];
    for (const [look, x, y] of spots) {
      const w = new Walker16(this.ctx, look, x, y, 'down');
      this.people.push(w);
      add(w.group);
    }
    this.blipTex = [0, 1, 2, 3].map((f) => pixelTexture(paintBlip(f % 2, f >= 2).toCanvas()));
    this.blip = billboard(this.lighting, T, this.blipTex[2].image as HTMLCanvasElement, 13.0, 17.6, 0.6);
    add(this.blip);
    this.resize();
  }

  resize(): void {
    this.stage.resize();
    const { w: vw } = this.stage.viewTiles;
    const x = vw >= this.setting.map.w ? this.setting.map.w / 2 : Math.min(this.setting.map.w - vw / 2, Math.max(vw / 2, 10.5));
    this.stage.lookAt(x, 14.6, false);
  }

  update(dt: number): void {
    this.time += dt;
    const t = this.time;
    this.setting.update(t, this.stage.target.x);
    for (const p of this.people) p.update(dt, this.reducedMotion);
    // Blip bounces for joy
    swapFrame(this.blip, this.blipTex[2 + (this.reducedMotion ? 0 : Math.floor(t * 3) % 2)]);
    const px = this.style.px;
    this.blip.position.y = (0.6 + (this.reducedMotion ? 0 : Math.abs(Math.sin(t * 5)) * 0.3)) * K;
    // the parked ships' lights twinkle
    this.ships.forEach((m, i) => (m.position.y = this.reducedMotion ? 0 : (Math.round(Math.sin(t * 2 + i) * 1) / px) * K));
  }

  render(): void {
    this.stage.render(this.scene);
  }
}
