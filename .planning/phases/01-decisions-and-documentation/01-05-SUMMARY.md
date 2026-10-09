---
phase: 01-decisions-and-documentation
plan: 05
subsystem: docs
tags: [motion, reduced-motion, motion-primitives, react-spring, ownership, interactions]

requires:
  - phase: 01-01
    provides: "Motion spec seed: ownership rule, fixed 17-row IX catalog, IX-09 format"
provides:
  - "01-MOTION-SPEC.md (Accepted): principles, motion budget, spring/duration/easing tokens, single reduced-motion source with layers L0-L6, ownership matrix, vendored primitives list, 17 interaction specs, element ownership check"
affects: [01-07-wireframes, phase-02-scaffold, phase-04-motion-and-rail]

actuals:
  tokens: 5400
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Every interaction has exactly 12 labeled bullet lines and exactly one owner library"
    - "Nested-element ownership: react-spring on the outer rail item, motion layoutId on the inner card; Magnetic on the outer CTA wrapper, react-spring squish on the inner button"

key-files:
  created: []
  modified:
    - .planning/phases/01-decisions-and-documentation/01-MOTION-SPEC.md

key-decisions:
  - "react-spring owns exactly four interactions (IX-02, IX-03, IX-06, IX-10); IX-14 uses motion layout expand so the scope stays at four"
  - "Spring tokens snappy 500/32/1, gentle 170/26/1, bouncy 300/14/1 are starting values, tuned on real phones during the rail work"
  - "One useMotionPreference hook feeds MotionConfig, Globals.assign({ skipAnimation }) and the CSS guard; Lenis is not started under reduced motion"
  - "Whether react-spring stays at all is decided after the rail is measured"

patterns-established:
  - "Reduced-motion fallback is mandatory per interaction, with non-motion feedback (L5) where motion carried meaning"

requirements-completed: [DOC-05]

duration: 5min
completed: 2026-10-09
status: complete
---

# Phase 1 Plan 05: Motion spec Summary

**Complete motion spec: tokens in both libraries' formats, a single reduced-motion source with seven layers, an ownership matrix and 17 interaction specs (owner, touch equivalent, keyboard path, reduced-motion fallback) ending in an element ownership check showing no element has two animating libraries.**

## Performance

- **Duration:** about 5 min (start time was not captured; estimated)
- **Completed:** 2026-10-09
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Added Principles (content never gated by motion, transform and opacity only, fine-pointer gate `(hover: hover) and (pointer: fine)`, entrance at most 420 ms, stagger at most 60 ms for at most 6 items), Motion tokens (three springs in motion and react-spring formats, three durations, ease-out `cubic-bezier(0.22, 1, 0.36, 1)`), Reduced motion (hook, three consumers, L0 to L6), Ownership matrix with constraints, and Vendored motion-primitives (TextEffect or TextLoop, MorphingDialog, AnimatedNumber, InfiniteSlider, Tilt/Magnetic/Spotlight; Cursor and Dock excluded).
- Specified IX-01..IX-17 in the 12-label format. Owner counts: motion 11, react-spring 4, CSS 1 (IX-04 with `scroll-snap-type`), Lenis 1 (IX-16 with `syncTouch` and `respectReducedMotion`). Owners match the catalog index for all 17 rows.
- Added the Element ownership check (rail item, CTA buttons, experience card, theme toggle) ending with "No element has two owner libraries." and set Status: Accepted.
- Both automated verifies printed their markers (MOTION-BASE-OK, MOTION-OK); the phone-number-shape negative grep returned nothing.

## Task Commits

1. **Task 1: Principles, budget, tokens, reduced-motion layers, ownership matrix, vendored primitives** - `0900c06` (docs)
2. **Task 2: 16 interaction specs, element ownership check, status Accepted** - `a94b613` (docs)

## Deviations from Plan

None - plan executed exactly as written. The file header sentence describing what plan 01-05 adds was reworded to past tense when the status moved to Accepted.

## Issues Encountered

None.

## Known Stubs

None.

## Threat Flags

None. Docs only; T-01-13 and T-01-14 are mitigated by the content-visible-by-default principle, IX-15, the per-interaction reduced-motion and keyboard lines, and the ownership check.

## Next Phase Readiness

- Plan 01-07 can annotate wireframes with the IX IDs, which are now fully specified.
- Phase 2 can wire MOT-01 from the Reduced motion section; Phase 4 builds the rail and motion system from the interaction specs.
- Open for Phase 4: spring numbers need on-device tuning, the overlay dialog primitive depends on the overlay accessibility ADR (plan 01-06), and the L6 visible toggle remains an open decision.

## Self-Check: PASSED

- 01-MOTION-SPEC.md exists with all required headings, 17 IX subsections, 17 owner/touch/keyboard/reduced-motion lines, 4 react-spring owner lines.
- Commits 0900c06 and a94b613 exist.
- `references/` and the three untracked/modified `.planning` state files were never staged.
