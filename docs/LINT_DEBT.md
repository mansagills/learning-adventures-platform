# Lint Debt: Planning Doc

**Generated**: 2026-09-06, from `npx eslint .` on branch `fix/npc-duplicate-declaration` (mansagills/learning-adventures-platform#182), after fixing the plugin-resolution bug that had silently prevented `npm run lint` from ever completing in this repo. This is the **first time lint has actually analyzed this codebase** — every prior run crashed on `next lint`'s interactive setup wizard before reaching a single file (see PR #182 for that history).

**Total: 292 problems — 269 errors, 23 warnings — across 144 files.** All are pre-existing; none are in files touched by PR #182. This doc catalogs every issue by rule, explains what each rule means and why it matters, and proposes a phased order to pay the debt down safely.

**How to reproduce**: `npm run lint` (runs `eslint .`). Full raw output is what this doc summarizes — nothing here is hand-picked.

---

## At a glance

| Rule | Count | Severity | What it's about |
|---|---|---|---|
| `@typescript-eslint/no-unused-vars` | 174 | error | A variable, import, or function parameter is declared but never read. |
| `react/no-unescaped-entities` | 92 | error | A raw `'` or `"` character appears in JSX text instead of an HTML entity. |
| `react-hooks/exhaustive-deps` | 18 | warning | A `useEffect`/`useCallback` dependency array is missing something the function body actually uses. |
| `@next/next/no-img-element` | 5 | warning | A plain `<img>` tag is used where Next's `<Image>` component would be more efficient. |
| `prefer-const` | 3 | error | A variable declared with `let` is never reassigned, so it should be `const`. |

Only errors fail `npm run lint` (and therefore CI); the 23 warnings do not currently block anything, but `react-hooks/exhaustive-deps` warnings are worth reading because a few may be real bugs, not just style (see Phase 10).

---

## Rule-by-rule explanation

### 1. `@typescript-eslint/no-unused-vars` (174 errors, the majority of the debt)

**What it means**: something was declared — an import, a `const`, a destructured field, a function parameter — and nothing in that scope ever reads it. Dead code, in other words: harmless to the running program (unused variables don't cause runtime bugs by themselves) but it accumulates cruft and occasionally *hides* a real bug (see the `authError` pattern below, which is the one sub-group in this file worth reading closely before treating it as pure cleanup).

**Config detail specific to this repo**: `eslint.config.mjs` sets `argsIgnorePattern: '^_'`, so a function parameter named `_foo` is exempt from this rule. That's the escape hatch to use for parameters your code is required to accept (by an interface, a framework signature, a callback shape) but doesn't need — rename `foo` to `_foo` rather than deleting it.

This rule breaks down into a handful of repeating shapes, which is why it's worth fixing as pattern-sweeps rather than 174 one-off edits:

#### 1a. The `authError` pattern — 45 occurrences across 35 files — **worth checking for a real bug, not just cleanup**

Every one of these files does something like:
```ts
const { user, authError } = await getApiUser(request);
```
...and then never checks `authError` before proceeding. That's suspicious on its own: if `getApiUser` is designed so that `authError` is set exactly when `user` is null (a common pattern), then not checking it is probably fine as long as the code separately checks `if (!user)` — but if any of these 35 routes rely on `authError` for something `!user` doesn't cover (e.g., a distinct "expired" vs. "missing" state, or a rate-limit signal), silently dropping it could mean an auth failure mode is being ignored. **Recommend**: before mechanically deleting `authError` from all 35 files, read `getApiUser`'s implementation once to confirm `!user` alone is a sufficient auth check everywhere it's used. If so, the fix really is mechanical (drop `authError` from the destructure in all 35 files). If not, some of these 35 need an actual `if (authError) return ...` added, not just a deletion.

Files: see the "authError pattern" section of the full appendix below (Phase 5).

#### 1b. Unused `request`/`req` handler parameters — 18 occurrences across 18 files

Next.js route handlers (`GET`, `POST`, etc. in `app/api/**/route.ts`) receive a `request: Request` (or `req`) argument as part of the framework's required signature, even for handlers that don't need to read anything off it (no query params, no body, no headers). ESLint doesn't know that's a framework requirement, hence the warning. **Fix**: rename the parameter to `_request`/`_req` (already exempt per the `argsIgnorePattern: '^_'` config) rather than removing it — the framework still calls the handler positionally.

#### 1c. Unused `context` parameters in skill/agent classes — 11 occurrences across 7 files (`lib/agents/`, `lib/skills/`)

These are classes implementing a shared interface (an "agent" or "skill" base class) where the interface method signature includes a `context` parameter that a specific implementation doesn't happen to use. Same fix as 1b: rename to `_context`.

#### 1d. Unused `node` parameters in a Markdown renderer — 12 occurrences, all in `components/agents/MessageBubble.tsx`

This is a `react-markdown` custom-renderer component where each element override (`h1`, `p`, `code`, etc.) receives a `node` prop from the AST that most overrides don't use. Same fix: rename to `_node` per override.

#### 1e. Unused `session` variables — 6 occurrences across 6 files

Destructured from `useAuth()` and then never read. Worth a quick individual look per file rather than blind deletion — in a couple of these (`app/parent/dashboard/page.tsx` assigns but doesn't use `session`, alongside a separately-unused `avgCompletion`) it's plausible a display feature was half-wired and abandoned rather than the variable being truly pointless. Low risk either way, but "read the surrounding 10 lines before deleting" is the right level of care here, unlike 1b–1d which are pure signature boilerplate.

#### 1f. Everything else — ~82 one-off occurrences

The remaining unused-vars errors are scattered singletons: unused imports (`useState`, `useContext`, `redirect`, `bcrypt`, `readFile`, `join`, date-fns helpers like `subWeeks`/`addWeeks`, etc.), a few unused destructured state setters (`setIsLoading`, `setFeedback`, `setConversations`), and a handful of assigned-but-unused local variables (`avgCompletion`, `thisLessonProgress`, `distributionWarnings`, `availableCount`). Each is genuinely one-off — no shared pattern to sweep — so these are best fixed file-by-file, and each is a good moment to glance at whether the surrounding code still needs what the variable was going to be used for.

---

### 2. `react/no-unescaped-entities` (92 errors, 29 files)

**What it means**: JSX text content has a literal apostrophe (`'`) or double quote (`"`) character, which the `react/no-unescaped-entities` rule flags because in rare cases raw quote characters in JSX can render ambiguously or trip up certain static analysis tools. In practice, for a rendered page in a browser, unescaped `'`/`"` in text almost always displays exactly as intended — this is a style/lint-hygiene rule, not a functional bug. The fix is mechanical: replace `'` with `&apos;`/`&rsquo;` and `"` with `&quot;`/`&rdquo;` in the flagged spots (or restructure the string to avoid the character, e.g. use double quotes around a string containing an apostrophe).

**Note**: ESLint did not report any of these as auto-fixable (`--fix`), so each needs a manual text edit — but it's a purely mechanical, zero-logic-risk edit. This is a good "batch this in one afternoon" category, ideally by someone comfortable skimming 29 files of user-facing copy without introducing typos.

Heaviest files: `app/internal/studio/page.tsx` (11), `app/certificates/[certificateId]/page.tsx` (8), `components/studio/IterationControls.tsx` (6), `app/progress/page.tsx` (6).

---

### 3. `react-hooks/exhaustive-deps` (18 warnings, 17 files)

**What it means**: a `useEffect` or `useCallback` reads a value from the surrounding scope (a function, a piece of state, a prop) that isn't listed in its dependency array. React's own docs treat this as a common source of stale-closure bugs — the effect can end up running with an outdated version of that value instead of the current one. **This is the one category in this whole list most likely to hide an actual bug**, not just style, so it deserves individual review rather than a blind "add the missing dep and move on" — sometimes the right fix is to add the dependency, but sometimes the effect was intentionally written to run only once (e.g., on mount) and adding the dependency would introduce an infinite loop or unwanted re-fetching. Each of the 17 files needs a human decision, not a mechanical sweep.

A few worth flagging specifically because "add the missing dep" is clearly *not* safe as a blind fix:
- `components/agents/FileUploader.tsx` — missing dep is `handleFiles`, inside a `useCallback`; check whether `handleFiles` itself is stable (wrapped in its own `useCallback`) before adding it, or you'll get a re-creation loop.
- `app/internal/components/ContentPreview.tsx` — the warning lists **13 missing dependencies** (a large chunk of `formData.*` plus `generatedContent`, `handleGenerate`, `onContentGenerated`), which usually means the effect's dependency list was never actually maintained as the component grew. This one likely needs a real refactor (e.g., `useCallback`-wrapping `onContentGenerated` at its parent, as the warning itself suggests) rather than a one-line fix.

---

### 4. `@next/next/no-img-element` (5 warnings, 5 files)

**What it means**: a plain `<img>` tag is used where Next.js's `<Image>` component would give automatic optimization (responsive sizing, lazy loading, format conversion). Purely a performance suggestion — nothing is broken. Lowest priority in this whole list; worth doing opportunistically whenever one of these 5 files is touched for another reason, rather than as its own pass.

Files: `app/internal/layout.tsx`, `app/profile/page.tsx`, `components/UserMenu.tsx`, `components/agents/FileUploader.tsx`, `components/world/CharacterCreator.tsx`.

---

### 5. `prefer-const` (3 errors)

**What it means**: a `let` variable is never reassigned after its initial value, so it should be `const` — signals intent (this binding won't change) and lets the type-checker/reader reason about it more easily. Zero risk, one-line fix each.

- `.agents/skills/develop-web-game/scripts/web_game_playwright_client.js:179` and its duplicate `.claude/skills/develop-web-game/scripts/web_game_playwright_client.js:179` — the same file appears to be checked into the repo twice under two different tool-config directories; worth asking whether one of those two copies should just be deleted/symlinked rather than maintained in parallel.
- `app/api/internal/extract-metadata/route.ts:58` — a genuine one-off.

---

## Suggested phasing

Ordered by risk (lowest first) and by how mechanical the fix is — do the safe sweeps before the ones needing judgment, so the error count drops fast and what's left is genuinely worth slowing down for.

| Phase | Scope | Count | Risk | Effort |
|---|---|---|---|---|
| **1** | `prefer-const` (all 3) | 3 | None | Trivial — one keyword each |
| **2** | Unused-vars pattern 1b: rename unused `request`/`req` params to `_request`/`_req` | 18 | None | Trivial, same edit repeated |
| **3** | Unused-vars pattern 1c: rename unused `context` params to `_context` | 11 | None | Trivial, same edit repeated |
| **4** | Unused-vars pattern 1d: rename unused `node` params to `_node` in `MessageBubble.tsx` | 12 | None | Trivial, one file |
| **5** | Unused-vars pattern 1a: the `authError` sweep — **read `getApiUser`'s implementation first** (see §1a above), then either delete `authError` from all 35 destructures, or fix the subset that actually needs an auth-error check | 45 | Low, but verify the auth assumption first | Medium — one read, then a mechanical sweep |
| **6** | `react/no-unescaped-entities` — batch-edit all 29 files | 92 | None (pure text) | Medium — mechanical but touches a lot of files; worth one focused sitting |
| **7** | Unused-vars pattern 1e: the `session` sweep — glance at each of the 6 files before deleting | 6 | Low | Small |
| **8** | Unused-vars "everything else" — the ~82 one-off imports/vars, file by file | ~82 | Low | Largest remaining chunk, but each fix is independent and small |
| **9** | `@next/next/no-img-element` — swap to `next/image` opportunistically | 5 | Low (verify layout/sizing after swap) | Small, can be folded into unrelated work on those files |
| **10** | `react-hooks/exhaustive-deps` — review each of the 17 files individually; this is the one category where "just do what the linter suggests" can introduce a bug | 18 | **Medium** — needs a real decision per case, especially `ContentPreview.tsx` and `FileUploader.tsx` | Highest — no shortcut, budget real review time |

Phases 1–4 and 6 are close to pure mechanical sweeps and could reasonably be done as `eslint --fix`-assisted batch commits without much individual review. Phase 5 has one genuine question to answer before it becomes mechanical too. Phases 7–9 are small and low-stakes but deserve a quick look each. Phase 10 is the only category that can't be rushed — it's the one place on this whole list where the "unused" thing being flagged is actually a *missing* thing (a dependency), not an *extra* one, and the risk profile is different (stale closures / bugs) rather than just dead code.

---

## Appendix A — full `@typescript-eslint/no-unused-vars` list, by file (174 total, 103 files)

Grouped roughly in the order discussed above isn't practical for 103 files, so this is alphabetical by path. Cross-reference against §1a–1f above to know which pattern a given file falls into (files with `authError` in the details column are Phase 5; files with `request`/`req`/`context`/`node` are Phases 2–4; everything else is Phase 8, except the 6 `session` files, which are Phase 7).

| File | Count | Details |
|---|---|---|
| app/agents/page.tsx | 2 | L12: 'ProtectedRoute' is defined but never used; L20: 'authError' is assigned a value but never used |
| app/api/achievements/user/route.ts | 1 | L12: 'request' is defined but never used |
| app/api/admin/test-courses/[id]/approve/route.ts | 1 | L13: 'authError' is assigned a value but never used |
| app/api/admin/test-courses/[id]/feedback/route.ts | 1 | L12: 'authError' is assigned a value but never used |
| app/api/admin/test-courses/[id]/promote/route.ts | 1 | L13: 'authError' is assigned a value but never used |
| app/api/admin/test-courses/[id]/route.ts | 2 | L12: 'authError' is assigned a value but never used; L54: 'authError' is assigned a value but never used |
| app/api/admin/test-courses/[id]/status/route.ts | 1 | L12: 'authError' is assigned a value but never used |
| app/api/admin/test-courses/route.ts | 2 | L9: 'authError' is assigned a value but never used; L49: 'authError' is assigned a value but never used |
| app/api/admin/test-games/[id]/approve/route.ts | 1 | L13: 'authError' is assigned a value but never used |
| app/api/admin/test-games/[id]/feedback/route.ts | 1 | L12: 'authError' is assigned a value but never used |
| app/api/admin/test-games/[id]/promote/route.ts | 1 | L14: 'authError' is assigned a value but never used |
| app/api/admin/test-games/[id]/route.ts | 1 | L12: 'authError' is assigned a value but never used |
| app/api/admin/test-games/[id]/status/route.ts | 1 | L13: 'authError' is assigned a value but never used |
| app/api/admin/test-games/route.ts | 3 | L7: 'req' is defined but never used; L9: 'authError' is assigned a value but never used; L42: 'authError' is assigned a value but never used |
| app/api/agent/chat/route.ts | 3 | L24: 'authError' is assigned a value but never used; L27: 'context' is assigned a value but never used; L56: 'request' is defined but never used |
| app/api/agents/[agentId]/chat/route.ts | 2 | L18: 'authError' is assigned a value but never used; L29: 'history' is assigned a value but never used |
| app/api/agents/files/upload/route.ts | 1 | L27: 'authError' is assigned a value but never used |
| app/api/agents/history/route.ts | 1 | L15: 'authError' is assigned a value but never used |
| app/api/agents/list/route.ts | 2 | L73: 'request' is defined but never used; L76: 'authError' is assigned a value but never used |
| app/api/challenges/route.ts | 1 | L5: 'addWeeks' is defined but never used |
| app/api/child/logout/route.ts | 1 | L12: 'request' is defined but never used |
| app/api/child/session/route.ts | 1 | L13: 'request' is defined but never used |
| app/api/course-requests/draft/route.ts | 7 | L35: '_id' is assigned a value but never used; L35: '_userId' is assigned a value but never used; L35: '_status' is assigned a value but never used; L35: '_isDraft' is assigned a value but never used; L35: '_createdAt' is assigned a value but never used; L35: '_updatedAt' is assigned a value but never used; L169: 'request' is defined but never used |
| app/api/course-requests/submit/route.ts | 1 | L63: '_ignoredUserId' is assigned a value but never used |
| app/api/courses/[courseId]/lessons/[lessonId]/complete/route.ts | 1 | L21: 'validateRequestBody' is defined but never used |
| app/api/debug/session/route.ts | 2 | L10: 'request' is defined but never used; L12: 'authError' is assigned a value but never used |
| app/api/gemini/generate/route.ts | 2 | L27: 'authError' is assigned a value but never used; L170: 'authError' is assigned a value but never used |
| app/api/gemini/iterate/route.ts | 2 | L16: 'authError' is assigned a value but never used; L182: 'authError' is assigned a value but never used |
| app/api/gemini/preview/[contentId]/route.ts | 1 | L12: 'authError' is assigned a value but never used |
| app/api/gemini/publish/route.ts | 1 | L23: 'authError' is assigned a value but never used |
| app/api/gemini/stats/route.ts | 2 | L6: 'req' is defined but never used; L9: 'authError' is assigned a value but never used |
| app/api/internal/claude-generate/route.ts | 1 | L101: 'authError' is assigned a value but never used |
| app/api/internal/content-upload/course-package/route.ts | 1 | L17: 'authError' is assigned a value but never used |
| app/api/internal/content-upload/list/route.ts | 2 | L6: 'request' is defined but never used; L7: 'authError' is assigned a value but never used |
| app/api/internal/content-upload/route.ts | 1 | L13: 'authError' is assigned a value but never used |
| app/api/internal/extract-metadata/route.ts | 3 | L4: 'readFile' is defined but never used; L5: 'join' is defined but never used; L24: 'authError' is assigned a value but never used |
| app/api/internal/save-content/route.ts | 3 | L4: 'copyFile' is defined but never used; L4: 'readdir' is defined but never used; L13: 'authError' is assigned a value but never used |
| app/api/internal/upload-zip/route.ts | 1 | L10: 'authError' is assigned a value but never used |
| app/api/leaderboard/route.ts | 3 | L5: 'subWeeks' is defined but never used; L5: 'subMonths' is defined but never used; L111: 'index' is defined but never used |
| app/api/oversight/students/route.ts | 1 | L7: 'request' is defined but never used |
| app/api/parent/children/[id]/route.ts | 3 | L35: 'authError' is assigned a value but never used; L83: 'authError' is assigned a value but never used; L199: 'authError' is assigned a value but never used |
| app/api/parent/children/route.ts | 3 | L31: 'request' is defined but never used; L33: 'authError' is assigned a value but never used; L90: 'authError' is assigned a value but never used |
| app/api/parent/verify/route.ts | 4 | L15: 'request' is defined but never used; L17: 'authError' is assigned a value but never used; L68: 'request' is defined but never used; L70: 'authError' is assigned a value but never used |
| app/api/progress/games/route.ts | 1 | L13: 'request' is defined but never used |
| app/api/progress/user/route.ts | 1 | L12: 'request' is defined but never used |
| app/api/subscriptions/status/route.ts | 1 | L16: 'request' is defined but never used |
| app/api/user/profile/route.ts | 3 | L10: 'authError' is assigned a value but never used; L69: 'request' is defined but never used; L71: 'authError' is assigned a value but never used |
| app/courses/[slug]/lessons/[order]/page.tsx | 1 | L24: 'session' is assigned a value but never used |
| app/courses/[slug]/page.tsx | 1 | L24: 'session' is assigned a value but never used |
| app/games/[gameId]/page.tsx | 1 | L7: 'getGameMetadata' is defined but never used |
| app/internal/testing/page.tsx | 3 | L101: 'session' is assigned a value but never used; L102: 'router' is assigned a value but never used; L157: 'selectId' is assigned a value but never used |
| app/my-requests/[id]/page.tsx | 1 | L41: 'router' is assigned a value but never used |
| app/parent/children/page.tsx | 1 | L59: 'router' is assigned a value but never used |
| app/parent/dashboard/page.tsx | 2 | L99: 'session' is assigned a value but never used; L109: 'avgCompletion' is assigned a value but never used |
| app/profile/page.tsx | 1 | L5: 'redirect' is defined but never used |
| app/progress/page.tsx | 2 | L3: 'useAuth' is defined but never used; L4: 'redirect' is defined but never used |
| app/robots.txt/route.ts | 1 | L1: 'MetadataRoute' is defined but never used |
| app/test-progress/page.tsx | 1 | L42: 'result' is assigned a value but never used |
| components/Header.tsx | 1 | L16: 'handleCTAClick' is assigned a value but never used |
| components/LoginPageContent.tsx | 1 | L97: 'data' is assigned a value but never used |
| components/ProfileSettings.tsx | 2 | L45: 'isLoading' is assigned a value but never used; L45: 'setIsLoading' is assigned a value but never used |
| components/RoleGuard.tsx | 1 | L32: 'requireAll' is assigned a value but never used |
| components/agents/ConversationHistory.tsx | 1 | L24: 'setConversations' is assigned a value but never used |
| components/agents/FileUploader.tsx | 1 | L37: 'allowedTypes' is assigned a value but never used |
| components/agents/LearningBuilderChat.tsx | 1 | L52: 'session' is assigned a value but never used |
| components/agents/MessageBubble.tsx | 12 | L72: 'node' is defined but never used; L75: 'node' is defined but never used; L78: 'node' is defined but never used; L82: 'node' is defined but never used; L85: 'node' is defined but never used; L88: 'node' is defined but never used; L92: 'node' is defined but never used; L94: 'node' is defined but never used; L107: 'node' is defined but never used; L114: 'node' is defined but never used; L121: 'node' is defined but never used; L125: 'node' is defined but never used |
| components/course-request/FormNavigation.tsx | 2 | L18: 'currentStep' is defined but never used; L19: 'totalSteps' is defined but never used |
| components/course-request/inputs/MultiSelectCheckbox.tsx | 1 | L3: 'useState' is defined but never used |
| components/courses/EnrollButton.tsx | 1 | L31: 'session' is assigned a value but never used |
| components/goals/GoalCard.tsx | 2 | L45: 'onUpdate' is defined but never used; L54: 'status' is assigned a value but never used |
| components/world/JobBoard.tsx | 3 | L30: 'onJobComplete' is defined but never used; L35: 'setFeedback' is assigned a value but never used; L79: 'availableCount' is assigned a value but never used |
| components/world/ShopModal.tsx | 1 | L4: 'Coins' is defined but never used |
| game/entities/Player.ts | 1 | L173: 'delta' is defined but never used |
| lib/agents/AccessibilityValidatorAgent.ts | 1 | L41: 'ValidationResult' is defined but never used |
| lib/agents/GameIdeaGeneratorAgent.ts | 1 | L150: 'response' is defined but never used |
| lib/agents/WorkflowExecutor.ts | 4 | L248: 'prompt' is assigned a value but never used; L271: 'context' is defined but never used; L290: 'context' is defined but never used; L309: 'context' is defined but never used |
| lib/agents/deploy-game.example.ts | 1 | L60: 'componentData' is assigned a value but never used |
| lib/auth-context.tsx | 1 | L3: 'useContext' is defined but never used |
| lib/courses/courseQueries.ts | 1 | L12: 'CourseEnrollment' is defined but never used |
| lib/courses/enrollmentHelpers.ts | 1 | L10: 'User' is defined but never used |
| lib/courses/progressHelpers.ts | 1 | L108: 'thisLessonProgress' is assigned a value but never used |
| lib/courses/quizHelpers.ts | 1 | L196: 'userLevel' is assigned a value but never used |
| lib/courses/xpCalculations.ts | 1 | L264: 'source' is assigned a value but never used |
| lib/skills/accessibility-validator/AccessibilityValidatorSkill.ts | 2 | L37: 'context' is defined but never used; L78: 'context' is defined but never used |
| lib/skills/curriculum-design/CurriculumDesignSkill.ts | 1 | L159: 'distributionWarnings' is assigned a value but never used |
| lib/skills/game-builder/GameBuilderSkill.ts | 4 | L14: 'GameFile' is defined but never used; L80: 'context' is defined but never used; L278: 'userRequest' is defined but never used; L285: 'context' is defined but never used |
| lib/skills/game-ideation/GameIdeationSkill.ts | 1 | L72: 'context' is defined but never used |
| lib/skills/interactive-content/InteractiveContentSkill.ts | 3 | L3: 'writeFile' is defined but never used; L3: 'mkdir' is defined but never used; L4: 'join' is defined but never used |
| lib/skills/metadata-formatter/MetadataFormatterSkill.ts | 1 | L43: 'context' is defined but never used |
| lib/skills/react-component/ReactComponentSkill.ts | 1 | L45: 'context' is defined but never used |
| middleware.ts | 1 | L4: 'createServiceClient' is defined but never used |
| prisma/seed-test-games.ts | 1 | L7: 'bcrypt' is defined but never used |
| prisma/seed.ts | 2 | L162: 'demoChild1' is assigned a value but never used; L175: 'demoChild2' is assigned a value but never used |
| tests/Faq.test.tsx | 1 | L98: 'index' is defined but never used |
| tests/security/filename_path_traversal.test.ts | 2 | L3: 'path' is defined but never used; L65: 'path' is defined but never used |
| tests/security/package_upload_security.test.ts | 1 | L34: 'buffer' is defined but never used |
| tests/security/save_content_auth.test.ts | 1 | L39: 'path' is defined but never used |
| tests/security/save_content_path_traversal.test.ts | 2 | L3: 'path' is defined but never used; L68: 'path' is defined but never used |
| tests/security/save_content_vulnerability.test.ts | 2 | L1: 'afterEach' is defined but never used; L3: 'path' is defined but never used |
| tests/security/signup_mass_assignment.test.ts | 1 | L4: 'bcrypt' is defined but never used |
| tests/security/signup_validation.test.ts | 1 | L118: 'data' is assigned a value but never used |
| tests/security/storage_router_traversal.test.ts | 1 | L1: 'afterEach' is defined but never used |
| tests/security/zip_slip_prevention.test.ts | 4 | L2: 'POST' is defined but never used; L55: 'mockExtractAllTo' is assigned a value but never used; L71: 'mockGetEntries' is assigned a value but never used; L96: 'req' is assigned a value but never used |

## Appendix B — full `react/no-unescaped-entities` list, by file (92 total, 29 files)

| File | Count | Lines |
|---|---|---|
| app/certificates/[certificateId]/page.tsx | 8 | 149, 149, 149, 149, 151, 151, 153, 153 |
| app/course-request/success/page.tsx | 3 | 73, 101, 128 |
| app/courses/[slug]/lessons/[order]/page.tsx | 3 | 290, 290, 295 |
| app/courses/page.tsx | 3 | 202, 353, 353 |
| app/games/page.tsx | 2 | 185, 185 |
| app/internal/components/ContentPreview.tsx | 4 | 313, 407, 592, 592 |
| app/internal/components/ContentPublisher.tsx | 2 | 95, 95 |
| app/internal/studio/page.tsx | 11 | 125, 125, 125, 126, 144, 144, 144, 146, 162, 162, 163 |
| app/parent/child/[id]/page.tsx | 1 | 114 |
| app/parent/children/page.tsx | 5 | 296, 323, 463, 599, 737 |
| app/parent/dashboard/page.tsx | 2 | 246, 341 |
| app/practice/page.tsx | 1 | 204 |
| app/progress/page.tsx | 6 | 135, 135, 149, 149, 163, 163 |
| components/Faq.tsx | 3 | 137, 137, 137 |
| components/SocialProof.tsx | 3 | 81, 110, 110 |
| components/agents/AgentDiscovery.tsx | 3 | 124, 158, 158 |
| components/agents/ChatInterface.tsx | 1 | 177 |
| components/course-request/steps/Step10FinalNotes.tsx | 5 | 136, 186, 194, 202, 206 |
| components/course-request/steps/Step1RequestorInfo.tsx | 1 | 187 |
| components/course-request/steps/Step8DeliveryLogistics.tsx | 1 | 200 |
| components/course-request/steps/Step9BudgetReusability.tsx | 4 | 108, 163, 209, 210 |
| components/courses/LevelUpModal.tsx | 1 | 50 |
| components/courses/PremiumPaywallModal.tsx | 1 | 197 |
| components/games/ecosystem-builder/EcosystemBuilder.tsx | 4 | 322, 337, 478, 478 |
| components/studio/IterationControls.tsx | 6 | 204, 204, 204, 204, 205, 205 |
| components/world/QuestLog.tsx | 1 | 225 |
| components/world/QuestOfferDialog.tsx | 4 | 48, 48, 52, 52 |
| components/xp/DailyXPGoal.tsx | 2 | 76, 113 |
| components/xp/StreakDisplay.tsx | 1 | 107 |

## Appendix C — full `react-hooks/exhaustive-deps` list (18 total, 17 files)

| File | Line | Missing dependency |
|---|---|---|
| app/certificates/[certificateId]/page.tsx | 29 | React Hook useEffect has a missing dependency: 'fetchCertificate' |
| app/child/dashboard/page.tsx | 42 | React Hook useEffect has a missing dependency: 'checkSession' |
| app/child/login/page.tsx | 27 | React Hook useEffect has a missing dependency: 'checkSession' |
| app/courses/[slug]/lessons/[order]/page.tsx | 49 | React Hook useEffect has missing dependencies: 'fetchLesson' and 'router' |
| app/courses/[slug]/page.tsx | 33 | React Hook useEffect has a missing dependency: 'fetchCourse' |
| app/courses/page.tsx | 46 | React Hook useEffect has a missing dependency: 'fetchCourses' |
| app/internal/components/ContentPreview.tsx | 58 | React Hook useEffect has missing dependencies: 'formData.difficulty', 'formData.estimatedTime', 'formData.gameIdea', 'formData.gradeLevel', 'formData.skills', 'formData.sourceCodeUrl', 'formData.subject', 'formData.subscriptionTier', 'formData.title', 'formData.type', 'formData.uploadPlatform', 'formData.uploadSource', 'formData.uploadedZipPath', 'generatedContent', 'handleGenerate', and 'onContentGenerated' |
| app/staging/courses/[slug]/page.tsx | 55 | React Hook useEffect has missing dependencies: 'fetchCourse' and 'router' |
| app/staging/games/[gameId]/page.tsx | 43 | React Hook useEffect has missing dependencies: 'fetchGame' and 'router' |
| components/agents/FileUploader.tsx | 175 | React Hook useCallback has a missing dependency: 'handleFiles' |
| components/games/ecosystem-builder/EcosystemBuilder.tsx | 216 | React Hook useEffect has missing dependencies: 'actions', 'calculateBalance', and 'gameState.level' |
| components/games/sample-math-game/SampleMathGame.tsx | 148 | React Hook useEffect has missing dependencies: 'generateQuestion' and 'timer.actions' |
| components/phaser/PhaserGame.tsx | 76 | React Hook useEffect has a missing dependency: 'variant' |
| hooks/useAchievements.ts | 64 | React Hook useEffect has a missing dependency: 'fetchAchievements' |
| hooks/useAuth.ts | 98 | React Hook useEffect has a missing dependency: 'supabase' |
| hooks/useCourseRequestAutoSave.ts | 120 | React Hook useEffect has a missing dependency: 'saveDraft' |
| hooks/useCourseRequests.ts | 58 | React Hook useEffect has a missing dependency: 'fetchRequests' |
| hooks/useProgress.ts | 79 | React Hook useEffect has a missing dependency: 'fetchProgress' |

## Appendix D — full `@next/next/no-img-element` list (5 total, 5 files)

| File | Line |
|---|---|
| app/internal/layout.tsx | 73 |
| app/profile/page.tsx | 36 |
| components/UserMenu.tsx | 74 |
| components/agents/FileUploader.tsx | 245 |
| components/world/CharacterCreator.tsx | 181 |

## Appendix E — full `prefer-const` list (3 total)

| File | Line | Message |
|---|---|---|
| .agents/skills/develop-web-game/scripts/web_game_playwright_client.js | 179 | 'base64' is never reassigned. Use 'const' instead |
| .claude/skills/develop-web-game/scripts/web_game_playwright_client.js | 179 | 'base64' is never reassigned. Use 'const' instead |
| app/api/internal/extract-metadata/route.ts | 58 | 'metadataEntry' is never reassigned. Use 'const' instead |

---

## Keeping this doc current

This snapshot will drift the moment anyone touches these files. Before starting a phase, re-run `npm run lint` and diff against this doc's counts for that phase's files — if new issues appeared in files you're about to touch anyway, fold them into the same pass rather than reopening this doc. Once a phase is complete, delete its rows from the appendices (or strike them through) so this stays a live todo list rather than a historical snapshot that quietly goes stale.
