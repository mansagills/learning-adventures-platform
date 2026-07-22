---
name: dev-workflow
description: Full feature development lifecycle orchestrator for the Learning Adventures Platform. Guides you through Build → Review → Test → Deploy in sequence, invoking the right skill or agent at each phase. Use this skill whenever starting work on a new feature, fixing a bug that requires code changes, or shipping anything to production — even if the user just says "build X", "add Y", or "I want to implement Z". This skill ensures nothing ships without going through code review, browser testing, and a verified Vercel deployment.
---

# Learning Adventures Dev Workflow

You are orchestrating a structured, multi-phase development workflow for the Learning Adventures Platform (Next.js 14 App Router + Supabase Auth + Prisma + Phaser 3, deployed to Vercel).

The workflow has 5 phases. Walk through them in order. Each phase hands off clearly to the next. Do not skip phases unless the user explicitly asks.

---

## Platform Context

Before starting, orient yourself:
- **API routes**: `app/api/` — must have `export const dynamic = 'force-dynamic'` and use `getApiUser()` from `lib/api-auth.ts` for auth
- **Auth**: Supabase Auth via `useAuth()` hook (client) or `getApiUser()` (server)
- **Database**: Prisma + Supabase PostgreSQL — schema in `prisma/schema.prisma`
- **Game world**: Phaser 3 scenes in `learning-adventures-app/game/`, bridge via `EventBus.ts`
- **HTML games/lessons**: `public/games/` and `public/lessons/`
- **Dev server**: `http://localhost:3000`
- **Branch**: always work on a feature branch, not `main`

---

## Phase 1: BUILD

**Goal**: Understand the feature, design the approach, implement it.

Invoke the appropriate skill based on what's being built:

| Feature type | Skill to use |
|---|---|
| API routes, backend logic, DB changes | `senior-backend` |
| React components, pages, UI | `frontend-design` |
| HTML games or lessons | `create-adventure` |
| Phaser scenes or game systems | `game-development` |
| Full-stack feature (API + UI) | `feature-dev:feature-dev` (if available), otherwise `senior-backend` then `frontend-design` |

Tell the user which skill you're invoking and why. Then invoke it.

After the skill completes implementation:
- Confirm all new API routes have `export const dynamic = 'force-dynamic'`
- Confirm auth is wired via `getApiUser()` (server) or `useAuth()` (client)
- If Prisma schema changed, remind the user to run `npx prisma db push`

**Phase 1 complete when**: Code is written and the feature is functional locally (or the user confirms it builds without errors).

---

## Phase 2: CODE QUALITY

**Goal**: Clean up and simplify the implementation before review.

Invoke the `simplify` skill on the files that were just written or modified.

This catches:
- Redundant code, unnecessary abstractions
- Inconsistent patterns vs. the rest of the codebase
- Dead code or unused imports

**Phase 2 complete when**: The simplify skill has run and any flagged issues are addressed.

---

## Phase 3: REVIEW

**Goal**: Catch bugs, security issues, and logic errors before they ship.

Invoke the `code-reviewer` skill. Point it at the modified files (get the list via `git diff --name-only`).

The reviewer will check for:
- Security vulnerabilities (auth bypass, injection, improper data exposure)
- Logic errors and edge cases
- Next.js / Supabase / Prisma anti-patterns
- Missing error handling at system boundaries

If any **high-severity** issues are found, fix them before proceeding. Low-severity issues can be noted and deferred.

**Phase 3 complete when**: Review is done and any blockers are resolved.

---

## Phase 4: TEST

**Goal**: Verify the feature works in a real browser before deploying.

Use the `webapp-testing` skill to test against `http://localhost:3000`.

If the dev server isn't running, ask the user to start it with `npm run dev` before proceeding.

Test plan — adapt to the specific feature, but always cover:
1. **Happy path**: Does the feature work as intended end-to-end?
2. **Auth gating**: Does it require login when it should? Does it reject wrong roles?
3. **Error states**: What happens with bad input or a missing resource?
4. **Mobile viewport**: Does it render acceptably at 375px wide?

Capture screenshots for any failures and describe what broke.

**Phase 4 complete when**: The happy path passes and no critical failures are found.

---

## Phase 5: DEPLOY

**Goal**: Ship to Vercel and verify the production deployment.

### 5a — Commit & PR
First, ensure changes are committed on a feature branch:
```bash
git add -p   # stage relevant files selectively
git commit -m "feat(...): description"
git push -u origin <branch>
```

Then guide the user to open a PR against `main`. Remind them:
- The Vercel preview deployment will trigger automatically on the PR
- Add the Supabase env vars to Vercel if this is a new project

### 5b — Deploy
Invoke the `vercel:deploy` skill to deploy to production (only after the PR is merged, or if deploying directly).

### 5c — Verify
Invoke the `vercel:verification` skill to confirm the production deployment is healthy:
- Build succeeded (no `DYNAMIC_SERVER_USAGE` errors, no lockfile errors)
- Key routes are reachable
- Auth flow works on the deployed URL

**Phase 5 complete when**: Vercel shows a green deployment and the feature is verified live.

---

## Handoff Format

At the start of each phase, announce it clearly:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase N: [NAME]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

At the end of each phase, give a one-line status and ask the user to confirm before moving on — unless they've asked you to run the full workflow automatically.

---

## Skipping Phases

The user can skip any phase by saying so explicitly. Common shortcuts:
- "skip testing" → jump from Review to Deploy
- "just review and deploy" → start at Phase 3
- "already reviewed, just deploy" → start at Phase 5

If skipping, acknowledge the skip and note any risk (e.g., "skipping tests means we won't catch browser-level issues before deploy").

---

## Common Gotchas for This Platform

- **Lockfile drift**: After adding/removing packages, run `npx pnpm install` and commit `pnpm-lock.yaml` before pushing — Vercel enforces frozen lockfile
- **Static prerender errors**: Any route using Supabase cookies must have `export const dynamic = 'force-dynamic'`
- **Schema changes**: `npx prisma db push` (no migration files needed for Supabase)
- **Phaser + Next.js**: Phaser scenes must be client-only; use dynamic imports with `ssr: false`
- **Auth hook shape**: `useAuth()` returns `{ user, loading }` — not `{ data: { session } }` (that's the old NextAuth pattern)
