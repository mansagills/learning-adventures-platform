# Learning Adventures Campus — Asset MVP
## Futuristic Sci-Fi Fantasy · 16-Bit Pixel Art · Gather-like

> **Reference:** Full style guide at `C:\Users\mlkg7\.claude\plans\design-a-style-guide-tidy-dolphin.md`
>
> **Tools:** ChatGPT (native image generation) + Midjourney v6 / Niji 6
>
> **Code status:** Phase A (CSS, fonts, HUD restyling) complete. Phases B–H below cover art assets.

---

## How to Use This Document

AI image generators output high-resolution images that *look like* pixel art — they don't output true 32×32 files. **Workflow for each asset:**

1. Generate at full resolution using the prompts below
2. Open in **Aseprite** (or Photoshop/Pixaki) and scale down to the target canvas size using **nearest-neighbor** (no anti-aliasing)
3. Touch up pixel-by-pixel to meet the palette and edge rules
4. Export as PNG-32 (RGBA) at the final target size
5. Drop into the correct folder under `public/game-assets/`

**Naming convention:** `[zone]-[type]-[variant].png` for tiles, `char-[id].png` for characters, `npc-[id].png` for NPCs.

### Using ChatGPT Image Generation Effectively

ChatGPT's native image model (GPT-4o) is **conversational** — use that to your advantage:

- **Start each session with context:** Paste this once at the top of a new chat before generating any assets: *"I'm building a top-down 2D pixel art game world in the style of 16-bit SNES RPGs. The aesthetic is futuristic sci-fi fantasy — dark void backgrounds, neon accents, pixel-perfect hard edges. Colors are limited per asset: max 8 for tiles, 16 for characters. No anti-aliasing, no gradients, no soft edges."*
- **Iterate in the same thread:** After a generation, say things like *"Make the floor darker"*, *"Shift the grid lines to be more blue"*, or *"The cyan glow dot is too large — reduce it to 2×2 pixels"*. GPT-4o remembers context within the conversation.
- **Ask for variants:** *"Generate 3 variations of this tile, each slightly different"* — pick the best one.
- **Background for sprites:** ChatGPT cannot output transparent PNGs. For all characters and NPCs, request a **solid bright magenta background (#FF00FF)**. This color never appears in the style palette, so you can cleanly remove it in Aseprite using Select by Color.
- **Tiles don't need background instructions** — tiles are fully opaque and fill the entire 32×32 canvas with the base color.

---

## Global Palette Reference

Every asset draws from this master palette. Stick to these values to ensure the world reads as cohesive.

| Role | Hex | Use |
|------|-----|-----|
| Void | `#050810` | Background, shadow fills |
| Ground Base | `#0D1320` | Default floor dark |
| Ground Mid | `#1A2540` | Mid-tone floor |
| Ground Light | `#2A3A5C` | Highlight floor |
| Grid Line | `#1E2D4A` | Subtle tile grid marks |
| Path Base | `#162840` | Corridor center |
| Outline | `#CCDDFF` | Sprite edges, building outlines |
| Nexus Cyan | `#00CCFF` | Main Hub accent |
| Quantum Violet | `#9B5CFF` | Math Hall accent |
| Science Mint | `#00FFB3` | Discovery Lab accent |
| Archive Pink | `#FF4DCC` | Story Grove accent |
| Commons Amber | `#FFB300` | Commons accent |

**Per-tile palette limit:** Max 8 colors per tile sprite. Per-character sprite limit: Max 16 colors.

---

## Phase B — Ground Tiles

**Target size:** 32 × 32 px (displayed at 64×64 via Phaser 2× scaling)
**File location:** `public/game-assets/tilemaps/`

---

### B1 · GRID_FLOOR_1 (replaces GRASS_1)
Default floor tile used across all zones. Dark navy with subtle 4px hex grid.

**Specs:** Deep navy base `#0D1320`, grid lines `#1E2D4A`, occasional single bright node pixel `#00CCFF`

**ChatGPT prompt:**
```
A single seamless 32x32 pixel art floor tile for a sci-fi RPG game. Dark deep navy blue background (#0D1320) fills the entire tile. Subtle hexagonal grid pattern etched in slightly lighter blue (#1E2D4A). Flat top-down perspective. Hard pixel edges, no anti-aliasing, no gradients. Minimal detail. Grid lines are 1 pixel wide. One tiny glowing cyan dot (#00CCFF) at the center. 16-bit SNES-style game tile aesthetic. The tile fills the full canvas edge to edge.
```

**Midjourney prompt:**
```
/imagine pixel art floor tile, top-down view, 32x32, dark navy sci-fi hexagonal grid, deep space aesthetic, seamless tiling texture, 16-bit SNES RPG style, flat colors, hard edges, no anti-aliasing, game asset, cyan accent glow dot --ar 1:1 --style raw --niji 7
```

---

### B2 · GRID_FLOOR_2 (replaces GRASS_2)
Lighter floor variant with faint circuit trace for variety.

**Specs:** Slightly lighter base `#111828`, faint circuit line `#1E2D4A`, no glow dot

**ChatGPT prompt:**
```
A single seamless 32x32 pixel art floor tile for a sci-fi RPG game. Dark space blue-gray background (#111828). A faint single-pixel circuit trace line running diagonally across the tile in slightly lighter color (#1E2D4A). Completely flat, top-down perspective. 16-bit pixel art, hard pixel edges, no gradients, no anti-aliasing. Minimal detail. Designed as a tileable floor tile for a Gather-town style game world.
```

**Midjourney prompt:**
```
/imagine pixel art sci-fi floor tile, 32x32, dark blue-gray, faint circuit trace etched into surface, top-down game asset, 16-bit retro game aesthetic, SNES RPG style, seamless, flat colors, hard pixel edges --ar 1:1 --style raw --niji 6
```

---

### B3 · ENERGY_FLOOR (replaces GRASS_3) — 5 zone variants
Floor tile with a glowing energy node at center. Make 5 versions — one per zone accent color.

**Specs:** `#0D1320` base, center node = zone accent color (4×4 px diamond), 2px glow ring around node

**ChatGPT prompt (example: Nexus cyan):**
```
A 32x32 pixel art floor tile for a sci-fi RPG, top-down view. Dark navy background (#0D1320). At the exact center: a 4-pixel diamond shape glowing in bright cyan (#00CCFF). A 2-pixel wide semi-transparent ring around the diamond suggesting energy glow. Hard pixel art style, 16-bit SNES aesthetic, no gradients, no anti-aliasing. Flat top-down tile. Clean and minimal.
```

*(Repeat with `#9B5CFF` violet / `#00FFB3` mint / `#FF4DCC` pink / `#FFB300` amber for the other four variants.)*

**Midjourney prompt (cyan variant):**
```
/imagine pixel art energy floor tile, top-down 32x32 game tile, dark navy, glowing cyan diamond center node, sci-fi RPG game asset, 16-bit pixel art, hard edges, SNES style, flat colors --ar 1:1 --style raw --niji 6
```

---

### B4 · TECH_PATH (replaces PATH)
The main campus corridors. Dark with bright neon edge lines on the left and right sides.

**Specs:** `#162840` base, 2px neon `#00CCFF` lines along both long edges (the tile is horizontal), subtle `#003344` inner band

**ChatGPT prompt:**
```
A 32x32 pixel art corridor floor tile for a top-down sci-fi RPG game. Dark navy-blue base (#162840). Bright cyan neon lines (2 pixels wide, #00CCFF) run along the very top and bottom edge of the tile. A slightly lighter band (#003344) fills the center stripe. No gradients, hard pixel art edges, 16-bit 2D game tile style. Seamless tiling. Gather-town style game asset.
```

**Midjourney prompt:**
```
/imagine pixel art sci-fi corridor floor tile, 32x32, top-down, dark navy with cyan neon edge lines, glowing tron-style path, 16-bit RPG tile, flat colors, hard pixel edges, seamless, game asset --ar 1:1 --style raw --niji 6
```

---

### B5 · CRYSTAL_CLUSTER (replaces FLOWERS_1) — 5 zone variants
Small glowing crystal formation. 2–3 crystals, zone color.

**Specs:** `#050810` base, 2–3 pixel-art crystal spires (6–8px tall), zone accent fill, white pixel tip, `#CCDDFF` outline

**ChatGPT / DALL-E 3 prompt (violet variant):**
```
A 32x32 pixel art tile for a top-down RPG game. Black/void background (#050810). 2 or 3 small pixel-art crystal spires in the center, each 6-8 pixels tall. The crystals are filled with violet (#9B5CFF), outlined in light blue-white (#CCDDFF), with a single white pixel at each tip for sparkle. Hard 16-bit pixel art style, no anti-aliasing, flat colors. The crystals feel magical and futuristic. Game tile asset.
```

**Midjourney prompt (violet):**
```
/imagine pixel art crystal formation tile, 32x32, top-down RPG game asset, void black background, 2-3 small violet glowing crystal spires, sci-fi fantasy 16-bit style, hard edges, flat colors, SNES RPG aesthetic --ar 1:1 --style raw --niji 6
```

---

### B6 · GLOW_MOSS (replaces FLOWERS_2)
Bioluminescent ground cover — organic patches that feel tech-grown.

**Specs:** `#0D1320` base, organic blob shapes in `#003322` (dark), with bright `#00FF88` dots scattered for glow spots

**ChatGPT prompt:**
```
A 32x32 pixel art tile for a top-down sci-fi RPG. Dark navy floor (#0D1320). Small organic blob shapes of dark teal-green (#003322) scattered across the tile like moss patches. Within the blobs: a few 1-2 pixel bright green glowing dots (#00FF88) suggesting bioluminescence. 16-bit pixel art style, hard edges, no anti-aliasing, flat colors. Tile is seamless. Blends sci-fi tech with organic growth.
```

**Midjourney prompt:**
```
/imagine pixel art bioluminescent moss tile, 32x32 top-down game tile, dark navy, teal-green organic blobs with tiny glowing green pixels, sci-fi fantasy RPG, 16-bit flat pixel art, no anti-aliasing, seamless tile --ar 1:1 --niji 6
```

---

### B7 · DARK_MATTER (replaces DIRT)
Rough void-textured floor for zone border areas.

**Specs:** `#080E1A` base, scattered 1px dithered noise in `#0D1320`, no glow

**ChatGPT prompt:**
```
A 32x32 pixel art floor tile for a top-down RPG game. Very dark near-black background (#080E1A). Dithered texture of slightly lighter dark pixels (#0D1320) scattered irregularly to give a rough void-like surface. No color, no glow. 16-bit pixel art, hard edges, no gradients. Looks like cracked dark matter or deep space rock. Seamless tiling game asset.
```

**Midjourney prompt:**
```
/imagine pixel art dark void floor tile, 32x32, near-black, dithered rough surface texture, deep space rock aesthetic, top-down RPG game tile, 16-bit pixel art, no gradients, hard edges, flat dark colors --ar 1:1 --style raw --niji 6
```

---

### B8 · PLASMA_FLOW (replaces WATER) — 4-frame animated set
Flowing plasma / energy river. Output 4 frames; each frame shifts the color band left by 8px.

**Specs:** Frame 1: `#0044AA` to `#0088FF` gradient bands (pixel-art stepped, not smooth). Frames 2–4 shift bands leftward.

**ChatGPT prompt (Frame 1):**
```
A 32x32 pixel art tile for an animated plasma river in a top-down sci-fi RPG game. Horizontal bands of color: deep blue (#0044AA) at the edges, mid blue (#005FCC) in the middle band, bright blue-cyan (#0088FF) as the bright center stripe. Bands are 4-8 pixels wide, stepped (no gradient, flat color bands). 16-bit pixel art style, hard pixel edges, no anti-aliasing. This is animation frame 1 of 4 for a scrolling plasma river effect.
```

**Midjourney prompt:**
```
/imagine pixel art plasma energy river tile, 32x32, top-down view, horizontal flowing blue energy bands, deep blue to bright cyan, 16-bit game tile, flat stepped color bands, sci-fi RPG, animated loop frame 1, hard pixel edges --ar 1:1 --style raw --niji 6
```

---

## Phase C — Wall / Structure Tiles

**Target size:** 32 × 32 px (single tile) — buildings are assembled from multiple tiles
**File location:** `public/game-assets/tilemaps/`

---

### C1 · WALL_QUANTUM (Quantum Lab / Math Hall)
Dark purple-violet tech panels with rune equation markings.

**Specs:** `#1A0A2E` base, `#9B5CFF` panel joints (1px vertical lines every 8px), tiny pixel rune symbols (∑ π ∞) in `#3A1A6A`

**ChatGPT prompt:**
```
A 32x32 pixel art wall tile for a top-down sci-fi RPG building exterior. Very dark purple background (#1A0A2E). Vertical panel joint lines every 8 pixels in bright violet (#9B5CFF), 1 pixel wide. In the center of each panel: a tiny pixel-art symbol (like a math rune — a summation symbol or infinity sign) in dim violet (#3A1A6A). 16-bit flat pixel art, no anti-aliasing, hard edges. Futuristic magic math building exterior. Game tile asset.
```

**Midjourney prompt:**
```
/imagine pixel art sci-fi magic wall tile, 32x32, dark purple, violet neon panel joints, tiny rune math symbols, quantum lab exterior, 16-bit RPG game tile, flat colors, hard pixel edges, futuristic fantasy --ar 1:1 --style raw --niji 6
```

---

### C2 · WALL_NEXUS (Science Nexus / Discovery Lab)
Teal-cyan reinforced plating with glowing vent slits.

**Specs:** `#0A2020` base, `#00FFB3` mint horizontal vent slits (1px, every 10px), `#0F4040` panel areas

**ChatGPT prompt:**
```
A 32x32 pixel art wall tile for a top-down sci-fi RPG building. Very dark teal background (#0A2020). Horizontal vent slit lines every 10 pixels: 1-pixel lines in bright electric mint (#00FFB3). Each panel area between vents filled with slightly lighter dark teal (#0F4040). 16-bit flat pixel art, no anti-aliasing, hard edges. Futuristic science laboratory building exterior. Tile should be seamlessly tileable vertically and horizontally.
```

**Midjourney prompt:**
```
/imagine pixel art sci-fi science wall tile, 32x32, dark teal, horizontal glowing mint vent slits, bioluminescent laboratory exterior, 16-bit RPG game tile, flat colors, hard edges, top-down view --ar 1:1 --style raw --niji 6
```

---

### C3 · WALL_ARCHIVE (Chronicle Archive / Story Grove)
Pink-magenta panels with floating glyph projections.

**Specs:** `#200A20` base, `#FF4DCC` outline between panels (1px), dim glyph marks `#661A55`

**ChatGPT prompt:**
```
A 32x32 pixel art wall tile for a top-down sci-fi fantasy RPG. Very dark magenta-purple background (#200A20). Hot pink panel dividers (#FF4DCC), 1 pixel wide, creating a 2×2 panel grid on the tile. Inside each panel: tiny pixel-art glyph marks (a letter shape or symbol) in dim magenta (#661A55). 16-bit pixel art, flat colors, hard edges, no anti-aliasing. Fantasy archive / library building exterior. Mystical and futuristic.
```

**Midjourney prompt:**
```
/imagine pixel art fantasy archive wall tile, 32x32, dark magenta, pink neon panel borders, tiny glyph symbols, mystical sci-fi library exterior, 16-bit RPG tile, flat colors, hard pixel edges --ar 1:1 --style raw --niji 6
```

---

### C4 · WALL_TECH (generic building / brick replacement)
Standard dark metal wall with bolt/rivet details.

**Specs:** `#0A1828` base, `#1A2540` panel raise (checkerboard-like), `#CCDDFF` 1px bolt dots at corners

**ChatGPT prompt:**
```
A 32x32 pixel art wall tile for a sci-fi RPG building. Very dark navy background (#0A1828). Slightly lighter raised panel (#1A2540) covering most of the tile. At each corner of the panel: a single pixel white-blue dot (#CCDDFF) representing a bolt or rivet. 16-bit pixel art, flat colors, hard edges, no gradients. Generic futuristic metal wall tile for a top-down game. Tileable.
```

**Midjourney prompt:**
```
/imagine pixel art futuristic metal wall tile, 32x32, dark navy, raised panel with corner rivets, sci-fi building exterior, 16-bit RPG game asset, hard pixel edges, flat colors, tileable --ar 1:1 --style raw --niji 6
```

---

### C5 · WALL_COMMONS (Stellar Commons / shop building)
Warm amber-lit panels with glowing shop details.

**Specs:** `#201000` base, `#FFB300` amber glow trim lines (horizontal, every 10px), `#664400` panel areas

**ChatGPT prompt:**
```
A 32x32 pixel art wall tile for a top-down RPG marketplace building. Very dark warm brown background (#201000). Horizontal amber glow lines every 10 pixels (#FFB300, 1 pixel wide). Dark amber panel fills between the lines (#664400). 16-bit pixel art, flat colors, hard pixel edges, no anti-aliasing. Warm marketplace / shop exterior wall. Futuristic but inviting. Tileable game asset.
```

**Midjourney prompt:**
```
/imagine pixel art marketplace wall tile, 32x32, dark warm brown, horizontal amber neon trim lines, futuristic shop exterior, 16-bit RPG game tile, flat colors, hard edges, warm sci-fi aesthetic --ar 1:1 --style raw --niji 6
```

---

## Phase D — Special Feature Tiles

**Target size:** 32×32 per tile (multi-tile features composed in-engine)
**File location:** `public/game-assets/tilemaps/`

---

### D1 · HOLOGRAM_PROJECTOR (floor disk + beam)
Floor-mounted disk projecting a vertical beam (2 tiles: disk and beam).

**Disk tile specs:** `#050810` base, concentric circle rings in `#00CCFF`, bright center dot
**Beam tile specs:** Transparent edges, thin vertical blue column, fade toward top

**ChatGPT prompt (disk):**
```
A 32x32 pixel art floor tile for a top-down sci-fi RPG. Black background (#050810). At the center: a circular projector disk drawn in pixel art — 3 concentric circle rings in cyan (#00CCFF), each ring 1 pixel wide, with a bright white-cyan center dot. The rings have hard pixel edges (no anti-aliasing). 16-bit game art. Clean and minimal. The rest of the tile is black.
```

**Midjourney prompt (disk):**
```
/imagine pixel art hologram projector floor tile, 32x32, void black background, concentric cyan circle rings, sci-fi game asset, top-down view, 16-bit pixel art, hard edges, flat colors --ar 1:1 --niji 6
```

---

### D2 · CRYSTAL_PILLAR (2-tile: top + bottom)
Tall crystal — bottom tile is the base, top tile is the crystal peak with glow.

**Bottom tile specs:** `#050810` base, crystal base triangle in zone accent, `#CCDDFF` outline
**Top tile specs:** Narrow crystal peak, bright apex pixel, soft zone accent fill

**ChatGPT prompt (bottom / base, violet):**
```
A 32x32 pixel art bottom tile for a crystal pillar prop in a top-down sci-fi RPG. Black background. In the lower 20 pixels: a pixel-art crystal base — a wide hexagonal or rectangular shape filled with dark violet (#3A1A6A), outlined in light blue-white (#CCDDFF), 1 pixel outline. Upper portion: the crystal shaft begins, narrowing upward, filled with bright violet (#9B5CFF). 16-bit pixel art, hard edges, no anti-aliasing.
```

**Midjourney prompt:**
```
/imagine pixel art crystal pillar base tile, 32x32, void black background, violet glowing crystal, hexagonal base, sci-fi fantasy RPG prop, 16-bit game asset, hard pixel edges, flat colors --ar 1:1 --niji 6
```

---

### D3 · PORTAL_RING (3×3 tile set — 9 tiles total)
Center animated portal + 8 surrounding ring tiles. Generate the center first.

**Center tile specs:** `#050810` base, swirling dark blue-to-cyan void in center (4 animation frames), bright outer ring in `#00CCFF`

**ChatGPT prompt (center, frame 1):**
```
A 32x32 pixel art center tile for a magical portal effect in a top-down sci-fi RPG game. Black background (#050810). The entire tile shows a circular energy vortex: outer ring of bright cyan (#00CCFF) 2px wide, inner ring slightly dimmer (#0088CC), center filled with very dark blue (#001A33) with a few brighter pixel flecks to suggest swirling energy. 16-bit pixel art, hard edges, flat colors, animation frame 1 of 4. Portal floor effect.
```

**Midjourney prompt:**
```
/imagine pixel art portal floor tile center, 32x32, void black, glowing cyan vortex energy ring, sci-fi magic portal top-down view, 16-bit RPG game asset, flat colors, hard pixel edges, animation frame --ar 1:1 --niji 6
```

---

## Phase E — Player Character Spritesheets

**Target spritesheet size:** 128 × 128 px (4 columns × 4 rows, each frame 32×32)
**Layout:**
- Row 0: Walk Down (frames 0–3)
- Row 1: Walk Left (frames 4–7)
- Row 2: Walk Up (frames 8–11)
- Row 3: Idle (frames 12–15, subtle 2px bob)

**File location:** `public/game-assets/sprites/`

> **Tip:** Generate each character as a full character portrait first, then recreate as a 4-direction spritesheet. ChatGPT/MJ generate better full characters than spritesheets directly.

---

### E1 · char-robot-blue (Cyber Bot)
Metal robot body, LED visor eyes in cyan, compact proportions.

**ChatGPT prompt (portrait reference):**
```
A 32x32 pixel art character sprite for a 2D top-down RPG game. A small robot character facing the camera. Dark metallic blue-gray body (#1A3A5C), rounded head with a visor displaying two bright cyan LED eyes (#00CCFF). Compact boxy humanoid shape. Short stubby arms. Outlined in light blue-white (#CCDDFF) 1-pixel outline. 16-bit SNES RPG character art style, flat colors, hard pixel edges, no anti-aliasing. Transparent background.
```

**Midjourney prompt (portrait):**
```
/imagine pixel art robot character sprite, 32x32, top-down RPG, dark metallic blue body, cyan LED eyes, compact boxy humanoid, sci-fi 16-bit style, hard pixel edges, flat colors, SNES character art, solid magenta background (#FF00FF) --ar 2:3 --niji 6
```

**Spritesheet prompt (full sheet):**
```
/imagine pixel art character spritesheet 128x128, 4x4 grid, 32x32 each frame, small robot character, walking animation 4 directions (down, left, up, idle), dark blue metal body, cyan visor eyes, 16-bit SNES RPG style, flat colors, hard pixel edges, white or solid magenta background (#FF00FF) --ar 2:3 --niji 6
```

---

### E2 · char-wizard-purple (Arcane Scholar)
Hooded figure in purple robes, glowing rune staff.

**ChatGPT prompt:**
```
A 32x32 pixel art character sprite for a 2D RPG. A small hooded wizard character facing the camera. Dark purple hooded robe (#4A1A6A), robe outlined in bright violet (#9B5CFF). A tiny staff held to the side with a glowing violet tip. Face hidden in shadow inside hood with just two small glowing eyes visible. 16-bit SNES pixel art character, flat colors, hard edges, solid bright magenta background (#FF00FF) for easy extraction in Aseprite.
```

**Midjourney prompt:**
```
/imagine pixel art wizard character, 32x32, deep purple hooded robe, glowing violet rune staff, mysterious sci-fi mage, 16-bit SNES RPG sprite, flat colors, hard pixel edges, solid magenta background (#FF00FF) --ar 2:3 --niji 6
```

---

### E3 · char-cat-orange (Tech Cat)
Orange cat in a tech jumpsuit, tail visible.

**ChatGPT prompt:**
```
A 32x32 pixel art character sprite for a 2D RPG game. An anthropomorphic orange cat character in a futuristic jumpsuit. Orange fur (#CC5500), dark tech jumpsuit (#1A1A1A) with amber (#FFB300) trim. Cat ears on head, tail curling to the side. Friendly expression with dot eyes. 16-bit SNES RPG style, flat colors, hard pixel edges, solid bright magenta background (#FF00FF) for easy extraction in Aseprite.
```

**Midjourney prompt:**
```
/imagine pixel art cat character sprite, 32x32, orange anthropomorphic cat, dark tech jumpsuit with amber trim, cute sci-fi RPG character, 16-bit SNES style, flat colors, hard pixel edges, transparent bg --ar 1:1 --niji 6
```

---

### E4 · char-knight-silver (Star Knight)
Silver armored figure, star-shaped visor.

**ChatGPT prompt:**
```
A 32x32 pixel art sci-fi knight character for a 2D RPG. Silver-gray armor (#7A8FA6) with bright electric mint trim (#00FFB3). Helmet with a narrow visor slit. Compact armored humanoid proportions. Hard pixel art style, 16-bit SNES character, flat colors, hard pixel edges, solid bright magenta background (#FF00FF) for easy extraction in Aseprite.
```

**Midjourney prompt:**
```
/imagine pixel art sci-fi knight character, 32x32, silver armor, mint-green visor trim, compact futuristic warrior, 16-bit SNES RPG sprite, flat colors, hard pixel edges, solid magenta background (#FF00FF) --ar 2:3 --niji 6
```

---

### E5 · char-human-explorer (Human Explorer)
Classic adventurer in a blue flight suit.

**ChatGPT prompt:**
```
A 32x32 pixel art human character for a 2D RPG. A young adventurer in a blue flight suit (#4A90D9) with white trim. Short hair, determined expression with dot eyes. Simple compact humanoid proportions. 16-bit SNES pixel art style, flat colors, hard edges, solid bright magenta background (#FF00FF) for easy extraction in Aseprite.
```

**Midjourney prompt:**
```
/imagine pixel art human adventurer character, 32x32, blue sci-fi flight suit, young explorer, compact humanoid, 16-bit SNES RPG sprite, flat colors, hard pixel edges, solid magenta background (#FF00FF) --ar 2:3 --niji 6
```

---

### E6 · char-alien-teal (Alien Cadet) — new character
Alien figure with large eyes and teal skin.

**ChatGPT prompt:**
```
A 32x32 pixel art alien character for a 2D RPG. A friendly alien cadet with dark teal skin (#0D5C4A), large round eyes glowing in bright mint (#00FFB3). Wearing a simple uniform. Slim humanoid proportions with slightly oversized head. 16-bit SNES pixel art, flat colors, hard edges, solid bright magenta background (#FF00FF) for easy extraction in Aseprite.
```

**Midjourney prompt:**
```
/imagine pixel art alien character, 32x32, dark teal skin, large glowing mint eyes, friendly alien cadet, sci-fi RPG sprite, 16-bit SNES style, flat colors, hard pixel edges, solid magenta background (#FF00FF) --ar 2:3 --niji 6
```

---

## Phase F — NPC Spritesheets

**Target spritesheet size:** 128 × 64 px (4 columns × 2 rows, each frame 32×32)
**Layout:**
- Row 0: Idle Down (4-frame gentle bob)
- Row 1: Talk (4-frame mouth/gesture animation)

**File location:** `public/game-assets/sprites/`

For each NPC, generate a full-body portrait first, then use it as reference to build the spritesheet.

---

### F1 · npc-jaylen (Guide — Nexus Plaza, cyan)
Young guide in a pilot jacket with a holographic visor.

**ChatGPT prompt:**
```
A 32x32 pixel art NPC character for a top-down RPG. Jaylen, a young teen guide character. Casual dark navy pilot jacket (#1A2540) with bright cyan trim (#00CCFF). Holographic visor over one eye glowing cyan. Friendly expression, short hair. Compact humanoid proportions suitable for a 2D RPG. 16-bit pixel art style, flat colors, hard edges, solid bright magenta background (#FF00FF) for easy extraction in Aseprite.
```

**Midjourney prompt:**
```
/imagine pixel art NPC guide character, 32x32, young teen, dark pilot jacket with cyan holographic visor, sci-fi RPG character, 16-bit SNES style, flat colors, hard pixel edges, solid magenta background (#FF00FF) --ar 2:3 --niji 6
```

---

### F2 · npc-professor-ivy (Scholar — Nexus Plaza, cyan)
Elder scholar in a long coat with circuit patterns.

**ChatGPT prompt:**
```
A 32x32 pixel art NPC character for a top-down RPG. Professor Ivy, an older scholar. Long dark coat (#0A1828) with glowing cyan circuit pattern lines (#00CCFF) etched along the collar and sleeves. Wise expression, gray hair. Carrying a small holographic datapad. 16-bit pixel art, flat colors, hard pixel edges, solid bright magenta background (#FF00FF) for easy extraction in Aseprite.
```

**Midjourney prompt:**
```
/imagine pixel art professor NPC, 32x32, elder scholar, dark long coat with cyan circuit pattern, sci-fi academic, 16-bit RPG sprite, flat colors, hard pixel edges, solid magenta background (#FF00FF) --ar 2:3 --niji 6
```

---

### F3 · npc-professor-numbers (Math — Quantum Lab, violet)
Eccentric mathematician surrounded by floating number glyphs.

**ChatGPT prompt:**
```
A 32x32 pixel art NPC for a top-down RPG. Professor Numbers, an eccentric math teacher. Dark purple lab coat (#3A1A6A) with violet (#9B5CFF) trim. Round glasses with glowing violet lenses. A tiny floating math symbol (∑ or π) beside their head as a 1-2 pixel icon. 16-bit pixel art, flat colors, hard edges, solid bright magenta background (#FF00FF) for easy extraction in Aseprite.
```

**Midjourney prompt:**
```
/imagine pixel art mathematician NPC, 32x32, dark purple lab coat, glowing violet glasses, floating math symbols, sci-fi math teacher character, 16-bit RPG sprite, flat colors, hard pixel edges --ar 1:1 --niji 6
```

---

### F4 · npc-dr-spark (Scientist — Science Nexus, mint)
Lab coat with a glowing test tube, bioluminescent details.

**ChatGPT prompt:**
```
A 32x32 pixel art NPC for a top-down RPG. Dr. Spark, a scientist. White lab coat with teal (#006644) collar and cuffs. Holding a tiny glowing test tube in one hand, the liquid inside bright mint (#00FFB3). Goggles on forehead. Friendly and excited expression. 16-bit pixel art, flat colors, hard edges, solid bright magenta background (#FF00FF) for easy extraction in Aseprite.
```

**Midjourney prompt:**
```
/imagine pixel art scientist NPC, 32x32, white lab coat with teal trim, glowing mint test tube, sci-fi researcher, 16-bit RPG sprite, flat colors, hard pixel edges, solid magenta background (#FF00FF) --ar 2:3 --niji 6
```

---

### F5 · npc-story-sage (Storyteller — Chronicle Archive, pink)
Mystical figure in flowing robes with floating rune text.

**ChatGPT prompt:**
```
A 32x32 pixel art NPC for a top-down RPG. Story Sage, a mystical storyteller. Dark magenta robes (#330A2A) with hot pink trim (#FF4DCC). Floating 1-pixel rune text glyphs beside them. Long flowing robe silhouette. Mysterious and wise expression. 16-bit pixel art, flat colors, hard edges, solid bright magenta background (#FF00FF) for easy extraction in Aseprite.
```

**Midjourney prompt:**
```
/imagine pixel art mystical storyteller NPC, 32x32, dark magenta robes, pink neon trim, floating rune glyphs, sci-fi fantasy character, 16-bit RPG sprite, flat colors, hard pixel edges, solid magenta background (#FF00FF) --ar 2:3 --niji 6
```

---

### F6 · npc-commons-host (Merchant — Stellar Commons, amber)
Merchant with a holographic shop interface on their arm.

**ChatGPT prompt:**
```
A 32x32 pixel art NPC for a top-down RPG. Commons Host, a friendly merchant. Dark warm outfit (#201000) with amber (#FFB300) sash and trim. A tiny holographic display panel glowing on their wrist/forearm in amber. Big welcoming smile. 16-bit pixel art, flat colors, hard edges, solid bright magenta background (#FF00FF) for easy extraction in Aseprite.
```

**Midjourney prompt:**
```
/imagine pixel art merchant NPC, 32x32, dark warm outfit, amber holographic wrist display, friendly sci-fi shopkeeper, 16-bit RPG sprite, flat colors, hard pixel edges, solid magenta background (#FF00FF) --ar 2:3 --niji 6
```

---

## Phase G — Building Exteriors

Buildings are composed of a single large sprite placed as a layer above floor tiles. Each building is ~192×256 px (3×4 tiles) or 384×256 px (6×4 tiles) rendered as one image.

**File location:** `public/game-assets/buildings/`
**Note:** Generate at 512×512 or higher then scale down to target px with nearest-neighbor.

---

### G1 · Quantum Lab Exterior (Math Hall)
Dark purple tech facility with violet rune equations on walls.

**ChatGPT prompt:**
```
Pixel art building exterior for a top-down 2D RPG game. A futuristic mathematics research facility. Dark purple walls (#1A0A2E) with violet neon panel joints (#9B5CFF). The front facade has a wide entrance door that glows violet. Above the entrance: a large carved math rune symbol (∑ or Ψ) in violet. Flat top-facing roof in very dark purple. Small glowing violet windows. 16-bit SNES pixel art style, top-down oblique projection, flat colors, hard edges. Size: approximately 6 tiles wide, 4 tiles tall.
```

**Midjourney prompt:**
```
/imagine pixel art sci-fi math building exterior, top-down oblique view, dark purple walls, violet neon joints and rune symbols, glowing entrance, 16-bit SNES RPG building, flat colors, hard pixel edges, game asset --ar 3:2 --niji 6
```

---

### G2 · Science Nexus Exterior (Discovery Lab)
Teal bioluminescent research station with DNA helix motif.

**ChatGPT prompt:**
```
Pixel art building exterior for a top-down RPG. A bioluminescent science laboratory. Very dark teal walls (#0A2020) with bright mint green (#00FFB3) glowing horizontal vent slits. On the front wall: a pixel-art DNA double helix symbol in mint. Wide entrance with a teal glow. Top-facing roof in very dark teal. 16-bit SNES style, top-down oblique projection, flat colors, hard pixel edges.
```

**Midjourney prompt:**
```
/imagine pixel art sci-fi science lab building, top-down oblique view, dark teal walls, mint neon vents and DNA helix, bioluminescent laboratory, 16-bit RPG building asset, flat colors, hard pixel edges --ar 3:2 --niji 6
```

---

### G3 · Chronicle Archive Exterior (Story Grove)
Pink mystical archive with glowing glyph clouds above entrance.

**ChatGPT prompt:**
```
Pixel art building exterior for a top-down RPG. A mystical story archive building. Dark magenta-purple walls (#200A20) with hot pink (#FF4DCC) decorative panel borders. Front facade has an arched entrance with pink glow. Above the arch: tiny floating pixel-art glyph symbols. A pointed tower detail on top. 16-bit SNES style, top-down oblique projection, flat colors, hard pixel edges.
```

**Midjourney prompt:**
```
/imagine pixel art mystical archive building, top-down oblique view, dark magenta walls, pink neon glyph symbols, fantasy sci-fi library, 16-bit RPG building, flat colors, hard pixel edges --ar 3:2 --niji 6
```

---

### G4 · Stellar Commons Exterior (Shop)
Warm amber marketplace building with holographic sign above door.

**ChatGPT prompt:**
```
Pixel art building exterior for a top-down RPG. A futuristic marketplace / shop building. Dark warm brown walls (#201000) with amber (#FFB300) neon trim lines. Wide storefront entrance. Above the entrance: a floating holographic sign with amber glow (a small icon of a coin or gem). Flat roof with amber accent lighting. 16-bit SNES pixel art, top-down oblique projection, flat colors, hard edges.
```

**Midjourney prompt:**
```
/imagine pixel art sci-fi marketplace building, top-down oblique view, dark warm brown, amber neon shop sign, futuristic storefront, 16-bit RPG building asset, flat colors, hard pixel edges --ar 3:2 --niji 6
```

---

### G5 · Nexus Plaza Quest Board (small building)
Compact 3×3 tile kiosk / obelisk with cyan quest display.

**ChatGPT prompt:**
```
Pixel art small building / kiosk for a top-down RPG. A futuristic quest board obelisk. Dark navy structure (#0A1828) with a glowing cyan holographic display panel on the front face (#00CCFF). The display shows tiny pixel-art icons (a star, a checkmark). 3 tiles wide, 3 tiles tall. 16-bit SNES pixel art, top-down oblique projection, flat colors, hard edges.
```

**Midjourney prompt:**
```
/imagine pixel art quest board kiosk, top-down oblique view, dark navy, cyan holographic display with icons, sci-fi RPG prop building, 16-bit game asset, flat colors, hard pixel edges --ar 1:1 --niji 6
```

---

## Phase H — HUD Icons

**Target size:** 16 × 16 px each
**File location:** `public/game-assets/ui/`

| Icon | Description | ChatGPT prompt |
|------|-------------|----------------|
| `icon-star.png` | XP star — 8-point pixel star, amber `#FFB300` fill, white outline | `A 16x16 pixel art 8-point star icon, bright amber (#FFB300), white outline, hard pixel edges, 16-bit game UI icon, black transparent background` |
| `icon-coin.png` (4-frame) | Spinning coin — flat circle, amber, 4 frames of rotation | `A 16x16 pixel art coin icon, frame 1 of 4 rotation, bright amber (#FFB300), thin dark outline, 16-bit game UI, transparent background` |
| `icon-xp.png` | XP lightning bolt — cyan `#00CCFF` | `A 16x16 pixel art lightning bolt icon, bright cyan (#00CCFF), hard pixel edges, 16-bit game UI icon, transparent background` |
| `icon-level.png` | Level up arrow — upward chevron, violet | `A 16x16 pixel art upward arrow chevron, bright violet (#9B5CFF), hard pixel edges, 16-bit game UI icon, transparent background` |

**Midjourney prompts (batch):**
```
/imagine pixel art game UI icons set, 16x16 each, star, coin, lightning bolt, arrow chevron, amber and cyan and violet palette, 16-bit RPG UI icons, flat colors, hard pixel edges, solid magenta background (#FF00FF) --ar 2:3 --niji 6
```

---

## Asset Delivery Checklist

For each completed asset, verify before dropping into `public/game-assets/`:

- [ ] Final dimensions match spec (32×32, 128×128, etc.)
- [ ] Scaled with **nearest-neighbor** interpolation only (no bilinear/bicubic)
- [ ] Max color count respected (8 for tiles, 16 for characters)
- [ ] Background is transparent (PNG-32 RGBA) for sprites/NPCs
- [ ] Background matches game bg `#050810` or is transparent for tiles
- [ ] No anti-aliasing pixels on edges
- [ ] File naming follows convention: `[zone]-[type]-[variant].png`
- [ ] Tested in-engine at 2× scale (64×64 display) and looks crisp

---

## Recommended Asset Creation Order

1. **B4 TECH_PATH** — immediately improves the cross-road spine of the world
2. **B1 GRID_FLOOR_1** — replaces all default grass across the whole map
3. **G1–G5 Building Exteriors** — biggest visual impact per asset
4. **F1–F6 NPC Sprites** — brings characters to life
5. **E1–E6 Player Sprites** — player character feels on-brand
6. **C1–C5 Wall Tiles** — detailed building detail
7. **B2–B8 Remaining Floor Tiles** — zone variety
8. **D1–D3 Special Feature Tiles** — landmark moments
9. **H HUD Icons** — polish pass

---

## Tools & Resources

| Tool | Use |
|------|-----|
| **Aseprite** | Primary pixel art editor — scaling, palette reduction, animation |
| **ChatGPT** | Native image generation (GPT-4o) — conversational iteration, precise hex color following, best for detailed descriptive prompts and character concepts |
| **Midjourney v6 + Niji 6** | `--niji 6` excels at game-style character art; `--style raw` for tiles |
| **Pixelator / Pixelicious** | Web tool to convert any image to pixel art automatically |
| **Lospec Palette DB** | Find matching retro palettes to match the campus color system |
| **EZGif** | Assemble 4-frame animations into animated PNGs for reference |

**Midjourney quick-reference flags used in this doc:**
- `--ar 1:1` — square output for tiles and sprites
- `--ar 3:2` — landscape for building exteriors
- `--niji 6` — anime/game character art model
- `--style raw` — less Midjourney post-processing, closer to the described style
