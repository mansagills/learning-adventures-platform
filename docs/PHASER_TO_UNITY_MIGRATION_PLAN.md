# Phaser vs Unity: Strategic Decision for Learning Adventures Platform

## Context

The platform has a functioning Phaser 3 top-down 2D hub world (~2,675 lines of game code) integrated into a Next.js 14 app. The question is whether to continue building the prototype in Phaser, or migrate to Unity now while the project is still early.

**Key facts from codebase exploration:**
- Phaser code is **loosely coupled** via EventBus — swappable without touching Next.js app code
- 2D hub world is ~60-70% complete (scenes, economy, job system done; real assets and 2 native mini-games pending)
- 36 standalone HTML games already exist and are **engine-agnostic** (iframe-embedded, work regardless of hub engine)
- Phase 2 (real character/tilemap assets) is the current blocker — code is done, waiting on Sorceress-generated assets

**User requirements clarified:**
- Hub world stays **2D top-down** permanently
- Some individual games will be **3D** (accessed from the 2D hub)
- Target platforms: **mobile (iOS/Android) + desktop app** — NOT primarily web-only
- Grant funding + developer hire: **12–24 months out** (not imminent)

---

## Recommendation: **Finish the Phaser prototype, then migrate to Unity before hiring**

This is not "delay Unity indefinitely" — it's a deliberate two-phase strategy.

---

## Phase 1: Complete the Phaser Prototype (Now → ~3 months)

**Why finish Phaser first:**

1. **You already have 60-70% of the game world built.** The remaining work is 4-6 weeks of assets + 2 mini-games. Abandoning now wastes that investment with no user-facing benefit.

2. **The 36 HTML games are engine-agnostic.** They work via iframe regardless of whether the hub is Phaser or Unity. No migration needed for these.

3. **Phaser runs in a browser** — useful for demos, grant applications, and early user testing without requiring app installs.

4. **The prototype's job is to prove the concept**, not ship production-quality mobile builds. Phaser is sufficient for that.

**What to finish in Phaser:**
- Integrate Sorceress character sprites + campus tileset (Phase 2)
- Build 2 native mini-games: MathDashScene + CafeteriaCashierScene (Phase 5)
- Basic polish + testing (Phase 6)
- Use this as your grant demo / proof-of-concept

---

## Phase 2: Migrate to Unity Before the Developer Hire (~6-12 months from now)

**Why Unity is the right long-term engine:**

| Factor | Phaser 3 | Unity |
|--------|----------|-------|
| Mobile (iOS/Android native) | ❌ WebView only | ✅ Native builds |
| Desktop app | ❌ Electron wrapper | ✅ Native builds |
| 3D games embedded in 2D world | ❌ Needs separate renderer | ✅ Single engine handles both |
| Asset ecosystem | Limited | Massive (Unity Asset Store) |
| Developer hiring pool | Small | Very large |
| Performance on low-end devices | WebGL limitations | Native optimization |

Your platform requirements (mobile + desktop native, some 3D games) are a **direct mismatch** for Phaser's strengths. Phaser is a web engine — it can run on mobile via WebView, but it's not a native mobile engine. Unity is.

**Why migrate BEFORE the developer hire (not after):**
- A professional game developer will expect Unity. Handing them Phaser code is friction and rework.
- The migration is well-scoped: ~8-10 weeks of work. It's manageable solo if done before the codebase grows.
- Unity's architecture will inform your grant narratives ("Unity-based cross-platform educational platform" is a stronger pitch than "web game").

**Migration scope (when the time comes):**
- The 36 HTML games stay as-is — they iframe-embed from any shell
- Rebuild hub world in Unity (top-down 2D using Unity's Tilemap system)
- Replace EventBus with Unity ↔ React Native bridge (or go full Unity for mobile)
- 3D games are native Unity scenes — no separate renderer needed

---

## On Claude Code + Unity

**Can you build Unity with Claude Code? Yes, with limitations.**

**What works well:**
- Claude Code can read, write, and edit C# scripts
- Can scaffold Unity component architecture, GameObjects, ScriptableObjects
- Can write MonoBehaviour logic, coroutines, event systems
- Can help with Unity-specific patterns (object pooling, scene management, input system)
- Can read Unity project files (`.unity`, `.prefab` are YAML — readable but verbose)

**What doesn't work:**
- Claude Code cannot open the Unity Editor, run Play mode, or see the scene visually
- Cannot drag-and-drop assets, configure the Inspector, or wire up component references via UI
- Shader Graph, Animator controllers, and Tilemap painting require the Editor

**Practical workflow with Claude Code + Unity:**
1. Claude writes C# scripts and project structure
2. You open Unity Editor to wire up references, test in Play mode, configure visual assets
3. Claude iterates on the scripts based on your feedback
4. This works well — similar to how you'd use Claude for any non-visual code

---

## Summary Decision Tree

```
Right now (April 2026):
  → Finish Phaser prototype (3-4 months)
  → Use it for grant demos + early user testing

~6-9 months from now:
  → Migrate hub world to Unity
  → Keep all 36 HTML games as-is (engine-agnostic)
  → Build 3D game scenes natively in Unity

~12-24 months from now:
  → Developer hire joins a Unity codebase they know
  → Scale from there
```

---

*Created: April 2026*
