# Campus Visual & Character Polish Plan

Follow-on work after **Phase 6** (functional polish). This plan turns the placeholder campus into a cohesive **top-down pixel art** school world aligned with `2D_GAME_WORLD_PLAN.md`.

**Prerequisites:** Phase 6 complete (persistence, iframe embeds, mobile joystick, pause menu, error boundary).

**Estimated effort:** 2–3 weeks (art + integration), depending on asset source (hand-drawn vs. licensed tile packs).

---

## Design targets

| Element | Spec |
|--------|------|
| Tile size | 32×32 px |
| Character sprites | 32×32, 4 directions, walk (3–4 frames) + idle (1–2 frames) |
| Palette | Cream `#FFFDF5`, violet `#8B5CF6`, teal `#14B8A6`, amber `#F59E0B` |
| Reference | Stardew Valley / Necesse readability — clear silhouettes, not noisy tiles |

---

## Track A — Campus overworld (Phase 1 visual debt)

### A1. Tilemap authoring
1. Create `game/assets/tilemaps/campus.json` + `campus.png` in **Tiled** (40×23 tiles ≈ current grid).
2. Layers: `ground`, `paths`, `decor`, `collision` (object layer or blocked tiles).
3. Replace `WorldScene.createPlaceholderWorld()` loop with `this.make.tilemap` + `createLayer`.
4. Wire arcade physics colliders from collision layer (not per-tile static bodies).

### A2. Building exteriors
1. Distinct sprites for Math (active), Science/English (locked), Shop, Job Board.
2. Animated door tiles or sprite overlays at entrance coordinates.
3. Remove colored `rectangle` placeholders in `addPlaceholderBuilding` / shop/job helpers.

### A3. Decorations
1. Trees, benches, fountain/water tiles, signposts with readable labels.
2. Optional: light particle layer (leaves, sparkles) — keep mobile-safe.

**Done when:** Campus reads as a school courtyard at a glance; no flat color blocks except locked-building overlay.

---

## Track B — Character sprites (Phase 2 visual debt)

### B1. Avatar sprite sheets
1. Export 12 sheets matching `CharacterCreator` ids (`human-1` … `bear-brown`).
2. Path: `public/game/sprites/avatars/{avatarId}.png` (spritesheet) + JSON atlas **or** Phaser `load.spritesheet` with fixed frame size.
3. `Player.ts`: load texture from `avatarId` instead of `player-placeholder`.
4. `WorldScene` / `MathBuildingScene`: pass `avatarId` from bootstrap (extend `WorldBootstrap` usage in scene `create`).

### B2. Animation system
1. Replace direction **tint** hack with `anims.create` for walk/idle per direction.
2. Shared `game/entities/animationKeys.ts` for animation key naming.

### B3. Equipment layers
1. Map shop `itemId` → overlay sprites (hat, shirt, accessory).
2. On equip (`handleEquip` in `world/page.tsx`), `EventBus.emit('equip-cosmetic', { slot, itemId })`.
3. `Player` composes layers: base → shirt → hat → accessory (render order).

### B4. Pets
1. Follower sprite with simple pathing behind player (offset 24–32 px).

**Done when:** Created avatar appears in-world; equipped wizard hat visible without reopening scene.

---

## Track C — Math building interior (Phase 3 visual debt)

### C1. Interior tilemap
1. `game/assets/tilemaps/math-building.json` — rooms, hallway, exit.
2. Replace brick/wood loops in `MathBuildingScene.createInterior`.

### C2. Arcade stations
1. Unique cabinet sprites per station (or recolors).
2. “Screen glow” when player in range (`InteractableObject` highlight).

### C3. NPC polish
1. `npc-teacher` sprite sheet; portrait in `WorldDialog` optional.
2. Same for Campus Guide.

---

## Track D — Audio (Phase 6 extension)

1. `public/game/audio/` — `footstep.mp3`, `door.mp3`, `coin.mp3`, `campus-theme.mp3` (OGG fallback).
2. `game/systems/WorldAudio.ts` listens to `world-settings-changed` and EventBus `play-sfx`.
3. Door enter, shop purchase, XP award hooks.

---

## Track E — Product integration

1. **Dashboard / child home:** “Enter Campus” CTA → `/world`.
2. **Feature flag** (env `NEXT_PUBLIC_WORLD_ENABLED`) for staged rollout.
3. Update `docs/test-games.md` with campus QA checklist.

---

## Suggested walk order (one PR per track)

| Order | PR focus | Reviewer checks |
|-------|----------|-----------------|
| 1 | A1 + A2 tilemap + Math building exterior | Walk collision, door still works |
| 2 | B1 + B2 avatars + animations | Create character → correct sprite |
| 3 | C1 + C2 math interior | All 5 games still open in iframe |
| 4 | B3 + B4 cosmetics + pets | Shop equip updates sprite |
| 5 | A3 + D decor + audio | Mobile FPS ≥ 30 |
| 6 | E integration | New user can find campus |

---

## Asset checklist (deliverables)

- [ ] `campus.png` + `campus.json`
- [ ] `math-building.png` + `math-building.json`
- [ ] 12× avatar spritesheets
- [ ] 10+ cosmetic overlay sprites
- [ ] 4× building facade sprites
- [ ] UI doesn’t need change if HUD already on-brand

---

## QA (visual pass)

- [ ] No placeholder rectangles in campus or math building
- [ ] Pixel art crisp at 1x and 2x zoom (`pixelArt: true` in `game/main.ts`)
- [ ] iPhone Safari: joystick + iframe games + restored position
- [ ] Locked buildings still block entry
- [ ] Lighthouse performance: LCP acceptable with lazy-loaded atlases

---

## References

- Implementation plan: `2D_GAME_WORLD_PLAN.md`
- Scenes: `game/scenes/WorldScene.ts`, `game/scenes/MathBuildingScene.ts`
- Bootstrap: `game/worldBootstrap.ts`
- Character API: `app/api/character/*`
