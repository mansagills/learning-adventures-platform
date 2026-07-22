// wearables.ts
// Pure TypeScript module — NO Phaser dependency.
//
// Maps owned demo-shop items (demoEconomy) to a "worn" emoji that rides
// above the player's head, so buying gear in the campus shop visibly changes
// your avatar — the payoff that closes the earn → spend → wear loop.
//
// The head slot shows ONE item at a time: the highest-priority owned
// wearable, so buying better gear visibly upgrades the avatar
// (cap → helmet → trophy). Non-wearable items (e.g. the sticker pack) have
// no entry and never show.

export interface WearableDef {
  /** Emoji drawn above the player. Matches the shop icon so the causal link
   *  "I bought that → I'm wearing that" is unmistakable. */
  emoji: string;
  /** Pixels above the player's origin to anchor the emoji's base. */
  offsetY: number;
}

const WEARABLES: Record<string, WearableDef> = {
  'campus-cap':    { emoji: '🧢', offsetY: 26 },
  'racing-helmet': { emoji: '🏎️', offsetY: 28 },
  'golden-trophy': { emoji: '🏆', offsetY: 30 },
};

/** Best-first: the highest item owned is the one worn. */
const PRIORITY: string[] = ['golden-trophy', 'racing-helmet', 'campus-cap'];

/** The wearable to show for a given inventory, or null if none apply. */
export function wearableForOwned(owned: string[]): WearableDef | null {
  for (const id of PRIORITY) {
    if (owned.includes(id)) return WEARABLES[id];
  }
  return null;
}
