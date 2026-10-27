---
phase: 03-content-complete-site
plan: "10"
subsystem: ui
tags: [experience, details, summary, index-list, content, parity-tests, playwright]

requires:
  - phase: 03-content-complete-site
    provides: ExperienceEntry schema and siteContent (03-02), Section and Container layout, poster-grid and ladder utilities, interactions.css hover conventions, the inventory parser in content-inventory.test.ts, hero-parity skeleton check
provides:
  - src/content/experience.ts, five entries EXP-01 to EXP-05 verbatim, joined into siteContent
  - Experience section, an index list of five native details rows with a 24 px slot, monogram chips, plus or minus marker, location line and three bullets
  - Experience row hover, focus and press treatment in interactions.css (rule draw, --secondary wash, font-stretch 112% at 1024 px and up)
  - tests/e2e/content.spec.ts, tests/unit/sections.test.tsx, experience date order and EXP parity unit tests
affects: [03-11 logos into the 24 px slots, 03-14 and 03-15 sections that extend content.spec.ts and sections.test.tsx, 03-19 acceptance]

status: complete
commits: 2
plan_head_before: 2057990dcd5d3fb0eb0f88a820ee2662dac98668
plan_head_after: f884195e96735a2619d6b0877f89bf177310f2c7

actuals:
  tokens: 6700
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Summary-as-row: a details summary is a 12-column grid (three stacked lines below 768 px, two lines to 1023 px, one line from 1024 px) and the open body shares the same padding so both sit on the same columns"
    - "Row wash reaches 12 px past the content edge by negative margin and equal padding, and the drawn rule is inset by the same amount so it matches the 1 px rule under the row"
    - "The h3 is the company heading inside the summary and holds the aria-hidden chip, so its accessible name is the organisation alone"

key-files:
  created:
    - src/content/experience.ts
    - src/sections/Experience/Experience.tsx
    - tests/e2e/content.spec.ts
    - tests/unit/sections.test.tsx
  modified:
    - src/content/index.ts
    - src/app/Page.tsx
    - src/sections/Stubs/SectionStubs.tsx
    - src/styles/interactions.css
    - tests/unit/content.test.ts
    - tests/unit/content-inventory.test.ts

key-decisions:
  - "The chip lives inside the company h3 (aria-hidden) rather than in a wrapper span around the h3, because a span may not contain a heading; accessible name stays the organisation"
  - "The marker is absolutely positioned at the height of the first company line (var(--text-m) x 1.35) so it centres on line one at every breakpoint, including when the company wraps"
  - "Ids stay unique per array rather than globally: a global rule would trap legitimate later collisions such as a project and an experience both called spectrum"
  - "The Experience section takes a local structural row type, not ExperienceEntry, because only Page.tsx may import from @/content (lint-enforced); 03-11 widens it with the logo"

patterns-established:
  - "Experience e2e reads company names from .exp-name, since the h3 text also carries the aria-hidden chip letters"
  - "Content sections place themselves ahead of SectionStubs in Page.tsx and delete their stub line, so the remaining stubs keep document order"

requirements-completed: []
requirements-partial: [CNT-01, CNT-02]

duration: ~25 min
completed: 2026-10-27

coverage:
  - id: D1
    description: "Experience renders five rows newest first (Capital One, Spectrum, Symbotic, OdderTech IT, The University of Texas at Austin) from src/content/experience.ts as native details rows, all closed, any number open, opening by click, Enter or Space"
    requirement: CNT-01
    verification:
      - kind: e2e
        ref: "tests/e2e/content.spec.ts#shows five rows in the inventory order, all closed"
        status: pass
      - kind: e2e
        ref: "tests/e2e/content.spec.ts#every row is focusable and Enter opens it onto three bullets"
        status: pass
      - kind: e2e
        ref: "tests/e2e/content.spec.ts#a click toggles a row and Space closes it again"
        status: pass
    human_judgment: false
  - id: D2
    description: "The five entries equal inventory EXP-01 to EXP-05 in order and text (role, org, location undefined when not stated, dates label, bullets), start dates are non-increasing, and the Spectrum bullet keeps its less-than-or-equal sign and 30%"
    requirement: CNT-02
    verification:
      - kind: unit
        ref: "tests/unit/content-inventory.test.ts#experience parity with the inventory"
        status: pass
      - kind: unit
        ref: "tests/unit/content.test.ts#keeps experience start dates non-increasing in array order (ties allowed)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Every row starts with a 24 px slot of constant size; OdderTech IT and UT Austin show aria-hidden monogram chips OT and UT and omit the location line; an entry without a logo renders no img"
    verification:
      - kind: e2e
        ref: "tests/e2e/content.spec.ts#OdderTech IT and UT Austin show aria-hidden monogram chips; slots keep one size"
        status: pass
      - kind: unit
        ref: "tests/unit/sections.test.tsx#shows the monogram chip and no img for an entry without a logo"
        status: pass
    human_judgment: false
  - id: D4
    description: "At 390 px the UT Austin dates sit below its title with no overlap and the page does not scroll sideways"
    verification:
      - kind: e2e
        ref: "tests/e2e/content.spec.ts#at 390 px the UT Austin dates sit below its title with no overlap"
        status: pass
    human_judgment: false
  - id: D5
    description: "Row hover draws the rule to full width, washes the row with --secondary and widens the company name to font-stretch 112% at 1280 px but not at 900 px; under reduced motion the rule is full at once and the width stays 100%"
    verification:
      - kind: e2e
        ref: "tests/e2e/content.spec.ts#hover widens the company name at 1280 px and not at 900 px"
        status: pass
      - kind: e2e
        ref: "tests/e2e/content.spec.ts#hover washes the row and draws the rule to full width"
        status: pass
      - kind: e2e
        ref: "tests/e2e/content.spec.ts#reduced motion shows the final state with no width change"
        status: pass
    human_judgment: false
  - id: D6
    description: "Visual quality of the list at phone, tablet and desktop widths (rhythm, wash edge against the text, open-row spacing, empty slot indent for the three rows that await logos)"
    verification: []
    human_judgment: true
    rationale: "Screenshots at 390, 900 and 1280 px were read by the executor, and the open-row top padding was adjusted after the first look, but taste calls on spacing and the wash edge need the owner"

# Metrics
---

# Phase 3 Plan 10: Experience Summary

**Five-role Experience index list built from native details and summary rows, transcribed verbatim from the content inventory with a constant 24 px slot, monogram chips, and a rule, wash and font-stretch hover**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-10-27
- **Completed:** 2026-10-27
- **Tasks:** 2 of 2
- **Files modified:** 10 (4 created, 6 modified)

## Accomplishments

- `src/content/experience.ts` holds EXP-01 to EXP-05 verbatim (en dash date labels, the Spectrum less-than-or-equal sign, locations omitted for OdderTech IT and UT Austin, monograms OT and UT) and joins `siteContent`.
- `Experience` renders each role as `li > details > summary`: a 24 px slot, the company as an h3, the title, dates and a two-bar plus or minus marker. It works without JavaScript, starts closed, and any number of rows may be open. The open body shows the location line when known and three bullets at a 62ch measure from column 7 at 768 px and up.
- Layout follows the UI-SPEC breakpoints: one line on the 12-column grid from 1024 px, two lines from 768 px, three stacked lines below (dates on line three, so the long UT Austin name never collides).
- Row treatment in `interactions.css`: the rule draws left to right in 220 ms, the row washes to `--secondary`, and the company name widens from 100% to 112% font-stretch only at 1024 px and up. Focus-visible gets the same plus the global ring, `:active` gets the wash, hover is gated to `(hover: hover)`, and reduced motion shows the rule and wash at once with no width change.
- Tests: `content.spec.ts` (9 chromium tests), `sections.test.tsx` (7 tests), experience date order and ISO shape in `content.test.ts`, and EXP-01 to EXP-05 parity in `content-inventory.test.ts`.
- Verify gates: `npm run verify` exits 0 (initial JS 117,402 B gz of 150,000 B, up from 115.9 kB), and the full Playwright suite is 95 passed across the chromium and mobile projects.

## Task Commits

1. **Task 1: Tracer, Experience renders five typed entries as an index list** - `ea286c7` (feat)
2. **Task 2: Content rules, inventory parity and section tests cover Experience** - `f884195` (test)

**Plan metadata:** added by the docs commit that follows this file.

_Note: Task 2 is marked tdd="true" but its tests were written after the Task 1 implementation by the plan's own ordering, so the new tests passed on first run for the right reasons (they compare against the inventory file, not the module's own values). Only one cycle commit (test) exists._

## Files Created/Modified

- `src/content/experience.ts` - five typed experience entries
- `src/content/index.ts` - experience added to `siteContent`
- `src/sections/Experience/Experience.tsx` - index list with details rows
- `src/app/Page.tsx` - passes `siteContent.experience` to Experience ahead of the remaining stubs
- `src/sections/Stubs/SectionStubs.tsx` - Experience stub removed (the index.html shell stub stays)
- `src/styles/interactions.css` - `.exp-*` layout and hover, focus, press and reduced-motion rules
- `tests/e2e/content.spec.ts` - order, keyboard, overlap, slot and hover tests
- `tests/unit/sections.test.tsx` - section render tests from props
- `tests/unit/content.test.ts`, `tests/unit/content-inventory.test.ts` - date order and EXP parity

## Decisions Made

See key-decisions above. The chip sits inside the h3, the marker is sized to the first company line, ids stay unique per array, and the section takes a local props type because of the content import boundary.

## Deviations from Plan

None - plan executed exactly as written. Two small in-task adjustments, neither a rule deviation: the e2e company-name locator targets `.exp-name` because the h3 text includes the chip letters, and the open body got 16 px top padding after the first screenshot showed the location line crowding the rule.

## Issues Encountered

None. The static `index.html` Experience shell stub is unchanged and the hero-parity skeleton check (ids and h2 text) still passes, so the only mount-time change is the section growing from the 40svh stub to its real height below the fold.

## Known Stubs

The 24 px slots of Capital One, Spectrum and Symbotic are intentionally empty until plan 03-11 renders their logos there. All other sections remain 40svh stubs for later plans.

## Threat Flags

None. No new endpoints or trust-boundary surface. T-03-31 is mitigated: strings are checked against the inventory by the parity test, `content.test.ts` walks `siteContent.experience` for phone shapes and `tel:` links, and `check:no-phone` passed on dist.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 03-11 can fill the three logo slots: the `.exp-slot` span is in place and `Experience` only needs the logo field added to its local row type.
- CNT-01 (six sections from typed modules) and CNT-02 (all v1 content) advance but stay pending: Experience is done, the other sections are not. `requirements mark-complete` was not called.

---
*Phase: 03-content-complete-site*
*Completed: 2026-10-27*

## Self-Check: PASSED

- FOUND: src/content/experience.ts, src/sections/Experience/Experience.tsx, tests/e2e/content.spec.ts, tests/unit/sections.test.tsx
- FOUND commits ea286c7 and f884195 on HEAD
- Acceptance criteria: details and summary present, `satisfies readonly ExperienceEntry` present, stub id gone, EXP-05 and Experience greps pass, sections.test.tsx reports 7 passed
- Plan verification: `npx vitest run` passes, `VITE_BASE=/aa-phan-portfolio-v2/ npm run verify` exit 0, chromium content.spec.ts passes, full Playwright suite 95 passed
