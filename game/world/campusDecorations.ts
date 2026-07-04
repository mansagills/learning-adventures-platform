import * as Phaser from 'phaser';
import { TILE_SIZE } from './TilemapGenerator';

/**
 * campusDecorations — detail pass for the Modern-art campus.
 *
 * Places furniture inside the four rooms (classroom, science lab, library,
 * cafeteria) and life outdoors (trees, lamps, benches, fountain, clock
 * tower) using props prepared from the Modern Interiors/Exteriors packs in
 * public/game-assets/modern/props/.
 *
 * Placement rules (violating these breaks gameplay, not just looks):
 * - stay clear of station tiles and their prompts
 * - stay clear of NPC posts and patrol lines (Leo: col 11.75 rows 28.5-33 +
 *   row 28.5 cols 11.75-14 inside Math Hall; outdoor students on path bands
 *   rows 35-36.5 and cols 47-48)
 * - never block doorways (Math 11-12@34, Lab 39-40@15, Grove 81-82@34,
 *   Commons 55-56@52) or the quest power-cell spots
 *
 * Props are bottom-anchored (origin 0.5,1) at `row` so a 48×96 source reads
 * as standing furniture; 48px art scales ×4/3 onto the 64px grid.
 */

const T = TILE_SIZE;
const SCALE = 64 / 48;

const PROP_FILES: Record<string, string> = {
  // outdoor
  'prop-tree-1': 'tree-1.png',
  'prop-tree-2': 'tree-2.png',
  'prop-street-lamp': 'street-lamp.png',
  'prop-bench': 'bench.png',
  'prop-fountain': 'fountain.png',
  'prop-flower-bush-1': 'flower-bush-1.png',
  'prop-flower-bush-2': 'flower-bush-2.png',
  'prop-drinking-fountain': 'drinking-fountain.png',
  'prop-clock-tower': 'clock-tower.png',
  'prop-school-flag': 'school-flag.png',
  'prop-basketball-net': 'basketball-net.png',
  // classroom (Math Hall)
  'prop-chalkboard': 'chalkboard.png',
  'prop-school-desk': 'school-desk.png',
  'prop-globe': 'globe.png',
  'prop-corkboard': 'corkboard.png',
  'prop-locker': 'locker.png',
  'prop-world-map': 'world-map.png',
  // library (Story Grove)
  'prop-bookcase-1': 'bookcase-1.png',
  'prop-bookcase-2': 'bookcase-2.png',
  'prop-bookcase-narrow': 'bookcase-narrow.png',
  'prop-library-ladder': 'library-ladder.png',
  'prop-checkout-desk': 'checkout-desk.png',
  'prop-book-stand': 'book-stand.png',
  // cafeteria (Commons)
  'prop-vending-1': 'vending-1.png',
  'prop-vending-2': 'vending-2.png',
  'prop-snack-fridge': 'snack-fridge.png',
  'prop-cafe-table': 'cafe-table.png',
  'prop-stool': 'stool.png',
  'prop-food-tray': 'food-tray.png',
  // science lab (Discovery Lab)
  'prop-lab-desk-1': 'lab-desk-1.png',
  'prop-lab-desk-2': 'lab-desk-2.png',
  'prop-lab-plant': 'lab-plant.png',
  'prop-lab-robot': 'lab-robot.png',
  'prop-specimen-shelf': 'specimen-shelf.png',
};

interface Placement {
  key: string;
  col: number;
  row: number;
  /** Solid props get an invisible static body at their base tile. */
  solid?: boolean;
  /** Render above same-depth neighbours (e.g. tray on table). */
  raise?: boolean;
}

/** Looping animated props (spritesheets from the packs' Animated folders). */
interface AnimatedProp {
  key: string;
  file: string;
  frameWidth: number;
  frameHeight: number;
  frameRate: number;
}

const ANIMATED_PROPS: AnimatedProp[] = [
  { key: 'anim-fountain',       file: 'anim-fountain.png',       frameWidth: 144, frameHeight: 144, frameRate: 6 },
  { key: 'anim-school-flag',    file: 'anim-school-flag.png',    frameWidth: 144, frameHeight: 432, frameRate: 8 },
  { key: 'anim-butterfly-1',    file: 'anim-butterfly-1.png',    frameWidth: 48,  frameHeight: 48,  frameRate: 8 },
  { key: 'anim-butterfly-2',    file: 'anim-butterfly-2.png',    frameWidth: 48,  frameHeight: 48,  frameRate: 8 },
  { key: 'anim-control-screens',file: 'anim-control-screens.png',frameWidth: 192, frameHeight: 144, frameRate: 6 },
  { key: 'anim-pendulum-clock', file: 'anim-pendulum-clock.png', frameWidth: 48,  frameHeight: 144, frameRate: 4 },
  { key: 'anim-canteen-fridge', file: 'anim-canteen-fridge.png', frameWidth: 96,  frameHeight: 144, frameRate: 8 },
];

const ANIMATED_PLACEMENTS: Placement[] = [
  // Plaza fountain + school flag (replace the static versions)
  { key: 'anim-fountain', col: 54.5, row: 33.5, solid: true },
  { key: 'anim-school-flag', col: 52, row: 34.3, solid: true },
  // Butterflies fluttering by the flower beds and benches
  { key: 'anim-butterfly-1', col: 45.6, row: 34.1, raise: true },
  { key: 'anim-butterfly-2', col: 50.4, row: 37.4, raise: true },
  { key: 'anim-butterfly-1', col: 33.4, row: 37.7, raise: true },
  { key: 'anim-butterfly-2', col: 58.4, row: 34.0, raise: true },
  // Discovery Lab: wall of live monitoring screens behind the robot
  { key: 'anim-control-screens', col: 40, row: 6.2, solid: true },
  // Story Grove: ticking grandfather clock between the station and shelves
  { key: 'anim-pendulum-clock', col: 78.5, row: 27.4, solid: true },
  // Commons: humming display fridge full of cake (replaces static fridge)
  { key: 'anim-canteen-fridge', col: 60.2, row: 55.5, solid: true },
];

const PLACEMENTS: Placement[] = [
  // ── Math Hall (classroom): interior cols 5-19, rows 26-33 ─────────────────
  { key: 'prop-chalkboard', col: 12.5, row: 27.6, solid: true },
  { key: 'prop-world-map', col: 8, row: 26.9 },
  { key: 'prop-corkboard', col: 16.5, row: 26.9 },
  { key: 'prop-locker', col: 5.9, row: 29.5, solid: true },
  { key: 'prop-locker', col: 5.9, row: 30.8, solid: true },
  { key: 'prop-school-desk', col: 8, row: 30, solid: true },
  { key: 'prop-school-desk', col: 9.5, row: 30.8, solid: true },
  { key: 'prop-school-desk', col: 16.5, row: 30, solid: true },
  { key: 'prop-school-desk', col: 17.5, row: 31.5, solid: true },
  { key: 'prop-globe', col: 18.5, row: 29.5, solid: true },

  // ── Discovery Lab (science): interior cols 35-44, rows 5-14 ───────────────
  // (north wall center is taken by the animated control-screen wall)
  { key: 'prop-specimen-shelf', col: 37, row: 5.9 },
  { key: 'prop-lab-robot', col: 40, row: 7.2, solid: true },
  { key: 'prop-lab-desk-1', col: 38.5, row: 9, solid: true },
  { key: 'prop-lab-desk-2', col: 41.5, row: 9, solid: true },
  { key: 'prop-lab-plant', col: 35.8, row: 11.5, solid: true },
  { key: 'prop-lab-plant', col: 44.2, row: 11.5, solid: true },

  // ── Story Grove (library): interior cols 75-89, rows 26-33 ────────────────
  { key: 'prop-bookcase-1', col: 80, row: 27.5, solid: true },
  { key: 'prop-bookcase-2', col: 82, row: 27.5, solid: true },
  { key: 'prop-bookcase-1', col: 84, row: 27.5, solid: true },
  { key: 'prop-bookcase-narrow', col: 75.9, row: 29.5, solid: true },
  { key: 'prop-bookcase-narrow', col: 89.1, row: 29.5, solid: true },
  { key: 'prop-library-ladder', col: 83.2, row: 28.6 },
  { key: 'prop-checkout-desk', col: 86, row: 31, solid: true },
  { key: 'prop-book-stand', col: 80.5, row: 32, solid: true },

  // ── The Commons (cafeteria): interior cols 51-61, rows 53-62 ──────────────
  { key: 'prop-vending-1', col: 51.8, row: 56.5, solid: true },
  { key: 'prop-vending-2', col: 51.8, row: 58, solid: true },
  // (east wall fridge is the animated canteen fridge)
  { key: 'prop-cafe-table', col: 55, row: 57.5, solid: true },
  { key: 'prop-food-tray', col: 55, row: 57.2, raise: true },
  { key: 'prop-cafe-table', col: 58.5, row: 58.5, solid: true },
  { key: 'prop-food-tray', col: 58.5, row: 58.2, raise: true },
  { key: 'prop-stool', col: 54, row: 58 },
  { key: 'prop-stool', col: 56, row: 58 },
  { key: 'prop-stool', col: 57.5, row: 59 },
  { key: 'prop-stool', col: 59.5, row: 59 },

  // ── Outdoors: landmarks near the central crossing ──────────────────────────
  // (fountain + school flag are animated — see ANIMATED_PLACEMENTS)
  { key: 'prop-clock-tower', col: 23, row: 34.2, solid: true },
  { key: 'prop-drinking-fountain', col: 58, row: 34.6, solid: true },
  { key: 'prop-basketball-net', col: 26, row: 43, solid: true },

  // Trees lining the horizontal path (base row 34.3 north / 39 south)
  { key: 'prop-tree-1', col: 26, row: 34.3, solid: true },
  { key: 'prop-tree-2', col: 32, row: 34.3, solid: true },
  { key: 'prop-tree-1', col: 38, row: 34.3, solid: true },
  { key: 'prop-tree-2', col: 58, row: 33.2, solid: true },
  { key: 'prop-tree-1', col: 64, row: 34.3, solid: true },
  { key: 'prop-tree-2', col: 70, row: 34.3, solid: true },
  { key: 'prop-tree-2', col: 24, row: 39, solid: true },
  { key: 'prop-tree-1', col: 30, row: 39, solid: true },
  { key: 'prop-tree-2', col: 42, row: 39, solid: true },
  { key: 'prop-tree-1', col: 60, row: 39, solid: true },
  { key: 'prop-tree-2', col: 66, row: 39, solid: true },
  { key: 'prop-tree-1', col: 72, row: 39, solid: true },

  // Trees flanking the vertical path (clear of cols 47-48, the cells, and
  // the Discovery Lab's east wall at col 45)
  { key: 'prop-tree-1', col: 50.7, row: 10, solid: true },
  { key: 'prop-tree-2', col: 50.7, row: 18, solid: true },
  { key: 'prop-tree-2', col: 45.3, row: 44, solid: true },
  { key: 'prop-tree-1', col: 50.7, row: 50, solid: true },

  // Street lamps at the path edges
  { key: 'prop-street-lamp', col: 29, row: 34.6, solid: true },
  { key: 'prop-street-lamp', col: 41, row: 34.6, solid: true },
  { key: 'prop-street-lamp', col: 61, row: 34.6, solid: true },
  { key: 'prop-street-lamp', col: 73, row: 34.6, solid: true },
  { key: 'prop-street-lamp', col: 27, row: 38.2, solid: true },
  { key: 'prop-street-lamp', col: 63, row: 38.2, solid: true },

  // Benches + flower beds around the crossing
  { key: 'prop-bench', col: 43, row: 34.5, solid: true },
  { key: 'prop-bench', col: 53, row: 38.2, solid: true },
  { key: 'prop-bench', col: 33, row: 38.2, solid: true },
  { key: 'prop-flower-bush-1', col: 45.5, row: 34.6 },
  { key: 'prop-flower-bush-2', col: 50.5, row: 34.6 },
  { key: 'prop-flower-bush-2', col: 45.5, row: 37.9 },
  { key: 'prop-flower-bush-1', col: 50.5, row: 37.9 },
];

/** Queue every prop image + animated spritesheet. Call from preload(). */
export function preloadCampusProps(scene: Phaser.Scene): void {
  Object.entries(PROP_FILES).forEach(([key, file]) => {
    scene.load.image(key, `/game-assets/modern/props/${file}`);
  });
  ANIMATED_PROPS.forEach((a) => {
    scene.load.spritesheet(a.key, `/game-assets/modern/props/${a.file}`, {
      frameWidth: a.frameWidth,
      frameHeight: a.frameHeight,
    });
  });
}

/**
 * Place all decorations. Call from create() AFTER the base scene built the
 * map and player (solid props need the player collider).
 */
export function placeCampusProps(
  scene: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite | undefined,
): void {
  PLACEMENTS.forEach((p) => {
    if (!scene.textures.exists(p.key)) return;
    const x = p.col * T;
    const y = p.row * T;
    const img = scene.add.image(x, y, p.key);
    img.setOrigin(0.5, 1);
    img.setScale(SCALE);
    img.setDepth(p.raise ? 6 : 5);

    if (p.solid && player) {
      // Invisible blocker on the prop's base tile (same trick as stations)
      const body = scene.physics.add.staticImage(x, y - T / 2, 'wall-tile');
      body.setVisible(false).setDisplaySize(48, 40).refreshBody();
      scene.physics.add.collider(player, body);
    }
  });

  // Animated props: register a looping animation per sheet, then place
  ANIMATED_PROPS.forEach((a) => {
    if (!scene.textures.exists(a.key) || scene.anims.exists(`${a.key}-loop`)) {
      return;
    }
    scene.anims.create({
      key: `${a.key}-loop`,
      frames: scene.anims.generateFrameNumbers(a.key),
      frameRate: a.frameRate,
      repeat: -1,
    });
  });
  ANIMATED_PLACEMENTS.forEach((p) => {
    if (!scene.textures.exists(p.key)) return;
    const x = p.col * T;
    const y = p.row * T;
    const sprite = scene.add.sprite(x, y, p.key);
    sprite.setOrigin(0.5, 1);
    sprite.setScale(SCALE);
    sprite.setDepth(p.raise ? 7 : 5);
    if (scene.anims.exists(`${p.key}-loop`)) {
      sprite.anims.play(`${p.key}-loop`);
    }

    if (p.solid && player) {
      const body = scene.physics.add.staticImage(x, y - T / 2, 'wall-tile');
      body.setVisible(false).setDisplaySize(48, 40).refreshBody();
      scene.physics.add.collider(player, body);
    }
  });
}
