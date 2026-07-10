# Learning Adventures — Campus Demo (Vercel snapshot)

Standalone, backend-free snapshot of the Gather-style campus demo, published
to `main` under `demo/la-campus-demo/` **specifically so it can be deployed
as its own Vercel project** (Root Directory = `demo/la-campus-demo`) without
touching the real production app at the repo root.

**No environment variables required.** No Supabase, no database, no secrets.
Purely a client-side Phaser game with localStorage for XP/progress — it runs
entirely in the browser.

This folder started as a full copy of the app as of the `claude-demo-gather`
branch, then trimmed to only what the demo needs:

- **Kept**: `app/page.tsx` (redirects to `/dev/campus-sandbox`),
  `app/dev/campus-sandbox` (the demo itself), `app/layout.tsx`,
  `app/globals.css`, `app/robots.txt` and `app/sitemap.xml` (both static
  hardcoded strings), plus the full `game/`, `components/world/`, and
  `components/phaser/` source the demo depends on.
- **Removed**: `app/api/` (all ~31 route groups), `middleware.ts`, and every
  other page (admin, auth, courses, teacher/parent/child dashboards, etc.).
  None of it is reachable from the demo, and several of those routes
  eagerly required secrets (`CHILD_SESSION_SECRET`) or a live Supabase/
  Prisma connection just to build — removing them means this folder needs
  nothing configured to deploy.

## Deploying

Vercel project settings:

- **Root Directory**: `demo/la-campus-demo`
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (runs `prisma generate && next build`)
- **Environment Variables**: none required

Verified locally: `next build` and `next start` both succeed with zero env
vars set. `/` redirects (307) to `/dev/campus-sandbox`, which responds 200.

## Updating this snapshot

This folder does not stay in sync with the source branch automatically. To
pull in newer campus-demo work, re-copy the relevant files from
`claude-demo-gather` (or wherever that work lands) into `game/`,
`components/world/`, and `app/dev/campus-sandbox/` — avoid re-copying the
rest of the app, since that's what required the removals above.
