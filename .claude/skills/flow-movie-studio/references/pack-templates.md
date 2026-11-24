# Prompt pack templates

Copy these layouts. Antigravity reads the files top to bottom, so keep headings and field labels exactly as shown: they are how it finds things. Replace everything in `<angle brackets>`.

## 00_project_config.md

```markdown
# Project config: <Title>

> Instructions for the agent (Google Antigravity) controlling Google Flow. Apply these settings before generating anything. If a setting is not available in Flow, use the closest option and note it in 03_run_sheet.md. Do not change the creative text in 01 or 02.

## Project
- Title: <Title>
- Type: <Standalone film | Episode <N> of <Series>>
- Runtime target: <M> min (<shots> shots of ~8 s)
- Credit estimate: ~<credits> credits (+15% retake buffer: ~<buffered>)

## Flow settings
- Video model: Omni 1.2 Flash   <!-- the user's chosen model; if Flow's menu names it differently, pick the matching entry and note it -->
- Aspect ratio: <16:9 | 9:16>
- Quality: highest available / cinematic
- Outputs per prompt: 1   <!-- Flow's default is 2; 1 halves credit use -->
- Clip length: ~8 s
- Audio: on (dialogue, sound effects, music)
- Voice synthesis: enabled
- Agent: Gemini Neon controls Flow through Antigravity's browser   <!-- the user's chosen agent; confirm the name shown in Antigravity -->

## Files
0. flow-automation.md: how to drive Flow in the browser (read this first and follow it)
1. 01_characters_and_locations.md: anchors and reference images
2. 02_scenes_prompt_pack.md: <or list 02a, 02b ... parts>
3. 03_run_sheet.md: checklist; tick each shot when saved

## Output folders
- Reference images: `renders/refs/<ref-id>.png`
- Clips: `renders/scene-<NN>/<shot-id>.mp4` (e.g. `renders/scene-03/S03-SH02.mp4`)
- Make folders as needed. Never overwrite a clip; save a retake as `<shot-id>_take2.mp4`.

## Run order
1. Make every reference image in 01 ("Reference images to make first"), save them, and use them as ingredients wherever a shot lists them.
2. Generate shots in run-sheet order. For each shot: paste its **Flow prompt** exactly, attach its listed ingredients, generate 1 clip, download it to its **Output** path, tick it in 03.
3. Stop after the user's chosen point (default: end of Scene 1) and wait for review.
4. If a clip fails or is clearly wrong (wrong character, broken anatomy, missing speech), retake once, then mark it "needs review" and move on.
5. When all shots are done, run the continuity audit in flow-automation.md section 5 (hero props, characters, locations), fix drifted shots one at a time, then assemble and export to `renders/final/`.
```

## 01_characters_and_locations.md

```markdown
# Characters and locations: <Title>

## Style line (paste at the end of every visual prompt)
<One sentence: medium, look, lighting, color, lens feel.>

## Characters

### <NAME> (<role>)
- **Anchor (paste exactly)**: <Name>, <35–60 words: age, skin tone, face, hair, build, exact outfit with colors and materials, signature item>.
- **Voice**: <tone>, <accent>, <pace>, <emotional timbre>; e.g. "bright and quick, light Southern US accent, speeds up when excited".
- **Personality in motion**: <how they move and react, one line>.
- **Reference image ID**: REF-<NAME>

<repeat per character>

## Locations

### <LOCATION NAME>
- **Anchor (paste exactly)**: <25–50 words: layout, materials, colors, landmark, typical light>.
- **Ambient sound**: <e.g. wind through broken beams, distant crows>.
- **Reference image ID**: REF-LOC-<NAME>

## Key props

### <PROP>
- **Anchor (paste exactly)**: <size, shape, material, color, texture, glow or luminescence, any marks>.
- **Continuity**: <how it changes across the film, by scene>.

## Reference images to make first

| Ref ID | Prompt | Save to |
| --- | --- | --- |
| REF-<NAME> | Full-body character reference, front view, neutral pose, plain light-gray background. <anchor>. <style line> | renders/refs/REF-<NAME>.png |
| REF-LOC-<NAME> | Empty establishing view, no people. <location anchor>. <style line> | renders/refs/REF-LOC-<NAME>.png |
```

## 02_scenes_prompt_pack.md

```markdown
# Scenes prompt pack: <Title>

Shots: <total> · Runtime: ~<M> min · Aspect: <16:9 | 9:16> · 1 output per prompt

---

## Scene <N>: <LOCATION> · <TIME OF DAY>
**Purpose**: <what this scene does for the story, one line>
**Environment**: <location anchor plus this scene's weather, light, atmosphere>
**Continuity in effect**: <changes carried from earlier, or "none">

### <S0N-SH01>: <short name>
- **Camera**: <framing, lens, angle, movement>
- **Action & blocking**: <who stands where, what moves, start pose → end pose, physics, e.g. "cloak snaps in the wind">
- **Dialogue & audio**:
  - <NAME> says, <delivery>: "<line, ≤ 18 words>"
  - SFX: <sounds>
  - Music: <mood, or "none">
- **Ingredients**: REF-<NAME>, REF-LOC-<NAME>
- **Duration**: 8 s
- **Flow prompt**:
  > <One paragraph in the formula order: camera → full anchors → action → setting → light/mood → style line → audio. End with "No subtitles or on-screen text." if there is speech.>
- **Output**: `renders/scene-0N/S0N-SH01.mp4`

<repeat per shot, then per scene>
```

## 03_run_sheet.md

```markdown
# Run sheet: <Title>

## Before you start (for the user)
1. Put this folder somewhere on your computer and open it as a **New Project** in Google Antigravity.
2. In Antigravity's browser, sign in to Google Flow and check your credit balance (need ~<credits>).
3. Give Antigravity permission to control Flow.
4. Say: "Read 00_project_config.md and follow it. Make the reference images, then generate Scene 1 and stop."
5. Watch Scene 1. If it looks right, say: "Continue from the run sheet." If not, say what to change.

## Reference images
- [ ] REF-<NAME> → renders/refs/REF-<NAME>.png

## Shots
| ✓ | Shot | Scene | Output | Notes |
| --- | --- | --- | --- | --- |
| [ ] | S01-SH01 | 1 | renders/scene-01/S01-SH01.mp4 | |

## Continuity audit (after all shots)
| Shot | Problem (prop, character, location drift) | Fix (correcting sentence used) | Take | Status |
| --- | --- | --- | --- | --- |

## Final assembly
- [ ] Clips stitched in order at <16:9 | 9:16>
- [ ] Audio checked, captions added in the editor if wanted
- [ ] Exported to renders/final/<project-slug>.mp4

## Totals
- Shots: <total> · Estimated credits: ~<credits> · Test (Scene 1): ~<scene-1 credits>
```

## Worked example of one shot (16:9 fantasy)

```markdown
### S02-SH03: The egg wakes
- **Camera**: Close-up, 85mm, slightly low angle, slow push-in.
- **Action & blocking**: Kael kneels center frame, cupping the egg in both hands at chest height; a pulse of gold light spreads through its cracks and he flinches, then smiles.
- **Dialogue & audio**:
  - KAEL says, in a hushed, wondering whisper: "You're awake."
  - SFX: a soft heartbeat thrum from the egg, forge embers crackling.
  - Music: a single sustained low string note.
- **Ingredients**: REF-KAEL, REF-EGG, REF-LOC-FORGE
- **Duration**: 8 s
- **Flow prompt**:
  > Close-up, 85mm lens, slightly low angle, slow push-in. Kael, a 17-year-old young man with warm brown skin, short tight black curls, a lean build, a soot-streaked sleeveless leather apron over a rust-red linen shirt, and a braided copper cord around his left wrist, kneels and cups a dragon egg at chest height. The egg is the size of a melon, matte obsidian-black with fine cracks that glow molten gold. A pulse of gold light spreads through the cracks; he flinches, then breaks into a slow smile. Behind him, a small stone village forge with a glowing coal hearth and hanging iron tools. Warm firelight from the left, deep shadows on the right, embers drifting. Cinematic 3D animated feature style, soft global illumination, rich saturated color, shallow depth of field. Kael says, in a hushed, wondering whisper: "You're awake." Sound: a soft heartbeat thrum from the egg, embers crackling, one low sustained string note. No subtitles or on-screen text.
- **Output**: `renders/scene-02/S02-SH03.mp4`
```
