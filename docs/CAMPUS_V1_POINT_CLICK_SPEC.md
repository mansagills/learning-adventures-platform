# Campus V1 Point/Click Spec

## Product Direction

Campus V1 will ship as a point/click 2D campus experience instead of a full real-time top-down movement game. The goal is to release a polished learning hub sooner while preserving a clean path to a richer V2 game world.

V2 remains the full sprite-based top-down game experience with character movement, collision, animation, and deeper mechanics.

## Core Experience

- Students start in a main campus hub after login and character creation.
- The campus is split into connected zone screens rather than one giant map.
- Students move between zones by clicking directional exits at the edge of the screen.
- The avatar is represented by a simple marker that jumps to the selected interaction point or zone.
- Buildings, NPCs, quest boards, and machines are clickable.
- Clicking a building reveals the inside of that building.
- Inside buildings, students click machines or activity stations to launch games and lessons.

## Initial Zone Map

- Main Hub: spawn point, welcome NPC, quest board, navigation to other zones.
- West: Math Zone / Math Hall.
- North: Discovery Lab / Science Zone.
- East: Story Grove / English or reading zone.
- South: Commons, shop, profile/cosmetic area, or future social space.

Additional zones can be added later by extending the same directional navigation model.

## Building Interiors

Each building interior should be a simple point/click scene with:

- A clear back-to-campus action.
- 3-5 visible activity stations or machines.
- At least one NPC or guide character.
- Optional quest callouts and progress indicators.
- Activity launch actions that reuse the existing game/lesson embed flow.

The first production-ready interior should be Math Hall because existing math games are already wired into the world flow.

## NPCs And Dialogue

NPCs are clickable objects on zone and interior screens. Clicking an NPC opens a dialogue panel.

NPC dialogue should support:

- A short greeting or guidance message.
- Optional quest prompt.
- Optional action button, such as start quest, open activity, or visit building.

NPCs do not need pathing, schedules, or autonomous movement in V1.

## Quests, XP, And Progress

V1 should retain quests and XP as core game-feel systems.

- Completing a game or lesson can award XP and coins.
- The quest board can surface daily or recommended activities.
- NPCs can introduce quests or point students to relevant machines.
- Existing award/progress APIs should be reused where possible.
- Quest state can start simple: available, in progress, complete.

## V1 Non-Goals

- No real-time player movement.
- No collision system.
- No pathfinding.
- No animated sprite walking.
- No fully simulated open world.
- No complex inventory or economy beyond what is already needed for XP, coins, and basic rewards.

## V2 Compatibility

The V1 zone model should be treated as the narrative and spatial foundation for V2. Zone IDs, building IDs, NPC IDs, quest IDs, and activity station IDs should be stable enough to carry forward when the point/click scenes later become real walkable maps.

## Implementation Priority

1. Replace `/world` with the point/click zone shell while preserving auth and character requirements.
2. Build Main Hub with directional exits, welcome NPC, and quest board placeholder.
3. Build Math Zone and Math Hall interior.
4. Wire Math Hall machines to existing embedded math games.
5. Preserve XP/coin award flow after game completion.
6. Add basic NPC dialogue and quest prompts.
7. Add visual polish and mobile-friendly interactions.
