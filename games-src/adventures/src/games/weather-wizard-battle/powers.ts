import type { Power } from '../../kit/worlds/wild-lands/weather-art';

/**
 * What each weather power does, and where it works. Every power only works
 * where it really would in nature (the Professor's "spells" are nature's own
 * processes), and when it does not work the game says why in one plain
 * sentence:
 *   Sun     warms water so it evaporates (rising vapor and warm air), or melts ice
 *   Cool    turns rising vapor into a cloud (condensation); no vapor, no cloud
 *   Wind    pushes a cloud along
 *   Cold    freezes water, but only below 0 °C
 *   Rain    falls only from a full, grey cloud; below 0 °C it falls as snow
 */

export type CloudKind = 'cumulus' | 'grey';

/** What is close in front of the wizard when a power is used. */
export interface Spot {
  /** The air temperature here, in °C. */
  temp: number;
  /** Liquid water (a tide pool, the sea, a river, a waterfall). */
  water: boolean;
  /** Ice that could melt (an ice wall, frozen water, a snowbank). */
  ice: boolean;
  /** Rising water vapor (from water the Sun warmed). */
  vapor: boolean;
  /** The nearest cloud within reach, if any. */
  cloud: CloudKind | null;
}

export type Effect = 'evaporate' | 'melt' | 'condense' | 'push' | 'freeze' | 'rain' | 'snow' | 'none';

export interface CastResult {
  effect: Effect;
  /** One plain sentence: what happened, or why nothing did. */
  say: string;
}

export const FREEZING = 0;

/** Below 0 °C water freezes (and a cloud's water falls as snow). */
export function freezes(temp: number): boolean {
  return temp < FREEZING;
}

const deg = (t: number) => `${t < 0 ? '−' : ''}${Math.abs(t)} °C`;

export function cast(power: Power, s: Spot): CastResult {
  switch (power) {
    case 'sun':
      if (s.ice) return { effect: 'melt', say: 'The Sun warms the ice, and it melts into water.' };
      if (s.water) return { effect: 'evaporate', say: 'The Sun warms the water. It rises as invisible water vapor, and the warm air rises too.' };
      return { effect: 'none', say: 'The Sun warms things up. Try it on water or ice.' };
    case 'cool':
      if (s.vapor) return { effect: 'condense', say: 'The vapor cools into tiny drops of water. That is a cloud!' };
      return { effect: 'none', say: 'A cloud needs water vapor. Warm some water with the Sun first.' };
    case 'wind':
      if (s.cloud) return { effect: 'push', say: 'The wind pushes the cloud along.' };
      return { effect: 'none', say: 'Wind pushes clouds. There is no cloud close by.' };
    case 'cold':
      if (!freezes(s.temp)) return { effect: 'none', say: `It is ${deg(s.temp)} here. Water freezes only below 0 °C.` };
      if (s.water) return { effect: 'freeze', say: `It is ${deg(s.temp)}. The water freezes into ice. Careful, it is slippery!` };
      return { effect: 'none', say: 'Cold freezes water. There is no water close by.' };
    case 'rain':
      if (s.cloud === 'grey') {
        if (freezes(s.temp)) return { effect: 'snow', say: `It is ${deg(s.temp)}, below freezing. The cloud’s water falls as snow!` };
        return { effect: 'rain', say: `It is ${deg(s.temp)}, above freezing. The cloud’s heavy drops fall as rain.` };
      }
      if (s.cloud === 'cumulus') return { effect: 'none', say: 'This small white cloud is not full enough to rain. Rain falls from full, grey clouds.' };
      return { effect: 'none', say: 'Rain falls only from a full, grey cloud. There is no cloud close by.' };
  }
}

/** The powers in the order they are learned (keys 1 to 5). */
export const POWER_ORDER: Power[] = ['sun', 'cool', 'wind', 'rain', 'cold'];
