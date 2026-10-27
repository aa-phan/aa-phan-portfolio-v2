---
phase: 03-content-complete-site
plan: "12"
subsystem: ui
tags: [projects, crate, scroll-snap, native-dialog, react, tailwind]

requires:
  - phase: 03-content-complete-site
    provides: owner links and approved write-ups (03-02), image gate and verify chain (03-11)
provides:
  - Seven typed projects (PRJ-01 to PRJ-07) with the RecipeCart code link and three approved write-ups
  - Projects crate of typographic sleeves in a scroll-snap row with a live n / 7 index
  - Native ProjectDialog with Previous, Next, wrap, arrow keys, backdrop close, scroll lock, phone sheet
  - Interim CSS sleeve rise (IX-03 replaces it in Phase 4)
affects: [03-13 inverted band and sleeve grounds, Phase 4 sleeve physics and dialog morph, Phase 6 iPhone QA]

status: complete
commits: 2
plan_head_before: 61422c2c24e3883300fdfd8b1153ebab0ff56b39
plan_head_after: 973a64fee4b837efe3c4336a8b5dee3d695ee8c2

actuals:
  tokens: 12600
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "The native dialog element is the panel with no padding of its own; padding lives on an inner .project-panel so a click whose target is the dialog can only be a backdrop click"
    - "Sleeve carries data-kind (context kind) as the hook for plan 03-13's ground tokens"
    - "Section takes an optional aside rendered on the heading baseline; without it the markup is unchanged"

key-files:
  created:
    - src/content/projects.ts
    - src/sections/Projects/Projects.tsx
    - src/sections/Projects/Sleeve.tsx
    - src/sections/Projects/ProjectDialog.tsx
    - src/sections/Projects/project-types.ts
    - src/components/ui/icons/ChevronLeftIcon.tsx
    - src/components/ui/icons/ChevronRightIcon.tsx
    - tests/e2e/project-dialog.spec.ts
  modified:
    - src/content/index.ts
    - src/app/Page.tsx
    - src/layout/Section.tsx
    - src/sections/Stubs/SectionStubs.tsx
    - src/styles/interactions.css
    - tests/unit/content-inventory.test.ts
    - tests/unit/sections.test.tsx

key-decisions:
  - "Focus return: the sleeve focuses itself on click (Safari does not) and the dialog remembers document.activeElement only on the null-to-number transition, so stepping through projects still returns focus to the first-opened sleeve"
  - "Dialog content renders only while a project is selected, so the closed dialog adds no controls to the DOM"
  - "Prev and Next footer is sticky on phones only; on desktop it sits in the panel's scroll flow, still reachable by internal scroll"

patterns-established:
  - "Dialog tests treat document.body as a non-page target: after the last control Chromium hands Tab to browser chrome, which Playwright reports as body"

requirements-completed: [CNT-01, CNT-02]

duration: 25 min
completed: 2026-10-27

coverage:
  - id: D1
    description: "Seven projects typed verbatim from the inventory with the owner's link and approved write-ups"
    requirement: CNT-01
    verification:
      - kind: unit
        ref: "tests/unit/content-inventory.test.ts#project parity with the inventory"
        status: pass
    human_judgment: false
  - id: D2
    description: "Crate of seven named sleeves, no horizontal page overflow at 320 to 1920, next sleeve peeks 24 px or more at 390 and 1280, index follows scroll"
    requirement: CNT-02
    verification:
      - kind: e2e
        ref: "tests/e2e/project-dialog.spec.ts#the long MediaDash title wraps inside its sleeve and nothing overflows the page"
        status: pass
      - kind: e2e
        ref: "tests/e2e/project-dialog.spec.ts#the next sleeve peeks by at least 24 px at 390 and 1280"
        status: pass
      - kind: e2e
        ref: "tests/e2e/project-dialog.spec.ts#the crate index reads 1 / 7 at rest and changes after scrolling the crate"
        status: pass
    human_judgment: false
  - id: D3
    description: "Native dialog: focus on Close, containment, Escape and backdrop close, focus return, scroll lock, stepping with wrap, phone sheet"
    requirement: CNT-02
    verification:
      - kind: e2e
        ref: "tests/e2e/project-dialog.spec.ts#project dialog (16 tests, chromium)"
        status: pass
      - kind: unit
        ref: "tests/unit/sections.test.tsx#ProjectDialog"
        status: pass
    human_judgment: false
  - id: D4
    description: "Visual quality of the typographic sleeves (title crop at the sleeve edge, mid-word wrap of Recommendation) and iOS Safari scroll lock and focus return"
    requirement: CNT-02
    verification: []
    human_judgment: true
    rationale: "Cropping taste and WebKit behavior are not asserted by any test; research A6 and A7 route the iPhone check to Phase 6 (QA-02)"
---

# Phase 3 Plan 12: Projects crate and dialog Summary

Seven typographic project sleeves in a scroll-snap crate with a live n / 7 index, opening one native dialog that traps focus, steps and wraps through all projects, and renders the owner-approved Problem, Approach and Outcome for the three featured ones.

## Performance

- **Tasks:** 2 of 2
- **Files:** 15 changed (8 created, 7 modified), 1150 insertions
- **Entry JS:** 121.2 kB gz of the 150 kB budget (was 117.8 kB; Projects ships in the entry chunk, no animation library involved)

## Accomplishments

- Task 1 (tracer, b20a96e): projects module, Sleeve, Projects, ProjectDialog (showModal, focus on Close, explicit focus return), Page wiring, Projects stub removed, four e2e checks. Tracer re-verified end to end (lint, typecheck, unit, build, chromium e2e) before expanding.
- Task 2 (973a64f): Previous, Next and arrow keys with 07/01 wrap; `nn / 07` index; backdrop close; `html:has(dialog[open])` scroll lock; phone sheet at 100dvh with a sticky footer and safe-area padding; "Code on GitHub" only for RecipeCart; crate index on a passive, rAF-throttled scroll listener; interim sleeve rise with a reduced-motion outline; inventory parity for PRJ-01 to PRJ-07; 12 further e2e checks.
- Full suite: vitest 14 files green, `npm run verify` exits 0, and Playwright chromium plus mobile pass 113 of 113 (97 prior plus 16 new).

## Task Commits

1. Task 1 tracer: b20a96e
2. Task 2: 973a64f

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Section gained an optional `aside` prop**
- **Found during:** Task 2 (crate index "on the heading's baseline at the right")
- **Issue:** Section renders the h2 and children inside one Container, so the index could not share the heading's baseline without hacks.
- **Fix:** `src/layout/Section.tsx` takes `aside?: ReactNode` and wraps h2 and aside in a baseline flex row only when given. Markup without it is byte-identical, so the static shell is unaffected. The change shipped in the Task 1 commit with the Projects section, since Projects was its first user.
- **Files modified:** src/layout/Section.tsx (not in the plan's files list)
- **Commit:** b20a96e

**2. [Rule 1 - Bug] Tab-containment test assumed focus never reaches body**
- **Found during:** Task 1 verification
- **Issue:** With a modal open, Chromium passes Tab to browser chrome after the last control and Playwright reports `activeElement` as body, which failed "never focuses an element outside the dialog".
- **Fix:** The assertion now requires the active element to be inside the dialog or the body, so no page element behind the dialog can take focus.
- **Files modified:** tests/e2e/project-dialog.spec.ts
- **Commit:** b20a96e

**Total deviations:** 2 auto-fixed (1 blocking, 1 test bug). **Impact:** none on scope; one small shared-layout prop added.

## Notes for the next plans

- The sleeve button is `.sleeve` with `data-kind`; 03-13 maps `data-kind` (personal, employer, course, hackathon) to ground tokens and puts the Projects section on the band. The dialog is already a sibling outside the section.
- Sleeve text uses `bg-secondary`, `text-text` and `text-muted` for now; 03-13 audits the final grounds.
- At exactly 768 px the three visible sleeves end at 767 px so no fourth sleeve peeks (the 24 px rule is specified and tested at 390 and 1280 only). Widths from 800 px up peek.
- "Recommendation" in the MediaDash title breaks mid-word at 1280 in headless Chromium (hyphens:auto needs a platform dictionary there); it stays inside the sleeve and within five lines.

## Known Stubs

None. No placeholder data; absent links and write-ups render nothing.

## Threat Flags

None. The only new external surface is the RecipeCart link (T-03-17): `target="_blank"` always carries `rel="noopener noreferrer"`, asserted in the unit and e2e tests, and the inventory parity test requires https.

## Issues Encountered

None. Owner-supplied data limits (only PRJ-01 has a link) are by design.

## Self-Check: PASSED

- All created files exist; b20a96e and 973a64f are ancestors of HEAD.
- Acceptance criteria: showModal, aria-labelledby, snap-mandatory present; touch-action absent from Projects.tsx; `satisfies readonly Project` present; `dialog[open]`, `noopener noreferrer`, `IX-03`, `ArrowRight` present.
- Plan verification: vitest, e2e project-dialog (16/16), `npm run verify` exit 0.
