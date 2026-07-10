// welcomeState.ts
// Pure TypeScript module — NO Phaser/React dependency.
//
// Tracks whether the player has already dismissed the first-time welcome
// overlay (components/world/WelcomeOverlay.tsx), so it only shows once per
// browser. Exposes a reset so the demo-restart control (a separate feature)
// can bring it back for a fresh run-through.

const WELCOME_SEEN_KEY = 'gather-demo-welcome-seen';

export function hasSeenWelcome(): boolean {
  if (typeof window === 'undefined') return true; // SSR: never show
  try {
    return window.localStorage.getItem(WELCOME_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function markWelcomeSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WELCOME_SEEN_KEY, '1');
  } catch {
    // Storage blocked: overlay will just show again next load, harmless
  }
}

export function resetWelcomeSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(WELCOME_SEEN_KEY);
  } catch {
    // ignore
  }
}
