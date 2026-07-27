<!-- ROCKETRIDE:BEGIN -->

# RocketRide — AI Pipeline Builder

Use RocketRide when building AI pipelines, document processing, RAG systems, or data integration.

## Documentation

Full docs: `.rocketride/docs/`

**Read the relevant doc(s) before generating any RocketRide code.**

| File                              | Read when...                                                      |
| --------------------------------- | ----------------------------------------------------------------- |
| ROCKETRIDE_README.md              | Starting any RocketRide work — overview + mandatory setup steps   |
| ROCKETRIDE_QUICKSTART.md          | Writing first pipeline — complete working examples (Python & TS)  |
| ROCKETRIDE_PIPELINE_RULES.md      | Defining pipelines — structure, lane wiring, config rules         |
| ROCKETRIDE_COMPONENT_REFERENCE.md | Choosing/configuring components — all providers and config fields |
| ROCKETRIDE_COMMON_MISTAKES.md     | Before finalizing — known pitfalls to avoid                       |
| ROCKETRIDE_python_API.md          | Python SDK — client methods, types, patterns                      |
| ROCKETRIDE_typescript_API.md      | TypeScript SDK — client methods, types, patterns                  |

## Before Writing ANY RocketRide Code

1. Read `.rocketride/docs/ROCKETRIDE_README.md` for mandatory setup requirements
2. Read the relevant API doc (Python or TypeScript) for your language
3. Read `.rocketride/docs/ROCKETRIDE_PIPELINE_RULES.md` + `.rocketride/docs/ROCKETRIDE_COMPONENT_REFERENCE.md`
4. Read `.rocketride/docs/ROCKETRIDE_COMMON_MISTAKES.md` before finalizing
<!-- ROCKETRIDE:END -->

## Cursor Cloud specific instructions

This repo is the **Learning Adventures Platform** (Next.js 14 App Router + Prisma + Supabase Auth). Standard scripts live in `package.json`; test creds and DB steps are in `DEVELOPMENT_README.md`. The notes below only cover non-obvious cloud setup caveats.

### Local backing services (Postgres + Supabase Auth)
Auth (login/signup/seed) uses **Supabase**, and Postgres is provided by a **local Supabase stack run via Docker**. These are installed in the VM image but **not auto-started**, and the update script does NOT start them. Start them manually each session (there is no systemd; use tmux/background):

1. Start Docker daemon: `sudo dockerd` (leave running in a tmux session).
2. Start Supabase (needs Docker): `sudo supabase start -x studio,imgproxy,edge-runtime,realtime,storage-api,logflare,vector,supavisor`
   - Postgres → `127.0.0.1:54322`, Auth/REST API → `127.0.0.1:54321`. Keys shown by `sudo supabase status -o env`.
3. Start the app: `npm run dev` (http://localhost:3000).

### Environment files
`.env` and `.env.local` already exist (gitignored, persisted in the VM snapshot) with the **local Supabase default keys**. Both are needed: Next.js reads `.env.local`; the **Prisma CLI reads `.env`** — keep them identical. If they are ever missing, recreate them with `DATABASE_URL`/`DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres`, `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`, and the anon/service-role keys from `sudo supabase status -o env`, plus any `CHILD_SESSION_SECRET` (required by `lib/childAuth.ts`).

### Database
After Supabase is up: `npm run db:push` (schema) then seed. The seed script (`tsx prisma/seed.ts`) reads `process.env` directly and does NOT auto-load `.env.local`, so run it with env loaded: `set -a && . ./.env.local && set +a && npm run db:seed` (or `npm run db:reset` to wipe + reseed). Seeded logins are in `DEVELOPMENT_README.md` (e.g. `student@test.com` / `password123`).

### Lint / test / build caveats
- `npm run build` and `npx tsc --noEmit` pass for the **main app** (all `tsc` errors are in the un-installed `demo/la-campus-demo/` copy, a separate nested project — ignore it).
- `npm run lint` (`next lint`) does not detect the flat `eslint.config.mjs`; it prompts interactively and effectively no-ops. Prefer `npx tsc --noEmit` for static checking.
- `npm test` (Vitest) has **pre-existing failures unrelated to the environment**: many tests are stale after the NextAuth→Supabase auth migration (they mock Prisma but the routes now call live Supabase, so results are order-dependent), and the `demo/la-campus-demo/` tests reference uninstalled `next-auth`. The Vitest toolchain itself runs fine.
