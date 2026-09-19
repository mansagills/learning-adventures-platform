# Prompting Guide: Opus 5 & Fable 5.1 for the Campus World Demo

**Purpose of this document**: This is the source-of-truth reference for writing prompts to Claude Opus 5 or Claude Fable 5.1 when asking either model to build, fix, or extend the **Gather-style 2D campus world demo** (`/world`, `app/world/*`, `components/world/*`, `game/*`). Use it every time you open a fresh Opus or Fable session to work on this track, so each session gets a complete, well-scoped brief instead of a vague one-liner.

It is adapted from Anthropic's Claude 5 tech-spec prompting templates, filled in with this project's specifics. Two filled templates are provided below — pick the one matching the model you're prompting, copy it, fill the bracketed blanks, and paste it as your first message.

---

## Why this project needs a prompting guide

This repo has accumulated many overlapping planning documents (`COMPREHENSIVE_PLATFORM_PLAN.md`, `BETA_PROTOTYPE_PLAN.md`, `2D_GAME_WORLD_PLAN.md`, six root-level `GATHER_*.md` files, plus a `docs/` and `platform-docs/` tree) that sometimes contradict each other about what's actually built. A prompt that just says "continue the campus demo" will cause the model to either re-derive stale status from the wrong doc or guess. The templates below force every session to state, in the prompt itself, which doc is authoritative and what the model should treat as already-decided — so the model spends its effort building, not re-diagnosing project history.

**Always pair this guide with `docs/CAMPUS_WORLD_DEMO_PRD.md`** (created alongside this guide) — that PRD is the current source of truth for scope, feature status, and priority order on the campus world track. Point the model at it explicitly in every prompt.

---

## The Golden Rules (apply to both models)

1. **Give the entire job upfront.** State the full task and exit criteria in one message rather than steering step-by-step. Both models are trained to execute complete, multi-step tasks autonomously.
2. **Explain the "why," not just the "what."** Say who the feature is for and what it lets them do next — SPARK dialogue, a quest, a shop purchase all serve the same underlying goal: convincing a stakeholder walking through the demo that this is a real product. Tell the model that goal so its judgment calls point the right direction.
3. **Swap hard bans for reasons.** Instead of "NEVER hardcode dialogue," say "SPARK dialogue should come from the LLM integration in `lib/agents/BaseAgent.ts`, because a hardcoded response won't handle the questions a live demo audience actually asks."
4. **Don't ask it to double-check itself.** Opus 5 and Fable 5.1 self-verify natively. Adding "double-check your work" or "explain your reasoning step by step" causes over-verification and wastes tokens without improving output.

---

## Choosing a model

| Use **Opus 5** for | Use **Fable 5.1** for |
|---|---|
| Wiring the SPARK chatbot to a real LLM backend, quest/job/shop API routes, Prisma model work, auth/COPPA-sensitive code, code review of an existing PR | Phaser scene/entity work (`game/scenes`, `game/entities`), character movement and animation, tileset/building-interior integration, anything vision-guided (matching a reference screenshot or art style), high-autonomy multi-file passes across the campus world code |

If a task spans both (e.g., "add a new building with a mini-game embedded and an NPC that reacts to progress"), split it into an Opus 5 prompt for the data/API/dialogue-logic half and a Fable 5.1 prompt for the scene/asset half — don't ask one model to do both in one shot.

---

## Template A — Claude Opus 5

Copy this whole block, fill every `[bracket]`, and send it as the first message of the session.

```markdown
# TECHNICAL SPECIFICATION & EXECUTION DIRECTIVE

## 1. CONTEXT & GOAL (THE WHY)
* I am working on: the Learning Adventures platform's Gather-style 2D campus world demo — a browser demo where a student's avatar walks a campus, talks to the AI character SPARK, takes on quests, and plays embedded mini-games inside buildings.
* This is designed for: [investors / grant reviewers / pilot-school families / internal QA — name the actual audience for this session's work]
* They need this because: the demo has to read as a real, working product during a live or recorded walkthrough — broken dialogue, dead-end quests, or placeholder art breaks the illusion and costs credibility with whoever is watching.
* Source of truth for current status and scope: `docs/CAMPUS_WORLD_DEMO_PRD.md` in this repo. Read it before starting. Do not trust `GATHER_DEMO_FUTURE_FEATURES.md` or `COMPREHENSIVE_PLATFORM_PLAN.md` for current status — they are known to be stale/contradictory; the PRD reconciled them against actual code.
* With that in mind, the core objective of this turn is to: [state the precise goal, e.g. "wire SparkChat.tsx to a real LLM call via lib/agents/BaseAgent.ts instead of the current mocked response"]

## 2. SYSTEM ARCHITECTURE & REQUIREMENTS (THE WHAT)
* Relevant existing code: [list the actual files this touches, e.g. components/world/SparkChat.tsx, lib/agents/BaseAgent.ts, app/api/agent/chat/route.ts, Prisma models AgentConversation/ConversationMessage]
* Core Feature 1: [details]
* Core Feature 2: [details]
* Data structures / schemas already defined in prisma/schema.prisma that this must use: [name the models — don't invent new ones without checking first]

## 3. STRICT SCOPE & BOUNDARIES (PREVENTING OVER-ENGINEERING)
* Deliver exactly what is asked, at the scope intended.
* Make routine judgment calls yourself. Only pause or check in if different readings of the request would lead to materially different work.
* If you identify a flaw, a mistaken assumption, or a better approach in this specification, point it out briefly in a single sentence, but proceed with the task as specified rather than unilaterally transforming, widening, or narrowing the scope.
* Finish the whole task. Stop short of actions that are clearly beyond what is requested here.
* This is a demo, not a production LMS: don't add multi-tenant scaling, payment/subscription logic, or admin tooling unrelated to the task — the Prisma schema already has substantial unused scaffolding (Stripe fields, agent workflow tables) from earlier over-building; don't add to that pile.

## 4. CODE QUALITY & IMPLEMENTATION CONSTRAINTS
* Do not leave placeholders, stubs, or "TODO" comments. Complete the code end-to-end.
* Follow the style guides and frameworks already in the codebase (Next.js 14 App Router, Prisma, Tailwind, existing component patterns in components/world/).
* If replacing a mock/stub (several exist in lib/agents/, e.g. BaseAgent.ts's Claude SDK integration), remove the mock entirely rather than leaving it as a fallback path.

## 5. RE-VERIFICATION & SUBAGENT DELEGATION LIMITS
* Focus on execution. Do not spawn subagents to double-check, verify, or review your own work.
* Only delegate to a subagent if you encounter large, genuinely independent, and parallelizable tasks (such as a wide multi-file codebase investigation) that cannot be completed within a few tool calls. Keep spawn counts as low as possible.

## 6. SELF-CORRECTION CADENCE
* Only correct an earlier statement or code implementation if the error would materially change my code, conclusions, or downstream decisions.
* State any necessary corrections plainly and briefly, then continue. For minor slips that do not impact functionality or understanding, make the fix and move on without narrating it.

## 7. USER-FACING COMMUNICATION & BRIEFING TONE
* Keep responses focused, brief, and concise. Spend most of the response on the main deliverable rather than conversational fluff.
* Keep disclaimers, caveats, and warning notes extremely short.
* If explaining a concept or code structure, provide a high-level summary. Do not write in-depth, lengthy explanations unless I explicitly request them.
* Before your first tool call, explain in one sentence what you are about to do. While working, give a brief update only when you find something important or change direction.
* When you finish, lead with the outcome: your first sentence must answer "what happened" or "what did you find," followed by supporting detail.
* When you finish, update `docs/CAMPUS_WORLD_DEMO_PRD.md`'s status table for the feature(s) you touched, and note the change in `COMPREHENSIVE_PLATFORM_PLAN.md`'s campus-world section per the repo's existing session protocol.
```

---

## Template B — Claude Fable 5.1

Use this for Phaser/scene/asset-heavy, highly autonomous, or vision-guided work. Copy, fill, send as the first message.

```markdown
# END-TO-END AUTONOMOUS TASK SPECIFICATION

## 1. GOAL & STRATEGIC INTENT (THE WHY)
* Overall Project: Learning Adventures' Gather-style 2D campus world demo — a Phaser-based browser world (`/world`) where a student avatar explores a campus, talks to SPARK, completes quests, and enters buildings with embedded educational mini-games.
* Target Audience: [who will watch/experience this specific piece of work — investor demo, grant reviewer walkthrough, actual pilot students]
* Downstream Impact: a smooth, bug-free campus experience is what convinces that audience the platform is real and working; visual glitches, missing sprites, or broken building transitions undercut everything else in the demo.
* Source of truth for current status and scope: `docs/CAMPUS_WORLD_DEMO_PRD.md`. Read it before starting — it reconciles the conflicting claims in `GATHER_DEMO_FUTURE_FEATURES.md`, `docs/BETA_PROTOTYPE_PLAN.md`, and `2D_GAME_WORLD_PLAN.md` against what's actually in the code, so treat it (not those older docs) as ground truth for what's already done.
* Specific Request: [state the primary task, e.g. "replace the placeholder character sprite and campus tileset with the real Sorceress-generated assets in public/[path], and verify movement/collision still works with the new tile dimensions"]

## 2. DESIGN & TECHNICAL REQUIREMENTS (THE WHAT)
* Relevant existing code/assets: [game/scenes, game/entities, game/world, public/ asset paths, components/world/* UI overlays involved]
* Requirements: [e.g., specific tile size, animation states needed, collision layers, how this building/scene should connect to the existing quest or mini-game embed system]
* Reference material if any: [screenshot, style guide doc — e.g. docs/CAMPUS_GATHER_STYLE.md — or note "no reference, use judgment consistent with existing assets"]

## 3. EFFORT & CONTROL DIRECTIVES
* Proceed with high autonomous momentum. When you have enough information to act, act.
* Do not re-derive facts already established, re-litigate decisions I have already made, or narrate options you chose not to pursue in user-facing messages. If you are weighing a choice, state your recommendation directly instead of giving an exhaustive survey.

## 4. PREVENTING PREMATURE ABSTRACTION (OVER-ENGINEERING)
* Don't add features, refactor, or introduce abstractions beyond what the task requires.
* A bug fix does not need surrounding cleanup, and a one-shot operation does not need a helper. Do the simplest thing that works well.
* Avoid premature abstraction and half-finished implementations.
* Don't add error handling, fallbacks, or validation for scenarios that cannot happen. Trust internal code and framework guarantees; validate only at system boundaries (user input, external APIs).
* Don't use feature flags or backwards-compatibility shims when you can simply edit the code directly.
* This codebase already has two abandoned/parallel demo forks (`demo/la-campus-demo/`, `demos/campus-sim-demo/`) from earlier over-branching — do not create a third. Work in the main app unless this spec explicitly says otherwise.

## 5. AUDITING PROGRESS & ELIMINATING HALLUCINATED STATUSES
* Before reporting progress in the conversation, audit each claim against an actual tool result from this session.
* Only report work you can point to concrete evidence for. If something is not yet verified (e.g., you couldn't run the dev server to confirm the sprite renders correctly), state so explicitly.
* Report outcomes faithfully: if tests fail, show the output; if a step was skipped, state that; when something is completed and verified, report it plainly without hedging.
* This project has a documented pattern of docs claiming "fully built and live" when the code was actually stubbed (see `GATHER_DEMO_FUTURE_FEATURES.md` vs. the reconciled state in the PRD) — do not repeat that pattern. Never mark something done in `docs/CAMPUS_WORLD_DEMO_PRD.md` without having actually run/viewed it.

## 6. SYSTEM BOUNDARIES & VOLUNTARY STEPS
* If I am describing a problem, asking a question, or brainstorming out loud rather than requesting a code/system change, your deliverable is your assessment. Report your findings and stop. Do not apply a fix until I ask for one.
* Before running any command that alters system state (deletions, restarts, configuration edits, database migrations), verify that the evidence supports that specific action. Do not apply a fix based on a superficial pattern match.

## 7. AUTONOMOUS PIPELINE CONTINUITY (NO EARLY STOPPING)
* You are operating autonomously. I am not watching in real time and cannot answer clarifying questions mid-task. Asking "Want me to...?" or "Shall I...?" will block progress. For reversible actions that follow naturally from this spec, proceed without asking.
* Before ending your turn, review your last paragraph. If it contains a plan, analysis, question, list of next steps, or a promise about work you have not yet completed, perform that work now with tool calls before ending the turn.
* End your turn only when the task is fully complete, verified in a running dev server where visual/interactive changes are involved, or you are genuinely blocked on input only I can provide.

## 8. INSTRUCTION FOLLOWING & BRIEFING TONE
* Lead with the outcome. Your first sentence after finishing must answer "what happened" or "what did you find."
* Readability is paramount. Be selective about what you include rather than compressing into fragments, abbreviations, arrow chains, or heavy jargon.
* Do not echo, transcribe, or explain your internal reasoning within your user-facing response text. If you need to reason, do so silently in your thinking blocks.
* When finished, update `docs/CAMPUS_WORLD_DEMO_PRD.md`'s status table for what you touched.

## 9. READABILITY IN ASYNCHRONOUS SUMMARIES
* Terse shorthand is fine between tool calls. Your final summary is for me, a reader who did not watch the step-by-step execution.
* Write your final message as a complete re-grounding: state the outcome first, then the one or two things you need from me, each explained clearly.
* Use complete sentences, spell out technical terms, and avoid made-up labels, hyphen-stacked compounds, or arrow chains. Give each file, commit, or flag its own plain-language clause. Choose clarity over brevity.
```

---

## Filling the blanks well — quick checklist

Before sending either template, make sure you've actually filled in, not left generic:

- [ ] The specific files/components the task touches (name them — don't say "the relevant code")
- [ ] What "done" looks like — a concrete, checkable exit condition, not "make it better"
- [ ] Which existing mock/stub (if any) this replaces, with its file:line
- [ ] Whether this task is Opus-shaped, Fable-shaped, or needs splitting (see model table above)
- [ ] A pointer to `docs/CAMPUS_WORLD_DEMO_PRD.md` and an instruction to update its status table when done

## Keeping this guide and the PRD in sync

Whenever a prompted session finishes real work, two things should happen (the templates above already instruct the model to do the first one, but verify it actually did):
1. `docs/CAMPUS_WORLD_DEMO_PRD.md` status table updated for the features touched.
2. If the session's finding contradicts something in this guide (a new file layout, a new canonical doc, a model-choice lesson learned), edit this guide directly — it's meant to accumulate project-specific prompting knowledge over time, not stay frozen at its first version.
