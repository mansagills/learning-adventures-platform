import * as THREE from 'three';
import { Lighting } from '../kit/world/sceneKit';
import { Talk, type Speaker } from '../kit/ui/talk';
import { h } from '../kit/ui/dom';
import type { Expression } from '../kit/art/portraits';
import { audio } from '../kit/systems/audio';
import { Figure, SETTINGS, Stage, WORLD_STYLES, settingById, type SceneCtx, type TimeOfDay } from '../kit/worlds';
import '../kit/worlds/worlds.css';
import { TEST_HOSTS, castFor, type Level } from './cast';
import { currentToken, pageNav } from './nav';

/**
 * A world setting from the kit (src/kit/worlds), shown with the player and a
 * test host standing in it. This is exactly what a game gets from the theme
 * layer; the page only adds the camera placement, a label and the talk box.
 */
export function showScene(host: HTMLElement, q: URLSearchParams): void {
  const settingId = SETTINGS.some((s) => s.id === q.get('setting')) ? q.get('setting')! : 'station-deck';
  const setting = settingById(settingId);
  const style = WORLD_STYLES[setting.world];
  const level = (['a', 'b', 'c'].includes(q.get('level') ?? '') ? q.get('level') : 'b') as Level;
  const time: TimeOfDay = q.get('time') === 'evening' ? 'evening' : 'day';
  // The world's own px (24) is level (b); levels (a) and (c) are kept for comparison.
  const px = { a: 16, b: style.px, c: 32 }[level];
  document.body.classList.add(style.panelClass);

  const stage = new Stage(host, px);
  const ctx: SceneCtx = { scene: new THREE.Scene(), lighting: new Lighting(), px, time };
  const built = setting.build(ctx);
  stage.renderer.setClearColor(new THREE.Color(built.clear), 1);
  ctx.lighting.set(style.tint[time], time === 'evening' ? 1 : 0);

  const cast = castFor(settingId, level);
  const player = new Figure(ctx, cast.player, built.spots.player.x, built.spots.player.y);
  const hostFig = new Figure(ctx, cast.host, built.spots.host.x, built.spots.host.y);

  // Put the camera where the characters and the back of the world both show.
  const place = () => {
    const { w: vw, h: vh } = stage.viewTiles;
    const { map, focus } = built;
    const cy = Math.min(Math.max(focus.top + vh / 2, focus.feet + 1.4 - vh / 2), map.h - vh / 2);
    const cx = Math.min(Math.max(focus.x, vw / 2), map.w - vw / 2);
    // not clamped to the map: the test scenes also show what stands above row 0 (the wall, the sky)
    stage.lookAt(vw >= map.w ? map.w / 2 : cx, cy, false);
  };
  stage.setBounds(built.map.w, built.map.h);
  place();
  window.addEventListener('resize', () => {
    stage.resize();
    place();
  });

  // A label so screenshots say what they show, links to the other pages, and the world's music.
  const music = h('button', { class: 'btn small ld-music', type: 'button', text: 'Play world music' });
  let playing = false;
  music.addEventListener('click', () => {
    if (!style.music) return;
    audio.addSong(style.id, style.music);
    if (playing) audio.play(null);
    else audio.play(style.id);
    playing = !playing;
    music.textContent = playing ? 'Stop music' : 'Play world music';
  });
  const label = h(
    'div',
    { class: 'ld-label panel' },
    h('strong', { text: `${style.name}: ${setting.name}` }),
    h('span', { text: `${px} pixels per tile · ${style.timeNames[time]}${level === 'b' ? '' : ` · comparison level (${level})`}` }),
  );
  label.append(h('div', { class: 'ld-row' }, pageNav(currentToken() || `${settingId}-${time === 'day' ? 'day' : 'evening-talk'}`, true), style.music ? music : null));
  host.appendChild(label);

  if (q.get('talk')) {
    const test = TEST_HOSTS[settingId];
    const talk = new Talk(host);
    const who: Speaker = { name: test.name, role: test.role, portrait: (e: Expression) => cast.portrait(e), voice: 210 };
    void talk.say(who, test.line, 'smile');
  }

  const t0 = performance.now();
  const tick = () => {
    const t = (performance.now() - t0) / 1000;
    built.update(t, stage.target.x);
    player.frame(t % 3.6 > 3.45 ? 1 : 0);
    hostFig.frame(t % 4.3 > 4.15 ? 1 : 0);
    stage.render(ctx.scene);
    requestAnimationFrame(tick);
  };
  tick();
  Object.assign(window, { __lookdev: { stage, setting, level, time } });
}
