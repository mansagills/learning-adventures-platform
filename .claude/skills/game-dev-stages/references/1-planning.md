# Stage 1 — Planning

**Question:** What is this game, and can we afford to build it?

Planning is the cheapest place to be wrong. Every hour here saves a week in production.

---

## Part A — The Big Six

Nothing else in this stage matters until these are answered in writing. Answer them
concretely; "some kind of roguelike-ish thing" is not an answer.

| Question | A good answer looks like |
|----------|-------------------------|
| **Genre?** | "Single-player 2D precision platformer, 3–5 hour campaign" |
| **2D or 3D?** | "2D, orthographic, 16×16 tile grid" — and *why* (team skills, budget, feel) |
| **Art style?** | "Limited-palette pixel art, 32-colour, no anti-aliasing" — with 2–3 reference games |
| **Core mechanics?** | The 3–5 verbs the player performs constantly. Name them. |
| **Hero and villain?** | Who the player is, what opposes them, why the player should care |
| **Engine?** | Named engine + the constraint that decided it (platform, team skill, licence) |

Ideas churn violently here — that is correct and healthy. The stage ends when churn stops,
not when the first idea is written down.

### Pillars

Distil the above into **3 design pillars**: short declarative statements that settle future
arguments. Example: *"Death is instant and always the player's fault."* Every later feature
gets judged against the pillars. Features that serve no pillar are candidates for the cut list
before they are ever built.

### The 30-second loop

Write the loop the player repeats constantly:

```
ACTION → FEEDBACK → REWARD → REPEAT
```

If this can't be written in four lines, the concept isn't ready.

---

## Part B — Proof Of Concept

The proof of concept is the resource plan that determines whether the game can be made at all,
and it's what a publisher or funder actually evaluates. Seven questions:

1. **How much will it cost?** Break out salaries/contractors, tools and licences, art and audio
   outsourcing, platform fees, marketing, certification, contingency (add 20–30%).
2. **Where does the money come from?** Savings, publisher advance, crowdfunding, Early Access,
   grants, day job. Name the actual source and the trigger point where it runs out.
3. **How long will it take?** Calendar time per stage, not just production. Then apply the
   standard correction: whatever you estimated, it is longer.
4. **Do you have the skills?** List required disciplines — code, art, animation, audio, writing,
   UX, QA, marketing, business/legal. Mark each as *have / learn / hire / outsource*.
5. **How big is the team, and which roles?** If any role is "learn", add its learning curve to
   the timeline. If solo, every role is yours — say so explicitly.
6. **How will it make money?** Premium, F2P + IAP, ads, subscription, DLC, demo-to-full. Pick
   one primary model; the monetisation model constrains design, so it belongs in stage 1.
7. **Which platforms?** Each platform is a certification process, a store page, a control scheme,
   and a hardware floor. Adding a platform later is not free.

Indie-specific: if the funding answer is thin, the realistic levers are crowdfunding, Early
Access, scope reduction, or a smaller first game that funds the real one. Say which.

---

## Deliverables

- `docs/game/concept.md` — big six, pillars, 30-second loop, 2–3 reference games
- `docs/game/proof-of-concept.md` — the seven resource questions, with numbers

---

## Exit Criteria

- [ ] All six fundamentals answered in writing, and stable for at least one revision pass
- [ ] Three pillars written, each phrased as a decidable statement
- [ ] Core loop expressible in four lines
- [ ] Budget with contingency, and a named funding source
- [ ] Timeline covering all seven stages
- [ ] Skills gap list, each item marked have/learn/hire/outsource
- [ ] Monetisation model chosen
- [ ] Launch platform list frozen (additions later are re-planning)

**Do not enter pre-production** while any fundamental is still moving. That is the Conker's
Bad Fur Day failure: a tone change during production cost two extra years and a lot of goodwill.
