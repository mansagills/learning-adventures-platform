import { settings } from './settings';

/**
 * Read aloud, for players who are still learning to read (kindergarten and
 * first grade). It uses the speech voices built into the device.
 *
 * Privacy: some browsers offer "online" voices that send the text to a
 * server. Only voices that run on the device (localService) are used, so
 * nothing ever leaves the browser. If the device has none, read-aloud is
 * simply not offered.
 */

let gameDefault = false;
let voice: SpeechSynthesisVoice | null | undefined;

function synth(): SpeechSynthesis | null {
  try {
    return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  } catch {
    return null;
  }
}

function pickVoice(): SpeechSynthesisVoice | null {
  const s = synth();
  if (!s) return null;
  const local = s.getVoices().filter((v) => v.localService && /^en(-|_|$)/i.test(v.lang));
  if (!local.length) return null;
  const pref = local.find((v) => /en-US/i.test(v.lang) && v.default) ?? local.find((v) => /en-US/i.test(v.lang)) ?? local[0];
  return pref;
}

/** Can this device read aloud (with an on-device voice)? */
export function speechAvailable(): boolean {
  if (voice === undefined || voice === null) voice = pickVoice();
  return !!voice;
}

/** A game for young readers turns read-aloud on unless the player turned it off. */
export function setReadAloudDefault(on: boolean): void {
  gameDefault = on;
  const s = synth();
  // Voices load late in some browsers.
  if (s && voice == null) s.onvoiceschanged = () => (voice = pickVoice());
}

export function readAloudOn(): boolean {
  const pref = settings.readAloud;
  const on = pref === 'on' || (pref === 'auto' && gameDefault);
  return on && !settings.muted && speechAvailable();
}

/** Say `text` (replacing anything still being said). Does nothing when read-aloud is off. */
export function speak(text: string, opts: { force?: boolean } = {}): void {
  const s = synth();
  if (!s || !(opts.force ? speechAvailable() && !settings.muted : readAloudOn())) return;
  try {
    s.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/−/g, ' minus ').replace(/\+/g, ' plus '));
    if (voice) u.voice = voice;
    u.rate = 0.92;
    u.pitch = 1.05;
    u.volume = Math.max(0.2, settings.sfxVolume);
    s.speak(u);
  } catch {
    /* speech is a bonus; never break the game */
  }
}

export function stopSpeaking(): void {
  try {
    synth()?.cancel();
  } catch {
    /* nothing to stop */
  }
}
