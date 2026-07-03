Original prompt: Create a standalone demo folder in main so the campus demo can run directly in a browser without authentication.

## Progress

- Added a self-contained static canvas demo under `demos/campus-sim-demo`.
- Implemented the Mrs. Numbers quest loop: accept quest, collect three parts, return, unlock Math Race Rally, score 80% or better.
- Added `render_game_to_text`, `advanceTime`, and `demoTest` hooks for future automated checks.
- Added a zero-dependency local static server and smoke test.

## Notes

- The demo intentionally avoids app auth, Next.js routing, database calls, sockets, and external asset downloads.
- Current visuals are canvas-drawn pixel-style placeholders. Future work can replace these with Aseprite/LibreSprite sprite sheets or imported free tilesets.

## TODO

- Replace drawn placeholders with finalized 16-bit sprite and tile assets.
- Add richer simulated student chatter and quest celebration animations.
- Add a browser automation test that drives the full quest loop.
