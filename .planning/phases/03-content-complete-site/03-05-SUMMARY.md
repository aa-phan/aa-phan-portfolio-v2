---
phase: 03-content-complete-site
plan: "05"
subsystem: ui
tags: [clipboard, toast, live-region, lazy-motion, motion, bundle-budget, playwright]

requires:
  - phase: 03-content-complete-site
    provides: Hero({ profile, email }) fed from the typed contact module (03-04)
provides:
  - src/lib/copy.ts with copyText (Clipboard API, then execCommand), openMail, COPY_SUCCESS, COPY_FALLBACK
  - ToastProvider with a persistent role=status live region and one visual pill; useToast and useCopyEmail hooks
  - MotionFeatures (LazyMotion, async domMax chunk) and ToastPresence (220 ms opacity plus 8 px rise) exported from the @/anim barrel
  - Hero Copy email wired to the handler while keeping its mailto href
affects: [03-15 contact section copy button, every later plan that shows a toast or uses m components]

status: complete
commits: 2
plan_head_before: 07d18e33b1063a04fe2b67af2af644c5c3ff5c71
plan_head_after: 0c9fb2f66297bfbaf09af5d2e4f5e3d7888399ca

actuals:
  tokens: 5300
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Progressive enhancement: the hero Copy email stays a mailto anchor; React adds onClick that preventDefaults, copies, then toasts, or toasts the fallback and opens mail"
    - "Persistent polite live region cleared then rewritten on the next frame so a repeated message is announced again; the visual pill is aria-hidden"
    - "m components are imported as * from motion/react-m (not from the motion/react barrel) so the full motion proxy and feature bundle stay out of the initial chunk"
    - "A tiny external store (featuresStatus) tells m components whether the lazy feature bundle loaded; an initial style only animate can undo is applied only when it did"

key-files:
  created:
    - src/lib/copy.ts
    - src/components/ui/Toast.tsx
    - src/components/ui/useToast.ts
    - src/components/ui/useCopyEmail.ts
    - src/anim/MotionFeatures.tsx
    - src/anim/features.ts
    - src/anim/featuresStatus.ts
    - src/anim/declarative/ToastPresence.tsx
    - tests/unit/copy.test.ts
    - tests/e2e/copy-email.spec.ts
  modified:
    - src/app/Providers.tsx
    - src/sections/Hero/Hero.tsx
    - src/anim/index.ts

key-decisions:
  - "m is imported from motion/react-m, because importing it from the motion/react barrel made rolldown keep the full motion proxy and feature bundle in the entry chunk (initial JS 139,066 B gz); with react-m the initial JS is 113,348 B gz"
  - "Reduced-motion visitors never download the motion features chunk: the LazyMotion loader never settles and the idle warm-up is skipped (the existing motion.spec asserts no lazy JS loads under reduced motion)"
  - "Until the feature chunk has loaded, the toast renders at its final state (no initial style), otherwise it would be stranded at opacity 0"

patterns-established:
  - "Component files export only components; contexts and hooks live in sibling .ts files (react/only-export-components warns fail lint)"
  - "e2e checks of animated UI assert computed opacity, because Playwright toBeVisible ignores opacity 0"

requirements-completed: []
requirements-partial: [NAV-03]

duration: ~8 min
completed: 2026-10-27

coverage:
  - id: D1
    description: "Hero Copy email writes the address to the clipboard and the persistent status region reads 'Email copied to clipboard'; JS-off keeps the mailto link"
    requirement: NAV-03
    verification:
      - kind: e2e
        ref: "tests/e2e/copy-email.spec.ts#copy email: click copies the address and announces and shows the toast"
        status: pass
      - kind: e2e
        ref: "tests/e2e/copy-email.spec.ts#copy email: JS disabled keeps a working mailto link"
        status: pass
    human_judgment: false
  - id: D2
    description: "Failure path: both copy paths failing shows the fallback copy and opens the mail app without a page error"
    requirement: NAV-03
    verification:
      - kind: e2e
        ref: "tests/e2e/copy-email.spec.ts#copy email: both copy paths failing shows the fallback copy and opens mail"
        status: pass
      - kind: unit
        ref: "tests/unit/copy.test.ts"
        status: pass
    human_judgment: false
  - id: D3
    description: "One toast at most, replaced and re-timed on repeat activation; reduced motion shows it at once; lazy chunks blocked still copy and announce"
    requirement: NAV-03
    verification:
      - kind: e2e
        ref: "tests/e2e/copy-email.spec.ts#copy email toast"
        status: pass
    human_judgment: false
  - id: D4
    description: "Toast enters with a 220 ms opacity and 8 px rise through the @/anim barrel; whether the motion feels right on a real phone"
    requirement: NAV-03
    verification:
      - kind: command
        ref: "JS_BUDGET_BYTES=125000 VITE_BASE=/aa-phan-portfolio-v2/ npm run check:budget"
        status: pass
    human_judgment: true
    rationale: "Timing and feel of the rise are judgment calls; tests assert presence, opacity and budget, not perceived quality"
---

# Phase 3 Plan 05: Copy email with a toast Summary

**The hero Copy email now copies aaron.phan240@gmail.com (Clipboard API, then execCommand), confirms through a persistent polite live region plus a single pill toast that animates through a LazyMotion-based anim barrel, and falls back to opening the mail app; initial JS is 113,348 B gz.**

## Performance

- **Duration:** ~8 min
- **Tasks:** 2 (1 tracer, 1 auto/tdd)
- **Files:** 10 created, 3 modified

## Accomplishments

- Tracer: click on #hero Copy email copies the address, `getByRole('status')` reads "Email copied to clipboard", the pill shows and is gone within 6 s, the URL does not change; with JS off the link is still `mailto:aaron.phan240@gmail.com`. Verified end-to-end (typecheck, lint, hero-parity, boundaries, smoke and copy e2e), then expanded.
- Failure path: with `writeText` rejecting and `execCommand` returning false the status reads "Couldn’t copy the address. Opening your mail app instead.", mail is opened and no page error occurs.
- Toast animation through `@/anim`: `ToastPresence` (opacity 0 to 1, y 8 to 0, 220 ms, easeOut), 0 s under reduced motion. `MotionFeatures` wraps the app in `LazyMotion` with an async `domMax` chunk that is not modulepreloaded.
- Unit tests: 6 passing for `copyText` (API success, execCommand fallback with no leftover textarea, both failing, throwing execCommand, never reads the clipboard, message wording).
- e2e: reduced motion leaves no running animation; two clicks 1 s apart leave exactly one toast still present 3.5 s after the second; with every lazy chunk blocked the click still copies, announces and shows the toast at opacity 1.
- Budget: **initial JS 113,348 B gz** (limit 125,000 B; research expected about 103 kB). Full `VITE_BASE=/aa-phan-portfolio-v2/ npm run verify` exits 0 (its default 150,000 B budget gate also passes).

## Task Commits

1. **Task 1 (tracer): copy the email from the hero and hear and see the confirmation** - `2ea47c6` (feat)
2. **Task 2: toast through the anim barrel, mail fallback, reduced motion** - `0c9fb2f` (feat)

## Deviations from Plan

**1. [Rule 3 - Blocking] Import `m` from `motion/react-m` instead of the `motion/react` barrel**
- **Found during:** Task 2 (budget measurement)
- **Issue:** With `m` and `AnimatePresence` imported from `motion/react`, rolldown kept the full `motion` proxy and its feature bundle in the entry chunk, taking initial JS to 139,066 B gz, over the 125,000 B budget. Bisecting showed LazyMotion plus `AnimatePresence` cost about 12 kB and `m` from the barrel about 29 kB more.
- **Fix:** `import * as m from 'motion/react-m'` in `ToastPresence.tsx` (still inside `src/anim`, so the lint boundary holds). `AnimatePresence`, `LazyMotion` and `domMax` still come from `motion/react`.
- **Files modified:** src/anim/declarative/ToastPresence.tsx
- **Verification:** `check:budget` reports 113,348 B; every Playwright test passes.
- **Commit:** 0c9fb2f

**2. [Rule 1 - Bug] Toast invisible when the feature chunk never loads**
- **Found during:** Task 2 (new e2e for blocked chunks, asserting computed opacity)
- **Issue:** `m.div initial={{ opacity: 0 }}` stays at opacity 0 when no animate feature is present, so a failed or blocked chunk left the toast invisible although Playwright's `toBeVisible` passed.
- **Fix:** Added `src/anim/featuresStatus.ts` (a small external store set when the bundle resolves); `ToastPresence` applies `initial` only when the bundle has loaded, otherwise the toast renders at its final state. Not in the plan's file list.
- **Files modified:** src/anim/featuresStatus.ts, src/anim/MotionFeatures.tsx, src/anim/declarative/ToastPresence.tsx, tests/e2e/copy-email.spec.ts
- **Commit:** 0c9fb2f

**3. [Rule 1 - Bug] Idle warm-up broke the reduced-motion "no lazy JS" test**
- **Found during:** Task 2 (`tests/e2e/motion.spec.ts`)
- **Issue:** LazyMotion calls its loader at mount and the plan's idle warm-up also fetched the chunk, so reduced-motion visitors downloaded the motion features, which `motion.spec.ts` ("role line is static text") forbids.
- **Fix:** When the preference is reduced at mount the loader never settles and the warm-up is skipped; nothing animates for those visitors anyway. A later switch to no-preference leaves toasts static until reload.
- **Files modified:** src/anim/MotionFeatures.tsx
- **Commit:** 0c9fb2f

**Total deviations:** 3 auto-fixed (1 blocking, 2 bugs). **Impact:** one extra small file (`featuresStatus.ts`); behavior matches the plan's must-haves. TDD note: `copyText` already existed from Task 1, so the new unit tests passed on first run (no RED step was meaningful); they were still written against the behavior block and exercise each branch.

## Requirements

NAV-03 is declared by this plan, 03-04 and 03-15. This plan delivers the hero half end to end, but `requirements.ready-ids` holds the ID until 03-15 (Contact copy button) has its SUMMARY, so it is not marked complete here. NAV-04 and CNT-04 untouched, as instructed.

## Known Stubs

None introduced.

## Threat Flags

None. T-03-06 mitigated: only the constant public address is written, only inside a click handler; `grep readText src/lib/copy.ts` finds nothing and the unit test asserts a spy `readText` is never called. T-03-07 mitigated: one toast, repeat clicks replace the message and restart one timer (e2e covers it).

## Self-Check: PASSED

- Files exist: src/lib/copy.ts, src/components/ui/{Toast.tsx,useToast.ts,useCopyEmail.ts}, src/anim/{MotionFeatures.tsx,features.ts,featuresStatus.ts,declarative/ToastPresence.tsx}, tests/unit/copy.test.ts, tests/e2e/copy-email.spec.ts.
- Commits 2ea47c6 and 0c9fb2f are ancestors of HEAD; `commits: 2` measured from the ledger.
- Acceptance criteria: aria-live and role="status" in Toast.tsx; no readText in copy.ts; useCopyEmail in Hero.tsx; mailto href in index.html; LazyMotion present and `strict` absent in MotionFeatures.tsx; `grep -rln motion/react src` lists only src/anim and src/components/motion-primitives; copy.test.ts 6 passed; dist/index.html does not reference the features chunk.
- Plan verification: copy unit tests, `check:budget` at 125,000 B (113,348 B), copy-email and motion e2e (14 passed), `npm run verify` exit 0.
