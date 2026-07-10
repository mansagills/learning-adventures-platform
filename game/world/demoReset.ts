// demoReset.ts
// Pure TypeScript module — NO Phaser/React dependency.
//
// "Restart Demo" control: wipes every piece of sandbox-local state (XP,
// inventory, explored-rooms, welcome-seen) and reloads the page, so a
// presenter can run the same pitch over and over with an identical fresh
// start instead of a stale XP balance or a skipped welcome card.
//
// The in-memory quest state (mathQuest.ts) and the physical power-cell
// sprites need no explicit reset here — they live only in the current
// Phaser scene instance, so the reload clears them for free.
//
// Sandbox-only by design: the authed /world/campus page's XP is real
// server-backed progress (via /api/world/award), not demo-local state, so
// this must never be wired up there.

import { demoEconomy } from './demoEconomy';
import { exploration } from './explorationState';
import { resetWelcomeSeen } from './welcomeState';

export function resetDemo(): void {
  demoEconomy.reset();
  exploration.reset();
  resetWelcomeSeen();
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}
