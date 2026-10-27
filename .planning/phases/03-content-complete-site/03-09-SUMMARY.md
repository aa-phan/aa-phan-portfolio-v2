---
phase: 03-content-complete-site
plan: "09"
subsystem: ui
tags: [pill-nav, mobile, motion, layout-animation, playwright, nav-04]

requires:
  - phase: 03-content-complete-site
    provides: useActiveSection scroll-spy, NAV_ITEMS and SECTION_IDS, store-backed ThemeToggle and phone top bar (03-08), CtaLink, ToastProvider offset that already clears a 56 px pill, MotionFeatures with the lazy domMax chunk
provides:
  - PillNav, the phone navigation below 768 px (Experience, Projects, Menu) with a non-modal menu panel holding six sections, the Theme row and a full-width Resume
  - PillMorph in the anim barrel, the in-place pill-to-panel layout morph with the gentle spring
  - CloseIcon inline SVG
  - --surface-frost, --scrim and --pill-reserve tokens, with body bottom padding below 768 px
  - A "mobile" Playwright project (Pixel 7, Chromium only) that runs tests/e2e/mobile/ only; the chromium project skips that folder
  - The automated NAV-04 10-second proxy at 375 x 667 with and without JavaScript
affects: [03-19 staging timed 10-second run, 03-15 footer (bottom reserve is already in place), Phase 4 motion polish]

status: complete
commits: 3
plan_head_before: d9dc3563fdd7e60db5033b1d55ffae41f9b20002
plan_head_after: 2fa72435e14ff8c45ec6d1b29161cbd6f333935b

actuals:
  tokens: 7000
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Layout morph: a fixed, pointer-events-none m.div layoutRoot with the collapsed height holds a bottom-aligned m.nav layout box, so the box animates and the root never resizes"
    - "Content swap inside the morph: keyed m.div layout=position with an opacity-only fade, initial gated on featuresLoaded"
    - "Close-after-tap: the tapped anchor is unmounted on a 0 ms timeout, after its default action, because a disconnected link cannot navigate"

key-files:
  created:
    - src/layout/PillNav.tsx
    - src/anim/declarative/PillMorph.tsx
    - src/components/ui/icons/CloseIcon.tsx
    - tests/e2e/mobile/pill.spec.ts
    - tests/e2e/mobile/ten-second.spec.ts
  modified:
    - playwright.config.ts
    - src/app/Page.tsx
    - src/anim/index.ts
    - src/styles/tokens.css
    - src/styles/interactions.css
    - tests/e2e/nav.spec.ts

key-decisions:
  - "layoutRoot sits on a separate fixed wrapper, not on the morphing nav: in motion 14 a layoutRoot element's own layout change is instant (type false), so putting it on the nav, as the research note suggested, killed the morph"
  - "The wrapper is fixed at the collapsed height (h-14, items-end) so it never resizes; the nav is bottom-aligned inside it and grows upward, which keeps the projected translate correct (a hugging wrapper gave the wrong direction)"
  - "The pill closes on a link or Resume tap through a 0 ms timeout, not inside the click handler, so the jump and the download still run"
  - "AnimatePresence is not used for the panel content: with an exit animation the row and the panel would stack in the box for the exit duration; the content swap is a keyed opacity fade instead"

patterns-established:
  - "Mobile-only specs live in tests/e2e/mobile/ and run on the Pixel 7 project; desktop specs run on chromium"
  - "Reduced-motion running-animation checks wait 100 ms and count playState running, because the base guard turns every change into a 0.01 ms transition"

requirements-completed: [NAV-02]
requirements-partial: [NAV-04]

duration: ~35 min
completed: 2026-10-27

coverage:
  - id: D1
    description: "Below 768 px a fixed, centered pill with Experience, Projects and Menu, each at least 44 px tall and 96 px wide; the segment of the section in view is aria-current=location; the pill does not move while the page scrolls; at 1280 the Sections nav is not in the accessibility tree"
    requirement: NAV-02
    verification:
      - kind: e2e
        ref: "tests/e2e/mobile/pill.spec.ts#pill"
        status: pass
    human_judgment: false
  - id: D2
    description: "Menu (aria-expanded, aria-controls) opens a panel with six sections, a Theme row with the toggle and a Resume download; closes on Close, a link, the scrim and Escape; focus goes to Close then back to Menu; the page behind still scrolls and nothing is inert or aria-modal"
    requirement: NAV-02
    verification:
      - kind: e2e
        ref: "tests/e2e/mobile/pill.spec.ts#pill"
        status: pass
    human_judgment: false
  - id: D3
    description: "The pill morphs through in-between widths with the gentle spring; reduced motion shows the panel at once with no running animation; with every lazy chunk aborted Menu opens and closes with no page error (T-03-14)"
    requirement: NAV-02
    verification:
      - kind: e2e
        ref: "tests/e2e/mobile/pill.spec.ts#pill morph"
        status: pass
      - kind: e2e
        ref: "tests/e2e/mobile/pill.spec.ts#pill under reduced motion"
        status: pass
    human_judgment: false
  - id: D4
    description: "At 375 x 667 the open panel is capped at 80dvh, scrolls internally and Resume stays reachable and downloads"
    verification:
      - kind: e2e
        ref: "tests/e2e/mobile/pill.spec.ts#pill morph on a short phone the open panel scrolls and Resume stays reachable"
        status: pass
    human_judgment: false
  - id: D5
    description: "At 375 x 667 the h1, role line, Download resume, Copy email and the pill's Experience and Projects segments are inside the first viewport, the four hero items end above the pill and nothing covers them; Experience, Projects, Resume (200 application/pdf, %PDF- body) and Copy email (clipboard plus status) are each one action"
    requirement: NAV-04
    verification:
      - kind: e2e
        ref: "tests/e2e/mobile/ten-second.spec.ts#ten-second: first viewport / one action each"
        status: pass
    human_judgment: false
  - id: D6
    description: "With JavaScript disabled the static shell still shows the name, role, Download resume and Copy email (mailto) inside the 375 x 667 first viewport"
    requirement: NAV-04
    verification:
      - kind: e2e
        ref: "tests/e2e/mobile/ten-second.spec.ts#ten-second: without JavaScript"
        status: pass
    human_judgment: false
  - id: D7
    description: "How the pill, the frosted panel and the morph look and feel on a real phone (spring feel, thumb reach, frost legibility over busy content); the timed human 10-second run"
    verification: []
    human_judgment: true
    rationale: "Visual and tactile taste; e2e asserts geometry, state and motion presence, not how it feels. The human timed run happens on staging in plan 03-19."
---

# Phase 3 Plan 09: Phone pill nav and the automated 10-second check Summary

**Below 768 px a bottom pill (Experience, Projects, Menu) jumps to sections in one tap and morphs in place, with the gentle spring, into a non-modal panel of all six sections, the theme switch and Resume; a 375 x 667 Playwright check proves the recruiter fast path with and without JavaScript.**

## Performance

- **Duration:** ~35 min
- **Completed:** 2026-10-27
- **Tasks:** 3 (1 tracer, 2 auto)
- **Files:** 11 (5 created, 6 modified)
- **Initial JS:** 115,889 B gz (was 114.9 kB before the plan); the 130,000 B target and the 150,000 B gate both pass

## Accomplishments

- Tracer: `PillNav` plus the `mobile` Playwright project. Pill fixed 16 px (plus the safe-area inset) above the bottom, centered, three segments at least 44 x 96 px, the section in view filled `--accent` with `aria-current="location"`. The panel (id `pill-panel`, `max-height: 80dvh`, internal scroll) lists the six sections with About Me and Contact Me in full, a Theme row reusing the store-backed `ThemeToggle`, and a full-width filled Resume. It is not modal: no trap, no inert, the page behind scrolls. Focus goes to Close on open and back to Menu on close.
- `PillMorph` in the anim barrel: the box is a layout animation with `springs.gentle.motion`, radius in `style` (9999 to 28), content wrapper `layout="position"`, opacity-only content fade. Before the chunk loads, after it fails, and under reduced motion (it is never fetched) every state change is instant.
- Page reserve: `--pill-reserve` pads the body below 768 px so the pill never covers the footer; the toast already clears it.
- NAV-04 proxy: first-viewport geometry and `elementFromPoint` coverage, one-tap reachability of Experience, Projects, Resume and Copy email, and the JS-disabled static shell, all at 375 x 667.

## Task Commits

1. **Task 1 (tracer): pill, panel, mobile project** - `34e6e43` (feat)
2. **Task 2: in-place morph and chunk-failure tests** - `ffb6185` (feat)
3. **Task 3: automated 10-second check** - `2fa7243` (test)

## Verification

- `npm run verify` (typecheck, lint, format, vitest, case, colors, contrast PASS, build, budget, no-phone): pass
- `npm run test:e2e`: 85 passed (67 chromium, 18 mobile)
- `JS_BUDGET_BYTES=130000 npm run check:budget`: 115,889 B gz
- All task acceptance criteria re-run and pass.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] layoutRoot on the morphing nav made the morph instant**
- **Found during:** Task 2
- **Issue:** The plan (and the research note) put `layoutRoot` on the fixed nav itself. In motion 14 a `layoutRoot` node's own layout transition is forced to `type: false`, so the pill snapped to the panel with no in-between frames.
- **Fix:** `PillMorph` renders a fixed, full-width, pointer-events-none `m.div layout layoutRoot` at the collapsed height (`h-14 items-end`), with the `m.nav layout` box bottom-aligned inside it. The root still carries `layoutRoot` (fixed element, scroll-aware) and never resizes; the box animates and grows upward. A first attempt with a hugging wrapper animated in the wrong direction, hence the fixed height.
- **Files modified:** src/anim/declarative/PillMorph.tsx, src/layout/PillNav.tsx
- **Verification:** the morph test samples in-between widths; reduced-motion and blocked-chunk tests pass
- **Commit:** ffb6185

**2. [Rule 1 - Bug] Closing the panel inside a link's click handler would cancel the jump**
- **Found during:** Task 1 (design, confirmed by the passing jump test with the deferred close)
- **Issue:** Unmounting the tapped anchor within its own click handler leaves a disconnected link, which cannot navigate or download.
- **Fix:** Section links and Resume close the panel through `setTimeout(..., 0)` after the default action.
- **Files modified:** src/layout/PillNav.tsx
- **Commit:** 34e6e43

**3. [Rule 3 - Blocking] Existing landmark test assumed no navigation at 375**
- **Found during:** Task 1
- **Issue:** `nav.spec.ts` asserted zero navigation landmarks at 375 (and its second assertion had been left at 0 after 03-07); the pill is now the one landmark there.
- **Fix:** The test now expects exactly one landmark at both widths (Primary at 1280, Sections at 375).
- **Files modified:** tests/e2e/nav.spec.ts
- **Commit:** 34e6e43

**4. [Rule 3 - Blocking] PillMorph interface differs from the plan contract**
- **Issue:** The contract was `PillMorph({ open, className?, children })`. The `layoutRoot` fix needs three class slots, so it also takes `rootClassName`, `contentClassName` and `aria-label`.
- **Impact:** None for callers beyond PillNav.

**5. AnimatePresence not used for the panel content**
- The plan said the content enters through `AnimatePresence`. With an exit animation both the row and the panel would sit in the box during the exit and inflate the layout, so the content swap is a keyed `m.div` with an opacity-in fade (no exit), gated on `featuresLoaded` per the project lesson. Observable behavior matches the plan: opacity only, duration 0 under reduced motion.

**Total deviations:** 3 auto-fixed (2 bugs, 1 blocking test update) plus 2 documented contract adjustments. **Impact:** none on scope or requirements.

## Known Stubs

None. The section bodies under the pill are still the 03-03 stubs, which later plans in this phase replace.

## Threat Flags

None. T-03-14 (motion chunk failure) is mitigated and tested: with every non-initial script aborted, Menu opens and closes with no page error.

## Notes for follow-up

- The scrim and panel are visually checked by a screenshot at 375 x 667 only; real-phone feel is left to the human run (coverage D7).
- NAV-04 is not marked complete: the project rule leaves it to phase-level acceptance. NAV-02 is marked complete here because the desktop half (03-07) and this phone half are both delivered.

## Next Phase Readiness

Ready for 03-10. The pill, its reserve and the mobile Playwright project are in place for the section plans that follow.

## Self-Check: PASSED

- Created files present: PillNav.tsx, PillMorph.tsx, CloseIcon.tsx, pill.spec.ts, ten-second.spec.ts
- Commits 34e6e43, ffb6185, 2fa7243 are ancestors of HEAD
