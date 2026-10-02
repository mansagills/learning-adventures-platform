import { bus } from '../core/events';
import { settings } from './settings';

/**
 * All music and sound is synthesized live with the Web Audio API (the same
 * approach as Seeds of Genius): short looping chiptune songs and quick
 * interface sounds. Nothing is downloaded, and everything respects the
 * music/effects sliders and the mute switch. The games never depend on
 * sound: every sound has a visible counterpart.
 *
 * Each game registers its own songs with `audio.addSong()` and picks one
 * with `audio.play()`.
 */

export const NOTE = (n: number): number => 440 * Math.pow(2, (n - 69) / 12); // MIDI → Hz

export interface Song {
  bpm: number;
  /** MIDI notes, one chord per bar. */
  chords: number[][];
  /** One bass root per bar. */
  bass: number[];
  /** Eight steps per bar, looped over the chords (null = rest). */
  melody: Array<number | null>;
  lead: OscillatorType;
  /** Optional soft percussion on the beat. */
  drums?: boolean;
}

/** A gentle default tune for title screens. */
const TITLE: Song = {
  bpm: 84,
  chords: [
    [65, 69, 72],
    [60, 64, 67],
    [62, 65, 69],
    [58, 62, 65],
  ],
  bass: [41, 36, 38, 34],
  // prettier-ignore
  melody: [
    72, null, null, 74, 76, null, 72, null,
    71, null, 72, null, 67, null, null, null,
    69, null, 72, null, 74, null, 72, 69,
    70, null, 69, null, 65, null, null, null,
  ],
  lead: 'triangle',
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicGain!: GainNode;
  private sfxGain!: GainNode;
  private songs = new Map<string, Song>([['title', TITLE]]);
  private current: string | null = null;
  private nextStepTime = 0;
  private stepIndex = 0;

  constructor() {
    bus.on('settings:changed', () => this.applyVolumes());
  }

  addSong(id: string, song: Song): void {
    this.songs.set(id, song);
  }

  /** Must be called from a user gesture (browsers require it). */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    try {
      this.ctx = new Ctx();
    } catch {
      return;
    }
    const c = this.ctx;
    this.master = c.createGain();
    this.master.connect(c.destination);
    this.musicGain = c.createGain();
    this.musicGain.connect(this.master);
    this.sfxGain = c.createGain();
    this.sfxGain.connect(this.master);
    this.applyVolumes();
    this.nextStepTime = c.currentTime + 0.1;
    window.setInterval(() => this.schedule(), 60);
  }

  get unlocked(): boolean {
    return !!this.ctx;
  }

  private applyVolumes(): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(settings.muted ? 0 : 1, t, 0.05);
    this.musicGain.gain.setTargetAtTime(settings.musicVolume * 0.32, t, 0.1);
    this.sfxGain.gain.setTargetAtTime(settings.sfxVolume * 0.6, t, 0.05);
  }

  /** Switch songs (null = silence). The new song starts at its first bar. */
  play(id: string | null): void {
    if (id === this.current) return;
    this.current = id && this.songs.has(id) ? id : null;
    this.stepIndex = 0;
  }

  // ------------------------------------------------------------ music

  private schedule(): void {
    const c = this.ctx;
    if (!c || c.state !== 'running' || !this.current) return;
    const song = this.songs.get(this.current)!;
    const stepDur = 60 / song.bpm / 2; // eighth notes
    if (this.nextStepTime < c.currentTime) this.nextStepTime = c.currentTime + 0.05;
    while (this.nextStepTime < c.currentTime + 0.25) {
      const bar = Math.floor(this.stepIndex / 8) % song.chords.length;
      const inBar = this.stepIndex % 8;
      const t = this.nextStepTime;
      if (inBar === 0) {
        song.chords[bar].forEach((n) => this.tone(NOTE(n), t, stepDur * 8, 'triangle', 0.05, this.musicGain, 0.4, 1.2));
        this.tone(NOTE(song.bass[bar]), t, stepDur * 3, 'sine', 0.16, this.musicGain, 0.02, 0.3);
      }
      if (inBar === 4) this.tone(NOTE(song.bass[bar] + 7), t, stepDur * 3, 'sine', 0.1, this.musicGain, 0.02, 0.3);
      if (song.drums && inBar % 2 === 0) this.tick(t, inBar % 4 === 0 ? 0.05 : 0.025);
      const m = song.melody[this.stepIndex % song.melody.length];
      if (m !== null) this.tone(NOTE(m), t, stepDur * 1.6, song.lead, 0.07, this.musicGain, 0.01, 0.35);
      this.nextStepTime += stepDur;
      this.stepIndex++;
    }
  }

  /** A soft woodblock-like tick (no noise buffers needed). */
  private tick(t: number, vol: number): void {
    const c = this.ctx!;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(1100, t);
    o.frequency.exponentialRampToValueAtTime(500, t + 0.04);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(g);
    g.connect(this.musicGain);
    o.start(t);
    o.stop(t + 0.06);
  }

  tone(freq: number, t: number, dur: number, type: OscillatorType, vol: number, out: GainNode = this.sfxGain, attack = 0.01, release = 0.15): void {
    const c = this.ctx;
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.setValueAtTime(vol, t + Math.max(attack, dur - release));
    g.gain.linearRampToValueAtTime(0, t + dur + release);
    o.connect(g);
    g.connect(out);
    o.start(t);
    o.stop(t + dur + release + 0.05);
  }

  // ------------------------------------------------------------ effects

  /** Play a short phrase: [midi, start offset s, duration s]. */
  fx(notes: Array<[number, number, number]>, type: OscillatorType = 'triangle', vol = 0.12): void {
    const c = this.ctx;
    if (!c) return;
    const t = c.currentTime;
    notes.forEach(([midi, at, dur]) => this.tone(NOTE(midi), t + at, dur, type, vol, this.sfxGain, 0.005, 0.08));
  }

  click(): void {
    this.fx([[84, 0, 0.03]], 'square', 0.04);
  }
  open(): void {
    this.fx([[72, 0, 0.05], [79, 0.05, 0.07]], 'triangle', 0.08);
  }
  close(): void {
    this.fx([[79, 0, 0.05], [72, 0.05, 0.07]], 'triangle', 0.07);
  }
  /** Soft voice blip while dialogue types; pitch is the speaker's voice. */
  blip(pitch: number): void {
    const c = this.ctx;
    if (!c) return;
    this.tone(pitch * (0.95 + Math.random() * 0.1), c.currentTime, 0.035, 'square', 0.025, this.sfxGain, 0.004, 0.03);
  }
  /** A rising hop; `up` false falls instead (for hops backward). */
  hop(up = true, big = false): void {
    const c = this.ctx;
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'square';
    const f0 = big ? 260 : 420;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(up ? f0 * 2 : f0 * 0.6, t + (big ? 0.22 : 0.12));
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (big ? 0.26 : 0.15));
    o.connect(g);
    g.connect(this.sfxGain);
    o.start(t);
    o.stop(t + 0.3);
  }
  land(): void {
    this.fx([[48, 0, 0.04]], 'triangle', 0.14);
  }
  itemGet(): void {
    this.fx([[72, 0, 0.08], [76, 0.08, 0.08], [79, 0.16, 0.08], [84, 0.24, 0.25]], 'square', 0.06);
  }
  levelUp(): void {
    this.fx([[72, 0, 0.12], [76, 0.12, 0.12], [79, 0.24, 0.12], [84, 0.36, 0.12], [88, 0.48, 0.4]], 'triangle', 0.12);
  }
  correct(): void {
    this.fx([[76, 0, 0.08], [84, 0.08, 0.18]], 'triangle', 0.1);
  }
  /** Gentle "hmm" for a wrong answer: never harsh. */
  retry(): void {
    this.fx([[67, 0, 0.1], [65, 0.1, 0.16]], 'sine', 0.1);
  }
  hint(): void {
    this.fx([[79, 0, 0.06], [83, 0.06, 0.06], [86, 0.12, 0.12]], 'sine', 0.08);
  }
}

export const audio = new AudioEngine();
