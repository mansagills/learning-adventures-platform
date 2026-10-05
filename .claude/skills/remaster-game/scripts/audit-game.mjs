#!/usr/bin/env node
// Quick inventory of a submitted or old single-file HTML game, for the plan.
//   node .claude/skills/remaster-game/scripts/audit-game.mjs <file.html>
// Prints: size, title, emoji count, external URLs (fonts, CDNs, trackers),
// canvas/Three.js use, likely questions and answer arrays, and feedback strings.
import { readFileSync } from 'node:fs';
const file = process.argv[2];
if (!file) {
  console.error('usage: audit-game.mjs <file.html>');
  process.exit(1);
}
const s = readFileSync(file, 'utf8');
const emoji = s.match(/\p{Extended_Pictographic}/gu) ?? [];
const urls = [...new Set((s.match(/https?:\/\/[^\s"'<>)]+/g) ?? []).map((u) => u.replace(/[,;]$/, '')))];
const title = (s.match(/<title>([^<]*)<\/title>/i) ?? [])[1] ?? '(none)';
const questions = (s.match(/["'`][^"'`\n]{8,160}\?["'`]/g) ?? []).slice(0, 25);
const arrays = (s.match(/\b(questions|problems|levels|words|facts|items|cards)\s*[:=]\s*\[/gi) ?? []).length;
// feedback shown to the child: strings written into the page, not CSS class names
const feedback = (s.match(/(?:textContent|innerText|innerHTML)\s*[+]?=\s*["'`][^"'`\n]{3,120}["'`]/g) ?? []).map((m) => m.replace(/^[^"'`]*/, '')).slice(0, 12);
const out = {
  file,
  title,
  sizeKB: Math.round(s.length / 1024),
  lines: s.split('\n').length,
  emojiCount: emoji.length,
  emojiSample: [...new Set(emoji)].slice(0, 20).join(' '),
  externalUrls: urls,
  googleFonts: /fonts\.googleapis|fonts\.gstatic/.test(s),
  usesCanvas: /<canvas|getContext\(/.test(s),
  usesThree: /three(\.module)?(\.min)?\.js|THREE\./.test(s),
  usesLocalStorage: /localStorage/.test(s),
  questionArrays: arrays,
  sampleQuestions: questions,
  sampleFeedback: feedback,
  // a level counter that actually changes something (not just the word "level")
  levelLogic: /(level|difficulty|tier)\s*(\+\+|\+=|=\s*\w+\s*\+)/i.test(s),
  hasHints: /hint/i.test(s),
};
console.log(JSON.stringify(out, null, 2));
