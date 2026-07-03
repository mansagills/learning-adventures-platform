const fs = require('fs');
const path = require('path');

const root = __dirname;
const requiredFiles = [
  'index.html',
  'styles.css',
  'src/main.js',
  'server.js',
];

for (const file of requiredFiles) {
  const target = path.join(root, file);
  if (!fs.existsSync(target)) {
    throw new Error(`Missing demo file: ${file}`);
  }
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8');

const checks = [
  ['canvas mount', html.includes('id="game"')],
  ['mrs numbers quest', js.includes('Mrs. Numbers')],
  ['quest item loop', js.includes('Number Battery') && js.includes('Turbo Token')],
  ['80 percent gate', js.includes('score >= 80')],
  ['text render hook', js.includes('render_game_to_text')],
  ['deterministic time hook', js.includes('advanceTime')],
];

const failed = checks.filter(([, passed]) => !passed);
if (failed.length) {
  throw new Error(`Smoke checks failed: ${failed.map(([name]) => name).join(', ')}`);
}

console.log('Campus sim demo smoke checks passed.');
