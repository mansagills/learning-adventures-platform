# Quest Dev Brief — The Spark Chronicles

**Audience:** any partner/dev building a quest game for Learning Adventures.
**tl;dr:** Build whatever genre you want. Wire it to the five slots below and use the reward rules as-is. That's the whole contract.

---

## 1. What a "Quest" is

A Quest is any playable game — side-scroller, shooter, FPS, 3D platformer, puzzle, whatever genre fits the subject best — wrapped in a fixed narrative and reward structure so it plugs into the larger Season 1 story without anyone having to touch the hub world (the campus).

The hub (campus) never changes structurally because of a quest. All story content — corrupted zones, boss fights, cinematics — happens in a **solo instanced pocket dimension** ("Echo") that the player enters from the hub and leaves when done. Build your quest as a self-contained level/scene; you don't need to worry about persistence, other players, or hub state.

## 2. The Quest Contract (5 required slots)

Every quest, regardless of genre, needs these five pieces:

1. **Briefing** — a short story beat (dialogue/text, delivered by Jaylen or another NPC) shown before gameplay starts. This is what ties your genre to the plot — e.g. "you're piloting through a Null-frozen asteroid field to recover a broken equation core" turns a generic space shooter into a story beat.
2. **Reskin, not rebuild** — represent the player however your genre needs (ship, runner, mage, avatar, etc.), but carry over small identity touches from their created character (Spark color, Academy insignia/colors) so it still reads as *their* character, not a generic stock asset.
3. **Gameplay** — fully up to you. Any genre, any mechanic. The one constraint: content should visibly serve both the subject (math, science, English, history) and the current story beat — don't just reskin generic enemies with numbers on them, make the obstacles/enemies/puzzles *be* the subject content.
4. **Completion condition** — binary clear/fail, or a skill-based score threshold (accuracy, time, correct-answer count). **Never a loot roll or random outcome determines success.**
5. **Debrief** — a short story beat on exit/completion that advances the plot, delivered the same way regardless of genre.

## 3. Reward Rules — No RNG, Ever

- **Every clear** (first time or replay) pays a **fixed** XP amount and a **fixed** points amount. A small skill-based bonus is fine (e.g. "no mistakes" bonus, "under time" bonus) as long as it's deterministic — never randomized.
- **First clear only** also grants a **guaranteed story item** (e.g. a "Null Fragment") required to progress the plot/unlock the next chapter or cinematic. This is fixed and non-random — every player gets the exact same item on their first clear, no exceptions.
- **Replays** after first clear pay XP/points only — no second story item. Replays exist purely so kids can grind points to spend in the Campus Shop on cosmetics/accessories.
- No loot tables, no drop chances, no variable rarity rewards anywhere in a quest.

## 4. Quest Metadata Shape

Every quest should ship with metadata like this (adapt field names to match `lib/catalogData.ts` conventions):

```
questId: string              // unique id, e.g. "q1-null-asteroid-run"
chapterId: string            // e.g. "chapter-1"
subject: "math" | "science" | "english" | "history" | "interdisciplinary"
genre: string                // free text, e.g. "space shooter", "side-scroller"
briefingText: string         // shown pre-gameplay
debriefText: string          // shown post-gameplay
completionType: "clear" | "score-threshold"
scoreThreshold?: number       // if completionType is score-threshold
xpReward: number             // fixed
pointsReward: number         // fixed
bonusRules?: string[]        // deterministic bonus conditions, no randomness
storyItemId: string          // granted once, on first clear only
avatarReskinNotes: string    // how the player's identity carries into this genre's avatar
```

## 5. Checklist Before Handoff

- [ ] Briefing and debrief text written and reviewed against the current chapter's story beat
- [ ] Gameplay content ties to the subject, not just cosmetically
- [ ] Completion condition is binary or skill-based — confirmed no RNG anywhere in rewards
- [ ] XP, points, and story item values are fixed and documented in metadata
- [ ] Story item only fires on first clear (verify replay path doesn't re-grant it)
- [ ] Player identity (Spark color/insignia) shows up somewhere in the reskin, even minimally
- [ ] Quest is fully self-contained (no dependency on live hub state)
