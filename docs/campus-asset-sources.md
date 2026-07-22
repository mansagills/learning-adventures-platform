# Campus Asset Sources

The current Codex campus demo uses a generated Phaser facade layer for the
futuristic Gather-style buildings. It does not ship the raw Kenney sprites yet;
instead, the room skins are modeled on CC0 Kenney sci-fi asset packs so the demo
can move quickly without introducing large binary asset churn.

## Primary Sources

- [Kenney Sci-Fi RTS](https://kenney.nl/assets/sci-fi-rts) - CC0. Top-down
  futuristic building, panel, and RTS-style structure reference.
- [Kenney Modular Space Kit](https://kenney.nl/assets/modular-space-kit) - CC0.
  Modular sci-fi trim, glass, doorway, and station reference.

## Current Implementation

- Source metadata and room skins live in
  `game/world/futuristicCampusArt.ts`.
- The rendered campus facelift is generated in
  `game/scenes/GatherCampusScene.ts`.
- Generated facades keep the browser demo deterministic, lightweight, and easy
  to deploy while preserving a clean CC0 art direction.

## Later Raw Asset Pass

When the demo needs more fidelity, download the Kenney packs into an ignored
source-art folder, extract only the selected room/building tiles into
`public/game-assets/`, and add an attribution/license note beside the optimized
sprites even though CC0 does not require attribution.
