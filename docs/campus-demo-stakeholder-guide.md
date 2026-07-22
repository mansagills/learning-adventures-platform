# Simulated Students Campus Demo

Branch: `codex/simulated-students-campus-demo`

## Stakeholder URL

Use this route for browser demos without requiring login:

`/world/campus?demo=1`

The regular authenticated campus route remains:

`/world/campus`

The development-only no-auth sandbox remains:

`/dev/campus-sandbox`

## Local Run

```powershell
npm.cmd run dev
```

Open:

`http://localhost:3000/world/campus?demo=1`

## Stakeholder Walkthrough

1. Confirm the campus opens without signing in and shows the `Stakeholder Demo`
   HUD label.
2. Point out the simulated students moving around campus with name tags,
   statuses, ambient chatter, and study circles.
3. Walk west to Math Hall and talk to Professor Numbers.
4. Start Math Race Rally from the Math Hall station or guided quest flow.
5. Close or complete the embedded activity and watch simulated students react.
6. Show the futuristic campus facades and note that the current pass is
   CC0/Kenney-backed generated art direction, not a final raw sprite pack.

## Vercel Notes

- `/world/campus?demo=1` is the preferred preview URL for stakeholders because
  it does not require seeded accounts, auth cookies, or local dev-only routes.
- `/dev/campus-sandbox` intentionally returns no content in production builds.
- Demo XP and coins update locally in the browser for presentation purposes,
  but the demo URL does not write rewards or character position to account APIs.

## Verification

```powershell
npm.cmd test -- tests/world/campus-demo-package.test.ts tests/world/futuristic-campus-art.test.ts tests/world/sim-learners.test.ts tests/world/campus-guided-quest.test.ts tests/world/math-lab-quest.test.ts
npx.cmd tsc --noEmit
```

Browser smoke targets:

- `http://localhost:3000/world/campus?demo=1`
- `http://localhost:3000/dev/campus-sandbox`
