# Learning Adventures v1 Website Rebuild — Games, Books & Hub World Demo

## Context

Learning Adventures' offering has changed. The current homepage (`components/LandingPage.tsx`, rewritten in commit `1ef54d7`) sells a "living pixel world": the Hero says "Enter the World" and "Create Your Character", and the site is wrapped in accounts, dashboards, courses and admin tools. Today's public Vercel link doesn't use that homepage at all. It serves a trimmed copy of the app (`demo/la-campus-demo/`) that redirects `/` to the campus demo, and that copy has to be re-synced by hand.

**v1 builds the site around what exists today:**

1. **Mini-games by subject.** The front door is a colorful subject grid (Math, Science, English, History, Interdisciplinary), and every card opens a game you can play right away.
2. **Children's books, presented as interactive ebooks,** that go with the games and build stories around them. Each ebook has a free sample on the site and a "Get the interactive ebook" button that opens the ebook store, where parents sign in and buy. The site never names the ebook platform; it only links to it.
3. **The Hub World demo** as a showcase only. Clicking "Demo" opens a demo landing page (today's hub-focused homepage, rebranded as an early preview), and from there a "Play the demo" button launches the playable campus.

**Decisions made with the user:**

- **Accounts:** hide accounts, dashboards, courses and admin behind a feature flag but keep the code (flag off in v1).
- **Books:** placeholders for now. There are no books, covers or store links yet.
- **Hub:** reuse today's homepage as the demo's landing page (rebranded as a demo), with a "Play the demo" button leading to the playable campus.
- **Hosting:** rebuild in the **main app** and make it run with **no backend or secrets**.
- **Game list:** show **only playable content**: the 36 HTML games plus the 7 HTML lessons, which will be labeled "activities".

**Working style** (from `CLAUDE_SUCCESSOR_HANDOVER.md`): one phase at a time. Verify, commit, report, then stop and check in before starting the next phase.

---

## Information architecture (new site map)

| Route                          | Purpose                                                                                                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                            | Home: hero → subject grid → featured games → "Stories behind the games" (books) → Hub World teaser → why parents trust it → FAQ                                                                                    |
| `/games`                       | Every playable game, with subject filter chips and a search box (public, no login)                                                                                                                                 |
| `/subjects/[subject]`          | Subject page: themed header, that subject's games, its companion books                                                                                                                                             |
| `/games/[gameId]`              | **Game player.** An HTML game plays in a same-origin iframe (fullscreen button, "Read the story" book card, "More [subject] games"). Registered React games keep using the existing `lib/gameLoader.ts` path       |
| `/books`                       | Book shelf: placeholder cards marked "Coming soon"                                                                                                                                                                 |
| `/books/[slug]`                | Book page: cover, synopsis, ages, free sample flip-through, "Get the interactive ebook" button (with a short note that buying and reading happen in a separate ebook reader with its own sign-in), companion games |
| `/hub`                         | **Hub World demo landing page.** The current homepage, moved here and rebranded as a demo ("Early preview" badge, reworded copy). Every CTA says "Play the demo" and goes to `/hub/play`                           |
| `/hub/play`                    | Full-screen playable campus demo (no login, no backend)                                                                                                                                                            |
| `/about`, `/privacy`, `/terms` | Simple pages. These replace the dead `#` links in the footer, and privacy/terms matter for a kids' site                                                                                                            |
| `/catalog`                     | Redirects to `/games`                                                                                                                                                                                              |

**When the accounts flag is off**, these redirect to `/`: `/login`, `/child/*`, `/parent/*`, `/teacher/*`, `/courses/*`, `/progress`, `/profile`, `/my-library`, `/practice`, `/assessments`, `/tutorials`, `/course-request`, `/my-requests`, `/world/*`, `/agents`, `/certificates/*`. `/internal` and `/staging` are already admin-only and stay as they are.

---

**Naming rule:** everywhere a visitor can see (page text, buttons, FAQ, metadata), the books are called **interactive ebooks** and the ebook platform is never named.

## Content data layer (new; `lib/catalogData.ts` stays untouched)

`lib/catalogData.ts` is mostly placeholders (65 of its 91 entries can't be played), and the hidden features still import it. So v1 gets its own small, typed content files. A "typed content file" is a TypeScript array whose shape is enforced by an interface, so a typo in a field fails the type-check instead of breaking the page.

- **`lib/content/subjects.ts`:** the 5 subjects, each with an id, name, tagline, icon and theme color. The colors map onto the existing Tailwind tokens (`pg-violet`, `pg-pink`, `pg-yellow`, `pg-mint`, `ocean`/`coral`).
- **`lib/content/games.ts`:**
  - **Shape:** `PlayableGame { slug, title, subject, kind: 'game' | 'activity', gradeBand, description, skills, estimatedTime, htmlPath, thumbnail?, featured?, bookSlugs? }`.
  - **Entries:**
    - Copy the metadata for the 25 HTML games/lessons that are already in `catalogData.ts` (plus the one React game, `sample-math-game`).
    - Write new entries for the 18 uncataloged games (e.g. `cafeteria-cashier`, `math-dash`, `solar-system-explorer`), pulling title and description from each file's `<title>` and intro text.
  - **Helpers:** `getGamesBySubject`, `getFeaturedGames`, `getGame`.
- **`lib/content/books.ts`:**
  - **Shape:** `Book { slug, title, series, subject, ageRange, synopsis, coverImage, samplePages: string[], ebookUrl?, status: 'coming-soon' | 'available', companionGameSlugs, characters }`.
  - **Entries:** 2–3 placeholder books built on the existing Spark Chronicles lore (`docs/lore/`: Jaylen, Spark, the Academy). Each is paired with real games and uses generated placeholder covers.
- **`lib/siteConfig.ts`:**
  - `features.accounts = process.env.NEXT_PUBLIC_ENABLE_ACCOUNTS === 'true'`. It defaults to off, so the site needs no env vars.
  - External URLs: ebook store, hub trailer (YouTube/Vimeo), and an optional newsletter form link.
- **`tests/content/content.test.ts`** (vitest, which is already set up) checks that:
  - every `htmlPath` exists in `public/`
  - every slug is unique
  - every `bookSlugs` / `companionGameSlugs` entry points to a real item
  - every subject has at least one game

---

## Reuse (don't rebuild)

- **Design tokens:** `tailwind.config.js` and `app/globals.css` (Playful Geometric: cream background, sticker cards, pop shadows, Outfit/Jakarta fonts). The new pages keep this brand.
- **Original preview components:** restore from `git show 1ef54d7^:components/preview/AdventurePreviewCard.tsx`, `AdventurePreviewGrid.tsx`, `SubjectPreviewSection.tsx` and `ViewMoreButton.tsx`. Adapt them to `PlayableGame` and remove the progress/auth props. These are the "original" subject rows the user wants back.
- **Game components:** `components/games/GameCard.tsx` and `GameCardSkeleton.tsx` for the `/games` grid. Drop the `progress` prop when accounts are off.
- **Iframe pattern:** `components/world/AdventureEmbed.tsx` shows how to embed an iframe and listen for `postMessage` completion. The player page reuses that approach, and `next.config.js` already allows same-origin framing of `/games/*` and `/lessons/*`.
- **Campus demo:** `app/dev/campus-sandbox/page.tsx` already runs with no auth or backend. Move its body into `components/hub/CampusDemoExperience.tsx`:
  - `/hub/play` renders it with no production guard.
  - The sandbox page keeps its dev-only guard and renders the same component.
  - `lib/campusDemoAccess.ts` gets `/hub/play` added.
- **Supabase guards:** `hooks/useAuth.ts` and `lib/supabase/middleware.ts` already handle missing env vars safely.
- **Current homepage:** `components/LandingPage.tsx` and its sections (`Hero`, `HowItWorks`, `Benefits`, `SocialProof`, `SecondaryCta`, `Faq`, which has a test in `tests/Faq.test.tsx`) become the Hub World demo landing page in Phase 5. The new homepage reuses their layout patterns (sticker cards, FAQ accordion) where it helps.
- **Hero image:** `public/images/jaylen-and-spark.png`. Jaylen and Spark are the link between the books and the games.

---

## Phases (check in after each)

### Phase 1: Foundation (flags, content data, no-backend build)

1. Add `lib/siteConfig.ts` and the three `lib/content/*` files, plus the content test.
2. **`middleware.ts`:**
   - When `features.accounts` is off, redirect the account-route list to `/`.
   - Always allow `/`, `/games*`, `/subjects*`, `/books*`, `/hub*`, `/about`, `/privacy`, `/terms`.
   - Redirect `/catalog` to `/games`.
3. **`components/Header.tsx`:**
   - New nav: Games, Subjects (dropdown), Books, Hub World Demo (goes to `/hub`), About.
   - Show Sign In/Up, UserMenu, Admin and Play Campus only when the flag is on.
   - Mirror the same links in the mobile menu.
4. **`components/navigation/AppLayout.tsx`:** skip the side nav when the flag is off. Remove `WelcomeBackBanner` from the homepage.
5. **Check it builds without a backend:** run `npm run build` with the Supabase and DB env vars unset (the build script already runs `prisma generate`, which needs no database). Fix any page that crashes at build time or render time without env vars.

### Phase 2: Games experience

1. `/games`: grid, subject filter chips, search. Rewrite `app/games/page.tsx` so it is public; show the progress fetch only when the flag is on.
2. `/subjects/[subject]`: themed page. `generateStaticParams` builds a page for each of the 5 subjects.
3. `/games/[gameId]`: if the slug is in `games.ts`, show the iframe player; otherwise use the existing React loader. The player has a responsive 16:9 frame (full-height on mobile), a fullscreen button, "Back to [subject]", a companion book card and a "More games" row.
4. Game cards: thumbnail if one exists, otherwise a subject-colored illustration with an emoji/icon. Show grade band, time and kind badge.

### Phase 3: Homepage

Build the new homepage as `components/home/HomePage.tsx` and point `app/page.tsx` at it. Leave `components/LandingPage.tsx` untouched, because Phase 5 turns it into the demo landing page. Sections:

1. **Hero:** "Play. Read. Explore." (the copy is a draft for the user to approve). Jaylen & Spark art, and CTAs "Play a game" and "Meet the books".
2. **Subject grid:** 5 big tiles linking to `/subjects/[subject]`.
3. **Featured game rows per subject:** the restored `SubjectPreviewSection`.
4. **"Stories behind the games":** book cards, each showing its companion games.
5. **Hub World teaser:** labeled "Early preview demo", links to the demo landing page at `/hub`.
6. **For parents:** free to play, no sign-up, no ads, ages K–5. This replaces Benefits/HowItWorks.
7. **FAQ:** new questions about the interactive ebooks (how to buy and read them, and why they need a separate sign-in), the Hub, and privacy.

The new homepage is built from new components. The old hub-focused sections are not deleted; they move to the demo landing page in Phase 5. Update `lib/seo` metadata and the JSON-LD.

### Phase 4: Books

- **`/books`:** the shelf.
- **`/books/[slug]`:**
  - cover
  - synopsis
  - age range
  - characters
  - **sample viewer:** a simple page-flip carousel of `samplePages` images with keyboard and swipe support
  - **"Get the interactive ebook" button:** opens `ebookUrl` in a new tab with `rel="noopener"`, plus a short note: "Buying and reading happen in our interactive ebook reader, which has its own sign-in."
  - companion game cards
- **While a book's status is `coming-soon`:** the ebook button reads "Coming soon", and the optional newsletter link from `siteConfig` shows only if it's set.
- **Placeholder art:** generate covers/sample pages into `public/books/<slug>/`, e.g. branded SVG placeholders, so they're easy to swap for the real files later.

### Phase 5: Hub World demo landing page (repurposed current homepage)

The current homepage is already a landing page for the Hub World, so it becomes the demo's landing page instead of being thrown away. Clicking **Demo** anywhere on the site (nav, homepage teaser, footer) goes to this landing page at `/hub`, not straight into the game.

- **Move, don't rewrite:** move `components/LandingPage.tsx` to `components/hub/HubDemoLanding.tsx`, move its sections (`Hero`, `HowItWorks`, `Benefits`, `SocialProof`, `SecondaryCta`, `Faq`) into `components/hub/`, and render it from `app/hub/page.tsx`. Update `tests/Faq.test.tsx` to the new path.
- **Rebrand it as a demo:**
  - an "Early preview demo — the full Hub World is in development" badge in the Hero
  - headline and copy reworded from "Your adventure awaits" to "Explore the Hub World demo"
  - every CTA ("Enter the World", "Create Your Character →") becomes **"Play the demo"** → `/hub/play`
  - drop or reword claims about features the demo doesn't have yet (accounts, saved characters, XP carried over, live multiplayer), and replace the world-stats row and review quotes so nothing overstates what exists
  - FAQ rewritten for the demo: what it is, keyboard/touch controls, that progress isn't saved, and when the full Hub is coming
  - optional: a trailer slot from `siteConfig` (poster image if no URL) and 3–4 Playwright screenshots of the demo saved to `public/hub/`
- **Play the demo:** move the sandbox page body into `components/hub/CampusDemoExperience.tsx`, then add `app/hub/play/page.tsx` (full-screen, with an "Exit demo" link back to `/hub`). The sandbox page keeps its dev-only guard and renders the same component.
- **Mobile:** tell phone visitors the demo works best with a keyboard. The demo already has touch controls in `/world/campus`, so check how well they work on the sandbox scene.

### Phase 6: Polish, docs, cutover

- **Footer:** real links (Games, Subjects, Books, Hub, About, Privacy, Terms). Remove the placeholder social links unless the real URLs are provided.
- **Pages and SEO:** `/about`, `/privacy`, `/terms` (placeholder legal text for the user to replace), a friendly `not-found.tsx`, and `app/sitemap.xml` + `robots.txt` updated to list the new routes.
- **Accessibility:** alt text, focus states, and a `title` on each iframe.
- **Docs:** update `CLAUDE.md` (current focus, the v1 structure, how to add a game or book to `lib/content/*`) and `README.md`. Add a v1 section to `COMPREHENSIVE_PLATFORM_PLAN.md`.
- **Cutover (the user does this in Vercel):**
  1. Change the project's Root Directory from `demo/la-campus-demo` to the repo root, with no env vars.
  2. Deploy a preview and review it.
  3. Promote it to production.
  4. Once the new site is live, delete `demo/la-campus-demo` in a separate, confirmed step.

---

## Verification (every phase)

- `npm run type-check`, `npm run lint`, `npm test` (including the new content test).
- `npm run build`, then `npm start`, with **no** Supabase/DB env vars set. This proves the site works with no backend.
- A Playwright script (Chromium is already installed) that visits every public route at 390px and 1280px widths, saves screenshots to the scratchpad, and fails on console errors. It also checks that:
  - `/games/<slug>` iframe loads the HTML game
  - `/hub/play` renders the Phaser canvas (it can use the existing `window.__campusTest` hook)
  - account routes redirect to `/` while the flag is off
  - `/catalog` redirects to `/games`
- Send the user screenshots after each phase before moving on.

---

## Known issue: Vercel project for the repo root fails to deploy

The Vercel project `learning-adventures-platform` (the one that builds the repo root and owns
`learningadventures.org`) has failed every deployment since 2026-07-05. Since mid-September it fails
with "Resource provisioning failed" before any code runs. The domain is still serving a 2026-07-04
build. This is not caused by the v1 work; it will be investigated on its own branch after all
phases are done. Details, timeline and a checklist: `docs/VERCEL_DEPLOY_FAILURE_NOTES.md`. It
affects the Phase 6 cutover.

## Progress log

| Phase                             | Status       |
| --------------------------------- | ------------ |
| 1. Foundation                     | COMPLETED ✅ |
| 2. Games experience               | COMPLETED ✅ |
| 3. Homepage                       | COMPLETED ✅ |
| 4. Books                          | COMPLETED ✅ |
| 5. Learning Adventures World demo | COMPLETED ✅ |
| 6. Polish, docs, cutover          | COMPLETED ✅ |
| Go-live                           | COMPLETED ✅ |
| UX changes                        | In progress  |

### Phase 1 notes

- Added `lib/siteConfig.ts` (accounts flag, external links, account-only route list) and `lib/content/{subjects,games,books}.ts`, plus `tests/content/content.test.ts`.
- `games.ts` lists 43 playable items: 18 math games, 18 science games, and 7 lessons shown as "activities". The React `sample-math-game` is left out because its registration is commented out in `lib/gameLoader.ts` (it shows "Game not found").
- Content gap: all 36 HTML games are Math or Science. English and History have one activity each; Mixed Skills (interdisciplinary) has none yet, so its tile will show "coming soon".
- `middleware.ts`: `/catalog` redirects to `/games`; account-only routes redirect to `/` while the flag is off.
- `Header`: new nav (Games, Subjects dropdown, Books, Hub World Demo, About) with a Play Now button; sign-in/user menu/admin only when accounts are on. The side nav and welcome-back banner are also gated on the flag.
- Build now works with no env vars. Two fixes were needed: `lib/childAuth.ts` read `CHILD_SESSION_SECRET` when the module loaded (moved into a function, still fails closed), and `AuthModal`, `UserMenu` and `app/internal/layout.tsx` created a Supabase client on render (now created inside the click handlers).
- `.claude/settings.json` hooks used bash-only `[[ =~ ]]` syntax and failed under `sh` in Linux containers; rewritten with portable `case` patterns (same behavior).
- Nav links to `/books`, `/hub`, `/about` and `/subjects/*` 404 until their phases land.

### Phase 2 notes

- `/games` is public: subject filter chips (the choice is kept in `?subject=` so filtered views can be shared) and a search across titles, descriptions and skills. The page's HTML includes the full grid, so the first paint and search engines see every game.
- `/subjects/[subject]` is pre-built for all 5 subjects, with a "coming soon" state for subjects with no games (Mixed Skills today) and a "Read the story" row of companion ebooks.
- `/games/[gameId]` plays HTML games in a same-origin iframe, with a loading state, a full-screen button, a sidebar (skills, level, companion ebook) and a "More [subject] games" row. When a game posts `{ type: 'game-complete', score }` (7 games do today), a "Nice work!" banner links to the companion ebook and more games. Unknown ids still go to the React game loader, now in `app/games/[gameId]/ReactGamePage.tsx`.
- New components: `components/play/` (`GameArt`, `PlayableGameCard`, `GameBrowser`, `GamePlayer`) and `components/books/` (`BookCover` with drawn placeholder covers, `BookCard`). Phase 4 builds on the book components.
- An automated smoke test opened all 43 games in the player. `time-attack-clock.html` had a typo (`const correct Time=`) that stopped its whole script, so the game could not start; fixed and played through one round. All 43 now load with no script errors.
- The old `components/games/GameCard.tsx`, `GameCardSkeleton.tsx` and `lib/games/gameHelpers.ts` are no longer used by the public site; they are kept for when accounts return.

### Phase 3 notes

- New homepage in `components/home/` (`HomePage`, `GameRow`, `HomeFaq`); `app/page.tsx` renders it. `components/LandingPage.tsx` and its sections are untouched and unrouted until Phase 5 turns them into the Hub World demo page.
- Sections: hero ("Play. Read. Explore.", draft copy for approval) → subject grid (with counts and "Coming soon") → scrolling game rows → "Stories behind the games" (ebook cards with "Play along" links to their companion games) → Hub World "Early preview demo" teaser → "Made for kids. Easy for parents." → parent FAQ.
- Uneven content handled: subjects with 3+ games get their own row (Math, Science); the rest share a "Reading, history and more" row. Rows adapt automatically as games are added.
- Parent-facing claims were checked against the code: no ad code anywhere, no accounts needed, and no player-to-player chat.
- The FAQ uses native `<details>`: no JavaScript needed, and it works with keyboards and screen readers.
- Site-wide SEO title/description and the JSON-LD descriptions in `lib/seo.ts` now describe the games and interactive ebooks.
- The footer is still the old one with placeholder links; Phase 6 replaces it.

### Phase 4 notes

- `/books` (shelf + "How it works" strip) and `/books/[slug]` (pre-built for every book; unknown slugs 404) are live. Every existing link to them (header, homepage, subject pages, game player sidebar and "Nice work!" banner) now resolves.
- New components: `components/books/SamplePageViewer.tsx` (Previous/Next, dots, arrow keys when focused, swipe via pointer events, "Page N of 3" announced to screen readers) and `components/books/GetEbookButton.tsx`.
- `GetEbookButton` shows "Get the interactive ebook" only when a book's `status` is `'available'` and it has a link (`ebookUrl`, else `NEXT_PUBLIC_EBOOK_STORE_URL`). Otherwise it shows "Interactive ebook coming soon", plus a "Tell me when it's out" link if `NEXT_PUBLIC_NEWSLETTER_URL` is set. The ebook platform is never named.
- Placeholder sample pages: `public/books/<slug>/sample-1..3.svg` (a subject-colored "illustration coming soon" page plus a text page with a short opening scene based on the lore). Replace them with the real pages (any image format) and update `samplePages` in `lib/content/books.ts`. Covers are still drawn by `BookCover` until `coverImage` is set.
- **To publish a real book:** set `status: 'available'`, `ebookUrl`, `coverImage` and `samplePages` in `lib/content/books.ts`, then run `npm test`. The content test fails if any image path is missing.

### Phase 5 notes

- **Renamed:** the demo is the **Learning Adventures World demo** (user decision), no longer "Hub World". Routes are `/demo` and `/demo/play` (not `/hub`); the header link reads "World Demo". Earlier sections of this plan that say "Hub World" or `/hub` are superseded by this. The in-game zone name "Main Hub" (the central plaza) is unchanged.
- **Demo merged into the main app.** The public snapshot (`demo/la-campus-demo`) was ahead of the main app: Chapter 0/1 story quests, name/avatar picker, story items, day/night, touch joystick. A three-way merge of 21 files against `50be5e3` (the last point both copies shared) had zero conflicts and kept the main app's later lint/CI fixes. 7 demo-only files were added (`game/world/chapter0`, `chapter1`, `characterBody`, `characterCards`, `playerIdentity`, `storyItems`, `components/world/StoryItemsChip`) plus `public/games/null-run.html`.
- `components/demo/CampusDemoExperience.tsx` is the one shared demo component, used by `/demo/play` (public, full screen, "Exit demo" button, noindex) and `/dev/campus-sandbox` (still dev-only). `PhaserGame`'s letterbox background is now dark, as the demo intended.
- The old homepage moved (with history) to `components/demo/` and is now the `/demo` landing page. Every CTA is "Play the demo" → `/demo/play`. Removed or replaced: sign-in/`AuthModal`, "100+ quests"/"+50 XP"/"Lv. 12" stats, "COPPA-compliant" claims, the parent dashboard/premium plan FAQ answers, dead "Contact Support"/"Schedule a Demo"/"Watch a Preview" buttons, and the invented testimonials (`SocialProof.tsx` is kept but not rendered). "What's coming" lists planned features, clearly labeled as in development.
- The hero shows a real screenshot of the demo (`public/demo/campus-preview.png`, captured with Playwright). An optional trailer appears when `NEXT_PUBLIC_DEMO_TRAILER_URL` is set.
- Verified in the production build: the canvas loads, the name picker saves, the arrow keys move the player, the phone joystick moves the player, "Exit demo" returns to `/demo`, there are no script errors, and the demo makes **no** `/api` calls.
- **`demo/la-campus-demo` can now be retired** once the site goes live (Phase 6 cutover), because the main app has everything it had.

### Phase 6 notes

- **Footer** rebuilt with real links only: Play (all games + each subject), Read & Explore (interactive ebooks, World Demo), About (about us, privacy, terms). The placeholder social links were removed. The contact email shows only when `NEXT_PUBLIC_CONTACT_EMAIL` is set.
- **New pages:** `/about`, `/privacy` and `/terms` (shared layout in `components/ContentPage.tsx`) and a friendly 404 (`app/not-found.tsx`). Privacy and Terms are **drafts** written from how the site actually works (no accounts, no analytics, progress in browser storage only, Google Fonts in 2 games, the external ebook reader) and show a "Draft" notice until the `draft` prop is removed after review.
- **SEO:** `sitemap.xml` is built from `lib/content/*` (58 URLs; `/demo/play` left out because it's noindex). `robots.txt` also blocks `/internal/`, `/staging/` and `/dev/`. New link-preview image (`public/og-image.png`, 1200×630), logo (`public/logo.png`) and `apple-touch-icon.png`. The empty social profile list was removed from the structured data.
- **Accessibility:** an axe scan of every public page at desktop and phone widths found only color-contrast problems, all fixed. `pg-violet` darkened slightly (`#7C3AED`) so white text on it passes; subjects gained an `onSolid` text color (dark text on mint, pink and yellow); Mixed Skills now uses `ocean-600`; pink/yellow/mint text on light backgrounds switched to darker shades. The final scan reports **no violations**. Iframes already had titles and images alt text.
- **Docs:** `README.md` rewritten for v1, `CLAUDE.md` has a "v1 Public Site" section (how to add games and books, env vars), `COMPREHENSIVE_PLATFORM_PLAN.md` has a v1 section, and `docs/V1_GO_LIVE_CHECKLIST.md` lists the go-live steps.
- **Still to do by the user:** review the legal pages, set the contact email, and do the Vercel cutover (the root project's deploy failure has to be fixed first, or the working `-2mxb` project repointed). Retiring `demo/la-campus-demo` is a separate, confirmed step after go-live.

### Go-live notes (2026-09-26)

- The owner reviewed the site locally and approved the legal pages, homepage copy and contact email (`info@learningadventures.org`); the optional links stay unset.
- **Supabase calls removed:** while accounts are off, `middleware.ts` skips the Supabase session refresh and `hooks/useAuth.ts` never creates a Supabase client. Local navigation had been slow because of those calls.
- **Vercel deploy failure fixed:**
  - "Resource provisioning failed" was caused by Supabase-integration env vars linked to a paused Supabase project. The integration is now disconnected from the project.
  - The follow-up install failure was caused by a stale `pnpm-lock.yaml`. It was deleted, so the repo uses npm only.
  - Details are in `docs/VERCEL_DEPLOY_FAILURE_NOTES.md`.
- **Launched:** PR #198 was squash-merged to `main` as `1f0d9db`. The production deploy went live on learningadventures.org and www, the first successful deploy since 2026-07-04.

### UX changes

Each change is listed as page → problem → change, and marked done when it lands. Each change gets its own feature branch off `main` and a PR.

#### UX-1: Replace emoji and Lucide icons with Learning Adventures artwork: COMPLETED ✅ (PR #200, merged 2026-09-26 as `11f8406`)

- **Pages:** all public pages (home, `/games`, `/games/[slug]`, `/subjects/*`, `/books`, `/books/[slug]`, `/demo`, 404).
- **Problem:** emojis are used as icons everywhere, which makes the site look like a generic AI-built site. The owner wants the site to feel more unique.
- **Change:** replace every emoji that works as an icon with artwork made for Learning Adventures, in one consistent style.

**Where the emojis are today (public site only):**

| Group                                   | Count    | Where it shows                                                                                                                                        | Source                                       |
| --------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Game icons                              | 43       | Game card art (`GameArt`), player header, homepage "Stories" links, game page title                                                                   | `emoji` in `lib/content/games.ts`            |
| Subject icons                           | 5        | Subject tiles, filter chips, card labels, book covers, subject page hero, homepage row titles                                                         | `emoji` in `lib/content/subjects.ts`         |
| Section / step icons                    | about 25 | Homepage rows (📚 🗺️ 🧭), `/books` "How it works", `/demo` (`Hero`, `HowItWorks`, `Benefits`, `SecondaryCta`, `Faq`), 404 page, subject "coming soon" | Hard-coded in those components               |
| UI icons (arrows, search, close, clock) | about 13 | Buttons and controls                                                                                                                                  | `lucide-react` (not emoji; optional restyle) |

Out of scope for UX-1: the hidden account pages, the in-game World demo panels (`components/world/`) and the games' own HTML files.

**Owner decisions (2026-09-26):**

- icons match the friendly character style of Jaylen and S.P.A.R.K. (`public/images/jaylen-and-spark.png`)
- Claude draws them first (Claude Design is the fallback)
- game cards use real screenshots
- the Lucide icons are replaced too

Work goes in 3 phases; each needs the owner's approval before the next starts.

| Phase | What                                                                                    | Status                                            |
| ----- | --------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 1     | Real screenshots on game cards                                                          | COMPLETED ✅ (approved)                           |
| 2a    | Draw the icon set and show it on a preview page                                         | COMPLETED ✅ (approved)                           |
| 2b    | Swap the subject and section emojis for the icons                                       | COMPLETED ✅ (approved)                           |
| 3a    | Draw UI icons, a shield sticker and 3 logo options on the preview page                  | COMPLETED ✅ (approved; owner picked `logo-bolt`) |
| 3b    | Replace Lucide, the stock logo mark and →/←/✓ on public pages; lint rule keeps them out | COMPLETED ✅ (approved, merged)                   |

**Phase 3b notes:**

- Public pages no longer use Lucide or the old `components/Icon.tsx`:
  - **Header:** the `logo-bolt` mark, the Subjects menu chevron, and the phone menu and close buttons (settings shows only with accounts on)
  - **Footer:** the `logo-bolt` mark
  - **Homepage:**
    - sticker icons in the hero badge and buttons
    - "Browse all" arrow
    - "Made for kids" tiles: ticket, bolt, shield, sparkle, each on a light tint
    - FAQ chevrons
  - **Game rows and game pages:** "See all" arrows and row scroll buttons; breadcrumbs; grades and time chips
  - **Games browser:** search and clear buttons
  - **Game player:** full-screen and close buttons; a sparkle sticker on the "Nice work!" banner
  - **Book pages:** sample viewer arrows; ebook button (open-book sticker + external-link icon)
  - **Subject pages:** the "All games" back arrow
  - **Demo:**
    - FAQ chevron
    - quick-facts checks
    - "Exit demo" arrow
- Removed the logo options the owner didn't pick (`logo-spark`, `logo-la`). `/dev/icons` shows just the chosen mark.
- **Guards:**
  - `eslint.config.mjs` blocks `lucide-react` and `components/Icon` imports in public-site files (checked once with a throwaway import for each)
  - the content test also fails on `←`, `→`, `✓` and `✔` in public source
- Checked in the production build: header (desktop Subjects menu, phone menu), homepage, `/games` search and no results, a game page with the "Nice work!" banner, a book page, `/demo` FAQ and quick facts, and the footer. No script errors, no sideways scroll at 390px, and no axe violations.

**Icon guide (for future work):**

- `SiteIcon` (`components/icons/art.tsx`) is for content: subjects, section headings, feature tiles, big buttons, and the logo mark. These are multi-colored stickers with a navy outline.
- `UiIcon` (`components/icons/ui.tsx`) is for controls: arrows, chevrons, close, search, full screen, clock and the like. It is one color, taken from the surrounding text.
- New icons go in those two files and appear on `/dev/icons` automatically. Don't use emoji or other icon packs on public pages; lint and `npm test` will fail.

**Phase 3a notes:**

- Owner decisions: replace the header and footer logo mark (Claude draws options, the owner picks one), and use sticker icons in the homepage "Made for kids" tiles.
- New `components/icons/ui.tsx` + `UiIcon.tsx`: 15 small interface icons on a 24×24 grid that use the surrounding text color:
  - arrows and chevrons
  - search, close, menu
  - clock, grad cap
  - expand, shrink
  - external, check, settings

  They have thick round strokes and solid arrowheads, to match the stickers. Use `UiIcon` for controls and `SiteIcon` for content.

- New sticker `shield` (violet shield with a heart), for "No chat, no ads".
- Three logo options: `logo-spark` (S.P.A.R.K.'s star-eyed screen), `logo-bolt` (lightning bolt badge) and `logo-la` ("LA" block with a bolt). `/dev/icons` shows them next to the wordmark on light and dark bars, plus a new "UI icons" section.

**Phase 2b notes:**

- `Subject.emoji` is now `Subject.icon` in `lib/content/subjects.ts` (`math`, `flask`, `abc-book`, `columns`, `puzzle`). Subject icons now show in:
  - the header Subjects menu (desktop and phone)
  - the homepage subject tiles and row titles
  - the game-card labels and the filter chips on `/games`
  - the book covers
  - the subject page header and the game and book pages
- Every section emoji on the public pages is now an icon:
  - homepage badge, rows and demo button
  - `/books` "How it works"
  - the 404 page
  - "coming soon" and "no results" states
  - the `/demo` sections (hero, how it works, what's coming, call to action, FAQ)
  - the React game loader's "Game not found" screen
- Emojis inside button text became a small icon next to the text. The subject tiles and subject page header now use the light subject tint behind the icon, so the icon stands out.
- New content tests:
  - every subject's icon exists in the set
  - public source files contain no emoji characters. © and ® are allowed. Arrows and ✓ are not emojis and get replaced in Phase 3. `SocialProof.tsx` is skipped because it isn't rendered.
- Checked in the production build: `/`, `/games`, `/subjects/math`, `/subjects/interdisciplinary`, `/books`, a book page, `/demo`, 404 and a game page at 1280 and 390px. No sideways scroll, no script errors, and no axe (WCAG A/AA) violations.

**Phase 2a notes:**

- 25 icons, drawn as code (inline SVG), in `components/icons/art.tsx`. The colors are in `components/icons/palette.ts`. Use them with `<SiteIcon name="…" size={…} />` from `components/icons/SiteIcon.tsx`. A misspelled icon name fails the type check.
- House style, from the Jaylen & S.P.A.R.K. art:
  - navy outline
  - flat colors
  - one darker cel-shadow shape per icon
  - one white shine
  - Jaylen orange and S.P.A.R.K. cyan accents, with lightning-bolt and star motifs
- Icons: `math`, `flask`, `abc-book`, `columns`, `puzzle` (the 5 subjects), plus `books`, `open-book`, `compass`, `map`, `magnifier`, `controller`, `tools`, `campus`, `ticket`, `laptop`, `avatar`, `chat`, `bolt`, `sword`, `chest`, `high-five`, `family`, `sparkle`, `spark-bot`, `question`.
- Preview page: `/dev/icons` shows every icon at 96, 48 and 24px, on each subject color, and in mock headings and buttons. It works locally and on Vercel previews, and 404s on the live site (`VERCEL_ENV=production`, checked with a production-flag build). It is also `noindex`.

**Phase 1 notes:**

- `npm run thumbnails` (`scripts/capture-game-thumbnails.ts`) serves `public/` itself, opens each game in Chromium at 1000×625, presses its Start button so the picture shows gameplay instead of the "How to play" box, and saves `public/games/thumbnails/<slug>.jpg` (640×400, about 25 KB each, 1.1 MB total). Use `--only <slug>` for one game. `overrides` in the script handles games that need other buttons or longer waits (none needed today). Set `CHROMIUM_PATH` to use an installed Chrome; otherwise run `npx playwright install chromium` once. `playwright` is a new devDependency.
- `PlayableGame.emoji` is gone and `thumbnail` is required.
  - `GameArt` shows the screenshot, lined up to the top so the game's title shows, with a small zoom on hover.
  - The game page title no longer has an emoji.
  - The player's loading screen shows the blurred screenshot.
  - The homepage "Play along" links show a tiny screenshot.
- The content test checks every game's `thumbnail` file exists. CLAUDE.md and README "add a game" steps now include making the thumbnail.
- **Bug fixed along the way:** Math Adventure Island and Solar System Explorer showed their "game over" box the moment they opened, covering the Start button. Their `.modal` CSS rule came after `.hidden` and won. `.hidden` is now `display: none !important`. A scan of all games and lessons found no others with this problem.

#### World Demo: name box ignores W, A, S, D (and E, Space, arrows): DONE ✅ (PR #201)

- Problem: on `/demo/play`, the "What's your first name?" box in the welcome card couldn't receive the game's movement keys, so names like "Sadie" or "Wes" couldn't be typed.
- Cause: Phaser listens for keys on the whole page and blocks the ones the game uses, even when a text box has focus.
- Change: `components/phaser/PhaserGame.tsx` turns the game's keyboard off while any text box has focus and back on when it loses focus. Movement keys work again as soon as the player leaves the box.

#### UX-2: Newsletter sign-up page and blog: IN PROGRESS (branch `claude/blissful-curie-fjnw4i`)

The owner asked for three things (2026-09-26):

1. **Newsletter page:** a "Sign up for our newsletter" page where parents leave their email address for updates and marketing.
2. **Blog:** a blog section, plus a first post that welcomes parents and kids to Learning Adventures and explains our goal of helping kids enjoy learning. The text is a draft; the owner will rewrite it later.
3. **Where to keep the email addresses:** do we need Supabase, and where should marketing emails live?

##### Answer to question 3: use an email marketing service, not Supabase

We don't need Supabase for this, and we shouldn't use it here. A list of email addresses is only half the job. We also have to _send_ the emails, let people unsubscribe with one click, prove they asked to join, and keep the emails out of spam folders. Email marketing services do all of that; Supabase only stores rows in a database.

| Option                                                    | Stores emails | Sends newsletters | Unsubscribe + consent records | Works with our no-backend site           | Verdict                                                  |
| --------------------------------------------------------- | ------------- | ----------------- | ----------------------------- | ---------------------------------------- | -------------------------------------------------------- |
| **Email marketing service** (Kit, beehiiv, Brevo, Sender) | Yes           | Yes               | Built in                      | Yes (one small API route, or no code)    | **Recommended**                                          |
| Supabase table                                            | Yes           | No                | We'd build it                 | No: needs the paused project reconnected | Not now. Brings back the setup that broke Vercel deploys |
| Google Sheet / Airtable via a form tool                   | Yes           | No                | No                            | Yes                                      | OK as a stopgap, but we'd have to move everyone later    |

Why not Supabase right now:

- The Supabase project is paused and its Vercel integration was disconnected on purpose (it caused the "Resource provisioning failed" deploys; see `docs/VERCEL_DEPLOY_FAILURE_NOTES.md`). Reconnecting it for one form brings that risk back.
- We'd still need a separate service to send the emails, so the addresses would end up copied there anyway.
- When accounts return, the service can sync with Supabase if we want (both have APIs). Nothing is lost by starting with a service.

**Recommended provider: Kit** (formerly ConvertKit). Its free plan (checked 2026-09-27 from review sites; confirm on kit.com) covers up to 10,000 subscribers with unlimited sends, sign-up forms, tags, sending from our own domain, and API access, which is what Phase 3 needs. Paid plans start around $39/month once automations are needed. Runner-up: **beehiiv** (free up to 2,500 subscribers, API included). MailerLite and Mailchimp were dropped from the shortlist because in 2025–2026 they cut their free plans to 250 subscribers. The owner makes the final pick in Phase 0; the code is written so we can swap providers by changing one file.

**Rules for a kids' site (COPPA and anti-spam laws):**

- The form is for **parents and guardians only**. It asks for a first name, an optional last name and an email address, plus a required checkbox: "I'm a parent or guardian, 18 or older." It never asks for a child's name, age or email.
- **Double opt-in:** the service emails a "confirm your subscription" link; people are only added once they click it. This is the proof they asked to join.
- Every marketing email needs an unsubscribe link and a postal mailing address (US CAN-SPAM). The service adds these automatically, but the owner needs a mailing address or PO box to give it.
- The Privacy page currently says the site has no sign-up forms. It must be updated **in the same PR** that turns the form on (Phase 3), not after.

##### Phases

Each phase ends with a check-in; the owner approves before the next starts. One branch and one PR (to `main`) unless the owner prefers a PR per phase.

| Phase | What                                                         | Needs from the owner                               | Status                                                 |
| ----- | ------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------ |
| 0     | Decisions and accounts                                       | Provider choice, sender email, mailing address     | In progress: Kit chosen; team deciding the email setup |
| 1     | Blog: `/blog`, `/blog/[slug]`, first welcome post            | Approve the draft post (can be rewritten later)    | COMPLETED ✅                                           |
| 2     | Newsletter page and form (shows "coming soon" until Phase 3) | Approve the page copy                              | COMPLETED ✅ (copy review pending)                     |
| 3     | Connect the email service, update the Privacy page           | API key added to Vercel; test sign-up on a preview | Planned                                                |
| 4     | Link everything together, docs, go live                      | Final review on the Vercel preview, then merge     | Planned                                                |

**Owner decisions (2026-09-27):** use **Kit** for the newsletter, and **publish** the welcome post now (it can be rewritten any time).

**Phase 1 notes (COMPLETED ✅):**

- `lib/content/blog.ts` lists the posts (`slug`, `title`, `excerpt`, `publishedAt`, `author`, `icon`, `status`). `publishedPosts` (newest first) and `getPost` only return published posts, so drafts never appear on the site or in the sitemap.
- Each post's text is Markdown in `content/blog/<slug>.md`, read at build time by `lib/blogPostBody.ts` and rendered by `components/blog/PostBody.tsx` (`react-markdown`, already a dependency). Links starting with `/` become site links; other links open in a new tab.
- Pages: `/blog` (post cards, `components/blog/PostCard.tsx`) and `/blog/[slug]` (built ahead of time with `generateStaticParams`; unknown slugs and drafts are a 404). Post pages use `ContentPage` and end with a "Ready for an adventure?" box linking to games and books. The newsletter box replaces or joins it in Phase 2.
- First post: `content/blog/welcome-to-learning-adventures.md` (published 2026-09-27).
- "Blog" is in the header (desktop and phone menu), the footer's About column and the sitemap.
- Guards: the lint icon rule and the emoji check now cover `components/blog` and `app/blog`. New content tests check that post slugs are unique and URL-safe, every post has its Markdown file, dates are real, icons exist, and the Markdown has no emoji.
- Checked in the production build with no env vars: `/blog`, the welcome post, and a 404 for an unknown slug, at 1280px and 390px. No sideways scroll and no console errors.

**Phase 2 notes (COMPLETED ✅, 2026-09-27):**

- The owner is deciding the email setup with their team; Kit stays the plan. Phase 2 was built so it's safe to merge before then.
- `/newsletter` (`app/newsletter/page.tsx`): hero, "What you'll get" (new games, book launches, learning ideas), "Our promises" (parents only and no child details, about one email a month, one-click unsubscribe, never sell your email) and the sign-up form. **The owner should confirm the promises and "about once a month" before sign-ups open.**
- `lib/newsletter.ts` `getNewsletterStatus()` decides what the page shows (server-only):
  - `live`: `NEWSLETTER_API_KEY` is set. The form posts to `/api/newsletter` (added in Phase 3).
  - `preview`: no key, not the live site (laptop or Vercel preview). The form can be tried out and a yellow note says nothing is sent.
  - `coming-soon`: no key, on the live site (`VERCEL_ENV=production`). The page says "Sign-ups open soon" and links to the blog.
  - The page is `noindex` and left out of the sitemap until `live`.
- `components/newsletter/NewsletterForm.tsx` (client): first name (required; owner decision 2026-09-27), optional last name, email, required "I'm a parent or guardian, 18 or older" checkbox, and a hidden honeypot field (`website`) that bots fill in; those sign-ups see the thank-you message but are never sent. Clear error messages (`role="alert"`) and a "Check your inbox to confirm" message after signing up.
- `components/newsletter/NewsletterCta.tsx`: a "Get updates for parents" box linking to `/newsletter`, at the end of every blog post. It renders nothing while the status is `coming-soon`. It is server-only; the footer runs in the browser, so the footer link waits for Phase 4.
- New `envelope` sticker in the icon set (shown on `/dev/icons`).
- Tests: `tests/newsletter/status.test.ts` covers the three statuses. The lint icon rule and the emoji check cover `components/newsletter` and `app/newsletter`.
- Checked in production builds: preview mode (a bad email and a missing checkbox show errors; a good sign-up shows "Check your inbox" and makes no network request) and live-site mode (`VERCEL_ENV=production`: "Sign-ups open soon", no blog box, not in the sitemap). 1280px and 390px, no sideways scroll, no console errors.
- Unchanged until Phase 3: the Privacy page (the form sends nothing yet) and the book pages' optional "Tell me when it's out" link.

**How to add a blog post:** add an entry to `posts` in `lib/content/blog.ts`, write `content/blog/<slug>.md` (plain text; `##` for headings, `**bold**`, `- ` for bullet points, `[text](/games)` for links), then run `npm test`. Use `status: 'draft'` to keep it hidden until it's ready.

**Phase 0: Decisions and accounts (owner, about 30 minutes)**

- Pick the provider (Kit recommended; beehiiv as runner-up) and create a free account.
- In the provider: turn on double opt-in, set the sender name ("Learning Adventures") and sender email (for example `hello@learningadventures.org`), and add the mailing address.
- Verify the `learningadventures.org` domain in the provider (it gives DNS records to add where the domain is managed). This keeps emails out of spam.
- Create the list/form (and a tag such as `parents`, plus `website` as the source).
- Decide: should the first blog post go live straight away, or stay a hidden draft until rewritten? **Default: publish it**, since it's a welcome post and can be edited any time.

**Phase 1: Blog (no outside services needed)**

Follows the same pattern as games and books, so it stays backend-free:

- `lib/content/blog.ts`: a `posts` list with `slug`, `title`, `excerpt`, `publishedAt`, `author`, optional `coverImage`, and `status: 'published' | 'draft'`. Drafts don't appear on the site or in the sitemap.
- `content/blog/<slug>.md`: the text of each post, in Markdown (plain text with `#` for headings and `**bold**`), so the owner can edit posts without touching code. It's rendered with `react-markdown`, which the project already has.
- Pages:
  - `/blog`: newest posts first, as cards (title, date, excerpt, cover)
  - `/blog/[slug]`: the post, with a "Get updates" box at the end that links to `/newsletter`
  - both built ahead of time with `generateStaticParams`, with titles and descriptions for search and social sharing
- First post: `content/blog/welcome-to-learning-adventures.md`, a welcome to parents and kids: who we are, our goal (kids enjoy learning through play and stories), what's on the site today (games by subject, interactive ebooks, the World Demo), what's coming, and an invitation to join the newsletter. Written in plain, warm language; placeholder text is marked so it's easy to find and replace.
- Add "Blog" to the header and footer, and the blog pages to `app/sitemap.xml/route.ts`.
- Icons: `SiteIcon`/`UiIcon` only (lint and `npm test` block emoji). A new `pencil` or `newspaper` sticker if needed, drawn in the UX-1 house style and shown on `/dev/icons`.
- Tests in `tests/content/content.test.ts`: post slugs are unique, every post has its Markdown file and cover image, dates are valid, and the Markdown files contain no emoji (the existing emoji check only covers source code).

**Phase 2: Newsletter page and form (still no outside services)**

- `/newsletter` page: a short pitch for parents (new games, book launches, learning tips; "about once a month, unsubscribe any time"), the form, and a note linking to the Privacy page.
- `components/newsletter/NewsletterForm.tsx`: first name, optional last name, email, the parent/guardian checkbox, and a hidden "honeypot" field that real people never fill in (bots do, so we can ignore those). Clear success ("Check your inbox to confirm") and error messages; accessible labels; works at 390px.
- Until Phase 3 is switched on, the form area shows "Newsletter coming soon" (same idea as the books' "coming soon" button), so the page is safe to merge early.
- A reusable `NewsletterCta` box for the end of blog posts, the homepage and book pages.

**Phase 3: Connect the email service**

- `app/api/newsletter/route.ts`: a small server function. The browser sends the form to our own site; our site passes it to the provider using a secret API key kept on the server. Why not call the provider directly from the browser? The key would be visible to anyone, and our own route lets us check the email, the checkbox and the honeypot first.
- New env vars, set in Vercel (Production and Preview):
  - `NEWSLETTER_PROVIDER` (for example `kit` or `beehiiv`)
  - `NEWSLETTER_API_KEY` (secret; no `NEXT_PUBLIC_` prefix, so it never reaches the browser)
  - `NEWSLETTER_LIST_ID` (the form, list or group to add people to)
- `lib/newsletter.ts`: the only file that knows which provider we use. Changing providers means changing this file and the env vars.
- If the env vars are missing (for example on a laptop), the page shows "coming soon" and the site still builds. That keeps the rule that public pages build with no env vars or secrets.
- Update `app/privacy/page.tsx`: what we collect (parent's first name, optional last name and email), why (updates and marketing), who holds it (the named provider), how to unsubscribe or ask for deletion, and that we never collect children's emails. Update the page's "updated" date and its code comment.
- Replace the optional `NEXT_PUBLIC_NEWSLETTER_URL` link on book pages ("Tell me when it's out") with a link to `/newsletter`, and retire that env var.
- Test on the Vercel preview with a real address: sign up, get the confirmation email, confirm, see the contact in the provider, unsubscribe.

**Phase 4: Link everything, docs, go live**

- "Get updates" links in the footer and at the end of the homepage; a blog link from the About page.
- Update CLAUDE.md (routes, content folders, "how to add a blog post", new env vars) and `docs/V1_GO_LIVE_CHECKLIST.md`.
- Mark UX-2 COMPLETED ✅ here.

**Checks for every phase:** `npx tsc --noEmit`, `npm run lint` (0 errors), `npm test`, `npm run build` with no env vars, then the pages in the production build at 1280px and 390px (no sideways scroll, no console errors, axe clean).

**Out of scope for UX-2:** a blog admin/editor (posts are Markdown files in the repo for now), comments on posts, RSS (easy to add later), and syncing subscribers with Supabase accounts.

#### UX-3: Featured games section on the homepage: COMPLETED ✅ (in PR #205, with the Seeds of Genius listing)

- **Page:** homepage (`/`).
- **Request (owner, 2026-10-01):** a "Featured games" section directly under "Pick a subject". Seeds of Genius goes first; more games will be added later.
- **Built:**
  - `homeFeaturedSlugs` in `lib/content/games.ts` is the ordered list for this section, with `getHomeFeaturedGames()` to read it. It is separate from the `featured: true` flag, which only moves a game to the front of its subject row.
  - In `components/home/HomePage.tsx`, the first game gets a large spotlight card: screenshot, "Featured" sticker, subject, description, skills, grades, time and a "Play now" button. Any other featured games show as regular cards in a grid under it. The section hides itself if the list is empty.
  - A content test checks that every featured slug is a real game and that none is listed twice.
- **To feature another game:** add its slug to `homeFeaturedSlugs`. The first slug gets the spotlight.
- **Checked:**
  - On the production build at 1280px and 390px: the section sits right after "Pick a subject", there is no sideways scroll, there are no console errors, and "Play now" opens `/games/seeds-of-genius`.
  - tsc, lint (0 errors), `npm test` (88), `npm run build`.

#### UX-4: Rebuild every game in Three.js to the Seeds of Genius standard: IN PROGRESS (Phase 0 COMPLETED ✅ and owner-approved 2026-10-02 in PR #207; Math batch M1, Counting Carnival, COMPLETED ✅ and owner-approved 2026-10-02 in PR #208; Math batch M2, Math Dash redesigned by the owner as "Library Rush" (a survivors-style action game), COMPLETED ✅ and owner-approved 2026-10-03 in PR #209; Math batch M3, Money Market Madness (with an upgrade shop, Cafeteria Cashier merged in) and Time Attack Clock, COMPLETED ✅ and owner-approved 2026-10-03 in PR #210; Math batch M4 COMPLETED ✅: Math Race Rally (PR #211) and Math Adventure Island (PR #212); Math batch M5, Geometry: Shape Town Builders, COMPLETED ✅ in PRs #213 and #214; Math batch M6, Fractions: Forum Fraction Feast, the first game in a new world (Ancient Kingdoms, Roman forum), COMPLETED ✅ and owner-approved 2026-10-09 in PR #220 (Fraction Pizza Party merged in, old link redirects); 9 of 11 Math games done. Math batch M7 in the Star Station world is IN PROGRESS (plan approved 2026-10-09; the owner turned Multiplication Space Quest into a vertical space shooter; half 1 built in PR #224, see the M7 section of `docs/GAMES_3D_UPGRADE_PLAN.md`); then Equation Balance Scale, then the other subjects inside their worlds, then the Echo narrative and an interactive world map on the site (`docs/GAME_WORLDS_PROPOSAL.md`))

- **Pages:** every game at `/games/[slug]` (43 games and activities; Seeds of Genius is the quality bar).
- **Problem (owner, 2026-10-01):** the games all work, but they are basic and use the same free icons (emoji).
- **Change:** rebuild each game with Three.js and original art, and make its learning challenges fit its grade level. One subject at a time (Math, then Science, then English and History). Each game must score 8.5/10 or higher on the Seeds of Genius rubric, and each batch needs the owner's approval.
- **Owner decisions (2026-10-01):** 2D retro pixel art, merge overlapping games (43 become 27), Math first, a host character per game.
- **Plan and status:** `docs/GAMES_3D_UPGRADE_PLAN.md`. Code: `games-src/adventures/` (the Adventure Kit and the rebuilt games).
