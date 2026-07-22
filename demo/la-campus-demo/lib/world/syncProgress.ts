import { WORLD_ADVENTURE_META } from './constants';

/**
 * Start + complete catalog progress when a world-embedded adventure finishes.
 */
export async function syncWorldAdventureProgress(
  adventureId: string,
  score?: number
): Promise<void> {
  const meta = WORLD_ADVENTURE_META[adventureId];
  if (!meta) return;

  try {
    await fetch('/api/progress/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adventureId,
        adventureType: meta.adventureType,
        category: meta.category,
      }),
    });
  } catch {
    // May already exist — continue to complete
  }

  try {
    await fetch('/api/progress/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adventureId, score }),
    });
  } catch (err) {
    console.error('Failed to sync adventure progress:', err);
  }
}
