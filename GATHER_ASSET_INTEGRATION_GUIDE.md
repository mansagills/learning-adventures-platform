# Campus Demo — Asset Integration Guide (itch.io Packs)

**Goal**: Download free 32×32 tilesets + sprites from itch.io, organize them, wire into Phaser.  
**Time**: ~30–45 minutes (mostly downloading + dragging files)  
**Cost**: Free

---

## Step 1: Download Tilesets

### Primary Tileset (Campus Environment)
**Collection**: Gather.town-compatible 32×32 tilesets  
**Link**: https://itch.io/c/1904339/gathertown-compatible-32x32-tilesets

**Pick ONE** (or download 2–3 to mix):
- **"PineQuest tilesets"** (if available) — clean, cohesive fantasy/modern mix
- **"LPC Tileset Pack"** (Liberated Pixel Cup) — modular, lots of variety
- **Any with "outdoor", "building", "floor" tags** — essential for campus

**Download**: Look for PNG files (usually `tileset.png` or `tilemap.png`). If it's a ZIP, extract all PNGs.

### Character Sprites
**Collection**: Gather.town-compatible character sprites  
**Link**: https://itch.io/c/1904363/gathertown-compatible-environment-and-item-sprites

**Pick ONE**:
- **"Player avatars"** or **"Character sprites"** — usually 32×32 or 16×32 standing sprites
- Look for multi-frame walk cycles if available (4–8 frames per direction)
- If multiple skins available, grab 3–5 variants

**Download**: PNG file, often named `player.png` or `characters.png`

### Secondary Tilesets (Optional, for Building Interiors)
**Collection**: OpenGameArt LPC tilesets  
**Link**: https://opengameart.org/content/gathertown

Pick 1–2 for interior variety (offices, classrooms, etc.).

---

## Step 2: Organize Files in Project

```
public/
└── assets/
    ├── tilesets/
    │   ├── campus_outdoor.png      (main outdoor tileset)
    │   ├── campus_indoor.png       (optional secondary)
    │   └── tileset_metadata.json   (we'll create this)
    └── sprites/
        ├── player_avatars.png      (character sprites)
        └── npc_students.png        (reuse same sheet or separate)
```

### Folder Setup
```bash
mkdir -p public/assets/{tilesets,sprites}
# Copy your downloaded PNG files into the folders above
```

---

## Step 3: Create Tileset Metadata

Create **`public/assets/tilesets/tileset_metadata.json`** (describes your tileset to Phaser):

```json
{
  "tilesets": [
    {
      "name": "campus_outdoor",
      "imageFile": "campus_outdoor.png",
      "tileWidth": 32,
      "tileHeight": 32,
      "spacing": 0,
      "margin": 0,
      "tileCount": 256,
      "columns": 16
    }
  ],
  "notes": "Adjust 'columns' based on your actual PNG. If PNG is 512px wide and tiles are 32px, columns = 512/32 = 16."
}
```

**How to calculate columns**:
- Open the PNG in an image viewer
- Check width in pixels (e.g., 512px)
- Divide by tile width: 512 / 32 = 16 columns

---

## Step 4: Update Campus.json Tilemap

The stub `campus.json` from earlier needs to reference your actual tileset.

**Edit `public/maps/campus.json`**:
```json
{
  "compressionlevel": -1,
  "height": 60,
  "infinite": false,
  "layers": [...],
  "nextlayerid": 3,
  "nextobjectid": 1,
  "orientation": "orthogonal",
  "renderorder": "right-down",
  "tiledversion": "1.8.0",
  "tileheight": 32,
  "tilewidth": 32,
  "tilesets": [
    {
      "firstgid": 1,
      "source": "../assets/tilesets/tileset_metadata.json"
    }
  ],
  "version": "1.8.0",
  "width": 60
}
```

Key point: `"source"` must point to your tileset metadata file.

---

## Step 5: Wire into Phaser

In **`scenes/CampusScene.ts`** (the Prompt 1 output), update the asset loading:

```typescript
// In the preload() method, add:
preload() {
  this.load.image('tileset', 'assets/tilesets/campus_outdoor.png')
  this.load.spritesheet('player', 'assets/sprites/player_avatars.png', {
    frameWidth: 32,
    frameHeight: 32
  })
  this.load.tilemapTiledJSON('campus', 'maps/campus.json')
}

// In create(), when loading tilemap:
const map = this.make.tilemap({ key: 'campus' })
const tileset = map.addTilesetImage('campus_outdoor', 'tileset')  // Must match name from metadata
const layer = map.createLayer(0, tileset, 0, 0)
layer.setCollision([...])  // Set collision tiles as needed
```

---

## Step 6: Handle Art Style Mismatch (If Needed)

If you download multiple tilesets from different creators, they might have slightly different:
- **Colors** (bright vs. muted)
- **Outline thickness** (thick vs. thin)
- **Proportions** (some tiles might feel taller/wider)

**Quick fixes**:
1. **Use only ONE tileset** for the main campus (cleanest, safest)
2. **Desaturate or color-shift** one tileset in an image editor to match the other (15 min in Aseprite/GIMP)
3. **Accept the variety** — honestly, a mix of styles reads as "this campus has different architectural eras" and can actually feel charming

**Recommendation**: Start with ONE cohesive tileset. If it works, ship it. If you want more variety, layer in a second one for interiors only.

---

## Step 7: Test Locally

```bash
npm run dev
# Open http://localhost:3000/campus
# You should see:
# - Campus tilemap with your itch.io assets
# - Player avatar sprite
# - Movement works (WASD)
```

**If tileset doesn't show:**
1. Check browser console (F12) for 404 errors on asset files
2. Verify file paths in CampusScene match your folder structure
3. Check tileset metadata JSON `columns` calculation is correct
4. Try a smaller tileset first to rule out size issues

**If tiles look misaligned:**
1. Verify `tileWidth` and `tileHeight` are exactly 32 in metadata
2. Check PNG doesn't have padding/margin between tiles
3. Some itch.io packs have 1–2px margins — if so, add to metadata:
   ```json
   "margin": 1,
   "spacing": 1
   ```

---

## Step 8: Add NPC Student Sprites (Optional, for Simulated Students Feature)

For the "Simulated Students" feature (from GATHER_SIMULATED_STUDENTS_PLAN.md):
- Reuse the same `player_avatars.png` spritesheet
- Pick 8–10 different frame indices to represent different "student" appearances
- Or, download a second character pack and create `npc_students.png`

In **`lib/npcStudents.json`**:
```json
{
  "npcs": [
    {
      "id": "npc_1",
      "name": "Jordan",
      "spriteVariant": 2,
      "spriteFrame": 5,  // Frame index from spritesheet
      "subject": "Math"
      // ... rest of data
    }
  ]
}
```

Then in `npcController.ts`, when creating sprites:
```typescript
const sprite = scene.add.sprite(x, y, 'npc_students', spriteFrame)
```

---

## Step 9: Commit Assets

```bash
git add public/assets/ public/maps/
git commit -m "feat(assets): add itch.io tilesets and sprites"
```

---

## Recommended Specific Packs (Curated List)

If you're paralyzed by choice, grab these three:

1. **LPC Tileset Complete Pack** (itch.io)
   - Covers indoor + outdoor
   - Hundreds of tiles, great modular design
   - Works well with Gather.town

2. **16x16 RPG Character Sprites** or **Tiny Character Pack** (any creator on itch.io tagged "32x32")
   - Simple, clean, easy to recolor if needed
   - Multiple character skins

3. **OpenGameArt LPC Environment/Interior Pack** (opengameart.org)
   - For classroom/office interiors
   - Free to use

Download all three, test locally, keep what feels cohesive, discard the rest.

---

## Troubleshooting Checklist

- [ ] PNG files in `public/assets/tilesets/` and `public/assets/sprites/`
- [ ] Tileset metadata JSON exists and has correct `columns` value
- [ ] Campus.json references tileset metadata with correct path
- [ ] CampusScene preload() loads tileset image + tilemap JSON
- [ ] CampusScene create() calls `addTilesetImage()` with matching name
- [ ] Browser console shows no 404s on asset files
- [ ] Tiles render at correct size (should be visible, not microscopic)
- [ ] Player sprite shows and moves

---

## Total Time Breakdown

- Download tilesets: 10 min (mostly clicking/extracting)
- Organize files: 5 min (drag into folders)
- Create metadata JSON: 5 min (copy-paste + edit columns)
- Update campus.json: 5 min (edit tileset reference)
- Update CampusScene code: 5 min (add preload/load calls)
- Test locally: 10 min (verify, debug any path issues)
- **Total**: ~40 minutes

---

## Next Steps (After Assets Work)

Once tileset + sprites are loading:
1. Run the rest of the Fable 5 prompts (interactive zones, modals, progress tracker, etc.)
2. Optionally add NPC Simulated Students (Prompts A–E from GATHER_SIMULATED_STUDENTS_PLAN.md)
3. Polish: animations, more buildings, more dialogue
4. Ship demo

You're ready to start downloading whenever — this is all manual work, no Fable 5 needed.
