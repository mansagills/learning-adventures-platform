# The quality bar and the rubric

The full, current wording lives in `docs/GAMES_3D_UPGRADE_PLAN.md`: section 2
is the standard and section 3.3 is the rubric. If that file disagrees with
this summary, the plan wins. Re-read it if the owner has changed something.

## What every remastered game must have

**Look and feel**

- A Three.js scene in the 2D retro pixel-art style of Seeds of Genius:
  - crisp whole-number pixel scaling and a warm palette
  - Pixelify Sans for titles and Atkinson Hyperlegible for reading (both bundled, never loaded from Google)
  - wood-and-parchment panels from `kit.css`
- Its own setting and its **own host and helper characters, with names**. Jaylen and S.P.A.R.K. are the site's theme, not game hosts.
- All art painted in code. No emoji, no stock icons, no image files from the internet.
- Sound effects and 2–3 short songs made in code: a main loop, an intense or special mode, and the finale or night. Mute is on M.
- Game feel: squash, bounce, sparkle and a toast when right; a gentle reaction when wrong. Reduced motion turns animation down.

**Learning**

- A learning spec: grade band, standards (Common Core Math, NGSS, CCSS ELA, C3), 3 levels per skill, and the misconceptions it targets.
- Wrong answers made from real misconceptions, and feedback that explains the misconception.
- A hint ladder on every challenge: a nudge, then a picture or model, then the answer outlined. Hints never cost progress.
- Adapts to the player: the kit's learner model (up after 2 clean answers, down after 2 misses).
- A talk-it-through debrief at the end of each part: explain or choose a reason (`talk.ask`).
- A For grown-ups page: what it teaches, the standards, talking points, how to help, what it simplifies, and a "How it is going" progress table.
- Facts checked against reliable sources (NASA, NOAA, USGS, NPS, Smithsonian and similar) for science and history. List the sources in the grown-ups page credits.

**Kid-safe and reliable**

- Works offline, with no network requests, no sign-in, no names and no trackers. Saves and settings stay in the browser (localStorage via `SaveStore`).
- Keyboard, mouse and touch all work. Works at 1280×720 and at 390×844 with no sideways scroll and no clipped text.
- Settings survive a reload (reduced motion, text size, mute).
- Runs smoothly: 30+ fps even on the test machine's software rendering.
- Unit tests for the learning logic, plus a browser test that plays the whole game.

## The rubric (out of 10, pass at 8.5)

| Category | Points | What earns it |
|---|---|---|
| Gameplay and feel | 2.5 | Fun loop, pacing, variety of activities, progress shown on screen, a finale, a reason to replay |
| Learning accuracy and clarity | 2.0 | Grade fit, standards, misconceptions diagnosed with clear sentences, hint ladder, debriefs |
| Visual and audio polish | 1.5 | A rich pixel scene, original characters and props, readable UI, music and sounds |
| Usability and accessibility | 1.5 | Keyboard, touch, read-aloud, phone layout, reduced motion, focus handling |
| Technical reliability | 1.5 | No console errors, offline, smooth, unit tests plus a full browser playthrough |
| Completeness | 1.0 | Every point above; save and continue; old links redirect |

Recent scores for calibration: Number Line Ninja 8.75, Counting Carnival 8.9,
Library Rush 8.85, Money Market 8.9, Time Attack Clock 9.0, Race Rally 9.0,
Math Adventure Island 9.0. A first build usually lands around 7.5–8.0. The
missing points almost always come from the screenshot review (art cut off or
overlapping, the player hidden) and the phone layout.

Write the score as a table with **one sentence of evidence per category**.
Name the weakest thing. For example: "The finale is a night scene, not an
animation."

## Screenshots the owner expects at check-in

- the title screen
- gameplay in the world
- a hint (ideally the picture rung)
- a wrong-answer explanation
- a debrief or the finale
- the grown-ups page
- a phone-width capture

Send them with SendUserFile, in that order, with a one-line caption.
