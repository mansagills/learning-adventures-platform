# Learning Adventures Platform - Claude Instructions

## 🚀 Platform Development Sessions

### Current Development Status

**Active Development Plan**: docs/V1_WEBSITE_REBUILD_PLAN.md (v1 public site: games by subject, interactive ebooks, Learning Adventures World demo)
**Last Completed**: v1 Phase 6 - Polish, docs, cutover prep ✅ (all v1 build phases done)
**Next Phase**: Go-live (user steps in docs/V1_GO_LIVE_CHECKLIST.md), then investigate the Vercel deploy failure on its own branch
**Current Focus**: Public site that runs with no backend; accounts are hidden behind `siteConfig.features.accounts`
**Earlier plan**: COMPREHENSIVE_PLATFORM_PLAN.md (account-based platform, paused for v1)
**Known issue**: the `learning-adventures-platform` Vercel project fails every deploy ("Resource provisioning failed"); see docs/VERCEL_DEPLOY_FAILURE_NOTES.md. Not caused by code changes; investigate after v1.

### 🌐 v1 Public Site: How It's Organized

- **Content lives in `lib/content/`**: `subjects.ts` (5 subjects and their colors), `games.ts` (every playable game/activity), `books.ts` (interactive ebooks). Pages are built from these files, including the sitemap.
- **Add a game**: save the HTML to `public/games/` (or `public/lessons/`) and add an entry to `games` in `lib/content/games.ts`. `lib/catalogData.ts` is the old catalog, used only by the hidden account features.
- **Add or publish a book**: edit `lib/content/books.ts`. To publish, set `status: 'available'`, `ebookUrl`, `coverImage` and `samplePages` (images in `public/books/<slug>/`). Visitor-facing text calls them "interactive ebooks" and never names the ebook platform.
- **Run `npm test` after content changes**: `tests/content/content.test.ts` checks files exist, slugs are unique and cross-links are valid.
- **Routes**: `/`, `/games`, `/games/[gameId]`, `/subjects/[subject]`, `/books`, `/books/[slug]`, `/demo`, `/demo/play`, `/about`, `/privacy`, `/terms`.
- **Components**: `components/home/`, `components/play/`, `components/books/`, `components/demo/` (`CampusDemoExperience` is the playable demo).
- **Optional env vars** (all `NEXT_PUBLIC_`): `CONTACT_EMAIL`, `EBOOK_STORE_URL`, `NEWSLETTER_URL`, `DEMO_TRAILER_URL`, `ENABLE_ACCOUNTS` (`true` restores accounts/dashboards/admin; off in v1). The site builds and runs with none set.
- **Keep it backend-free**: public pages must not need Supabase, Prisma or secrets. Check with `npm run build` and no env vars.
- **Colors**: text on colored backgrounds must pass WCAG AA contrast. Use `subject.theme.onSolid` for text on a subject's solid color.
- **Going live**: `docs/V1_GO_LIVE_CHECKLIST.md`.

### 📋 Development Session Protocol

**IMPORTANT**: When starting any development session, ALWAYS:

1. **Check Development Status**: Read `COMPREHENSIVE_PLATFORM_PLAN.md` to understand current progress
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
5. **Publish it** by adding an entry to `lib/content/games.ts` (see Integration Process below).
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
   - Required: `slug` (unique, used in the URL `/games/[slug]`), `title`, `subject` (`math`, `science`, `english`, `history`, `interdisciplinary`), `kind` (`'game'` or `'activity'`), `emoji` (shown on its card art), `grades` (e.g. `"2–5"`), `difficulty` (`'easy'`, `'medium'`, `'hard'`), `description`, `skills`, `estimatedTime`, `htmlPath` (e.g. `/games/my-game.html`)
   - Optional: `featured: true` (shown first), `thumbnail` (a screenshot in `public/`)
3. If the game goes with an interactive ebook, add its slug to that book's `companionGameSlugs` in `lib/content/books.ts`. That one list links them both ways (the game's page shows the book, and the book's page shows the game).
4. Run `npm test`. The content test fails if the file is missing, the slug is already used, or a book's `companionGameSlugs` names a game that doesn't exist.
5. Optional: if the game posts `window.parent.postMessage({ type: 'game-complete', score }, '*')` when finished, the player shows a "Nice work!" banner.

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
