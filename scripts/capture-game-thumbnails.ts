/**
 * Takes a screenshot of every game in lib/content/games.ts and saves it as
 * the game's card thumbnail: public/games/thumbnails/<slug>.jpg
 *
 *   npm run thumbnails                      # every game
 *   npm run thumbnails -- --only my-game    # one game (repeat --only for more)
 *
 * The games are plain HTML files, so this serves public/ itself; the Next.js
 * site does not need to be running. Chromium comes from Playwright
 * (`npx playwright install chromium` once on a new machine); set CHROMIUM_PATH
 * to use a Chrome/Chromium that is already installed instead.
 */

import { createReadStream, existsSync, mkdirSync, statSync } from 'fs';
import { createServer } from 'http';
import type { AddressInfo } from 'net';
import { extname, join, resolve } from 'path';
import { chromium, type Page } from 'playwright';
import { games } from '../lib/content/games';

const publicDir = resolve(__dirname, '../public');
const outDir = join(publicDir, 'games/thumbnails');

// Games are laid out at 1000×625 CSS pixels and saved at 640×400.
const viewport = { width: 1000, height: 625 };
const scale = 0.64;

/**
 * Most games open on a "How to play" box, so by default the script presses the
 * first visible start-style button to show real gameplay. Overrides replace
 * that: `clicks` are CSS selectors clicked in order (a missing one is
 * skipped), then the script waits `delay` ms before the screenshot. `after`
 * selectors are clicked once that wait is over (for something that only
 * appears later, like a customer at the counter).
 */
const startButton = /^\W*(start|begin|launch|enter|play|let's go)\b/i;
const overrides: Record<string, { clicks?: string[]; delay?: number; after?: string[] }> = {
  // A 3D game: start a new game, accept the starting look, then wait for the town.
  'seeds-of-genius': {
    clicks: [
      'button:has-text("Start a new game")',
      'button:has-text("I\'m ready!")',
    ],
    delay: 4000,
  },
  // Adventure Kit game: start, accept the look, read Sensei's welcome, then hop.
  'number-line-ninja': {
    clicks: [
      'button:has-text("Start a new game")',
      'button:has-text("I\'m ready!")',
      ...Array(14).fill('.dialogue'),
      '.pad-btn.one >> nth=1',
      '.pad-btn.one >> nth=1',
      '.pad-btn.one >> nth=1',
    ],
    delay: 1800,
  },
  // Library Rush: start a shift, read the librarian's welcome, then let the first students in.
  'math-dash': {
    clicks: [
      'button:has-text("Start a new game")',
      'button:has-text("I\'m ready!")',
      ...Array(14).fill('.dialogue'),
    ],
    delay: 6000,
  },
  'counting-carnival': {
    clicks: [
      'button:has-text("Start a new game")',
      'button:has-text("I\'m ready!")',
      ...Array(12).fill('.dialogue'),
    ],
    delay: 1500,
  },
  // Money Market: open the stand, read Chef Amara's welcome, wait for the first customer.
  'money-market-madness': {
    clicks: [
      'button:has-text("Start a new game")',
      'button:has-text("I\'m ready!")',
      ...Array(14).fill('.dialogue'),
    ],
    delay: 6000,
    after: ['.mm-serve'],
  },
  // Time Attack Clock: start, read Mr. Tock's welcome, then the town and its stopped tower.
  'time-attack-clock': {
    clicks: [
      'button:has-text("Start a new game")',
      'button:has-text("I\'m ready!")',
      ...Array(16).fill('.dialogue'),
    ],
    delay: 1500,
  },
};

const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

function servePublic() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(
      new URL(req.url ?? '/', 'http://x').pathname
    );
    const file = resolve(publicDir, `.${path}`);
    if (
      !file.startsWith(publicDir) ||
      !existsSync(file) ||
      !statSync(file).isFile()
    ) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream',
    });
    createReadStream(file).pipe(res);
  });
  return new Promise<typeof server>((done) =>
    server.listen(0, '127.0.0.1', () => done(server))
  );
}

async function capture(
  page: Page,
  baseUrl: string,
  slug: string,
  htmlPath: string
) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(baseUrl + htmlPath, { waitUntil: 'load' });

  const override = overrides[slug];
  const { clicks = [], delay = 1500, after = [] } = override ?? {};
  if (!override) {
    const start = page.getByRole('button', { name: startButton }).first();
    if (await start.isVisible().catch(() => false)) {
      await start.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(400);
    }
  }
  for (const selector of clicks) {
    const target = page.locator(selector).first();
    if (await target.isVisible().catch(() => false)) {
      await target.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(400);
    }
  }
  await page.waitForTimeout(delay);
  for (const selector of after) {
    const target = page.locator(selector).first();
    if (await target.isVisible().catch(() => false)) {
      await target.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(800);
    }
  }
  // Pressing a button can scroll the page; the card should show its top.
  await page.evaluate(() => window.scrollTo(0, 0));

  await page.screenshot({
    path: join(outDir, `${slug}.jpg`),
    type: 'jpeg',
    quality: 80,
  });
  return errors;
}

async function main() {
  const args = process.argv.slice(2);
  const only = args.flatMap((arg, i) =>
    args[i - 1] === '--only' ? [arg] : []
  );
  const unknown = only.filter(
    (slug) => !games.some((game) => game.slug === slug)
  );
  if (unknown.length)
    throw new Error(`Unknown game slug: ${unknown.join(', ')}`);
  const selected = only.length
    ? games.filter((game) => only.includes(game.slug))
    : games;

  mkdirSync(outDir, { recursive: true });
  const server = await servePublic();
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--mute-audio'],
  });

  try {
    for (const game of selected) {
      const page = await browser.newPage({
        viewport,
        deviceScaleFactor: scale,
      });
      const errors = await capture(page, baseUrl, game.slug, game.htmlPath);
      await page.close();
      console.log(
        `${errors.length ? '!' : '✓'} ${game.slug}` +
          (errors.length ? `  (script error: ${errors[0]})` : '')
      );
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
