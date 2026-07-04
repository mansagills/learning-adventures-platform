Original prompt: Create a standalone demo folder in main so the campus demo can run directly in a browser without authentication.

## Progress

- Added a self-contained static canvas demo under `demos/campus-sim-demo`.
- Implemented the Mrs. Numbers quest loop: accept quest, collect three parts, return, unlock Math Race Rally, score 80% or better.
- Added `render_game_to_text`, `advanceTime`, and `demoTest` hooks for future automated checks.
- Added a zero-dependency local static server and smoke test.
- Copied original Learning Adventures sprite sheets and tilemap PNGs into `assets/`.
- Replaced rectangle placeholder rendering with original character sprites, campus tiles, and props.
- Fixed standalone sprite anchoring so characters stand on the ground plane and face their walking direction.
- Added first-two-minutes polish: objective markers, clearer HUD guidance, ambient student chatter, and stronger Math Race result feedback.

## Notes

- The demo intentionally avoids app auth, Next.js routing, database calls, sockets, and external asset downloads.
- Current visuals use the original repo sprite sheets and tile textures, rendered directly on canvas.
- Stakeholder build is deployed through Vercel with `demos/campus-sim-demo` as the project root.

## TODO

- Tune campus layout scale/positioning to more closely match the integrated Phaser campus.
- Tune simulated student chatter density and add more quest celebration animation polish.
- Add a browser automation test that drives the full quest loop.
