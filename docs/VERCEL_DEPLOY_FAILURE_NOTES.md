# Vercel deploy failure: `learning-adventures-platform` project

**Status:** open, to be investigated on its own branch after the v1 site rebuild
(`docs/V1_WEBSITE_REBUILD_PLAN.md`) is finished.
**Written:** 2026-09-25, from the Vercel API (deployment list, deployment details and build logs).

## Summary

The Vercel project **`learning-adventures-platform`** (`prj_faHCRMqDwz8gJKfxzWPOpI6JSlqn`) has
failed every deployment, on `main` and on every branch, since **2026-07-05**. Its last
successful deploy is still what **learningadventures.org** serves.

Two other Vercel projects in the same account deploy the same commits successfully:

| Project                             | Root Directory          | Node | Status                                |
| ----------------------------------- | ----------------------- | ---- | ------------------------------------- |
| `learning-adventures-platform`      | repo root               | 22.x | ❌ every deploy fails                 |
| `learning-adventures-platform-2mxb` | `demo/la-campus-demo`   | 24.x | ✅ deploys (today's public demo link) |
| `codex-campus-demo`                 | `demos/campus-sim-demo` | —    | ✅ deploys                            |

On GitHub this shows up as a red `Vercel – learning-adventures-platform` status on every PR. It is
not caused by any one PR.

## Why it matters

- **The real domain is stuck in July.** The last good deploy
  (`dpl_Fso7dLziXjWijb8fg9i3G6pyFVW5`, `main` @ `e9655fe`, "feat: add campus demo xp store loop",
  2026-07-04) is aliased to `learningadventures.org`, `www.learningadventures.org` and
  `learning-adventures-platform.vercel.app`. Nothing merged since then has reached the domain.
- **It is the project that builds the repo root**, which is where the v1 site lives. Going live
  (v1 Phase 6) needs either this project fixed, or the domain moved to a project that deploys.

## Timeline

The failures happened in **two stages** with different causes.

### Stage 1: real build errors (July)

| When (UTC)       | Deployment                                              | Error                          |
| ---------------- | ------------------------------------------------------- | ------------------------------ |
| 2026-07-04 07:50 | `dpl_Fso7dLziXjWijb8fg9i3G6pyFVW5` (`main`)             | ✅ last successful deploy      |
| 2026-07-05 02:20 | `dpl_JDBroiBw3otgLfSmb2XeXpVPfAfG` (branch)             | `pnpm run build` exited with 1 |
| 2026-07-05 03:47 | `dpl_HU9AprGKttDqbhxzJSHS69e8voeA` (`main` @ `177c26d`) | `pnpm run build` exited with 1 |

The build log for the 03:47 deploy shows a normal TypeScript failure:

```
./demo/la-campus-demo/app/dev/campus-sandbox/page.tsx:11:30
Type error: Cannot find module '@/components/world/ActivityFeed'
```

That commit added the `demo/la-campus-demo` snapshot. The root build type-checked the demo's
files and resolved their `@/` imports against the repo root, where those files didn't exist.
**This was fixed later in the code** (#190 excluded `demo/` from the root `tsconfig`/vitest).
Another build-time failure, the `CHILD_SESSION_SECRET` check that ran at module load, was fixed on
the v1 branch. The root app now builds locally with **no env vars at all**.

### Stage 2: "Resource provisioning failed" (by mid-September, still happening)

| When (UTC)        | Deployment                                                    | Error                                        |
| ----------------- | ------------------------------------------------------------- | -------------------------------------------- |
| 2026-09-13 23:56  | `dpl_2Fn95zH5MFoatTfSD6o8MwSPEuDi` (branch)                   | `BUILD_FAILED: Resource provisioning failed` |
| 2026-09-14 (main) | `dpl_BdeAuau1egXspsrQgaQ2LPqTHW7y` (`main` @ `a6a7e6f`, #190) | same                                         |
| 2026-09-25 18:38  | `dpl_6JF7ttTgBUwrTvuVBaDf1MuB6CNa` (v1 branch)                | same                                         |

These fail **about half a second** after they start, before install or build, and produce **no
build log**. So the code isn't even reached: Vercel can't set up a build machine for this
project. That's why fixing the code errors from stage 1 didn't bring the deploys back.

Not yet pinned down: the exact date between 2026-07-08 and 2026-09-13 when the error type
switched. Checking the deployments in that window (Vercel dashboard → Deployments, or the API)
would date it.

## What to check in the Vercel dashboard

Open **vercel.com → mansas-projects → `learning-adventures-platform` → Settings**, and compare
each setting with `learning-adventures-platform-2mxb`, which works. Most likely first:

1. **Build machine / plan.** Settings → Build & Deployment → _Build Machine_. "Resource
   provisioning failed" means Vercel couldn't allocate a build machine. A common cause is a project
   set to a larger/faster build machine (Enhanced/Turbo) or a Pro-only feature after a trial or
   plan change. Compare with the working project and switch to _Standard_ if it differs. Also check
   the team's **Usage** and **Billing** pages for exhausted build minutes or limits.
2. **Node.js version.** This project is on **22.x**; the working one is on **24.x**
   (Settings → Build & Deployment → Node.js Version). Worth matching.
3. **Install and build commands.** The failed July builds ran `pnpm run build`. Vercel picked pnpm
   because the repo has a `pnpm-lock.yaml`, while the repo and CI use **npm** (`package-lock.json`,
   `npm ci`). Consider setting the install command to `npm ci` and the build command to
   `npm run build`, or removing the unused `pnpm-lock.yaml`.
4. **Environment variables.** Settings → Environment Variables. v1 needs none. Look for stale or
   very large values. Vercel has a total size limit for env vars per deployment.
5. **Redeploy the last good deployment** (Deployments → `dpl_Fso7dLziXjWijb8fg9i3G6pyFVW5` →
   Redeploy). If even that fails with "Resource provisioning failed", the cause is the project or
   account, not the code, which confirms items 1, 2 or 4.
6. If none of that helps, contact **Vercel support** with a failing deployment ID, e.g.
   `dpl_6JF7ttTgBUwrTvuVBaDf1MuB6CNa`. This error has no build log, so support can see things the
   dashboard doesn't.

## Fallback for going live

If this project can't be fixed quickly, point the working project `learning-adventures-platform-2mxb`
at the repo root (Settings → Root Directory: empty) and move the `learningadventures.org` domains to
it (Settings → Domains). The v1 site needs no env vars, so no secrets have to move.
