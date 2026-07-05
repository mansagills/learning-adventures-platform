# Campus Sim Demo

Standalone no-auth browser demo for the Learning Adventures simulated campus.

## Run

From this folder:

```bash
npm run dev
```

Then open:

```text
http://localhost:4173
```

The demo is static and has no app authentication, database, sockets, or Next.js
route dependency. It can also be opened directly with `index.html`, though the
local server is recommended for stakeholder testing.

## Assets

The `assets/` folder contains copied Learning Adventures player sprites plus
selected modern campus tiles and NPC/student character sheets from
user-provided LimeZu asset packs. Keeping
copies here makes this demo portable and no-auth without depending on the app's
Next.js public asset path.

See `ASSET_CREDITS.md` for attribution and non-commercial proof-of-concept
usage notes.

## Loop

1. Talk to Mrs. Numbers in Math Hall.
2. Collect the Number Battery, Fraction Fuel Cell, and Turbo Token.
3. Return to Mrs. Numbers to unlock Math Race Rally.
4. Play Math Race Rally.
5. Score 80% or better to complete the quest.

## Controls

- Move: WASD or arrow keys
- Interact: Space or E
- Fullscreen: F

## Test Hooks

The demo exposes:

- `window.render_game_to_text()`
- `window.advanceTime(ms)`
- `window.demoTest`

These hooks keep future browser smoke tests deterministic.
