# Learning Adventures Platform - Claude Instructions

## 🚀 Platform Development Sessions

### Current Development Status

**Active Development Plan**: docs/V1_WEBSITE_REBUILD_PLAN.md (v1 public site: games by subject, interactive ebooks, Learning Adventures World demo)
**Last Completed**: UX-1 ✅: custom icon set (Jaylen & S.P.A.R.K. style), real game screenshots on cards, bolt logo (PR #200 merged 2026-09-26 as `11f8406`). v1 went live in PR #198.
**Next Phase**: v1 UX changes. The site owner will describe them at the start of the session; ask for the page, the problem and the desired result (screenshots help) before coding. Record them as a "UX changes" section in docs/V1_WEBSITE_REBUILD_PLAN.md and work through them one at a time on a feature branch off `main`, with a PR to `main` (merging to `main` deploys to production).
**Current Focus**: Public site that runs with no backend; accounts are hidden behind `siteConfig.features.accounts`
**Earlier plan**: COMPREHENSIVE_PLATFORM_PLAN.md (account-based platform, paused for v1)
**Vercel**: the `learning-adventures-platform` project deploys again (fixed 2026-09-26: paused Supabase integration + stale `pnpm-lock.yaml`; see docs/VERCEL_DEPLOY_FAILURE_NOTES.md). Use **npm** only (no pnpm/yarn lockfiles), and keep the Supabase integration disconnected from this project while accounts are off.

### 🌐 v1 Public Site: How It's Organized

- **Content lives in `lib/content/`**: `subjects.ts` (5 subjects and their colors), `games.ts` (every playable game/activity), `books.ts` (interactive ebooks). Pages are built from these files, including the sitemap.
- **Add a game**: save the HTML to `public/games/` (or `public/lessons/`), add an entry to `games` in `lib/content/games.ts`, then run `npm run thumbnails -- --only <slug>` to screenshot it for its card. To show it in the homepage "Featured games" section, add its slug to `homeFeaturedSlugs` in the same file (the first slug gets the big spotlight card). `lib/catalogData.ts` is the old catalog, used only by the hidden account features.
- **Add or publish a book**: edit `lib/content/books.ts`. To publish, set `status: 'available'`, `ebookUrl`, `coverImage` and `samplePages` (images in `public/books/<slug>/`). Visitor-facing text calls them "interactive ebooks" and never names the ebook platform.
- **Add a blog post**: add an entry to `posts` in `lib/content/blog.ts` and write its text in `content/blog/<slug>.md` (Markdown). `status: 'draft'` keeps it off the site.
- **Run `npm test` after content changes**: `tests/content/content.test.ts` checks files exist, slugs are unique and cross-links are valid.
- **Routes**: `/`, `/games`, `/games/[gameId]`, `/subjects/[subject]`, `/books`, `/books/[slug]`, `/demo`, `/demo/play`, `/blog`, `/blog/[slug]`, `/newsletter`, `/about`, `/privacy`, `/terms`.
- **Components**: `components/home/`, `components/play/`, `components/books/`, `components/blog/`, `components/newsletter/`, `components/demo/` (`CampusDemoExperience` is the playable demo).
- **Optional env vars** (all `NEXT_PUBLIC_`): `CONTACT_EMAIL` (defaults to info@learningadventures.org), `EBOOK_STORE_URL`, `NEWSLETTER_URL`, `DEMO_TRAILER_URL`, `ENABLE_ACCOUNTS` (`true` restores accounts/dashboards/admin; off in v1). The site builds and runs with none set.
- **Keep it backend-free**: public pages must not need Supabase, Prisma or secrets. Check with `npm run build` and no env vars.
- **Icons**: use `SiteIcon` (sticker icons: subjects, sections, big buttons, logo) or `UiIcon` (small controls: arrows, close, search) from `components/icons/`; preview them all at `/dev/icons`. No emoji, Lucide or `components/Icon` on public pages: lint and `npm test` fail if they come back. The icon guide is in `docs/V1_WEBSITE_REBUILD_PLAN.md` (UX-1).
- **Colors**: text on colored backgrounds must pass WCAG AA contrast. Use `subject.theme.onSolid` for text on a subject's solid color.
- **Going live**: `docs/V1_GO_LIVE_CHECKLIST.md`.

### 🧭 Handoff notes (read first)

- **Where things stand**: the v1 site is live. Production = Vercel project `learning-adventures-platform`, which deploys `main` automatically. Every PR gets a Vercel preview (behind Vercel login).
- **UX changes so far**: UX-1 (icons + game screenshots, #200), the World Demo name-box fix (#201) and UX-3 (homepage "Featured games" section, in #205) are done. **UX-2 is in progress**: a newsletter sign-up page for parents (stored in Kit, an email marketing service, not Supabase) and a blog. Phase 1 (the blog, with the first welcome post) and Phase 2 (the `/newsletter` page, a preview until Kit is connected) are done. Phase 3 (connect Kit via `NEWSLETTER_API_KEY` and update the Privacy page) waits on the owner's team setting up the email account. The phases are in the UX-2 section of `docs/V1_WEBSITE_REBUILD_PLAN.md`; start at the first phase not marked done. UX-1 left three tools: `npm run thumbnails`, the `/dev/icons` preview page, and lint + `npm test` guards against emoji or stock icons on public pages.
- **Owner decisions that still hold**:
  - accounts stay off until paid features exist (it's a kids' site)
  - books are placeholders until real ones exist
  - the demo is called "Learning Adventures World demo" (header: "World Demo")
  - never name the ebook platform
  - the legal pages are approved for now and will be refined later
  - the contact email is info@learningadventures.org (pending team confirmation)
- **Run it locally**: `npm install && npm run dev` (http://localhost:3000). For real speed, use `npm run build && npm start`; dev mode compiles each page on first visit.
- **Before pushing**: `npx tsc --noEmit`, `npm run lint` (0 errors; 6 known warnings), `npm test`, `npm run build`.
- **Seeds of Genius (Carver game)**: a separate project in `games-src/seeds-of-genius/` (Vite + Three.js; its README explains how it's built). It is built into `public/games/seeds-of-genius/` and listed on the site (`lib/content/games.ts`, slug `seeds-of-genius`, History). All phases (0–8) are complete and owner-approved; further changes are post-release fixes (see `docs/SEEDS_OF_GENIUS_PLAN.md`; player guide: `docs/SEEDS_OF_GENIUS_PLAYER_GUIDE.md`). After changing the game, run `npm run game:carver:build` and commit the build; `node scripts/e2e-phase8.mjs` (in the game folder, with `npx vite preview --port 4173` running) plays the whole game from a new save.
- **UX-4 (in progress)**: rebuild the games in Three.js pixel art to the Seeds of Genius standard, merged from 43 into 27, one subject at a time (Math first). Plan, merge map, rubric and phase status: `docs/GAMES_3D_UPGRADE_PLAN.md`. Code: `games-src/adventures/` (shared Adventure Kit in `src/kit/`, one folder per game; builds to `public/games/play/<slug>/`; see its README). Phase 0 (kit + Number Line Ninja pilot, with ninja gear) is COMPLETED ✅ and owner-approved (PR #207); Math batch M1 (Counting Carnival, with Number Monster Feeding merged in; old link redirects in `next.config.js`) is COMPLETED ✅ and owner-approved (PR #208). M2 (Math Dash, redesigned by the owner as "Library Rush", a Vampire Survivors-style action game with library power-ups, same slug `math-dash`) is COMPLETED ✅ and owner-approved (PR #209); M3 is COMPLETED ✅ and owner-approved (PR #210): Money Market Madness (Cafeteria Cashier merged in, old link redirects; an upgrade shop for food, drinks, toppings and the stand, paid for with money earned) and Time Attack Clock (a town clock tower fixed by three jobs: read, set, elapsed time; plus a 60-second Time Attack). M4 is COMPLETED ✅: Math Race Rally (a behind-the-car pixel racer with Math Memory Match as the pit stop that earns cosmetic car upgrades; the old memory-match link redirects) is COMPLETED ✅ and owner-approved (PR #211); Math Adventure Island (an island with four word-problem zones that light torches, a treasure hunt with Pip the parrot, and a Quiz Show finale; Treasure Hunt Calculator and Math Jeopardy Junior merged in, old links redirect) is COMPLETED ✅ and owner-approved (PR #212). M5 (Geometry) is COMPLETED ✅ and owner-approved: Shape Town Builders (slug `geometry-builder-challenge`, K–4; Shape Sorting Arcade merged in, old link redirects; PRs #213 and #214). M6 (Fractions) is COMPLETED ✅ and owner-approved: Forum Fraction Feast (slug `pizza-fraction-frenzy`, in the Ancient Kingdoms world; Fraction Pizza Party merged in, old link redirects; PR #220). That makes **9 of the 11 Math games done**; M7 (Multiplication and equations, in Star Station) remains, and the team is doing QA on the finished games. New games and partner submissions are remastered with the `remaster-game` skill (`.claude/skills/remaster-game/`; partners put one HTML file in `games-src/submissions/`, see its README). Start at the first phase not marked done. After changing a game, run `npm run games:build` and commit `public/games/play/`.
- **Game worlds (in progress)**: the owner wants themed worlds beyond today's cozy town that children choose to play in. Pixel art stays, but **the new worlds get a more refined, colorful 16-bit look**. **Sunny Town and its games stay exactly as they are** (no moving, no skins). **The owner and team decide which game goes in which world**: so far, M6 Fractions goes to **Ancient Kingdoms** and M7 (Multiplication Space Quest, Equation Balance Scale) to **Star Station**. QA is the owner's separate process, not part of this work. Phases: W0 look development, W1 theme layer in the kit, W2 games in their worlds, W3 the site (Echoes and a world map). **W0 is COMPLETED ✅** (PR #217): the owner chose character level (b) (24x36 sprites, 24 pixels per tile) and approved Star Station and Ancient Kingdoms. Rule: **one style per world, many settings** (an Ancient Kingdoms game can be set in Rome or Egypt, a Star Station game on an alien planet; the world's style stays the same). **W1 (theme layer) is COMPLETED ✅** (PR #220; the owner approved the Roman forum and alien planet): `games-src/adventures/src/kit/worlds/` (see its README) has the world styles (Sunny Town 16 px; Star Station and Ancient Kingdoms 24 px, 16-bit) and settings: `station-deck`, `alien-planet`, `river-market`, `roman-forum` (the forum and planet are the owner-chosen proof settings). The eight finished games were not touched (game build byte-identical). **W2 is in progress**: M6 is **Forum Fraction Feast** (slug `pizza-fraction-frenzy`, grades 2–4, Roman forum; plan approved 2026-10-08 in the M6 section of `docs/GAMES_3D_UPGRADE_PLAN.md`). **M6 is COMPLETED ✅** (owner approved and merged PR #220 on 2026-10-09): the Bakery, Milestone Road, the Market Stall and the Mosaic light four braziers, then the Festival Feast at dusk, plus a 60-second Frenzy mode (score 9.1). **Next: M7 in Star Station** (Multiplication Space Quest with Bingo Bonanza and Tables Adventure merged in, and Equation Balance Scale), plan first. **Start with `docs/M7_STAR_STATION_HANDOFF.md`** (steps, open questions for the owner, practical lessons and a prompt for the session). Details: sections 2a, 4b, 6, 7, 7a and 7b of `docs/GAME_WORLDS_PROPOSAL.md`. The look development pages are in `games-src/adventures/lookdev/` and `src/lookdev/` (dev server only, left out of the build).
- **Open follow-ups** (not UX; do only when asked):
  - retire `demo/la-campus-demo` and its Vercel project `learning-adventures-platform-2mxb` in a separate PR
  - the owner will rotate the flagged `GEMINI_API_KEY` in Vercel
  - reconnect Supabase only when accounts return
- **The owner is new to coding**: explain changes and the reasons for them in plain language.

### 📋 Development Session Protocol

**IMPORTANT**: When starting any development session, ALWAYS:

1. **Check Development Status**: Read `docs/V1_WEBSITE_REBUILD_PLAN.md` (current work) and the status lines above. `COMPREHENSIVE_PLATFORM_PLAN.md` is the paused account-platform plan; read it only for account/dashboard work
2. **Review Last Completed Phase**: Look for the "COMPLETED" marker in the plan
3. **Continue from Next Phase**: Pick up from the next uncompleted phase/day
4. **Update Progress**: When completing a phase, mark it as "COMPLETED ✅" in the plan
5. **Track Session Work**: Update the plan with detailed progress notes

### 🎯 Session Continuation Instructions

When asked to continue development work:

- Read the comprehensive plan to understand the current state
- Continue from the next uncompleted phase
- Use TodoWrite to track current session progress
- Update the comprehensive plan when phases are completed
- Commit changes with descriptive messages including phase completion status

### 📊 Current Platform Architecture

**Completed Features**:

- ✅ Authentication system with NextAuth.js
- ✅ Database schema design (Prisma)
- ✅ PostgreSQL database (local installation via Homebrew)
- ✅ User roles: Admin, Teacher, Parent, Student
- ✅ Login/signup modals with role selection
- ✅ Header integration with auth status
- ✅ UserMenu dropdown with profile access
- ✅ ProtectedRoute HOC for authenticated pages
- ✅ ProfileSettings component with preferences management
- ✅ Profile page with comprehensive user information
- ✅ RoleGuard and PermissionProvider for role-based access control
- ✅ AdminPanel navigation and TeacherDashboard routes
- ✅ User progress tracking with API routes and hooks
- ✅ Achievement system with automatic badge awarding
- ✅ Progress indicators (linear & circular) and stats dashboard
- ✅ User dashboard with progress overview and recent activity
- ✅ 5-subject catalog system (Math, Science, English, History, Interdisciplinary)
- ✅ Adventure preview system with horizontal scrolling cards
- ✅ Subject-specific preview sections with featured content
- ✅ Homepage integration with loading states and error handling
- ✅ Authentication gating (3 adventures for unauthenticated, 5 for authenticated)
- ✅ Continue Learning section for in-progress adventures
- ✅ Progress indicators on adventure preview cards
- ✅ Smart loading states to prevent skeleton flash
- ✅ Intersection Observer animations for preview sections
- ✅ Touch-friendly scrolling for mobile devices

**In Progress**: Complete remaining Phase 2C features (content rotation, save for later, social sharing)
**Next Up**: Admin panel and content management system

### 🔄 Development Commands

```bash
# Start development server
npm run dev

# Database operations
npx prisma generate
npx prisma db push
npx prisma studio
npm run db:seed  # Seed test users and sample data

# PostgreSQL management (if installed via Homebrew)
brew services start postgresql@14
brew services stop postgresql@14
brew services restart postgresql@14

# Type checking and linting
npm run lint
npm run type-check
```

### 🗄️ Database Configuration

**Local PostgreSQL Setup**:

- Database: `template1` (default PostgreSQL database)
- Username: `mansagills` (system username)
- Connection: `postgresql://mansagills@localhost:5432/template1?sslmode=disable`
- Environment files: `.env` and `.env.local` (must have matching DATABASE_URL)

**Test Credentials** (created by seed script):

- Student: `student@test.com` / `password123`
- Teacher: `teacher@test.com` / `password123`
- Parent: `parent@test.com` / `password123`
- Admin: `admin@test.com` / `password123`

---

## Game/Lesson Creation Workflow

The v1 public site lists games from **`lib/content/games.ts`**. `lib/catalogData.ts` is the old catalog and only feeds the hidden account features (`NEXT_PUBLIC_ENABLE_ACCOUNTS`), so a game added only there will **not** appear on the site.

### 📋 Step-by-Step Process

1. **Look at existing games** in `public/games/` and activities in `public/lessons/` for patterns (single HTML file, embedded CSS/JS).
2. **Create the game** as one HTML file (see Design Patterns and Content Creation Guidelines below).
3. **Save it** to `public/games/[game-name].html` (games) or `public/lessons/[lesson-name].html` (activities).
4. **Test it on its own** before listing it (see Test Games Workflow below).
5. **Publish it** by adding an entry to `lib/content/games.ts` and running `npm run thumbnails -- --only <slug>` (see Integration Process below).
6. **Run the checks**: `npm test` (content test), `npx tsc --noEmit`, `npm run lint`.
7. **Check it on the site** (see Testing Checklist below).

### 🧪 Test Games Workflow

**Key Concept**: Saved ≠ Listed

- **Saved**: the HTML file is in `public/games/` and opens directly at its file URL, so it can be tested. Visitors won't find it.
- **Listed**: the game has an entry in `lib/content/games.ts`, so it appears on `/games`, its subject page, the homepage rows and the sitemap, and plays inside the site's player at `/games/[slug]`.

**For HTML games/lessons (the normal case):**

1. Save the file to `public/games/` or `public/lessons/`
2. Open `http://localhost:3000/games/[game-name].html` (or `/lessons/...`) and play it through
3. Optionally note it in `platform-docs/test-games.md`
4. Only add it to `lib/content/games.ts` once it works

**For React component games** (rare; the v1 site has none listed): create it in `components/games/[game-name]/`, register it in `lib/gameLoader.ts` `initializeGameRegistry()`, and test at `http://localhost:3000/games/[game-id]`. Ids that aren't in `lib/content/games.ts` fall through to the React loader (`app/games/[gameId]/ReactGamePage.tsx`).

**Testing Reference**: `platform-docs/test-games.md`

### 📁 Directory Structure

```
learning-adventures-platform/
├── public/
│   ├── games/                  # HTML game files
│   ├── lessons/                # HTML activity files
│   └── books/<slug>/           # Interactive ebook sample pages
├── lib/content/
│   ├── subjects.ts             # The 5 subjects
│   ├── games.ts                # ✏️ Every game/activity listed on the site
│   └── books.ts                # Interactive ebooks
├── tests/content/content.test.ts   # Checks the content files
└── lib/catalogData.ts          # Old catalog (hidden account features only)
```

### 🎯 File Locations for New Content

- **Games**: `/public/games/[game-name].html`
- **Activities (lessons)**: `/public/lessons/[lesson-name].html`
- **Listing on the site**: `/lib/content/games.ts`

### 🔄 Integration Process

1. Save the HTML file in the right `public/` folder.
2. Add an entry to the `games` array in `lib/content/games.ts`:
   - Required: `slug` (unique, used in the URL `/games/[slug]`), `title`, `subject` (`math`, `science`, `english`, `history`, `interdisciplinary`), `kind` (`'game'` or `'activity'`), `thumbnail` (`/games/thumbnails/<slug>.jpg`, its card picture), `grades` (e.g. `"2–5"`), `difficulty` (`'easy'`, `'medium'`, `'hard'`), `description`, `skills`, `estimatedTime`, `htmlPath` (e.g. `/games/my-game.html`)
   - Optional: `featured: true` (shown first)
3. Make its card picture: `npm run thumbnails -- --only <slug>`. This opens the game in Chromium, presses its Start button and saves a screenshot to `public/games/thumbnails/<slug>.jpg`. If the picture doesn't show the game well, add an entry for the slug to `overrides` in `scripts/capture-game-thumbnails.ts` (buttons to click, extra wait). On a new machine run `npx playwright install chromium` once.
4. If the game goes with an interactive ebook, add its slug to that book's `companionGameSlugs` in `lib/content/books.ts`. That one list links them both ways (the game's page shows the book, and the book's page shows the game).
5. Run `npm test`. The content test fails if the HTML file or card picture is missing, the slug is already used, or a book's `companionGameSlugs` names a game that doesn't exist.
6. Optional: if the game posts `window.parent.postMessage({ type: 'game-complete', score }, '*')` when finished, the player shows a "Nice work!" banner.

### ✅ Testing Checklist

- [ ] The file opens at its direct URL and plays with no console errors
- [ ] It appears on `/games` (and the count went up) and under the right subject filter
- [ ] It appears on `/subjects/[subject]`
- [ ] `/games/[slug]` plays it in the site player, including full screen
- [ ] Title, description, grades and time display correctly on its card
- [ ] It works at phone width (390px) with no sideways scrolling

### 🎨 Design Patterns to Follow

- Single HTML files with embedded CSS and JavaScript
- Child-friendly, colorful interfaces
- Interactive elements with immediate feedback
- Progress tracking and educational objectives
- Mobile-responsive design
- Accessibility considerations
- No sign-in, no external trackers, and nothing that needs a backend (the public site has none)

### 🧪 Development Commands

```bash
# Start development server
npm run dev

# Open a game/activity file directly
curl http://localhost:3000/games/[game-name].html
curl http://localhost:3000/lessons/[lesson-name].html

# Check it is listed and plays in the site player
curl http://localhost:3000/games
curl http://localhost:3000/games/[slug]

# Content checks
npm test
```

## 📝 Content Creation Guidelines

### For Interactive Lessons:

- Use educational best practices with scaffolded learning
- Include multiple learning modalities (visual, auditory, kinesthetic)
- Provide immediate feedback and progress tracking

### For Educational Games:

- Balance 70% entertainment with 30% obvious learning
- Include progressive difficulty and achievable challenges
- Provide meaningful choices that affect learning outcomes

---

**Last Updated**: October 2025
**Total Adventures**: 85+ games and lessons across 5 categories
**Development Status**: Phase 3A Complete - Dashboard Infrastructure Built
**Platform Features**: NextAuth.js, PostgreSQL, Prisma, User Roles, Permission System, Progress Tracking, Achievement System, Continue Learning Section, Authentication Gating, Preview Components with Progress Indicators, Save for Later, Social Sharing, Content Rotation, Dashboard Infrastructure
**Database**: PostgreSQL 14 (local via Homebrew)

- Always check the comprehensive_platform_plan to see which phase we last worked on from previous sessions.

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
