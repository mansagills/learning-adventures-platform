import { audio } from '../../kit/systems/audio';
import { settings } from '../../kit/systems/settings';
import { speak, stopSpeaking } from '../../kit/systems/speech';
import { h, Modal } from '../../kit/ui/dom';
import { isTouchDevice } from '../../kit/systems/settings';
import { cannonFrame, CONSTELLATION_NAME, paintCannon, paintConstellation, paintSeasonOrbit } from './art';
import { CANNON_DONE, CANNON_LINES, CANNON_TIP, DIAL_DONE, DIAL_TIP } from './content';
import { DIAL, launch, type Outcome } from './physics';
import { pix } from './pix';
import type { Season } from './problems';

/**
 * The hands-on models at the Star Dome and the Launch Bay, played with
 * before (and between) the questions:
 *   the season dial: turn it to each season and see Earth's place on its
 *     trip round the Sun, and which star picture our night side faces;
 *   the launch cannon: pick a speed and fire. The path is worked out with
 *     real gravity, so a slow shot lands, a fast enough one goes into orbit,
 *     and a super fast one flies away.
 * Each resolves when its window closes: true if the child finished it
 * (every season seen, or an orbit found).
 */

const SEASONS: Season[] = ['winter', 'spring', 'summer', 'autumn'];
const SEASON_NAME: Record<Season, string> = { winter: 'Winter', spring: 'Spring', summer: 'Summer', autumn: 'Autumn' };

export function openSeasonDial(host: HTMLElement): Promise<boolean> {
  return new Promise((resolve) => {
    const seen = new Set<Season>();
    let at: Season = 'winter';
    const orbitBox = h('div', { class: 'sse-row' });
    const skyBox = h('div', { class: 'sse-sky' });
    const status = h('p', { class: 'sse-toy-status', role: 'status', 'aria-live': 'polite' });
    const buttons = SEASONS.map((s) => h('button', { class: 'btn sse-dial-btn', type: 'button', 'data-season': s, 'aria-pressed': 'false', text: SEASON_NAME[s], onclick: () => turn(s) }));
    const doneBtn = h('button', { class: 'btn', type: 'button', text: 'Done', onclick: () => modal.close() });
    const turn = (s: Season) => {
      at = s;
      seen.add(s);
      audio.fx([[64 + SEASONS.indexOf(s) * 3, 0, 0.12]], 'triangle', 0.05);
      const W = 200;
      const H = 100;
      const { buf, spots, earth } = paintSeasonOrbit(W, H, s);
      orbitBox.replaceChildren(pix(`seasons-${s}`, () => buf, 1.8, `Earth’s trip round the Sun. In ${s}, our night side faces ${CONSTELLATION_NAME[s]}.`));
      for (const t of SEASONS) {
        const [x, y] = spots[t];
        orbitBox.append(h('span', { class: `sse-tag small${t === s ? ' on' : ''}`, style: `left:${(x / W) * 100}%;top:${Math.min(94, Math.max(6, (y / H) * 100 + (t === 'autumn' ? 14 : t === 'spring' ? -14 : 16)))}%`, text: CONSTELLATION_NAME[t] }));
      }
      orbitBox.append(h('span', { class: 'sse-tag small', style: `left:${(earth[0] / W) * 100}%;top:${(earth[1] / H) * 100 + (earth[1] > H * 0.6 ? -16 : 8)}%`, text: 'Earth' }));
      skyBox.replaceChildren(pix(`const-${s}`, () => paintConstellation(120, 72, s), 2, `The evening sky in ${s}: ${CONSTELLATION_NAME[s]}`), h('span', { class: 'sse-tag small', style: 'left:50%;top:88%', text: `${SEASON_NAME[s]} evening: ${CONSTELLATION_NAME[s]}` }));
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.season === s)));
      const text = seen.size === 4 ? DIAL_DONE : `${SEASON_NAME[s]}: our night side faces ${CONSTELLATION_NAME[s]}, so it is up in the evening sky. ${seen.size} of 4 seasons.`;
      status.textContent = text;
      speak(text);
      if (seen.size === 4) doneBtn.classList.add('primary');
    };
    const root = h(
      'div',
      { class: 'panel modal sse-toy', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'dial-title' },
      h('header', {}, h('h2', { id: 'dial-title', text: 'The season dial' })),
      h('div', { class: 'content' }, h('p', { class: 'small-note', text: DIAL_TIP }), h('div', { class: 'sse-toy-pics' }, orbitBox, skyBox), h('div', { class: 'sse-dial', role: 'group', 'aria-label': 'Seasons' }, ...buttons), status),
      h('footer', { class: 'sse-foot' }, h('span', {}), doneBtn),
    );
    root.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const i = (SEASONS.indexOf(at) + (e.key === 'ArrowRight' ? 1 : 3)) % 4;
      turn(SEASONS[i]);
      buttons[i].focus();
    });
    const modal = new Modal(host, root, () => {
      stopSpeaking();
      resolve(seen.size === 4);
    });
    turn('winter');
    requestAnimationFrame(() => buttons[0].focus());
  });
}

const CW = 160;
const CH = 110;
const SPEED_NAME = ['Very slow', 'Slow', 'Medium', 'Fast', 'Very fast', 'Super fast'];
const TRAIL: Record<Outcome, string> = { land: '#ffb547', orbit: '#7ff0ff', escape: '#ff8fd0' };

export function openCannon(host: HTMLElement): Promise<boolean> {
  return new Promise((resolve) => {
    let found = false;
    let speed = 2;
    const canvas = h('canvas', { class: 'sse-cannon-canvas', width: CW, height: CH, 'aria-label': 'Tess’s cannon on a little planet' }) as HTMLCanvasElement;
    const g = canvas.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    const bg = paintCannon(CW, CH, 'none').buf.toCanvas();
    const { at } = cannonFrame(CW, CH);
    /** Old shots stay as faint dotted paths; the newest one is drawn as it flies. */
    const old: Array<{ pts: Array<[number, number]>; color: string }> = [];
    let shot: { pts: Array<[number, number]>; outcome: Outcome; i: number } | null = null;
    let raf = 0;
    const status = h('p', { class: 'sse-toy-status', role: 'status', 'aria-live': 'polite', text: CANNON_TIP });
    const label = h('output', { class: 'sse-speed-name', text: SPEED_NAME[speed] });
    const slider = h('input', { type: 'range', min: '1', max: String(DIAL.length), value: String(speed + 1), 'aria-label': 'Launch speed', class: 'sse-speed' }) as HTMLInputElement;
    slider.addEventListener('input', () => {
      speed = Number(slider.value) - 1;
      label.textContent = SPEED_NAME[speed];
    });
    const fireBtn = h('button', { class: 'btn primary', type: 'button', 'data-autofocus': true, text: isTouchDevice() ? 'Fire!' : 'Fire! (F)', onclick: () => fire() });
    const doneBtn = h('button', { class: 'btn', type: 'button', text: 'Done', onclick: () => modal.close() });
    const draw = () => {
      g.drawImage(bg, 0, 0);
      for (const o of old) o.pts.forEach(([x, y], k) => k % 3 === 0 && dot(x, y, o.color, 1));
      if (shot) {
        const n = Math.min(shot.i, shot.pts.length);
        for (let k = 0; k < n; k++) if (k % 2 === 0) dot(shot.pts[k][0], shot.pts[k][1], TRAIL[shot.outcome], 1);
        // the probe: at the end of its path, or circling for ever on an orbit
        const idx = shot.outcome === 'orbit' && shot.i >= shot.pts.length ? shot.i % shot.pts.length : Math.min(n, shot.pts.length) - 1;
        const [px, py] = shot.pts[Math.max(0, idx)];
        dot(px - 0.5, py - 0.5, '#ff8fd0', 2);
      }
    };
    const dot = (x: number, y: number, c: string, s: number) => {
      if (x < -2 || y < -2 || x > CW + 2 || y > CH + 2) return;
      g.fillStyle = c;
      g.fillRect(Math.round(x), Math.round(y), s, s);
    };
    const fire = () => {
      if (shot && shot.i < shot.pts.length) return;
      if (shot) old.push({ pts: shot.pts, color: TRAIL[shot.outcome] + '80' });
      if (old.length > 3) old.shift();
      const f = launch(DIAL[speed]);
      const pts = f.path.map(([x, y]) => at(x, y));
      // an escaping shot only needs drawing until it leaves the picture
      let end = pts.length;
      if (f.outcome === 'escape') {
        const out = pts.findIndex(([x, y], k) => k > 10 && (x < -4 || y < -4 || x > CW + 4 || y > CH + 4));
        if (out > 0) end = out;
      }
      shot = { pts: pts.slice(0, end), outcome: f.outcome, i: settings.reducedMotion ? end : 0 };
      audio.fx([[48, 0, 0.08], [43, 0.06, 0.18]], 'square', 0.07);
      status.textContent = 'Fire!';
      fireBtn.disabled = true;
      cancelAnimationFrame(raf);
      loop();
    };
    const finish = () => {
      if (!shot) return;
      fireBtn.disabled = false;
      let text: string = CANNON_LINES[shot.outcome];
      if (shot.outcome === 'orbit') {
        audio.itemGet();
        if (!found) {
          found = true;
          text = `${text} ${CANNON_DONE}`;
          doneBtn.classList.add('primary');
        }
      } else audio.retry();
      status.textContent = text;
      speak(text);
      fireBtn.focus();
    };
    const loop = () => {
      if (!shot) return;
      const before = shot.i;
      shot.i += 4;
      draw();
      if (before < shot.pts.length && shot.i >= shot.pts.length) finish();
      // orbits keep going round; other shots stop when they end
      if (shot.i < shot.pts.length || shot.outcome === 'orbit') raf = requestAnimationFrame(loop);
    };
    const root = h(
      'div',
      { class: 'panel modal sse-toy', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'cannon-title' },
      h('header', {}, h('h2', { id: 'cannon-title', text: 'The launch cannon' })),
      h(
        'div',
        { class: 'content' },
        h('div', { class: 'sse-cannon-box' }, canvas),
        h('div', { class: 'sse-speed-row' }, h('span', { text: 'Speed' }), slider, label),
        status,
      ),
      h('footer', { class: 'sse-foot' }, fireBtn, doneBtn),
    );
    root.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'f' && !e.repeat) {
        e.preventDefault();
        fire();
      }
    });
    const modal = new Modal(host, root, () => {
      cancelAnimationFrame(raf);
      stopSpeaking();
      resolve(found);
    });
    draw();
    speak(CANNON_TIP);
    (window as unknown as { __sseCannon?: unknown }).__sseCannon = {
      set: (n: number) => {
        slider.value = String(n);
        slider.dispatchEvent(new Event('input'));
      },
      fire,
      get outcome() {
        return shot && shot.i >= shot.pts.length ? shot.outcome : null;
      },
    };
  });
}
