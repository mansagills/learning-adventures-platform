# Learning design: from a partner's game to a deep one

The partner owns **what** the game teaches. You own **how deeply and how
well**. Keep their subject, questions, facts and order of skills. Build
these layers around them.

## 1. Write the learning spec first

Before any art, write down:

- **Grade band.** Use the partner's band, widened to the full band if they
  only covered its bottom (the site lists bands like `2–5`).
- **Skills**: usually 3–4. Each one becomes a place, booth, zone or job in
  the game, and each is a separate skill in the learner model.
- **Standards** for each skill, with codes (for example 3.OA.3, 4.NF.2,
  5-PS1-1, RL.3.1, D2.His.2.3-5). Put them on the grown-ups page.
- **3 levels per skill.** Level 1 is the partner's content or the bottom of
  the band, level 2 is the middle, and level 3 is the top of the band,
  including the classic hard case (regrouping, remainders, unknown start,
  across the hour, unlike denominators, inference).
- **The misconceptions**: 4–10 named mistakes children really make with this
  topic. These drive the wrong answers, the feedback and the grown-ups
  progress table.

## 2. Raising the difficulty (the usual gap)

Most submitted games ask one kind of question at one level. Typical upgrades:

| What the partner made | Upgrade to |
|---|---|
| Random `a + b` questions | Three levels (within 20, two-digit, three-digit with regrouping), plus word problems where the key word is a trap ("found some *more*, now has 50" needs subtraction) |
| Pick the right fact | Explain why: the debrief asks for the reason, and level 3 asks about cause and effect or "what would happen if" |
| Vocabulary matching | Use in context: pick the word that fits the sentence; level 3 uses near-synonyms and prefixes and suffixes |
| A single quiz | Varied activities: a world with 3–4 places, each a different kind of task, plus a finale that mixes everything |
| No feedback beyond right or wrong | One sentence per misconception explaining the likely mistake |

Raise the challenge **by structure, not by speed**: unknowns in other
positions, more steps, bigger numbers, trap wording, a reasonableness check.
Timers belong only in an optional challenge mode (like Time Attack); the main
path is never timed.

## 3. Make every question a pure function

Keep all the learning logic in `problems.ts` with no drawing and no timers,
so it can be unit tested:

```ts
export function makeProblem(skill: Skill, tier: Tier, r: Rand): Problem
// r is mulberry32(seed) from src/kit/core/rng.ts, so a seed always gives the same question
```

Each problem carries:

- the question text, or what the game needs to build it
- the **choices**: 3 (or 4 for operations). Exactly one is correct. Every
  wrong one has a `misconception` tag and is computed from that mistake
  (column addition without carrying, smaller digit taken from bigger, the
  remainder given as the answer, the hour read one too many), never a random
  nearby number when a real mistake exists. Pad with "off by one" or
  "off by ten" only when you run out of real mistakes.
- anything the hint picture needs (the parts of a bar model, the groups, the
  number line)
- a one-sentence **strategy** that shows how to solve it

Helpers worth copying: `numChoices` and `asks` in
`src/games/math-adventure-island/problems.ts`, `addNoCarry`, and
`subSmallerFromBigger`.

**Break a multi-step task into steps when that shows where a child gets
stuck.** Math Adventure Island's word problems go: what is the question
asking → which operation → solve. Its treasure clues go: estimate →
calculate → is Pip's answer reasonable → find the grid square. A star needs
every step right the first time.

## 4. Feedback for each mistake

In `content.ts`, write one short sentence per misconception, with the actual
numbers where possible:

- Good: "Careful! The story says MORE, but we already know the whole. To find a missing part, take away."
- Good: "The leftover kids need a ride too! They need one more boat."
- Bad: "Wrong, try again."

The wrong choice gets greyed out and crossed through, and the child tries
again. After two misses the next hint opens automatically.

## 5. The hint ladder (three rungs)

1. **Nudge**: a question that points at the key idea ("Is the question about
   putting them together, or comparing them?").
2. **Model**: a picture plus a worked step that still leaves the last step
   to the child. Examples: bar model, equal groups, array, sharing boxes,
   hops on a number line, a clock with the hour shaded, a fraction strip.
   Render it in HTML or CSS, or pixel art.
3. **Answer**: the correct choice is outlined (`.worked` class) with its
   explanation.

Hints never cost progress, but the star needs `hintRung <= 1`.

## 6. Levels that adapt (the learner model)

Use the kit (`src/kit/learning/mastery.ts`):

```ts
const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
recordAnswer(save.learner, skillId, { correct, hintRung, misconception }, RULES);
```

- Record **once per question**: on the first miss (as wrong, with its
  misconception), or when it is solved cleanly.
- A place is "done" after 5 stars **and** (level ≥ 2 **or** 12 questions
  played). That way a child who struggles still finishes.
- Show "Level up!" and "Let's practise at an easier level" toasts when the
  level changes.

## 7. The talk-it-through debrief

At the end of each place, the helper asks one question with `talk.ask`.
It asks for a **reason or a classic trap**, not another drill question. The
question has 3 options, each with its feedback and misconception, and 3 hints
(the last says "The answer is outlined"). Record it as `<skill>-talk`.

## 8. The grown-ups page

`GROWNUPS` in `content.ts` (the `GrownupsContent` type) holds:

- a summary
- 4–6 "what it teaches" items: one per skill, plus how mistakes and hints work
- the standards with their codes
- 3 talking points for home
- 3 "how to help" notes (the level rules, nothing timed, read-aloud)
- what the game simplifies
- credits and sources

Add a `progressReport()` table with one row per skill. Each row shows status,
right-first-time count, current level, and the most common slip, translated
into plain words (`topMisconception` mapped through a WORDS table).

## 9. Science, English and history games

- **Science:** facts come from a reliable source. Write the source next to
  the fact in `content.ts`, and list the sources in the credits. Prefer
  "explain the cause" questions at level 3. Misconceptions are known
  student ideas (for example "heavier things fall faster", "the Sun moves
  around the Earth", "plants get their food from soil").
- **English:** generate from word lists the partner supplies. Level 3 uses
  context and morphology. Make sure read-aloud doesn't give the answer away:
  for spelling, say the word but don't spell it.
- **History:** primary-source framing ("How do we know?"), dates and places
  checked, people described respectfully, no invented quotes.
