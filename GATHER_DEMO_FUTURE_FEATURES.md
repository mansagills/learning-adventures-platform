# Gather Campus Demo — Future Feature Ideas

Captured 2026-07-05, at the point where the demo was feature-complete and
published to Vercel (`demo/la-campus-demo` on `main`). These are the next
features considered, ranked by pitch-impact relative to effort. Everything
here builds on systems that already exist — no new infrastructure needed.

**Logistics note that applies to all of these:** new work lands on the
`claude-demo-gather` branch first. The public Vercel deployment is a separate
snapshot in `demo/la-campus-demo/` on `main` and does NOT auto-sync — after a
batch of features, re-copy `game/`, `components/world/`, and
`app/dev/campus-sandbox/` into the snapshot (see its README for what NOT to
re-copy) and push `main`.

---

## Tier 1 — Highest impact: closes loops the demo already opens

### 1. Wear your purchases (medium-small effort)
The Racing Helmet bought in the shop actually appears on the player's avatar
(small overlay sprite anchored above/on the player). Right now the economy
loop ends at "✓ Owned" text in a modal; this makes the payoff *visible* —
the moment an investor understands why kids will care about earning XP.

- Where: `demoEconomy` already tracks `owned`; the Player sprite lives in
  `game/entities/Player.ts` (add an accessory overlay that reads the
  inventory on spawn and on `demo-economy-updated`).

### 2. Second quest — Dr. Spark, Discovery Lab (medium effort)
Example: "my lab robot lost its memory chips" → gather chips → play Crystal
Chemistry → score gate → reward. One quest reads as a scripted demo; two
reads as a *quest system*. Completing quest #1 could unlock quest #2 — a
real progression arc for the pitch.

- Where: `game/world/mathQuest.ts` is a single-quest state machine written
  to be generalized — lift the stage/dialogue/target/hint shape into a quest
  definition object and instantiate per quest. `TalkableNPC.setQuestDialogue`
  and the guidance marker/arrow already take arbitrary targets.

### 3. Player identity — name + avatar picker (small effort)
The welcome overlay asks for a first name and offers the six existing
character sprites (human-1/2, robot-blue, cat-orange, wizard-purple,
knight-silver). Name appears above the player and in the activity feed
("Mansa earned the Racing License!" instead of "YOU"). Personalizes the demo
instantly for whoever is holding the mouse.

- Where: extend `WelcomeOverlay` + a small localStorage identity module
  (same pattern as `welcomeState.ts`); the scene already supports avatar
  selection via the `set-avatar` EventBus event and `player-${charKey}`
  textures; `ActivityFeed` and the quest-completed feed entry read the name.

## Tier 2 — Strong polish: makes it feel like a finished product

### 4. Cinematic intro (small effort)
On "Start Exploring," the camera starts zoomed out over the whole campus and
glides down to the player over ~2.5s. Cheap in Phaser
(`camera.setZoom` + `pan`/zoom tween on scene start, gated behind the
welcome dismissal event). The "wow, look at this world" establishing shot.

### 5. Confetti burst on quest completion (small effort)
Particle explosion alongside the existing fanfare + celebration emotes.
Phaser particle emitter at the player position, one-shot, on
`quest-completed`.

### 6. Mobile touch controls in the sandbox (tiny effort — gap!)
The `TouchControls` joystick component already exists and is mounted on the
authed `/world/campus` page but NOT in the sandbox. Anyone opening the
public Vercel link on a phone currently cannot move. Mount it in
`app/dev/campus-sandbox/page.tsx` with the same modal-disable logic.

## Tier 3 — Ambient life: deepens the populated-world illusion

### 7. Students using the campus (medium effort)
A couple of sim students shooting hoops on the basketball court (walk to
court, 🏀 emote, ball-arc tween), or sitting on benches. The court is
currently pretty but unused. Waypoints must stay on open grass/court area
(NPC tweens don't collide).

### 8. Sim students greet you (small effort)
A quick 👋 emote when the player walks past (outside conversation range).
Mostly a proximity check in the scene's update loop feeding the existing
`showEmote`/`chatter` methods — throttle per-student so it doesn't spam.

### 9. Day/night tint cycle (medium effort, lowest priority)
Slow ambient color shift; street lamps "turn on" at dusk (lamp glow sprites
+ scene-wide tint overlay). Pretty, but least pitch-relevant of the list.

---

## Recommended bundle

For maximum pitch value in one pass: **1 + 3 + 4 + 6** (wearables, name/
avatar picker, cinematic intro, mobile controls) — the "this feels like a
real product" bundle — then **2** (second quest) if budget remains, since
it's the strongest story upgrade.
