---
phase: 02-deployed-themed-skeleton
plan: 07
subsystem: motion
tags: [reduced-motion, react-spring, motion, motion-primitives, lazy-loading, adr, playwright, vitest]
requires:
  - phase: 02-deployed-themed-skeleton
    provides: theme toggle with react-spring thumb and the @/anim barrel (02-05), initial JS budget gate and verify chain (02-06), CSS reduced-motion guard (02-02), hero shell parity test (02-04)
provides:
  - src/anim/useMotionPreference.ts, the single JS source of prefers-reduced-motion (useSyncExternalStore, live change listener, safe without matchMedia)
  - src/anim/MotionPreferenceProvider.tsx feeding motion MotionConfig ('always' or 'never') and react-spring Globals skipAnimation, reset on unmount
  - src/app/Providers.tsx wrapping the header and Page in App
  - src/anim/declarative/TextReveal.tsx, a lazy TextEffect behind an error boundary with one static paragraph for loading, failed and reduced states
  - vendored src/components/motion-primitives/text-effect.tsx (unmodified) and src/lib/utils.ts cn()
  - hero role line animated per word (slide, about 0.35 s) without touching the name or CTAs
  - ADR-0007 recording the vendoring with source URL, date, sha256 and bundle sizes
affects: [02-08, 02-09]
status: complete
commits: 4
plan_head_before: 329db23cf3042d7a1ed07b4e251f88652fa4d3e5
plan_head_after: 7ded6cd041d5f0dfc91a63f0c1bd493679a8ae6b
actuals:
  tokens: 7700
  tasks: 3
  commits: 4
tech-stack:
  added: []
  patterns: [one preference hook feeding MotionConfig, react-spring Globals and a decorative wrapper, lazy vendored primitive behind Suspense plus a class error boundary with a plain-paragraph fallback, e2e reads taken two animation frames after a click to separate a snapped value from a spring]
key-files:
  created:
    - src/anim/useMotionPreference.ts
    - src/anim/MotionPreferenceProvider.tsx
    - src/anim/declarative/TextReveal.tsx
    - src/app/Providers.tsx
    - src/lib/utils.ts
    - src/components/motion-primitives/text-effect.tsx
    - tests/unit/motion-preference.test.tsx
    - tests/e2e/motion.spec.ts
    - docs/adr/0007-vendored-motion-primitives.md
  modified:
    - src/anim/index.ts
    - src/app/App.tsx
    - src/sections/Hero/Hero.tsx
    - tests/unit/hero-parity.test.tsx
    - docs/adr/README.md
key-decisions:
  - "TextEffect uses the slide preset (opacity plus translateY per word, as the motion spec asks) with speedReveal 3 and speedSegment 2; 13 segments, about 0.35 s in total"
  - "The vendored file is hashed once (sha256 4b93c0ea...3484) and never formatted; ADR-0007 holds the hash and Task 3 verify re-checks it against disk"
  - "The reduced-motion visibility test waits for document.getAnimations() to reach 0 instead of reading it instantly, because the L1 CSS guard turns a theme change's color transitions into 0.01 ms transitions that exist for one frame"
requirements-completed: [MOT-01]
coverage:
  - id: D1
    description: "One hook reads prefers-reduced-motion with a live change listener and feeds motion MotionConfig, react-spring skipAnimation and the role-line wrapper; the CSS guard is the third consumer"
    requirement: MOT-01
    verification:
      - kind: unit
        ref: "tests/unit/motion-preference.test.tsx (default false, live flip both ways, missing matchMedia, skipAnimation true/false/reset on unmount, useReducedMotionConfig)"
        status: pass
      - kind: command
        ref: "grep -rln \"matchMedia('(prefers-reduced-motion\" src lists only src/anim/useMotionPreference.ts"
        status: pass
    human_judgment: false
  - id: D2
    description: "Under reduced motion the theme thumb is at matrix(1, 0, 0, 1, 20, 0) two frames after the click; with no preference it is mid-spring first and arrives within 2 s"
    requirement: MOT-01
    verification:
      - kind: e2e
        ref: "tests/e2e/motion.spec.ts#reduced motion: theme thumb snaps to its target; #motion: theme thumb animates with no preference"
        status: pass
    human_judgment: false
  - id: D3
    description: "Role line is static text with no per-word spans and no extra JS requested under reduced motion; per-word spans run for others while name and CTAs stay at opacity 1 with no animations; a failed chunk leaves the readable sentence and a live page"
    requirement: MOT-01
    verification:
      - kind: e2e
        ref: "tests/e2e/motion.spec.ts (three 'role line' tests)"
        status: pass
      - kind: unit
        ref: "tests/unit/hero-parity.test.tsx (default and reduced-motion parity)"
        status: pass
    human_judgment: false
  - id: D4
    description: "With reduced motion every hero element and the six section headings are visible at opacity 1 with no running animation, before and after a theme toggle; built CSS carries the guard; initial JS 86,954 B gzipped, under 120,000"
    requirement: MOT-01
    verification:
      - kind: e2e
        ref: "tests/e2e/motion.spec.ts#reduced motion: every hero element and section heading is visible with no running animations"
        status: pass
      - kind: command
        ref: "JS_BUDGET_BYTES=120000 npm run check:budget; grep prefers-reduced-motion dist/assets/*.css; npm run verify exit 0"
        status: pass
    human_judgment: false
  - id: D5
    description: "The role line's re-reveal when the effect chunk arrives (about 0.35 s, 7 words) reads as intentional rather than as a flicker on a phone"
    requirement: MOT-01
    verification: []
    human_judgment: true
    rationale: "Taste call (Research Open Question 2); folded into the end-of-phase review at a 375 px viewport, once with motion and once with the OS reduce-motion setting on"
duration: 11 min
completed: 2026-10-18
---

# Phase 2 Plan 07: Motion Preference Summary

One `useMotionPreference` hook now governs motion, react-spring and the role line, the hero role line gets a lazily loaded vendored TextEffect (about 50 kB gzipped in its own chunk) that is static text under reduced motion and survives a failed chunk, and ADR-0007 records the vendoring with its sha256.

## Task 1: Tracer (RED ffcbf58, GREEN 2a40d4c)

- RED: unit and browser tests first; the unit file failed on the missing modules.
- `useMotionPreference` uses `useSyncExternalStore` over `matchMedia('(prefers-reduced-motion: reduce)')` with a change listener; the snapshot is false when `matchMedia` is missing or on the server. `MotionPreferenceProvider` sets `Globals.assign({ skipAnimation })` in an effect that resets to false on cleanup and renders `MotionConfig` with `'always'` or `'never'` (never `'user'`, so motion reads no second query). `Providers` wraps the header and `Page` in `App`.
- Browser proof (Chromium): reduced, the thumb is at `matrix(1, 0, 0, 1, 20, 0)` two frames (about 33 ms) after the click; no preference, the first read is not the end matrix and it arrives within 2 s. Mutation check: replacing `Providers` with a passthrough made the reduced test fail with `matrix(1, 0, 0, 1, 1.28163, 0)`, so the test discriminates.
- Tracer feedback gate: `<verify>` is automated-only, so the full chain was re-run after the commit (unit 5 passed, build, thumb tests 2 passed, lint, Prettier check). Tracer verified end-to-end, expanding. No checkpoint.

## Task 2: Role line TextEffect (commit a2be398)

- Precondition passed (registry URL returned 200). The registry JSON had `dependencies: ["motion"]`, empty `registryDependencies` and one file; its content was written unmodified. Its imports are only `react`, `motion/react` and `@/lib/utils`, with no fetch, storage, eval or dynamic code.
- **sha256 of `src/components/motion-primitives/text-effect.tsx`: `4b93c0ea6b9d747d69b7a244d5279f790a11a784e73713f3fe17a636abf53484`**, retrieved 2026-10-18 (unchanged after the final `npm run verify`).
- **Measured sizes (gzip level 9):** initial JS 86,954 B (87.0 kB; was 85,571 B before this plan); effect chunk `text-effect-*.js` 49,991 B. `JS_BUDGET_BYTES=120000 npm run check:budget` passes; the research probe measured an eager import at about 134.5 kB.
- `TextReveal`: `lazy()` import mapping the named export to default, per word, `slide`, `speedReveal` 3, `speedSegment` 2; a class `ChunkBoundary` (`getDerivedStateFromError`) around `Suspense`; the reduced branch returns the plain paragraph before the lazy component renders. `Hero` imports it from `@/anim`; the h1 and CTAs are untouched.
- Tests: hero parity gained a reduced-motion case; three browser tests ("role line"). Mutations confirmed both guards: removing the reduced early-return made the static-text test fail (duplicated sentence from the effect's screen-reader copy), and making the boundary a passthrough made the failed-chunk test fail (role line not visible).

## Task 3: Visibility proof and ADR (commit 7ded6cd)

- Browser test with reduced motion: h1, role line, three CTAs and the six section h2 headings are visible at opacity 1 and `document.getAnimations()` reaches 0, both on load and after a theme toggle.
- ADR-0007 in the house style (Status, Date 2026-10-18, five headings), README log row added. The ADR grep for private paths, planning decision IDs and phone shapes is clean. Built CSS contains `prefers-reduced-motion`.
- Human check (role-line feel at 375 px, with and without OS reduce-motion) is deferred to the end-of-phase review per `human_verify_mode`; recorded as coverage item D5.

## Plan-level verification

| Check | Result |
|-------|--------|
| `npx vitest run` (inside verify) | 58 passed, includes motion-preference (5) and hero parity (4) |
| `VITE_BASE=/aa-phan-portfolio-v2/ npx playwright test -g "reduced motion"` | 3 passed; full e2e run 17 passed |
| `JS_BUDGET_BYTES=120000 npm run check:budget` | pass (86,954 B) |
| `VITE_BASE=/aa-phan-portfolio-v2/ npm run verify` | exit 0 |
| Task acceptance greps (hook, provider, TextReveal, Hero, utils, vendored file) | pass |
| Nothing pushed | pass |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `vi.spyOn(Globals, 'assign')` cannot work**
- **Found during:** Task 1 GREEN
- **Issue:** `Globals` from `@react-spring/web` is a frozen module namespace, so `spyOn` throws "Cannot redefine property: assign".
- **Fix:** The provider test asserts the live binding `Globals.skipAnimation` (true under reduce, false after the flip, true again, false after unmount), which observes the actual effect rather than the call.
- **Files modified:** tests/unit/motion-preference.test.tsx
- **Commit:** 2a40d4c

**2. [Rule 1 - Bug] First-frame thumb read was too early**
- **Found during:** Task 1 GREEN
- **Issue:** Reading the transform in the first animation frame after a synchronous `click()` returned the start matrix even under skipAnimation, because react-spring applies the snap on its own frame.
- **Fix:** The reduced test reads two frames after the click, still far earlier than any spring could reach 20 px (the mutation check shows 1.28 px at that point).
- **Files modified:** tests/e2e/motion.spec.ts
- **Commit:** 2a40d4c

**3. [Rule 1 - Bug] Instant `getAnimations()` check saw one-frame transitions**
- **Found during:** Task 3
- **Issue:** After a theme toggle under reduced motion, the CSS guard shortens color transitions to 0.01 ms but they still exist for a frame, so an instant `document.getAnimations().length` read returned 2 or more.
- **Fix:** The test polls for 0 within 1 s. Nothing else was running and no production code changed.
- **Files modified:** tests/e2e/motion.spec.ts
- **Commit:** 7ded6cd

**Minor, no rule:** the hook calls `window.matchMedia('(prefers-reduced-motion: reduce)')` through a small `query()` helper rather than a `QUERY` constant, so the plan's grep criterion ("lists only useMotionPreference.ts") is literally satisfied. Task 2 had no separate RED commit: its unit parity case passes by construction on the unchanged structure, and the browser tests were written alongside the implementation and then mutation-checked.

**Total deviations:** 3 auto-fixed (2 bug, 1 blocking). **Impact:** none on scope or production code; all three were test-method corrections.

## Known Stubs

None.

## Threat Flags

None. T-02-19 (registry dependency fields asserted, imports reviewed, hash recorded in ADR-0007 and matched against the file on disk, only `src/anim` imports it by lint), T-02-20 (error boundary proven by aborting the chunk) and T-02-21 (every fallback is one plain paragraph; the effect path keeps the sentence in the paragraph text) are mitigated as planned.

## Next

Ready for 02-08. The end-of-phase review should include the 375 px role-line feel check (D5) listed above.

## Self-Check: PASSED

All fourteen key files verified on disk; commits ffcbf58, 2a40d4c, a2be398 and 7ded6cd are ancestors of HEAD; the ADR hash matches the vendored file.
