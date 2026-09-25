# v1 Go-Live Checklist

How to put the v1 site (games by subject, interactive ebooks, Learning Adventures World demo) on
`learningadventures.org`. None of these steps need a code change; they are settings and review
work done in Vercel and in `lib/content/`.

## Before go-live

- [ ] **Review the draft legal pages.** `/privacy` and `/terms` were written from how the site
      works today (no accounts, no analytics, progress saved only in the browser). Have them
      reviewed, then remove the `draft` prop in `app/privacy/page.tsx` and `app/terms/page.tsx`
      and update the `updated` date.
- [ ] **Set a contact email** (optional but recommended): `NEXT_PUBLIC_CONTACT_EMAIL`. It shows in
      the footer and on the About, Privacy and Terms pages. Without it those pages say "Contact
      details will be added here."
- [ ] **Approve the homepage copy** ("Play. Read. Explore.") and the demo landing page copy.
- [ ] Optional links (each one is hidden until it is set):
  - `NEXT_PUBLIC_EBOOK_STORE_URL`: the ebook store, used by books that have no `ebookUrl` of their own
  - `NEXT_PUBLIC_NEWSLETTER_URL`: adds "Tell me when it's out" under books that are coming soon
  - `NEXT_PUBLIC_DEMO_TRAILER_URL`: a YouTube/Vimeo embed on `/demo`
- [ ] Leave `NEXT_PUBLIC_ENABLE_ACCOUNTS` **unset** (accounts, dashboards and admin stay hidden).

The site needs **no other environment variables**: no Supabase, database or secrets.

## Cutover in Vercel

Two projects are involved (see `docs/VERCEL_DEPLOY_FAILURE_NOTES.md`):

| Project                             | Builds                | Status                                                                                    |
| ----------------------------------- | --------------------- | ----------------------------------------------------------------------------------------- |
| `learning-adventures-platform`      | repo root             | Owns `learningadventures.org`, but every deploy fails with "Resource provisioning failed" |
| `learning-adventures-platform-2mxb` | `demo/la-campus-demo` | Deploys fine; serves the current public demo link                                         |

**Option A (preferred, once the failing project is fixed):**

1. In `learning-adventures-platform`, confirm Root Directory is the repo root and Framework is Next.js.
2. Remove the Supabase/database/secret env vars from the Production and Preview environments, or
   leave them; v1 does not read them while accounts are off. Add only the optional ones above.
3. Deploy a preview from the v1 branch and click through it (checklist below).
4. Merge to `main` and promote the production deployment.

**Option B (if the failing project can't be fixed quickly):**

1. In `learning-adventures-platform-2mxb`, change Settings → Build and Deployment → Root Directory
   from `demo/la-campus-demo` to the repo root (leave it empty).
2. Deploy a preview from the v1 branch and review it.
3. Move the `learningadventures.org` and `www` domains from the old project to this one
   (Settings → Domains), then promote to production.

## Smoke test on the preview URL

- [ ] `/` loads; subject tiles open `/subjects/<subject>`
- [ ] `/games` filter chips and search work; a game plays in `/games/<slug>`
- [ ] `/books` and a book page load; the sample pages flip
- [ ] `/demo` loads; "Play the demo" opens `/demo/play`, the player moves, "Exit demo" returns
- [ ] `/about`, `/privacy`, `/terms` load; the footer links all work
- [ ] Account pages such as `/login` and `/profile` redirect to `/`; `/catalog` redirects to `/games`
- [ ] `/sitemap.xml` and `/robots.txt` load; a made-up URL shows the "This path leads nowhere" page
- [ ] Share the homepage link somewhere private (e.g. a message to yourself) and check the preview image

## After go-live (separate, confirmed steps)

- [ ] Retire `demo/la-campus-demo`. The main app now contains everything it had (merged in
      Phase 5). Delete the folder in its own PR, and only after the new site has been live for a
      while. If Option B was used, nothing depends on the folder any more.
- [ ] Delete or archive whichever Vercel project is no longer used.
- [ ] Submit `https://learningadventures.org/sitemap.xml` in Google Search Console.
