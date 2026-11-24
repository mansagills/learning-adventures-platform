# Google Flow browser automation guide

How an autonomous agent (Google Antigravity, or Claude with browser use) controls **Google Flow** to render the film described by a prompt pack. `00_project_config.md` tells the agent to follow this guide, so keep the pack's file names, shot IDs and `renders/` paths exactly as written in `pack-templates.md`.

Flow's menus change often. Where a label below doesn't match the screen, choose the closest option and note it in `03_run_sheet.md` instead of stopping.

## Contents
1. Sign-in and workspace
2. Global video settings
3. Pre-production assets (locations, characters, voices)
4. Shot generation loop
5. Continuity audit and regeneration gate
6. Assembly and delivery
7. When to stop and ask a person

## 1. Sign-in and workspace

**Session check**
- Open the Google Flow web app.
- If no one is signed in, use the browser's saved Google session. If there isn't one, stop and ask the user to sign in; the agent never types a password itself.

**Credit check**
- Read the credit balance before generating anything.
- Compare it with the estimate in `00_project_config.md` (about 240 credits per finished minute: 20 minutes ≈ 4,800). If the balance is lower, say how many shots it covers and ask whether to run part of the film now.
- Flow has offered a small number of free credits per day (about 50 at last report; unconfirmed). That is enough for a test, not a long film.

**Workspace**
- Click **New Project** and name it exactly like the project title in file 00.
- Keep every reference image and clip inside this one project so assets stay together.

## 2. Global video settings

Open **Settings** and set these before making any asset or clip:

| Setting | Value | Notes |
| --- | --- | --- |
| Aspect ratio | `16:9` or `9:16`, as in file 00 | 16:9 for YouTube/TV, 9:16 for Shorts, Reels, TikTok. |
| Video model | `Omni 1.2 Flash`, or the latest Omni 1.2 listed | Chosen by the user; use the nearest entry if the menu words it differently. |
| Output quality | Highest / cinematic | Avoids compression artifacts. |
| Outputs per prompt | **1** (default is 2) | The key credit saver: one clip per shot prompt instead of two. |

After saving, re-open Settings and confirm the values stuck. A reset to 2 outputs silently doubles the cost.

## 3. Pre-production assets

Make every reference before the first shot, so the whole film draws on the same images.

**Locations.** For each location in `01_characters_and_locations.md`, paste its anchor plus the style line, generate an empty establishing view, and keep the best one as the reference named in the file (`REF-LOC-<NAME>`).

**Characters.** For each character, paste the anchor plus the style line, generate one full-body, front-facing image on a plain background, and keep the best one (`REF-<NAME>`). If a face or costume doesn't match the anchor, regenerate before moving on; every later shot copies this image.

**Props.** Do the same for any hero prop with a reference ID (for example the dragon egg), so its color, texture and size stay fixed.

**Voices.** Where Flow offers voice settings, enter each character's voice line from file 01 (tone, accent, pace, emotional timbre). Where it doesn't, the voice description inside each shot prompt does this job.

Save images to `renders/refs/<ref-id>.png` and tick them in `03_run_sheet.md`.

## 4. Shot generation loop

Work through `02_scenes_prompt_pack.md` in run-sheet order, one **shot** at a time. A scene is several shots, and each shot is one 8-second clip.

```
FOR EACH shot IN 03_run_sheet.md (in order):
  1. Focus the prompt box.
  2. Paste the shot's "Flow prompt" exactly as written. Do not edit, shorten or merge it.
  3. Attach the shot's listed ingredients (reference images for its characters, location and props).
  4. Confirm the settings are still: aspect ratio, 1 output, correct model.
  5. Click Generate.
  6. Wait until the status says complete. If it fails, retry once, then mark "needs review" and continue.
  7. Watch the clip. Quick checks: the right characters, the right outfit, speech present and clear, vertical or wide as set.
  8. Download it to renders/scene-NN/<shot-id>.mp4 (for example renders/scene-03/S03-SH02.mp4).
  9. Tick the shot in 03_run_sheet.md.
STOP at the point file 00 names (default: end of Scene 1) and wait for the user to review.
```

Do not overwrite a clip; save a retake as `<shot-id>_take2.mp4`. Allow at most 3 takes per shot before marking it "needs review", since every take costs credits.

## 5. Continuity audit and regeneration gate

Flow doesn't remember earlier clips, so the film can drift. Audit before assembly.

1. **Hero props and signature assets.** Check every clip that shows a key object. Example: a dragon egg should keep the same gray color, texture and size in every shot, not turn into an ordinary egg.
2. **Characters.** Compare faces, hair and outfits with the reference image.
3. **Locations.** Compare the layout, landmark and light with the location reference.
4. **Correct, shot by shot.** For a drifted clip, regenerate that shot only. Re-paste the original prompt and add one correcting sentence that names the exact defect, for example: "The egg must match the exact dark gray dragon egg in the reference image, with the same cracked texture and the same size." Attach the reference image again. Change one thing at a time.
5. Record each fix in the run sheet (shot ID, what was wrong, take number).

If the same shot fails the audit three times, stop retaking it and mark it for the user, because the prompt itself probably needs rewriting.

## 6. Assembly and delivery

1. **Stitch.** Place the approved clips in order, Shot 1 to the last shot, on a timeline at the project's aspect ratio. Trim about half a second of silence at the start and end of each clip.
2. **Audio and captions.** Keep each clip's dialogue and sound. Add music if the pack calls for it. If the user wants captions, add them in the editor rather than generating them in Flow, because generated on-screen text is often garbled.
3. **Export.** Export the full film (and keep the individual clips). Save the export in `renders/final/`, named after the project.
4. Tell the user the file location, the shot count, credits used compared with the estimate, and any shots marked "needs review".

## 7. When to stop and ask a person

- Not signed in, a CAPTCHA, or a payment or plan prompt appears.
- The credit balance can't cover the next batch.
- Flow refuses a prompt (usually a content rule). Report the shot ID and the message; don't reword creative text on your own.
- A shot fails the audit three times.
- A setting the guide depends on (aspect ratio, outputs per prompt) can't be found or won't hold.
