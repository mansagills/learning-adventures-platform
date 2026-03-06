---
name: sprite-integration
description: Integrate Sorceress-generated assets (sprites, tilesets, audio) into the Learning Adventures Phaser 3 campus world. Use when you have exported assets from Sorceress and need to load them into WorldScene or other Phaser scenes.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Sprite & Asset Integration (Sorceress → Phaser 3)

> Platform-specific skill for integrating Sorceress.games exports into Learning Adventures.
> Sub-skill of `game-development`. Also consult `game-development/game-art` for art principles.

---

## Sorceress Export Checklist

Before starting integration, confirm you have exported from Sorceress:

**For character sprites / NPCs:**
- [ ] PNG spritesheet (all frames in a grid)
- [ ] JSON frame data (if using Sorceress's Slicer — includes frame coords and animation groupings)
- [ ] Background removed (transparent PNG, not white background)
- [ ] Note the frame dimensions: width × height in pixels (e.g., 32×32)
- [ ] Note the layout: how many columns, how many rows, animation grouping order

**For tilesets:**
- [ ] PNG tileset image (single image with all tiles in a grid)
- [ ] Tiled-compatible JSON map file (if Sorceress exported a full map) OR just the tileset PNG for manual Tiled setup
- [ ] Note the tile size (e.g., 16×16, 32×32)
- [ ] Confirm tiles are seamless (no visible seams when tiled)

**For audio:**
- [ ] WebM/Opus format preferred (fallback: MP3)
- [ ] Trimmed and faded — no silence at start/end
- [ ] Normalized volume

---

## Asset Directory Structure

Place all assets under `learning-adventures-app/public/assets/`:

```
public/assets/
├── sprites/
│   ├── player.png            # Player character spritesheet
│   ├── player.json           # Optional: frame data JSON from Sorceress Slicer
│   ├── npc-teacher.png
│   ├── npc-shopkeeper.png
│   └── [character-name].png
├── tilesets/
│   ├── campus-tileset.png    # Main outdoor campus tiles
│   ├── math-interior.png     # Math building floor/wall tiles
│   └── [building]-interior.png
├── tilemaps/
│   ├── campus.json           # Tiled JSON map for WorldScene
│   └── math-building.json    # Tiled JSON map for MathBuildingScene
├── audio/
│   ├── footstep.webm
│   ├── door-open.webm
│   ├── xp-pickup.webm
│   └── level-up.webm
└── ui/
    ├── xp-icon.png
    └── coin-icon.png
```

**Naming convention:** `[type]_[object]_[variant].[ext]` for complex assets, or simple `[name].png` for spritesheets.

---

## Naming Reference

Match the `game-art` sub-skill naming convention:

```
spr_player_idle_01.png      → use as: 'player-idle'
spr_npc_teacher_walk.png    → use as: 'npc-teacher'
tex_campus_grass.png        → use as: 'campus-grass'
tileset_campus_main.png     → use as: 'campus-tiles'
sfx_footstep_grass.webm     → use as: 'footstep'
```

In Phaser, the key you use in `this.load.*()` is the reference throughout the scene. Keep keys short and consistent.

---

## Phaser Preload Patterns

Add all asset loading to the scene's `preload()` method.

### Spritesheet (uniform grid, no JSON)

```typescript
preload() {
  // Uniform grid spritesheet — specify frame dimensions
  this.load.spritesheet('player', '/assets/sprites/player.png', {
    frameWidth: 32,
    frameHeight: 32,
    // Optional: if spritesheet has margin/spacing
    margin: 0,
    spacing: 0
  });

  this.load.spritesheet('npc-teacher', '/assets/sprites/npc-teacher.png', {
    frameWidth: 32,
    frameHeight: 32
  });
}
```

### Spritesheet with Sorceress JSON Frame Data

```typescript
preload() {
  // Load both PNG and JSON together — Phaser uses the JSON for frame mapping
  this.load.atlas('player', '/assets/sprites/player.png', '/assets/sprites/player.json');
}
```

### Tileset + Tilemap

```typescript
preload() {
  // Tileset image — key must match the name used inside the Tiled JSON
  this.load.image('campus-tiles', '/assets/tilesets/campus-tileset.png');

  // Tiled JSON map
  this.load.tilemapTiledJSON('campus', '/assets/tilemaps/campus.json');
}
```

### Audio

```typescript
preload() {
  // WebM primary, MP3 fallback
  this.load.audio('footstep', ['/assets/audio/footstep.webm', '/assets/audio/footstep.mp3']);
  this.load.audio('door-open', ['/assets/audio/door-open.webm', '/assets/audio/door-open.mp3']);
  this.load.audio('xp-pickup', ['/assets/audio/xp-pickup.webm', '/assets/audio/xp-pickup.mp3']);
}
```

---

## Animation Config Patterns

Add animations in the scene's `create()` method after preload completes.

### 4-Direction Walk Cycle (Standard Sorceress Output)

Sorceress Spritely generates sprites in this row order by default: Down, Left, Right, Up.
Each direction: 3 walk frames + 1 idle frame (or just 3 walk frames with first frame as idle).

```typescript
create() {
  // 4-direction walk — 3 frames per direction, rows: 0=down, 1=left, 2=right, 3=up
  const dirs = ['down', 'left', 'right', 'up'];
  dirs.forEach((dir, row) => {
    this.anims.create({
      key: `player-walk-${dir}`,
      frames: this.anims.generateFrameNumbers('player', {
        start: row * 3,
        end: row * 3 + 2
      }),
      frameRate: 8,
      repeat: -1
    });

    // Idle: just the first frame of each direction
    this.anims.create({
      key: `player-idle-${dir}`,
      frames: [{ key: 'player', frame: row * 3 }],
      frameRate: 1,
      repeat: 0
    });
  });
}
```

### Atlas-Based Animation (from Sorceress JSON)

```typescript
create() {
  // When using this.load.atlas() — reference frames by name from the JSON
  this.anims.create({
    key: 'player-walk-down',
    frames: [
      { key: 'player', frame: 'walk_down_01' },
      { key: 'player', frame: 'walk_down_02' },
      { key: 'player', frame: 'walk_down_03' }
    ],
    frameRate: 8,
    repeat: -1
  });
}
```

---

## Tilemap Setup in WorldScene

```typescript
create() {
  // Create map from preloaded Tiled JSON
  const map = this.make.tilemap({ key: 'campus' });

  // Add tileset — first arg must match tileset name inside Tiled JSON
  const tileset = map.addTilesetImage('campus-tileset', 'campus-tiles');

  // Create layers — names must match layer names in Tiled
  const groundLayer = map.createLayer('Ground', tileset, 0, 0);
  const pathLayer = map.createLayer('Paths', tileset, 0, 0);
  const buildingLayer = map.createLayer('Buildings', tileset, 0, 0);

  // Collision layer — set invisible, mark tiles with collides property in Tiled
  const collisionLayer = map.createLayer('Collision', tileset, 0, 0);
  collisionLayer.setVisible(false);
  collisionLayer.setCollisionByProperty({ collides: true });

  // Set world bounds to map size
  this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  // Add collider between player and collision layer
  this.physics.add.collider(this.player, collisionLayer);

  // Camera follows player within map bounds
  this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
}
```

---

## Audio Playback

```typescript
create() {
  // Create sound objects (do not autoplay)
  this.sounds = {
    footstep: this.sound.add('footstep', { loop: true, volume: 0.4 }),
    doorOpen: this.sound.add('door-open', { volume: 0.6 }),
    xpPickup: this.sound.add('xp-pickup', { volume: 0.7 })
  };
}

update() {
  // Play footstep only while moving
  const moving = this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0;
  if (moving && !this.sounds.footstep.isPlaying) {
    this.sounds.footstep.play();
  } else if (!moving && this.sounds.footstep.isPlaying) {
    this.sounds.footstep.stop();
  }
}
```

**Note:** Browser audio requires user interaction before playing. Phaser handles this automatically via its audio unlock system — no extra code needed.

---

## Verification Checklist

After integrating new assets:

- [ ] No console errors on scene load (`preload` errors appear in browser console)
- [ ] Sprite renders at correct pixel size (not stretched or squashed)
- [ ] Walk animations play when player moves in all 4 directions
- [ ] Idle animation shows when player stops
- [ ] Tilemap renders at correct position (top-left origin, no offset)
- [ ] Collision tiles block player movement correctly
- [ ] Camera follows player and clamps to map bounds
- [ ] Audio plays at appropriate volume (not jarring)
- [ ] No visible white background on character sprites (must be transparent PNG)
- [ ] Sprites scale correctly at different viewport sizes

---

## Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| White box around sprite | Background not removed | Use Sorceress Background Remover before export |
| Wrong animation frames | Incorrect `start`/`end` frame numbers | Count frames in spritesheet — Phaser uses 0-indexed frames |
| Tileset name mismatch | Tiled JSON tileset name ≠ Phaser key | Open Tiled JSON, find `"name"` field in tilesets array — use that exact string in `addTilesetImage()` |
| Map layer not found | Layer name mismatch | Open Tiled JSON, check `"layers"` array for exact layer names |
| Audio doesn't play | Missing user interaction | Confirm game starts on a click/button press, not automatically |
| Sprites appear pixelated | Phaser antialiasing | Add `pixelArt: true` to Phaser config for pixel art sprites |

### Pixel Art Config

For pixel art sprites from Sorceress (to prevent blurring):

```typescript
// In game/main.ts Phaser config
const config: Phaser.Types.Core.GameConfig = {
  // ...
  pixelArt: true,  // Disables antialiasing for crisp pixel art
  render: {
    antialias: false,
    pixelArt: true
  }
};
```

---

> Sub-skills to also consult: `game-development/game-art` (art principles, naming, organization), `game-development/2d-world-dev` (scene structure, animation patterns, camera setup).
