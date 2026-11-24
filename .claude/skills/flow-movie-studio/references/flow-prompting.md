# Writing prompts Google Flow follows well

Flow turns one text prompt (optionally with reference images) into one short clip, about 8 seconds, with picture and sound. It remembers nothing between clips. These notes are about getting a film's worth of clips that look like one film.

## Contents
1. The shot prompt formula
2. Keeping characters and places consistent
3. Camera language
4. Dialogue, voices and sound
5. Pacing a film out of 8-second shots
6. Things that go wrong
7. Content rules

## 1. The shot prompt formula

Write each shot prompt as one paragraph in this order, because the model weighs early words most:

1. **Shot and camera**: framing, lens, angle, movement. "Medium close-up, 50mm, eye level, slow dolly-in."
2. **Subject**: the full character anchor(s) from file 01, pasted exactly.
3. **Action**: what physically happens in these 8 seconds, as one clear motion with a start and an end. "She lifts the egg from the ash, turns it toward the light, and gasps."
4. **Setting**: the location anchor, plus time of day and weather.
5. **Light and mood**: "warm forge glow from the left, cool blue dusk behind, embers drifting".
6. **Style line**: the film's style sentence from file 01, the same in every shot.
7. **Audio**: dialogue and sound, in the format in section 4.

Aim for 90 to 160 words. Shorter prompts let the model invent things (a new hairstyle, a different jacket); much longer ones get partly ignored.

Describe what should be there, not what shouldn't. "Clean, empty sky" works better than "no birds". Where something must be absent, put it at the end in one short sentence ("No on-screen text or subtitles.").

## 2. Keeping characters and places consistent

- **Anchors**: each character gets one locked description of 35 to 60 words: age, skin tone, face shape, hair (color, length, style), build, exact outfit with colors and materials, one signature item. Paste it word for word into every shot the character appears in. Change nothing, not even the word order: small rewordings produce visibly different people.
- **Name plus anchor**: start with the name and then the anchor ("Mira, a 12-year-old girl with ..."). The name helps Antigravity track who is who; the description is what Flow actually draws.
- **Reference images (ingredients)**: before any shots, make one clean full-body reference image per main character (plain background, front-facing, neutral pose) and one per key location and prop, from the same anchor text. Attach them as ingredients in every shot that uses them. File 01 lists these as the first jobs.
- **Locations** get anchors too (25 to 50 words): layout, materials, colors, a landmark that is always visible.
- **Style line**: one sentence fixed for the whole film, e.g. "Cinematic 3D animated feature style, soft global illumination, rich saturated color, shallow depth of field." Never mix styles between shots.
- **Continuity notes**: if something changed earlier (torn sleeve, the egg now glows), add it to the action of every later shot, because Flow won't know.

## 3. Camera language

Use plain film terms Flow understands:

- Framing: extreme wide, wide, full shot, medium, medium close-up, close-up, extreme close-up, over-the-shoulder, two-shot, insert (an object).
- Angle: eye level, low angle (makes someone powerful), high angle (small, vulnerable), bird's-eye, dutch angle (unease).
- Movement: static, slow push-in / dolly-in, pull-out, pan left/right, tilt up/down, tracking shot alongside, crane up, handheld (urgent), orbit.
- Lens: 24mm (wide, epic), 35mm (natural), 50mm (people), 85mm (soft portrait close-ups), macro (tiny details).

One camera move per shot. Vary framing between neighboring shots (wide, then medium, then close) so the edit flows; two wides in a row feel like a jump.

## 4. Dialogue, voices and sound

Flow can generate speech and sound with the picture. Write audio after the visual description:

```
Mira says, softly and amazed: "It's warm. It's still alive."
SFX: crackling embers, distant wind through the ruins.
Music: low, hopeful strings.
```

- Put the spoken words in double quotes after "<Name> says" with a short delivery note. Only one or two speakers per shot.
- Keep lines short: about 2 to 3 words per second, so at most about 18 words in an 8-second shot, and leave a second of silence at the start and end for cutting.
- Repeat the character's voice description from file 01 in the delivery note the first time they speak in each scene ("in her bright, quick, slightly husky voice"), since voices drift too.
- Add "No subtitles or on-screen text." at the end of shots with speech, or Flow may print the words.
- Narration: "Narrator (voice-over, warm and calm): ..." with nobody's lips moving.

## 5. Pacing a film out of 8-second shots

- Rough density: 7 to 8 shots per minute. A 3-minute episode is about 23 shots; 20 minutes is about 150.
- Open with an establishing wide, end scenes on a close-up reaction or a meaningful object.
- Big moments get more, shorter-feeling shots (close-up, reaction, insert); quiet moments can hold one slow shot.
- For a movement that must continue across shots (a chase), end shot A and start shot B on the same pose and direction, and say so in both prompts ("continuing her run from the previous shot, left to right").

## 6. Things that go wrong

- **Drifting faces and costumes**: anchor not pasted exactly, or no reference image. Fix the anchor, regenerate.
- **Extra limbs, melting hands, garbled text on signs**: simplify the action, avoid close-ups of hands doing fine work, avoid readable signs unless essential.
- **Too much in one shot**: two actions, a costume change and a location move in 8 seconds. Split it.
- **Silent or wrong-voiced clips**: missing quotes or speaker name; restate the voice.
- **Credits burned on retakes**: test Scene 1 first, and change one thing at a time when retaking.

## 7. Content rules

- Don't name real people, celebrities, or existing film, TV, game or brand characters, and don't ask for "in the style of <studio or artist>". Describe the look in your own words. Flow may refuse these, and the film should be original anyway.
- For children's content (Learning Adventures): no blood or gore, no weapons used on people, no frightening close-ups of monsters for young ages; danger is solved with courage, cleverness and teamwork.
