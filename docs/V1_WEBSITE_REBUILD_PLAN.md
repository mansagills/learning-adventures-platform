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

| Phase                          | Status       |
| ------------------------------ | ------------ |
| 1. Foundation                  | COMPLETED ✅ |
| 2. Games experience            | COMPLETED ✅ |
| 3. Homepage                    | COMPLETED ✅ |
| 4. Books                       | COMPLETED ✅ |
| 5. Hub World demo landing page | Next         |
| 6. Polish, docs, cutover       | Not started  |

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
