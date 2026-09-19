---
name: 2d-world-dev
description: Phaser 3 campus world development for Learning Adventures. Use when working on the 2D top-down game world — scenes, entities, tilemaps, the React/Phaser bridge, or integrating Sorceress-generated assets into the campus world.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# 2D Campus World Development (Phaser 3)

> Platform-specific skill for Learning Adventures' top-down RPG campus world.
> Sub-skill of `game-development`. Also consult `game-development/2d-games` and `game-development/web-games`.

---

## Agent Invocation Protocol

| Situation | Invoke | Why |
|-----------|--------|-----|
| Designing a new game mechanic, progression system, or NPC interaction | `game-designer` agent | Design before code — get GDD, balancing, player psychology |
| Implementing a spec'd mechanic, new scene, entity, or system | `game-developer` agent | Performance, architecture, patterns |
| Integrating Sorceress-exported assets | This skill alone | Asset pipeline is deterministic — no agent needed |
| Debugging Phaser rendering or physics | `game-developer` agent | Profiling and optimization expertise |

**Rule:** Always run `game-designer` before `game-developer` for new features. Never code first.

---

## Existing File Map

| File | Purpose |
|------|---------|
| `game/main.ts` | Phaser 3 config, arcade physics, scene registry |
| `game/scenes/WorldScene.ts` | Campus map — tilemap, player spawn, NPC placement, building doors |
| `game/scenes/MathBuildingScene.ts` | Math building interior skeleton |
| `game/entities/Player.ts` | WASD movement, collision, position saving |
| `game/entities/Door.ts` | Interactive door system (enter buildings) |
| `game/entities/NPC.ts` | NPC base class |
| `components/phaser/PhaserGame.tsx` | React/Phaser mount point and bridge |
| `components/phaser/EventBus.ts` | React ↔ Phaser event communication |
| `app/world/page.tsx` | Auth-gated world route with HUD overlay |
| `2D_GAME_WORLD_PLAN.md` | Full 833-line phase-by-phase spec — read before working on new phases |

**Always read `2D_GAME_WORLD_PLAN.md` before starting any new feature** to understand current phase and avoid duplicating planned work.

---

## Phaser 3 Patterns

### Scene Structure

```typescript
export class MyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MyScene' });
  }

  preload() {
    // Load assets here — spritesheets, tilemaps, audio
    this.load.spritesheet('player', '/assets/sprites/player.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.tilemapTiledJSON('campus', '/assets/tilemaps/campus.json');
    this.load.image('campus-tiles', '/assets/tilesets/campus-tileset.png');
  }

  create() {
    // Build scene — tilemaps, physics groups, animations, colliders
    // Emit to React when scene is ready:
    EventBus.emit('current-scene-ready', this);
  }

  update(time: number, delta: number) {
    // Per-frame logic — player input, NPC movement
  }
}
```

### Arcade Physics (Top-Down)

```typescript
// In main.ts config
physics: {
  default: 'arcade',
  arcade: { gravity: { y: 0 }, debug: false }  // y:0 for top-down
}

// In scene create()
this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
this.player = this.physics.add.sprite(startX, startY, 'player');
this.player.setCollideWorldBounds(true);

// Tilemap collision
const collisionLayer = map.createLayer('Collision', tileset, 0, 0);
collisionLayer.setCollisionByProperty({ collides: true });
this.physics.add.collider(this.player, collisionLayer);
```

### Animation Config (from Sorceress sprite data)

```typescript
// 4-direction walk cycle (32x32 sprites, 3 frames each)
const directions = ['down', 'left', 'right', 'up'];
directions.forEach((dir, row) => {
  this.anims.create({
    key: `walk-${dir}`,
    frames: this.anims.generateFrameNumbers('player', {
      start: row * 3,
      end: row * 3 + 2
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: `idle-${dir}`,
    frames: [{ key: 'player', frame: row * 3 }],
    frameRate: 1
  });
});
```

### Tilemap Setup

```typescript
const map = this.make.tilemap({ key: 'campus' });
const tileset = map.addTilesetImage('campus-tileset', 'campus-tiles');

// Layer order matters for z-depth
const groundLayer = map.createLayer('Ground', tileset, 0, 0);
const pathLayer = map.createLayer('Paths', tileset, 0, 0);
const buildingLayer = map.createLayer('Buildings', tileset, 0, 0);
const collisionLayer = map.createLayer('Collision', tileset, 0, 0);

collisionLayer.setVisible(false);  // Hidden collision layer
collisionLayer.setCollisionByProperty({ collides: true });
```

### Camera

```typescript
// Follow player with world bounds
this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
this.cameras.main.startFollow(this.player, true, 0.1, 0.1);  // lerp for smooth follow
```

---

## React/Phaser Bridge (EventBus)

Use `EventBus` for all communication between Phaser scenes and React HUD.

```typescript
// In Phaser scene — emit to React
import { EventBus } from '../../components/phaser/EventBus';

EventBus.emit('xp-gained', { amount: 50, total: 350 });
EventBus.emit('enter-building', { building: 'math', scene: 'MathBuildingScene' });
EventBus.emit('player-level-up', { level: 5 });

// In React component — listen from Phaser
useEffect(() => {
  EventBus.on('xp-gained', ({ amount, total }) => {
    setXP(total);
  });
  return () => { EventBus.removeListener('xp-gained'); };
}, []);
```

**Never import React components into Phaser scenes.** All cross-boundary communication goes through EventBus only.

---

## Scene Transitions

```typescript
// Switch scenes from within Phaser
this.scene.start('MathBuildingScene', { returnScene: 'WorldScene' });

// Trigger Next.js route from Phaser (for mini-games)
EventBus.emit('navigate', { path: '/games/math-adventure.html' });
// React listens and calls router.push()
```

---

## Performance Rules (60 FPS target)

- Use object pooling for frequently spawned items (XP particles, pickups)
- Pause inactive scenes: `this.scene.pause('WorldScene')` when inside a building
- Use `setActive(false)` + `setVisible(false)` instead of destroying sprites
- NPC pathfinding: update at 10Hz (every 6 frames), not every frame
- Tilemap layers: only create layers you actually use

---

## Asset Integration Workflow (from Sorceress)

See `game-development/sprite-integration` skill for the full pipeline. Summary:

1. Export PNG spritesheet + JSON frame data from Sorceress
2. Save to `public/assets/sprites/[name].png` (+ optional `[name].json`)
3. Load in scene `preload()` with `this.load.spritesheet()`
4. Create animations in `create()` with `this.anims.create()`
5. Test: player sprite renders, walk animations play on WASD input

---

## Phase Roadmap

Consult `2D_GAME_WORLD_PLAN.md` for detailed phase specs. Summary:

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Core infrastructure (scenes, player, doors, NPCs) | Partially done |
| 2 | Real assets: character sprites, campus tileset | Next priority |
| 3 | Building interiors, NPC dialogues | Upcoming |
| 4 | XP/coin economy, shop | Upcoming |
| 5 | Mini-game integration from buildings | Upcoming |
| 6 | Particle effects, polish | Upcoming |

---

> Sub-skills to also consult: `game-development/2d-games` (sprite/tilemap patterns), `game-development/web-games` (Phaser framework selection, browser constraints), `game-development/game-design` (progression systems).
