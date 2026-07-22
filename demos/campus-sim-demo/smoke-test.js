const fs = require('fs');
const path = require('path');

const root = __dirname;
const requiredFiles = [
  'index.html',
  'styles.css',
  'src/main.js',
  'server.js',
  'assets/sprites/human-1.png',
  'assets/sprites/human-2.png',
  'assets/sprites/robot-blue.png',
  'assets/sprites/wizard-purple.png',
  'assets/sprites/cat-orange.png',
  'assets/sprites/knight-silver.png',
  'assets/tilemaps/grass-plain-1.png',
  'assets/tilemaps/stone-path-1.png',
  'assets/tilemaps/math-wall-1.png',
  'assets/tilemaps/arcade-cabinet.png',
  'assets/tilemaps/desk-computer.png',
  'assets/modern/school-32.png',
  'assets/modern/office-32.png',
  'assets/modern/terrain-32.png',
  'assets/modern/city-terrain-32.png',
  'assets/modern/room-builder-32.png',
  'assets/modern/characters/adam-16.png',
  'assets/modern/characters/alex-16.png',
  'assets/modern/characters/amelia-16.png',
  'assets/modern/characters/bob-16.png',
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
  ['original sprite sheets', js.includes('./assets/sprites/human-1.png')],
  ['original tilemaps', js.includes('./assets/tilemaps/grass-plain-1.png')],
  ['modern campus sheets', js.includes('./assets/modern/school-32.png') && js.includes('drawModernBuilding')],
  ['modern free-pack characters', js.includes('./assets/modern/characters/amelia-16.png') && js.includes('drawModernCharacterSprite')],
  ['objective guidance', js.includes('objectiveHint') && js.includes('drawObjectiveMarker')],
  ['ambient student chatter', js.includes('studentLine') && js.includes('drawSpeechBubble')],
  ['race result feedback', js.includes('Math Explorer Badge')],
  ['xp reward loop', js.includes('awardQuestXp') && js.includes('progression.xp += 100')],
  ['campus store purchase loop', js.includes('Campus Store') && js.includes('purchaseStoreItem')],
];

const failed = checks.filter(([, passed]) => !passed);
if (failed.length) {
  throw new Error(`Smoke checks failed: ${failed.map(([name]) => name).join(', ')}`);
}

console.log('Campus sim demo smoke checks passed.');
