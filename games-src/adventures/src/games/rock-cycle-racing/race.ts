import * as THREE from 'three';
import { ChaseCam } from '../../kit/race/chaseCam';
import { DEFAULT_ROLL, newRoll, stepRoll, type RollInput } from '../../kit/race/roll';
import { type Lighting, LowpolyRenderer } from '../../kit/render/lowpolyRenderer';
import { settings, touchControlsVisible } from '../../kit/systems/settings';
import { speak, stopSpeaking } from '../../kit/systems/speech';
import { h } from '../../kit/ui/dom';
import { portrait } from '../../kit/world/lowpoly/portrait';
import { CAST, CLOCK_STAGES, FORK_SIGNS, HOST_LINES, ORDER_CARDS, ROCK_FORMS, UI, VENT_QUESTION, type OrderCard } from './content';
import type { Rock } from './cycle';
import { iconEl } from './icons';
import { anaQuispe, blaze, racer, steamPuff } from './models';
import { buildWorld } from './scene';
import { buildTestTrack } from './tracks';

/**
 * The test race: roll up the vent, answer the question at the gate, pick a
 * way at the fork, and finish as granite or basalt. The rival, Blaze,
 * always takes the hottest way (the eruption).
 */

export interface RaceOptions {
  order: 'granite' | 'basalt';
  lighting: Lighting;
  low?: boolean;
  /** Higher, smoother camera (also on with reduced motion). */
  steady?: boolean;
}

export interface RaceDebug {
  ready: boolean;
  phase: Phase;
  path: string;
  s: number;
  x: number;
  speed: number;
  /** Distance to the fork while on the vent (null after it). */
  forkAhead: number | null;
  /** Across-the-road places of each fork choice, for a test player. */
  forkTargets: Record<string, number>;
  finished: Rock | null;
  orderMet: boolean | null;
  place: number | null;
  stars: number;
  fps: number;
  /** Answer the open question (0, 1 or 2), for a test player. */
  answer(i: number): void;
}

type Phase = 'intro' | 'race' | 'question' | 'finish';

declare global {
  interface Window {
    __rcr?: RaceDebug;
  }
}

const DARK_SKY = new THREE.Color(0x140b08);

export function startRace(stage: HTMLElement, ui: HTMLElement, opts: RaceOptions): RaceDebug {
  const lp = new LowpolyRenderer(stage, {
    controls: 'none',
    lighting: opts.lighting,
    lowDetail: opts.low,
    fov: { wide: 60, tall: 74 },
    shadowSize: 28,
  });
  lp.camera.far = 420;
  const track = buildTestTrack();
  const world = buildWorld(lp, track, { low: opts.low });
  const order: OrderCard = ORDER_CARDS.find((o) => o.id === opts.order) ?? ORDER_CARDS[0];
  const steady = !!opts.steady || settings.reducedMotion;
  const cam = new ChaseCam(lp.camera, track.graph, { steady });

  // ── The racers ──
  const me = racer();
  lp.scene.add(me.group);
  const rival = blaze();
  lp.scene.add(rival.group);
  const roll = newRoll(3, 0);
  let path = 'vent';
  let phase: Phase = 'intro';
  let finished: Rock | null = null;
  let place: number | null = null;
  let stars = 0;
  let gateDone = false;
  const boostsUsed = new Set<string>();
  const route = (id: string) => ['vent', id];
  const rivalLen = track.graph.routeLength(route('erupt'));
  const ventLen = track.graph.path('vent').length;
  let rivalFrac = 0;
  let rivalSpin = 0;

  // ── Lighting: dark in the tunnels, bright in the open ──
  const base = { sun: opts.lighting.sunIntensity, hemi: opts.lighting.hemiIntensity, sky: new THREE.Color(opts.lighting.sky), fog: new THREE.Color(opts.lighting.fog) };
  let dark = 1;

  // ── Screen pieces ──
  const top = h('div', { class: 'rcr-top' });
  const orderBox = h('div', { class: 'rcr-order rcr-panel' }, iconEl('card'), h('div', {}, h('small', {}, UI.order), h('b', {}, order.line)));
  const clockLabel = h('b', {}, 'Right now');
  const clockBox = h('div', { class: 'rcr-clock rcr-panel', role: 'status', 'aria-live': 'polite' }, iconEl('clock'), h('div', {}, h('small', {}, UI.clock), clockLabel, h('span', {}, UI.clockNote)));
  const starBox = h('div', { class: 'rcr-stars rcr-panel', title: 'Cycle Stars' }, iconEl('star'), h('b', {}, '0'));
  top.append(orderBox, h('div', { class: 'rcr-top-right' }, starBox, clockBox));
  ui.append(top);

  const signs = h('div', { class: 'rcr-signs', 'aria-hidden': 'true' });
  const signEls = FORK_SIGNS.map((f) => {
    const el = h('div', { class: `rcr-sign rcr-sign-${f.path}` }, h('b', {}, f.sign), h('span', {}, `${ROCK_FORMS[f.result]?.name ?? f.result}, in ${f.time}`));
    signs.append(el);
    return el;
  });
  ui.append(signs);

  const toast = h('div', { class: 'rcr-toast', role: 'status', 'aria-live': 'polite' });
  ui.append(toast);
  let toastTimer = 0;
  const say = (line: string, seconds = 3.5) => {
    toast.textContent = line;
    toast.classList.add('show');
    toastTimer = seconds;
    speak(line);
  };

  const anaPic = portrait(anaQuispe().group, { height: 1.18, distance: 2.2 });

  // ── Input ──
  const keys = new Set<string>();
  const held = { left: false, right: false, push: false, brake: false, jump: false };
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k) && phase === 'race') e.preventDefault();
    keys.add(k);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());
  const input = (): RollInput => ({
    throttle: phase !== 'race' ? 0 : keys.has('arrowup') || keys.has('w') || held.push ? 1 : 0.6,
    brake: phase === 'finish' || keys.has('arrowdown') || keys.has('s') || held.brake,
    steer: phase !== 'race' ? 0 : (keys.has('arrowright') || keys.has('d') || held.right ? 1 : 0) - (keys.has('arrowleft') || keys.has('a') || held.left ? 1 : 0),
    jump: phase === 'race' && (keys.has(' ') || held.jump),
  });

  if (touchControlsVisible()) {
    const pad = h('div', { class: 'rcr-touch' });
    const hold = (name: keyof typeof held, icon: string, label: string) => {
      const b = h('button', { class: `rcr-touch-btn rcr-touch-${name}`, type: 'button', 'aria-label': label }, iconEl(icon), h('span', {}, label));
      const on = (e: Event) => {
        e.preventDefault();
        held[name] = true;
      };
      const off = () => (held[name] = false);
      b.addEventListener('pointerdown', on);
      b.addEventListener('pointerup', off);
      b.addEventListener('pointercancel', off);
      b.addEventListener('pointerleave', off);
      return b;
    };
    pad.append(h('div', { class: 'rcr-touch-side' }, hold('left', 'left', 'Left'), hold('right', 'right', 'Right')), h('div', { class: 'rcr-touch-side' }, hold('jump', 'jump', 'Jump'), hold('push', 'push', 'Push')));
    ui.append(pad);
  }

  // ── The intro card ──
  const intro = h(
    'div',
    { class: 'rcr-card rcr-panel rcr-intro', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'rcr-intro-title' },
    h('div', { class: 'rcr-talk' }, h('img', { src: anaPic, alt: '' }), h('div', {}, h('b', {}, CAST.ana.name), h('p', {}, HOST_LINES.start), h('p', {}, order.goal === 'granite' ? HOST_LINES.startGranite : HOST_LINES.startBasalt))),
    h('h2', { id: 'rcr-intro-title' }, UI.sub),
    h('p', { class: 'rcr-help' }, touchControlsVisible() ? UI.controlsTouch : UI.controlsKeys),
  );
  const go = h('button', { class: 'rcr-btn rcr-btn-main', type: 'button' }, iconEl('flag'), 'Start the race');
  intro.append(go);
  ui.append(intro);
  go.focus();
  speak(`${HOST_LINES.start} ${order.goal === 'granite' ? HOST_LINES.startGranite : HOST_LINES.startBasalt}`);
  go.addEventListener('click', () => {
    intro.remove();
    stopSpeaking();
    phase = 'race';
    lp.renderer.domElement.focus();
  });

  // ── The question at the gate ──
  let answerFn: (i: number) => void = () => undefined;
  function askQuestion(): void {
    phase = 'question';
    let tries = 0;
    const q = VENT_QUESTION;
    const help = h('p', { class: 'rcr-hint', role: 'status', 'aria-live': 'polite' });
    const list = h('div', { class: 'rcr-answers' });
    const card = h(
      'div',
      { class: 'rcr-card rcr-panel rcr-question', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'rcr-q' },
      h('div', { class: 'rcr-talk' }, h('img', { src: anaPic, alt: '' }), h('div', {}, h('b', {}, CAST.ana.name), h('p', {}, HOST_LINES.question))),
      h('p', { id: 'rcr-q', class: 'rcr-q' }, q.text),
      list,
      help,
    );
    const readBtn = h('button', { class: 'rcr-btn rcr-btn-quiet', type: 'button', 'aria-label': 'Read the question aloud' }, iconEl('speaker'), 'Read aloud');
    readBtn.addEventListener('click', () => speak(q.text, { force: true }));
    card.append(readBtn);
    const buttons = q.answers.map((a, i) => {
      const b = h('button', { class: 'rcr-answer', type: 'button' }, h('span', { class: 'rcr-num' }, String(i + 1)), a.text);
      b.addEventListener('click', () => answerFn(i));
      list.append(b);
      return b;
    });
    answerFn = (i: number) => {
      const a = q.answers[i];
      if (!a || buttons[i].disabled) return;
      if (a.right) {
        buttons[i].classList.add('right');
        buttons.forEach((b) => (b.disabled = true));
        if (tries === 0) {
          stars++;
          (starBox.querySelector('b') as HTMLElement).textContent = String(stars);
          roll.boost = 1.6;
        }
        const line = tries === 0 ? HOST_LINES.right : HOST_LINES.rightLater;
        help.textContent = line;
        speak(line);
        setTimeout(() => {
          card.remove();
          window.removeEventListener('keydown', numKeys);
          phase = 'race';
          lp.renderer.domElement.focus();
        }, 1100);
        return;
      }
      tries++;
      buttons[i].disabled = true;
      buttons[i].classList.add('wrong');
      // First a kind fix and a nudge, then the right answer is outlined.
      help.textContent = `${a.fix ?? ''} ${tries === 1 ? q.hint : 'The right answer is outlined.'}`.trim();
      if (tries >= 2) buttons[q.answers.findIndex((x) => x.right)].classList.add('outline');
      speak(help.textContent);
    };
    const numKeys = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= q.answers.length) answerFn(n - 1);
    };
    window.addEventListener('keydown', numKeys);
    ui.append(card);
    buttons[0].focus();
    speak(`${HOST_LINES.question} ${q.text}`);
  }

  // ── The finish ──
  const puffs: Array<{ m: THREE.Mesh; age: number; dir: THREE.Vector3 }> = [];
  function finish(rock: Rock): void {
    phase = 'finish';
    finished = rock;
    me.setForm(rock);
    me.setHeat(0);
    const at = me.group.position;
    for (let i = 0; i < 10; i++) {
      const m = steamPuff();
      const a = (i / 10) * Math.PI * 2;
      const dir = new THREE.Vector3(Math.cos(a), 0.9 + (i % 3) * 0.3, Math.sin(a)).multiplyScalar(1.4);
      m.position.copy(at).add(new THREE.Vector3(0, 0.6, 0));
      lp.scene.add(m);
      puffs.push({ m, age: 0, dir });
    }
    place = rivalFrac >= 1 ? 2 : 1;
    const met = rock === order.goal;
    const form = ROCK_FORMS[rock]!;
    const panel = h(
      'div',
      { class: 'rcr-card rcr-panel rcr-finish', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'rcr-finish-title' },
      h('small', {}, UI.place(place)),
      h('h2', { id: 'rcr-finish-title' }, `You are ${form.name}!`),
      h('p', { class: 'rcr-family' }, form.family),
      h('p', {}, form.how),
      h('p', { class: 'rcr-fact' }, form.fact),
      h('p', { class: `rcr-met ${met ? 'yes' : 'no'}` }, iconEl(met ? 'check' : 'card'), met ? HOST_LINES.finishMet : HOST_LINES.finishMissed),
    );
    const again = h('button', { class: 'rcr-btn rcr-btn-main', type: 'button' }, iconEl('again'), UI.again);
    again.addEventListener('click', () => location.reload());
    const other = h('button', { class: 'rcr-btn', type: 'button' }, iconEl('card'), UI.other);
    other.addEventListener('click', () => {
      const flagsNow = location.hash.slice(1).split('-');
      const has = flagsNow.includes('basalt');
      const next = has ? flagsNow.filter((f) => f !== 'basalt') : [...flagsNow, 'basalt'];
      location.hash = next.join('-');
    });
    panel.append(h('div', { class: 'rcr-row' }, again, other));
    setTimeout(() => {
      ui.append(panel);
      again.focus();
      speak(`You are ${form.name}! ${form.how} ${met ? HOST_LINES.finishMet : HOST_LINES.finishMissed}`);
    }, 1300);
  }

  // ── Every frame ──
  let fps = 0;
  let frames = 0;
  let fpsTime = 0;
  const basis = new THREE.Matrix4();
  const tmp = { r: new THREE.Vector3(), u: new THREE.Vector3(), t: new THREE.Vector3() };
  const place3 = (obj: THREE.Object3D, id: string, s: number, x: number, hh: number) => {
    const p = track.graph.path(id);
    const f = p.at(s);
    const pos = p.point(s, x, hh);
    obj.position.set(pos.x, pos.y, pos.z);
    tmp.r.set(-f.right.x, -f.right.y, -f.right.z);
    tmp.u.set(f.up.x, f.up.y, f.up.z);
    tmp.t.set(f.tangent.x, f.tangent.y, f.tangent.z);
    basis.makeBasis(tmp.r, tmp.u, tmp.t);
    obj.quaternion.setFromRotationMatrix(basis);
    return f;
  };

  const debug: RaceDebug = {
    ready: false,
    phase,
    path,
    s: roll.s,
    x: 0,
    speed: 0,
    forkAhead: null,
    forkTargets: Object.fromEntries(track.forks[0].choices.map((c) => [c.path, c.offset])),
    finished: null,
    orderMet: null,
    place: null,
    stars: 0,
    fps: 0,
    answer: (i: number) => answerFn(i),
  };

  lp.onFrame((dt, t) => {
    world.update(dt, t);
    frames++;
    fpsTime += dt;
    if (fpsTime > 1) {
      fps = Math.round(frames / fpsTime);
      frames = 0;
      fpsTime = 0;
    }
    // Small steps keep the physics steady even when frames are slow.
    if (phase === 'race' || phase === 'finish') {
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      for (let k = 0; k < steps; k++) {
        const p = track.graph.path(path);
        const f = p.at(roll.s);
        const ev = stepRoll(roll, input(), f, DEFAULT_ROLL, dt / steps);
        if (ev.hitWall) cam.shake(0.25);
        if (ev.landed) cam.shake(0.15, 0.2);
        // Speed pads.
        for (const b of track.boosts) {
          const key = `${b.path}:${b.s}`;
          if (b.path === path && !boostsUsed.has(key) && roll.s > b.s - 0.8 && roll.s < b.s + 1.2 && Math.abs(roll.x) < 2.4) {
            boostsUsed.add(key);
            roll.boost = 1.3;
            cam.shake(0.2);
          }
        }
        // The question gate.
        if (!gateDone && path === track.gate.path && roll.s >= track.gate.s) {
          gateDone = true;
          askQuestion();
          break;
        }
        // The fork, and the finish.
        if (roll.s >= p.length) {
          const n = track.graph.next(path);
          if (n.kind === 'fork') {
            const choice = track.graph.pick(n.fork, roll.x);
            roll.s -= p.length;
            roll.x -= choice.offset;
            path = choice.path;
            say(choice.path === 'deep' ? HOST_LINES.forkDeep : HOST_LINES.forkErupt);
          } else roll.s = p.length;
        }
        if (phase === 'race' && path !== 'vent' && roll.s >= track.graph.path(path).length - 3) {
          finish(path === 'deep' ? 'granite' : 'basalt');
        }
      }
    }

    // Place the racer and turn it as it rolls.
    const f = place3(me.group, path, roll.s, roll.x, roll.h);
    me.body.rotation.x = roll.spin;
    const pathObj = track.graph.path(path);
    const frac = path === 'vent' ? 0 : Math.min(1, roll.s / pathObj.length);
    if (phase !== 'finish') me.setHeat(path === 'vent' ? 1 : path === 'deep' ? 1 - frac * 0.85 : frac < 0.3 ? 1 : 1 - (frac - 0.3) * 1.1);

    // The rival keeps close, so the race stays exciting (it waits during questions).
    const myRoute = track.graph.routeLength(route(path === 'vent' ? 'erupt' : path));
    const myFrac = ((path === 'vent' ? 0 : ventLen) + roll.s) / myRoute;
    if (phase === 'race') {
      const lead = 0.012 + Math.sin(t * 0.45) * 0.022;
      const goal = Math.min(1, myFrac + lead);
      rivalFrac = Math.min(1, rivalFrac + Math.max(-0.0005, Math.min(dt * 0.06, (goal - rivalFrac) * dt * 1.2)));
    }
    const rd = rivalFrac * rivalLen;
    const rPath = rd < ventLen ? 'vent' : 'erupt';
    const rS = rd < ventLen ? rd : rd - ventLen;
    place3(rival.group, rPath, rS, rPath === 'vent' ? 1.6 : Math.sin(t * 0.7) * 1.4, 0);
    rivalSpin += dt * (phase === 'race' ? 14 : 0);
    rival.body.rotation.x = rivalSpin;

    // Light: dark in tunnels.
    const want = f.kind === 'tunnel' ? 1 : 0;
    dark += (want - dark) * Math.min(1, dt * 2.5);
    lp.sun.intensity = base.sun * (1 - 0.9 * dark);
    lp.hemi.intensity = base.hemi * (1 - 0.7 * dark);
    const sky = base.sky.clone().lerp(DARK_SKY, dark);
    (lp.scene.background as THREE.Color).copy(sky);
    const fog = lp.scene.fog as THREE.Fog;
    fog.color.copy(base.fog.clone().lerp(DARK_SKY, dark));
    fog.near = 30 + (1 - dark) * 40;
    fog.far = 90 + (1 - dark) * 160;

    // The Deep Time Clock.
    const stages = path === 'vent' ? null : CLOCK_STAGES[path as 'deep' | 'erupt'];
    const label = stages ? stages[Math.min(stages.length - 1, Math.floor(frac * stages.length))] : 'Right now';
    if (clockLabel.textContent !== label) clockLabel.textContent = label;

    // The fork signs, as you come up to the fork.
    const forkAhead = path === 'vent' ? pathObj.length - roll.s : null;
    const showSigns = forkAhead !== null && forkAhead < 30 && phase === 'race';
    signs.classList.toggle('show', showSigns);
    if (showSigns) {
      const pick = track.graph.pick(track.forks[0], roll.x).path;
      signEls.forEach((el, i) => el.classList.toggle('picked', FORK_SIGNS[i].path === pick));
    }

    // Steam puffs when the racer turns to stone.
    for (const p of puffs) {
      p.age += dt;
      p.m.position.addScaledVector(p.dir, dt);
      p.m.scale.setScalar(1 + p.age * 2.2);
      (p.m.material as THREE.MeshStandardMaterial).opacity = Math.max(0, 0.7 - p.age * 0.45);
    }

    if (toastTimer > 0) {
      toastTimer -= dt;
      if (toastTimer <= 0) toast.classList.remove('show');
    }

    const ball = me.group.position;
    cam.update(dt, path, roll.s, roll.x, roll.h, ball);
    lp.centerShadows(ball);

    debug.phase = phase;
    debug.path = path;
    debug.s = roll.s;
    debug.x = roll.x;
    debug.speed = roll.v;
    debug.forkAhead = forkAhead;
    debug.finished = finished;
    debug.orderMet = finished ? finished === order.goal : null;
    debug.place = place;
    debug.stars = stars;
    debug.fps = fps;
  });

  place3(me.group, path, roll.s, 0, 0);
  cam.snap();
  lp.start();
  debug.ready = true;
  return debug;
}
