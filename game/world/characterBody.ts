// characterBody.ts
// Pure TypeScript module — NO Phaser dependency.
//
// One source of truth for the character collision box, shared by the player
// (a Sprite) and every TalkableNPC (a Container). Both draw a 96×96 source
// frame at 64×64 on screen, so both need the same *world-pixel* footprint —
// but Phaser measures a Sprite body in source-frame pixels and a Container
// body in world pixels, hence the two helpers below.
//
// Why a "feet box" rather than a box around the whole sprite:
// in a top-down world a character's ground contact is their feet, not their
// middle. Colliding on the feet means walking DOWN to a wall stops you with
// your feet on its near edge, and walking UP stops you with your feet on its
// far edge — either way you stand *beside* the building instead of sinking
// into it.
//
// The previous box was 40×40 source px at offset (28, 40), which after the
// 0.667 scale worked out to a 26.7×26.7 world-pixel box centred on the
// sprite's middle. That let the feet overlap a wall tile by ~11px walking
// down, and the head/torso by ~27px walking up. Since characters draw above
// the tile layer, that overlap is what read as "walking on top of the
// buildings" — the collision itself was working the whole time.

/** Source frame size of every character sheet (px). */
export const CHAR_FRAME = 96;

/** On-screen size each frame is drawn at (px). */
export const CHAR_DISPLAY = 64;

/** Scale applied to the source frame to reach display size (0.666…). */
export const CHAR_SCALE = CHAR_DISPLAY / CHAR_FRAME;

/**
 * The collision footprint in WORLD pixels — a shallow box under the
 * character, roughly shoulder-wide and shoe-high. `bottomFromCentre` is how
 * far below the sprite's centre the bottom edge sits (the sprite spans ±32
 * from its centre, so 30 keeps the box bottom just inside the visible feet).
 */
export const FEET_BOX = {
  width: 36,
  height: 20,
  bottomFromCentre: 30,
} as const;

export interface BodyGeometry {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Body geometry for a Sprite drawn from a 96×96 frame with a centred origin.
 * Phaser measures both size and offset in SOURCE-frame pixels here and applies
 * the sprite's scale itself, so divide the world-pixel footprint back up by
 * CHAR_SCALE.
 *
 * Works out to: 54×30 at offset (21, 63).
 */
export function spriteFeetBody(): BodyGeometry {
  const width = Math.round(FEET_BOX.width / CHAR_SCALE);
  const height = Math.round(FEET_BOX.height / CHAR_SCALE);
  // Where the bottom edge sits, measured down the source frame from its top.
  const bottom = CHAR_FRAME / 2 + FEET_BOX.bottomFromCentre / CHAR_SCALE;
  return {
    width,
    height,
    offsetX: Math.round((CHAR_FRAME - width) / 2),
    offsetY: Math.round(bottom - height),
  };
}

/**
 * Body geometry for a Container positioned at the sprite's centre. A Container
 * has no origin and no display size, so Phaser treats the offset as a plain
 * world-pixel shift from the container's own x/y — no scaling involved.
 *
 * Works out to: 36×20 at offset (-18, 10).
 */
export function containerFeetBody(): BodyGeometry {
  return {
    width: FEET_BOX.width,
    height: FEET_BOX.height,
    offsetX: -FEET_BOX.width / 2,
    offsetY: FEET_BOX.bottomFromCentre - FEET_BOX.height,
  };
}
