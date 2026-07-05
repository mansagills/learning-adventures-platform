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
- Added post-quest progression loop: completing Math Race awards 100 XP, then players can spend XP at the Campus Store.
- Integrated selected modern LimeZu exterior/interior sheets for the campus grounds, buildings, plaza, and study commons visuals.

## Notes

- The demo intentionally avoids app auth, Next.js routing, database calls, sockets, and external asset downloads.
- Current visuals use original repo character sprites plus selected modern campus environment sheets, rendered directly on canvas.
- Stakeholder build is deployed through Vercel with `demos/campus-sim-demo` as the project root.
- Modern campus tiles are credited in `ASSET_CREDITS.md`; the demo includes selected sheets only, not full source asset packs.

## TODO

- Tune campus layout scale/positioning to more closely match the integrated Phaser campus.
- Tune simulated student chatter density and add more quest celebration animation polish.
- Replace the simulated store/economy with account-backed inventory once the authenticated app flow is ready.
- Add a browser automation test that drives the full quest loop.
