---
phase: 03-content-complete-site
plan: "06"
subsystem: ui
tags: [hero, poster, css-grid, cta, clip-path, playwright, static-shell-parity, meta]

requires:
  - phase: 03-content-complete-site
    provides: Hero({ profile, email }) with the Copy email handler and toast (03-04, 03-05), ladder utilities (03-03)
provides:
  - Poster hero (Aaron over Phan at text-mega, role line at text-l, two CTAs, two corner facts) identical in index.html and React
  - CtaLink pill CTA with a decorative ink-flood span; flood on hover (gated), keyboard focus and touch press
  - Container as the 1680 px frame with a fluid gutter; .poster-grid (4 columns, 12 from 768 px) in src/styles/interactions.css
  - index.html head with a unique title, a 152-character meta description and viewport-fit=cover
  - Parity test scoped to section#hero plus the main section id and heading skeleton
  - HERO-04 corner facts and the HERO-03 edit record in the content inventory; poster hero frames and navigation model in the IA
affects: [03-07 navigation chrome, 03-08 and later section plans (Container and poster-grid), Phase 5 SEC-04 (role line effect returns)]

status: complete
commits: 3
plan_head_before: 0cd2e2520243c8ecafee13b318b2b2ec8989ca89
plan_head_after: e0e2c4a37e9090899e06665f0e8f5393176ee7bd

actuals:
  tokens: 19000
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Poster layout: Container carries .poster-grid (4 columns, 12 from 768 px); the hero places children with col-span and row-start utilities, md:grid-rows-[auto_1fr_auto] only from 768 px so a tall phone shows no hole"
    - "Primary CTA = anchor with a flood span (clip-path inset from the bottom edge, --text ground) and a label span (translate 0 -2px, color --background); hover inside @media (hover: hover), same state on :focus-visible and :active, label lift dropped under reduced motion"
    - "Shell parity is scoped: section#hero must be canonically equal, the other sections only share ids, aria-labelledby and heading text"

key-files:
  created:
    - src/components/ui/CtaLink.tsx
    - src/styles/interactions.css
    - tests/e2e/hero.spec.ts
  modified:
    - src/sections/Hero/Hero.tsx
    - index.html
    - src/layout/Container.tsx
    - src/styles/index.css
    - tests/unit/hero-parity.test.tsx
    - tests/unit/layout.test.tsx
    - tests/e2e/smoke.spec.ts
    - tests/e2e/motion.spec.ts
    - .planning/phases/01-decisions-and-documentation/01-CONTENT-INVENTORY.md
    - .planning/phases/01-decisions-and-documentation/01-IA-WIREFRAMES.md

key-decisions:
  - "The role line is a plain p from the first paint: the hero no longer imports TextReveal and the shell dropped reveal-pending; TextReveal stays exported from the barrel for Phase 5 (SEC-04)"
  - "The corner facts sit in one wrapper div (flex column on phones with a 4 px gap, flex row with justify-between from 768 px) so the same tree serves both layouts"
  - "In the IA frames the facts, the 768 px nav labels and the 375 px dates are abbreviated to fit the fixed frame widths; the site shows the full copy"

patterns-established:
  - "e2e role-line selector is '#hero h1 + p' because the hero now holds more than one p"
  - "A decorative flood or fill goes in an aria-hidden span inside the anchor so the accessible name stays the label text"

requirements-completed: []
requirements-partial: [NAV-04, CNT-01]

duration: ~30 min
completed: 2026-10-27

coverage:
  - id: D1
    description: "Hero is a poster: h1 'Aaron Phan' over two lines, role line, Download resume and Copy email, and both corner facts; no Contact link"
    requirement: CNT-01
    verification:
      - kind: unit
        ref: "tests/unit/hero-parity.test.tsx#hero accessible name is Aaron Phan and the facts are present"
        status: pass
      - kind: e2e
        ref: "tests/e2e/smoke.spec.ts#JS disabled: hero name, role and CTAs are visible from static HTML"
        status: pass
    human_judgment: false
  - id: D2
    description: "Static shell and React hero are canonically identical, and the section ids and heading skeleton of main match"
    verification:
      - kind: unit
        ref: "tests/unit/hero-parity.test.tsx"
        status: pass
    human_judgment: false
  - id: D3
    description: "Role line is plain text from first paint: opacity 1 and no span on every frame from DOMContentLoaded to 1.5 s after load; no loader or intro"
    verification:
      - kind: e2e
        ref: "tests/e2e/motion.spec.ts#motion: role line is plain text from first paint and name and CTAs never animate"
        status: pass
      - kind: e2e
        ref: "tests/e2e/motion.spec.ts#reduced motion: role line is static text with no per-word spans"
        status: pass
    human_judgment: false
  - id: D4
    description: "At 375 x 667 the h1, role line and both CTAs sit inside the first viewport and each CTA is at least 44 px tall; no horizontal overflow at 320 and 390"
    requirement: NAV-04
    verification:
      - kind: e2e
        ref: "tests/e2e/hero.spec.ts#first viewport at 375 x 667 holds the name, role and both CTAs at 44px or taller"
        status: pass
      - kind: e2e
        ref: "tests/e2e/hero.spec.ts#the poster name causes no horizontal overflow at 320px"
        status: pass
    human_judgment: false
  - id: D5
    description: "Ink flood on hover and keyboard focus (label lifts 2 px and turns --background), instant flood with no lift under reduced motion"
    verification:
      - kind: e2e
        ref: "tests/e2e/hero.spec.ts#hero CTAs"
        status: pass
    human_judgment: false
  - id: D6
    description: "Head carries a unique title, a 50 to 160 character description with no phone number, and viewport-fit=cover"
    verification:
      - kind: e2e
        ref: "tests/e2e/hero.spec.ts#the document head carries a unique title, a description and viewport-fit"
        status: pass
      - kind: other
        ref: "npm run check:no-phone"
        status: pass
    human_judgment: false
  - id: D7
    description: "How the poster reads and how the flood feels on a real phone and a real desktop pointer; :active touch press was not driven by a test"
    verification: []
    human_judgment: true
    rationale: "Visual composition and touch feel are judgments; the automated checks cover layout bounds, computed styles and keyboard and mouse states only"
---

# Phase 3 Plan 06: Poster hero, ink-flood CTAs and head metadata Summary

**The hero is now a poster (Aaron over Phan at text-mega, plain-text role line, Download resume and Copy email as ink-flood pills, two corner facts) mirrored exactly in the static shell, with a unique title, meta description and viewport-fit in the head.**

## Performance

- **Duration:** ~30 min
- **Completed:** 2026-10-27
- **Tasks:** 3 of 3
- **Files modified:** 13 (3 created)

## Accomplishments

- Poster hero from `profile.heroFacts`: name split into two block spans with a text space (accessible name stays "Aaron Phan"), role line at text-l, CTAs in columns 9 to 12, facts along the bottom. No Contact link, no loader, no text effect.
- Container is now the 1680 px frame with a `clamp(1rem, 2vw, 2rem)` gutter (shell stubs updated to match); `.poster-grid` gives 4 columns on phones and 12 from 768 px.
- `CtaLink` plus `interactions.css`: the flood rises from the bottom edge on hover (inside `@media (hover: hover)`), `:focus-visible` and `:active`; reduced motion keeps the instant flood and drops the label lift. No `transition: all`.
- `index.html` head: title "Aaron Phan | Software engineer", 152-character description, `viewport-fit=cover`.
- Parity test narrowed to `section#hero` (exact) plus the main section id and heading skeleton; e2e smoke and motion specs updated; new `hero.spec.ts` covers flood, focus, reduced motion, first viewport at 375 x 667, no overflow at 320 and 390, and head checks.
- Inventory: HERO-03 edit record and new HERO-04. IA: navigation model (D-18, D-19), fast path, above the fold and the three hero frames redrawn.
- Verification: `npm run verify` exit 0 (initial JS 113.7 kB gz of the 150 kB budget), full Playwright suite 30 of 30, parity and inventory unit tests pass.

## Task Commits

1. **Task 1: Tracer, poster hero identical in shell and React** - `7a1e9f8` (feat)
2. **Task 2: Ink-flood CTAs and head metadata** - `438484a` (feat)
3. **Task 3: Inventory and IA amendments** - `e0e2c4a` (docs)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Layout unit test pinned the old container width**
- **Found during:** Task 1
- **Issue:** `tests/unit/layout.test.tsx` asserted `max-w-5xl` is absent after an override; the Container no longer emits it.
- **Fix:** assert `max-w-[1680px]` is absent instead (the override behavior is unchanged).
- **Files modified:** tests/unit/layout.test.tsx
- **Commit:** 7a1e9f8

**2. [Rule 1 - Bug] e2e role-line selector `#hero p` matched the new fact paragraphs**
- **Found during:** Task 1 (strict-mode violations in motion.spec)
- **Fix:** select the role line as `#hero h1 + p` in motion.spec and hero.spec.
- **Files modified:** tests/e2e/motion.spec.ts
- **Commit:** 7a1e9f8

**3. Fourth role-line test removed.** The plan said to remove three tests tied to the effect. Three were removed (effect runs, flash guard, fade-in when the entry script never loads) and replaced by one first-paint sampler. The "stays readable when lazy chunks fail" test stays (renamed) because other lazy chunks still exist.

**4. Prettier reformatted the inventory and IA tables.** Both files sit under `.planning/`, which `.prettierignore` skips, and had never been formatted. The plan's `prettier --write` aligned every table, so the diff for those two files is larger than the content change.

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug), 2 notes. **Impact:** none on scope.

## Issues Encountered

- A first scripted IA edit located `### Frame: Hero @ 375` inside a prose reference and would have deleted the Anchors through Wireframes sections; caught on the line-count and section check, the file was restored from git and redone anchored on the heading line. Nothing wrong was committed.

## Known Stubs

None. (The six `SectionStubs` below the hero are the pre-existing placeholders replaced by plans 03-08 onward.) `.reveal-pending` CSS in `base.css` is no longer used by the shell but `TextReveal` still references it, so it stays until Phase 5.

## Threat Flags

None. The only new surface is public metadata in `index.html`; T-03-09 is covered by `check:no-phone` (OK) and T-03-10 by the parity test.

## Next Phase Readiness

Ready for 03-07 (navigation chrome). Note for it: the theme toggle is currently fixed top right and sits over the hero's top-right corner (clear of the glyphs at 375 and 1280); the hero has no top-bar space reserved yet, so 03-07 should add the 64 px bar and revisit the `calc(100svh - 64px)` min-height.

## Self-Check: PASSED

- Created files exist: CtaLink.tsx, interactions.css, hero.spec.ts.
- Commits `7a1e9f8`, `438484a`, `e0e2c4a` are ancestors of HEAD; `git rev-list --count` from the ledger base is 3.
- Task acceptance greps pass; `npm run verify` exit 0; Playwright 30 of 30.
