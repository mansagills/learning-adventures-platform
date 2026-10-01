// Dev helper: node scripts/shot.mjs <url> <out.png> [w] [h]
import { chromium } from 'playwright-core';
const [url, out, w = '1280', h = '720'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on('console', (m) => console.log('[console]', m.type(), m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(url);
await page.waitForTimeout(1500);
await page.screenshot({ path: out });
await browser.close();
