# Learning Adventures — Campus Demo (Vercel snapshot)

Standalone snapshot of the Gather-style campus demo, published to `main` under
`demo/la-campus-demo/` **specifically so it can be deployed as its own Vercel
project** (Root Directory = `demo/la-campus-demo`) without touching the real
production app at the repo root.

This folder is a full copy of the app as of the `claude-demo-gather` branch,
with two changes made only here:

1. **`app/page.tsx`** — the root route redirects straight to
   `/dev/campus-sandbox` instead of rendering the full marketing homepage,
   since that page depends on Supabase env vars this deployment doesn't set.
2. **`middleware.ts`** — removed. The real app's middleware enforces auth on
   protected routes and role checks via Prisma; none of that applies to this
   auth-free demo, and keeping it would require a live database connection
   just to build.

Everything else — the campus world, quest loop, sim students, tilesets,
sound, HUD — is the shared source from `game/`, `components/world/`, and
`components/phaser/`, unchanged.

## Deploying

Required build-time env vars (the app's other pages reference these; the
campus demo itself doesn't need real values — placeholders are fine unless
you want `/internal/*` or `/api/child/*` to actually work):

- `CHILD_SESSION_SECRET` — any string
- `NEXT_PUBLIC_SUPABASE_URL` — any `https://` URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — any string

Vercel project settings:

- **Root Directory**: `demo/la-campus-demo`
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (runs `prisma generate && next build`)

## Updating this snapshot

This folder does not stay in sync with the source branch automatically. To
pull in newer campus-demo work, re-copy the relevant files from
`claude-demo-gather` (or wherever that work lands) and re-apply the two
changes above.
