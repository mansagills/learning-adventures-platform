/**
 * Hint providers.
 *
 * The game always uses authored hints. An optional AI service may later
 * rephrase them, but only through a server-side endpoint (no model keys ever
 * reach the browser), only from the curated fact bank, and it must never
 * block play: any error or slow reply falls back to the authored text.
 */

export interface HintRequest {
  objectiveId: string;
  rung: 1 | 2 | 3;
  authoredHint: string;
}

export interface HintProvider {
  readonly name: string;
  getHint(req: HintRequest): Promise<string>;
}

export const authoredHints: HintProvider = {
  name: 'authored',
  async getHint(req) {
    return req.authoredHint;
  },
};

/**
 * Placeholder for the optional server-side AI hint service. It is off unless
 * a same-origin endpoint is configured at build time
 * (VITE_HINT_ENDPOINT), and even then it falls back on any failure.
 */
export function createRemoteHintProvider(endpoint: string | undefined, timeoutMs = 2500): HintProvider {
  if (!endpoint) return authoredHints;
  return {
    name: 'remote',
    async getHint(req) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Only the objective and the authored hint are sent: no player data.
          body: JSON.stringify({ objectiveId: req.objectiveId, rung: req.rung, hint: req.authoredHint }),
          signal: controller.signal,
        });
        if (!res.ok) return req.authoredHint;
        const data = (await res.json()) as { hint?: unknown };
        return typeof data.hint === 'string' && data.hint.trim() ? data.hint : req.authoredHint;
      } catch {
        return req.authoredHint;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

export const hintProvider: HintProvider = createRemoteHintProvider(
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_HINT_ENDPOINT,
);
