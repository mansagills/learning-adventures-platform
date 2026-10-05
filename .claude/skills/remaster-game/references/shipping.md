# Shipping: site listing, docs, git, PR and the check-in

## Site listing (`lib/content/games.ts`)

Update the game's entry, or add one for a partner's new game:

```ts
{
  slug: 'my-game',                     // keep the old slug when replacing an old game
  title: 'My Game',
  subject: 'math',                     // math | science | english | history | interdisciplinary
  kind: 'game',
  grades: '2–5',                       // en dash
  difficulty: 'medium',
  description: 'Two plain sentences a parent understands: the setting and what the child does.',
  skills: ['Word Problems', 'Estimation'],
  estimatedTime: '30–45 min',
  htmlPath: '/games/play/my-game/index.html',
  thumbnail: '/games/thumbnails/my-game.jpg',
},
```

- **Merges**: delete the entries of the games merged in, and add permanent
  redirects in `next.config.js` `redirects()`:
  `{ source: '/games/<old-slug>', destination: '/games/<kept-slug>', permanent: true }`.
- Leave old `public/games/*.html` files in place. The hidden account
  features still point at some of them, and Phase 4 of the plan removes them.
- Partner submission files in `games-src/submissions/` also stay (they are
  the record of the partner's work). Note in the plan which submission
  became which game.
- `npm test` checks that the HTML file and thumbnail exist and that the slug
  is unique.

## Docs to update in the same PR

- `docs/GAMES_3D_UPGRADE_PLAN.md`:
  - the game's section: status "BUILT, waiting for the owner's test", what
    was built, tests, and a score table with evidence
  - a progress-log line with the date
  - when the owner approves and merges, mark it "COMPLETED ✅ (owner
    tested, approved and merged <date> in PR #N)"
- `CLAUDE.md` handoff notes, UX-4 bullet: one sentence on the game and its
  status. Mark the previous game completed if its PR has merged.
- `docs/V1_WEBSITE_REBUILD_PLAN.md`, UX-4 heading: the same status.
- `games-src/adventures/README.md`:
  - a section for the game: what it is, how it plays, the code folder, a
    controls table
  - the new scripts listed in the scripts block, with check counts

## Git

- Work on the branch the session names. If the PR from that branch has
  already merged, start fresh from `main`:

  ```bash
  git fetch origin main <branch> && git checkout -B <branch> origin/main
  # ...work, commit...
  git merge -s ours origin/<branch> -m "Merge earlier branch history (already merged to main in #N); keep this branch's files"
  git push -u origin <branch>
  ```

  The `-s ours` merge lets a normal push succeed without force-pushing
  (force-pushing is not allowed here). It keeps only this branch's files.
- Always commit the build (`public/games/play/`, including the shared
  `assets/` files that changed) and the new thumbnail.
- End the commit message with the attribution lines the session's system
  reminder gives. Never put a model name in commits, PRs or code.

## The PR

- Open it as a **draft** to `main` with the GitHub MCP tool
  (`mcp__github__create_pull_request`), then call `subscribe_pr_activity`.
- Title: `UX-4 <batch>: <Game> (<merged games> merged in)` or, for a partner
  game, `Partner game: <Game> remastered`.
- Body sections:
  - **What this adds**: plain-language bullets for how the game plays,
    what was kept from the partner, and the site changes
  - **Checks**: the counts of unit tests, browser checks and root checks
  - the score
  - "Waiting for the owner's test before merging."
- Watch the PR. The Vercel preview comments and the check suite finishing
  need no action when they're green. Fix anything red.

## The check-in message to the owner

Keep it short and plain:

1. Screenshots via SendUserFile (title, gameplay, hint, wrong-answer
   explanation, debrief or finale, grown-ups page, phone).
2. "How it plays": a numbered list of the game's parts, with the key
   learning idea of each in one sentence.
3. "What I kept from <partner>'s version": their questions, facts, order.
4. "On the site": the link path, redirects, card picture.
5. The score out of 10 and its weakest point.
6. The PR link and "nothing changes on the live site until you test and
   merge".
