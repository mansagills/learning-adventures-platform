# Choosing the kind of game, and which code to copy

Every game so far lives in `games-src/adventures/src/games/<slug>/`. Pick the
genre that fits the learning, then copy the closest game's structure. Don't
start from scratch: the existing games already solve camera, layout, saving,
debug hooks and phone layout.

| Genre | Best for | Copy from | How it plays |
|---|---|---|---|
| **Walking world with stations** | 3–4 related skills, younger players, story | `time-attack-clock` (3 jobs), `counting-carnival` (4 booths), `math-adventure-island` (4 zones, side quest, finale mode) | Walk a 45° pixel world. A sign over a person marks a job. Talking opens a panel of questions. 5 stars per place unlocks a part of a big goal (tower parts, torches) and then a finale |
| **Movement on a model** | Number lines, coordinates, measuring | `number-line-ninja` | The character moves on the math model itself (hops on stones) |
| **Survivors-style action** | Sorting or classifying under light pressure, older players | `math-dash` (Library Rush) | Endless run: carry items to the right place while dodging. Power-ups. Levels by stage |
| **Shop or service sim** | Money, measurement, multi-step everyday math | `money-market-madness` | Serve customers, make change, earn money for upgrades (cosmetic plus the stand) |
| **Arcade racer** | Fact fluency, quick strategies | `math-race-rally` | Always moving; steer into the right answer gate; a CPU rival follows your momentum; a memory-match pit stop for cosmetics. Uses its own `RaceScene` (perspective camera), not the kit renderer |
| **Game show or board** | Mixed review, finales | the Quiz Show in `math-adventure-island` | A board of categories × point values against a rival character who scores your misses, with a strategy bonus |

Rules of thumb:

- The owner likes games that feel like real games: "plays really well",
  "feel more like a racing game". If the subject allows an action or arcade
  loop, offer it as one option in the plan, next to the safer walking world.
- Mixed skills suit a world with stations. One skill practised for fluency
  suits arcade or action. Multi-step everyday tasks suit a sim.
- Merges (two old games into one): one becomes the main mode and the other a
  mode inside it (Math Memory Match became the Race Rally pit stop; Treasure
  Hunt Calculator became a side quest). Old slugs redirect.
- Give the game an end: a finale scene (night falls, torches blaze, the bell
  rings), a trophy, and a reason to come back (rematch, personal best, new
  hunts, cosmetic unlocks).

## Characters

Each game has a host (who explains the goal, the opening and the finale) and
one helper per station. Make them varied in skin tone, hair, clothes and age,
using `CharacterLook` and `extras` like jacket, apron, beard or belt. A
non-human sidekick or rival (Munch the monster, Pip the parrot, Dash the CPU
racer) adds personality. It needs its own portrait painter (48×48, see
`paintPipPortrait`).
