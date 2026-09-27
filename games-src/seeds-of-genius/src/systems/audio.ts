import { bus } from '../core/events';
import { settings } from './settings';

/**
 * All music and sound is synthesized live with the Web Audio API: gentle
 * looping tunes for day and night, soft ambience (birds, crickets) and short
 * interface sounds. Nothing is downloaded, and everything respects the
 * music/effects sliders and the mute switch. The game never depends on
 * sound: every sound has a visible counterpart.
 */

type Mood = 'day' | 'night' | 'title';

const NOTE = (n: number) => 440 * Math.pow(2, (n - 69) / 12); // MIDI → Hz

interface Song {
  bpm: number;
  chords: number[][]; // MIDI notes, one chord per bar
  bass: number[]; // one root per bar
  melody: Array<number | null>; // 8 steps per bar, looped over the chords
  lead: OscillatorType;
}

const SONGS: Record<Mood, Song> = {
  day: {
    bpm: 92,
    chords: [
      [65, 69, 72],
      [62, 65, 69],
      [58, 62, 65],
      [60, 64, 67],
    ],
    bass: [41, 38, 34, 36],
    melody: [
      77, null, 76, 74, 72, null, 74, null,
      72, null, 69, null, 70, 72, null, null,
      74, null, 72, 70, 69, null, 67, null,
      72, null, null, 69, 67, null, 65, null,
    ],
    lead: 'triangle',
  },
  title: {
    bpm: 84,
    chords: [
      [65, 69, 72],
      [60, 64, 67],
      [62, 65, 69],
      [58, 62, 65],
    ],
    bass: [41, 36, 38, 34],
    melody: [
      72, null, null, 74, 76, null, 72, null,
      71, null, 72, null, 67, null, null, null,
      69, null, 72, null, 74, null, 72, 69,
      70, null, 69, null, 65, null, null, null,
    ],
    lead: 'triangle',
  },
  night: {
    bpm: 68,
    chords: [
      [57, 60, 64, 67],
      [53, 57, 60, 64],
      [48, 52, 55, 59],
      [55, 59, 62],
    ],
    bass: [45, 41, 36, 43],
    melody: [
      76, null, null, null, 72, null, null, null,
      77, null, null, 76, 72, null, null, null,
      79, null, null, null, 76, null, 74, null,
      74, null, null, null, 71, null, null, null,
    ],
    lead: 'sine',
  },
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicGain!: GainNode;
  private sfxGain!: GainNode;
  private ambGain!: GainNode;
  private mood: Mood = 'title';
  private nextStepTime = 0;
  private stepIndex = 0;
  private nightAmbience = false;

  constructor() {
    bus.on('settings:changed', () => this.applyVolumes());
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
    this.ambGain = c.createGain();
    this.ambGain.connect(this.sfxGain);
    this.applyVolumes();
    this.nextStepTime = c.currentTime + 0.1;
    window.setInterval(() => this.schedule(), 60);
    window.setInterval(() => this.ambient(), 900);
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
    this.ambGain.gain.setTargetAtTime(0.5, t, 0.1);
  }

  setMood(mood: Mood): void {
    if (mood === this.mood) return;
    this.mood = mood;
    this.stepIndex = 0;
  }

  setNightAmbience(night: boolean): void {
    this.nightAmbience = night;
  }

  // ------------------------------------------------------------ music

  private schedule(): void {
    const c = this.ctx;
    if (!c || c.state !== 'running') return;
    const song = SONGS[this.mood];
    const stepDur = 60 / song.bpm / 2; // eighth notes
    while (this.nextStepTime < c.currentTime + 0.25) {
      const bar = Math.floor(this.stepIndex / 8) % song.chords.length;
      const inBar = this.stepIndex % 8;
      const t = this.nextStepTime;
      if (inBar === 0) {
        song.chords[bar].forEach((n) => this.tone(NOTE(n), t, stepDur * 8, 'triangle', 0.05, this.musicGain, 0.4, 1.2));
        this.tone(NOTE(song.bass[bar]), t, stepDur * 3, 'sine', 0.16, this.musicGain, 0.02, 0.3);
      }
      if (inBar === 4) this.tone(NOTE(song.bass[bar] + 7), t, stepDur * 3, 'sine', 0.1, this.musicGain, 0.02, 0.3);
      const m = song.melody[this.stepIndex % song.melody.length];
      if (m !== null) {
        this.tone(NOTE(m), t, stepDur * 1.6, song.lead, 0.07, this.musicGain, 0.01, 0.35);
        if (this.mood === 'night') this.tone(NOTE(m), t + stepDur * 1.5, stepDur, 'sine', 0.025, this.musicGain, 0.01, 0.4);
      }
      this.nextStepTime += stepDur;
      this.stepIndex++;
    }
  }

  private tone(
    freq: number,
    t: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    out: GainNode,
    attack = 0.01,
    release = 0.15,
  ): void {
    const c = this.ctx!;
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

  // ------------------------------------------------------------ ambience

  private ambient(): void {
    const c = this.ctx;
    if (!c || c.state !== 'running') return;
    const t = c.currentTime;
    if (this.nightAmbience) {
      // crickets: quick chirp trains
      if (Math.random() < 0.55) {
        const f = 4200 + Math.random() * 500;
        for (let i = 0; i < 3; i++) this.tone(f, t + i * 0.07, 0.03, 'sine', 0.012, this.ambGain, 0.005, 0.02);
      }
    } else if (this.mood !== 'title' && Math.random() < 0.3) {
      // a bird: two quick upward whistles
      const base = 2200 + Math.random() * 900;
      [0, 0.14].forEach((d, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(base * (1 + i * 0.1), t + d);
        o.frequency.exponentialRampToValueAtTime(base * 1.35, t + d + 0.09);
        g.gain.setValueAtTime(0, t + d);
        g.gain.linearRampToValueAtTime(0.018, t + d + 0.02);
        g.gain.linearRampToValueAtTime(0, t + d + 0.1);
        o.connect(g);
        g.connect(this.ambGain);
        o.start(t + d);
        o.stop(t + d + 0.12);
      });
    }
  }

  // ------------------------------------------------------------ effects

  private fx(notes: Array<[number, number, number]>, type: OscillatorType = 'triangle', vol = 0.12): void {
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
  step(): void {
    const c = this.ctx;
    if (!c) return;
    this.tone(90 + Math.random() * 30, c.currentTime, 0.03, 'triangle', 0.05, this.sfxGain, 0.002, 0.03);
  }
  itemGet(): void {
    this.fx([[72, 0, 0.08], [76, 0.08, 0.08], [79, 0.16, 0.08], [84, 0.24, 0.25]], 'square', 0.06);
  }
  questAccept(): void {
    this.fx([[67, 0, 0.1], [72, 0.1, 0.2]], 'triangle', 0.12);
  }
  questComplete(): void {
    this.fx([[72, 0, 0.12], [76, 0.12, 0.12], [79, 0.24, 0.12], [84, 0.36, 0.12], [88, 0.48, 0.4]], 'triangle', 0.12);
  }
  correct(): void {
    this.fx([[76, 0, 0.08], [84, 0.08, 0.18]], 'triangle', 0.1);
  }
  /** Gentle "hmm" for a wrong answer: never harsh. */
  retry(): void {
    this.fx([[67, 0, 0.1], [65, 0.1, 0.16]], 'sine', 0.1);
  }
  door(): void {
    this.fx([[55, 0, 0.06], [50, 0.07, 0.1]], 'square', 0.05);
  }
  rest(): void {
    this.fx([[72, 0, 0.3], [67, 0.3, 0.3], [64, 0.6, 0.3], [60, 0.9, 0.6]], 'sine', 0.1);
  }
}

export const audio = new AudioEngine();
