---
phase: 03-content-complete-site
plan: "07"
subsystem: ui
tags: [nav, scroll-spy, intersection-observer, skip-link, motion, layout-animation, playwright]

requires:
  - phase: 03-content-complete-site
    provides: CtaLink and interactions.css (03-06), Container and poster hero (03-06), anim barrel with MotionFeatures and featuresStatus (03-04, 03-05)
provides:
  - Sticky 64 px desktop nav at 768 px and up (home link, six section links, theme toggle, Resume), hidden with display none below 768 px
  - useActiveSection scroll-spy (pure pickActive, IntersectionObserver band, click lock, hash deep link) fed once from Page
  - Skip link as the first Tab stop; main#main focusable (tabindex -1) in React and in the static shell
  - NavIndicator (shared layoutId bar) through the anim barrel, static before the motion chunk loads
  - Nav label roll (CSS) with an underline under reduced motion
  - Section anchors clear the nav (md:scroll-mt-(--nav-h)) and Section gains tight and airy moods
affects: [03-08 wordmark and shared theme store, 03-09 phone pill and top bar (reuses useActiveSection, nav-items, panelLabel), every later section plan (Section mood, scroll margin)]

status: complete
commits: 2
plan_head_before: ef408fb51c0ef79cd4189de8c993fc2df2ea4ae2
plan_head_after: 7ae4a10aeace3465ec54132bb7a08f1b33978df4

actuals:
  tokens: 8200
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "The sticky element is the header, not the bar inside it, so the bar sticks for the whole page; the bar is display none below 768 px so its landmark leaves the accessibility tree"
    - "Scroll-spy: one IntersectionObserver per page in Page.tsx, rootMargin built in px at runtime from --nav-h (0 below 768 px, rebuilt when the breakpoint flips), pure picker unit-tested without IntersectionObserver"
    - "Click lock ends on scrollend, after 150 ms of scroll quiet, after 700 ms with no scroll at all, or at a 3 s cap, so Safari without scrollend still releases"
    - "Roll hover uses transform (not the individual translate property) on two copies of the label, the duplicate aria-hidden so accessible names stay single"
    - "Indicator is rendered only inside the active link, so a static bar sits under it before the chunk loads and motion's shared layout id slides it afterwards"

key-files:
  created:
    - src/layout/nav-items.ts
    - src/layout/SiteHeader.tsx
    - src/layout/SkipLink.tsx
    - src/hooks/useActiveSection.ts
    - src/anim/declarative/NavIndicator.tsx
    - tests/unit/active-section.test.ts
    - tests/e2e/nav.spec.ts
  modified:
    - src/app/App.tsx
    - src/app/Page.tsx
    - src/layout/Section.tsx
    - src/anim/index.ts
    - src/styles/tokens.css
    - src/styles/interactions.css
    - index.html
    - tests/unit/layout.test.tsx
    - tests/e2e/hero.spec.ts

key-decisions:
  - "Below 768 px the whole desktop bar, including the theme toggle, is display none, as the plan specifies; phones have no theme toggle and no nav until the top bar and pill land in 03-08 and 03-09"
  - "At 768 px the link gap is 16 px (24 px from 1024 px) because six links, toggle and Resume at 24 px overflowed the 736 px content width; the UI spec's 24 px applies from 1024 px"
  - "The skip link hides by translating above the viewport rather than sr-only, so it stays in the accessibility tree and the focus transition needs no utility ordering"
  - "Hero nav state: at the top of the page (hero in the band) no link is current; Contact becomes current at the bottom even when a nearer section was clicked, which matters only while the stub sections are short"

patterns-established:
  - "e2e reads aria-current through the link href, because textContent of a rolled link includes the aria-hidden duplicate"
  - "Hero keyboard test tabs up to 16 times; any new focusable chrome before the hero lengthens that path"

requirements-completed: []
requirements-partial: [NAV-02]

duration: ~10 min
completed: 2026-10-27

coverage:
  - id: D1
    description: "At 768 px and up a 64 px sticky nav is always visible with home link, six links in order, theme toggle and Resume (download)"
    requirement: NAV-02
    verification:
      - kind: e2e
        ref: "tests/e2e/nav.spec.ts#nav the Primary nav shows the six section links in order"
        status: pass
      - kind: e2e
        ref: "tests/e2e/nav.spec.ts#nav the bar is sticky: it stays at the top of the viewport after scrolling"
        status: pass
    human_judgment: false
  - id: D2
    description: "Scroll-spy marks the section in view with aria-current location, exactly one link at a time, Contact at the page bottom"
    requirement: NAV-02
    verification:
      - kind: unit
        ref: "tests/unit/active-section.test.ts#pickActive"
        status: pass
      - kind: e2e
        ref: "tests/e2e/nav.spec.ts#nav the link of the section in view carries aria-current and no other link does"
        status: pass
      - kind: e2e
        ref: "tests/e2e/nav.spec.ts#nav at the bottom of the page Contact is current"
        status: pass
    human_judgment: false
  - id: D3
    description: "2 px accent bar 4 px under the active label, as wide as the label; slides with the snappy spring, jumps under reduced motion, and sits under the active link when the motion chunk is blocked"
    verification:
      - kind: e2e
        ref: "tests/e2e/nav.spec.ts#nav behavior the indicator slides between links once the motion chunk is in"
        status: pass
      - kind: e2e
        ref: "tests/e2e/nav.spec.ts#nav behavior under reduced motion the indicator jumps and the roll becomes an underline"
        status: pass
      - kind: e2e
        ref: "tests/e2e/nav.spec.ts#nav behavior with the motion chunk blocked the indicator still sits under the active link"
        status: pass
      - kind: e2e
        ref: "tests/e2e/nav.spec.ts#nav behavior the indicator is 2 px tall, 4 px under the label and as wide as the label"
        status: pass
    human_judgment: false
  - id: D4
    description: "Clicking a link marks its target at once, the indicator never sweeps through other sections, and the heading lands at least 64 px below the top; scroll margin is 64 px at 1280 and 0 at 375"
    verification:
      - kind: e2e
        ref: "tests/e2e/nav.spec.ts#nav behavior clicking a link marks its target at once and the indicator never sweeps"
        status: pass
      - kind: e2e
        ref: "tests/e2e/nav.spec.ts#nav behavior every section anchor clears the 64 px nav at 1280 and has no offset at 375"
        status: pass
    human_judgment: false
  - id: D5
    description: "Labels roll on hover and keyboard focus with a single accessible name; underline replaces the roll under reduced motion"
    verification:
      - kind: e2e
        ref: "tests/e2e/nav.spec.ts#nav label roll"
        status: pass
    human_judgment: false
  - id: D6
    description: "Skip link is the first Tab stop, visible on focus, and Enter focuses main#main (tabindex -1 in React and in the shell); exactly one navigation landmark at 1280 and none at 375"
    verification:
      - kind: e2e
        ref: "tests/e2e/nav.spec.ts#skip link the first Tab stop is the skip link and Enter moves focus to main"
        status: pass
      - kind: e2e
        ref: "tests/e2e/nav.spec.ts#landmarks exactly one navigation landmark at 1280 and none at 375"
        status: pass
    human_judgment: false
  - id: D7
    description: "Deep link to a section id lands on it after React renders; any other hash is ignored"
    verification:
      - kind: e2e
        ref: "tests/e2e/nav.spec.ts#nav behavior a deep link to a section lands on it after React renders"
        status: pass
      - kind: e2e
        ref: "tests/e2e/nav.spec.ts#nav behavior any other hash is ignored"
        status: pass
    human_judgment: false
  - id: D8
    description: "E3 desktop nav: no horizontal overflow at 768 and 1024 widths with six links, toggle and Resume"
    verification:
      - kind: e2e
        ref: "tests/e2e/nav.spec.ts#desktop nav fit"
        status: pass
    human_judgment: true
    rationale: "The plan marks this a backstop checked by desktop and tablet screenshots; the e2e asserts scrollWidth, and a 1280 and a 768 screenshot were inspected, but how the bar reads is a visual judgment"
  - id: D9
    description: "How the roll, the sliding bar and the sticky bar feel with a real pointer and on real Safari (scrollend support, trackpad momentum)"
    verification: []
    human_judgment: true
    rationale: "Feel and Safari behavior are judgments; the e2e covers computed states and Chromium only"
---

# Phase 3 Plan 07: Desktop nav, scroll-spy and skip link Summary

**A 64 px sticky desktop nav (768 px and up) with an IntersectionObserver scroll-spy, a click lock that stops the indicator sweeping, an accent bar that slides through the anim barrel, a CSS label roll, anchors that clear the bar, and a skip link that focuses main.**

## Performance

- **Duration:** ~10 min
- **Tasks:** 2 of 2
- **Files:** 16 touched (7 created)
- **Initial JS:** 114.8 kB gzipped (114,796 B), checked against 130,000 B and the repo's 150,000 B; the nav added about 1.1 kB over the 113.7 kB before this plan

## Accomplishments

- `useActiveSection`: pure `pickActive` (last intersecting section in page order, previous on empty, last at the bottom, previous for an empty order), one observer with a px `rootMargin` computed from `--nav-h` (0 below 768 px, rebuilt on breakpoint change), a click lock, and a one-shot hash deep link restricted to the seven known ids (T-03-11).
- `SiteHeader`: sticky header holding the skip link and a bar that is `display: none` below 768 px; home link `Aaron Phan, home`, `Primary` nav with six links, theme toggle (moved from `App.tsx`) and an outlined `Resume` CtaLink. `Page` owns the single scroll-spy and passes `activeId` and `lockTo`.
- `NavIndicator` (`m.span`, `layoutId` `nav-indicator`, snappy spring) exported from the barrel; rendered only in the active link so it is a plain bar before the chunk loads or when it is blocked (T-03-12), and it never loads for reduced-motion visitors.
- Label roll in `interactions.css` (`nav-roll`, 220 ms, hover gated, focus-visible everywhere); reduced motion drops the transform and underlines the label.
- `Section` scroll margin `md:scroll-mt-(--nav-h)` and `mood` (`tight` py-24, `airy` pt-40 pb-24); the shell's section classes were updated to match so the shell and React do not shift.
- 20 nav e2e tests plus 7 picker, hook and nav-items unit tests. The "never sweeps" test was mutation-checked: with the lock disabled it fails; with it restored it passes.

## Task Commits

1. **Task 1: Tracer, sticky nav, scroll-spy, skip link** - `9cd7291` (feat). The RED run (module missing) was observed before implementing; RED and GREEN went into one commit because the tracer spans ten files.
2. **Task 2: Indicator, roll, lock, anchors** - `7ae4a10` (feat)

## Verification

- `npm run verify` exit 0 (typecheck, oxlint, prettier check, vitest, case, colors, contrast, build, budget, no-phone).
- `JS_BUDGET_BYTES=130000 npm run check:budget`: 114,796 B of 130,000 B.
- Full Playwright suite: 50 of 50.
- All acceptance greps for both tasks pass.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Hero keyboard focus test no longer reached Download resume**
- **Found during:** Task 2 full-suite run
- **Issue:** `tests/e2e/hero.spec.ts` tabbed at most 8 times; the skip link, home link, six nav links, toggle and nav Resume now precede the hero CTA (10 stops).
- **Fix:** loop bound raised to 16 with a comment.
- **Files modified:** tests/e2e/hero.spec.ts
- **Commit:** 7ae4a10

**2. [Rule 1 - Bug] Layout unit test pinned the old scroll margin and padding**
- **Found during:** Task 2
- **Fix:** assert `md:scroll-mt-(--nav-h)` and `py-24`; added a mood test.
- **Files modified:** tests/unit/layout.test.tsx
- **Commit:** 7ae4a10

**3. [Rule 1 - Bug] Own e2e assertions passed vacuously**
- **Found during:** Task 2
- **Issue:** `textContent` of a rolled link includes the aria-hidden duplicate ("ExperienceExperience"), so the sweep test's `not.toContain('Experience')` could never fail and the order test failed on text.
- **Fix:** the sweep sampler reads the link `href`; the order test checks accessible names. Mutation check confirmed the lock test now fails without the lock.
- **Files modified:** tests/e2e/nav.spec.ts
- **Commit:** 7ae4a10

**4. [Rule 3 - Blocking] Overflow at 768 px**
- **Found during:** Task 1 design (computed before building)
- **Issue:** six links, toggle and Resume with 24 px gaps need about 766 px against 736 px of content.
- **Fix:** gaps are 16 px below 1024 px and 24 px from 1024 px (`gap-4 lg:gap-6`); `whitespace-nowrap` on labels. The e2e confirms no overflow at 768 and 1024.
- **Files modified:** src/layout/SiteHeader.tsx
- **Commit:** 9cd7291

**5. Shell section classes changed** (not in the plan's file list for this purpose): `index.html` stub sections changed from `scroll-mt-6 py-16` to `py-24 md:scroll-mt-(--nav-h)` to match React and avoid a layout shift at mount.

**6. Click lock release is a little richer than the plan text.** The plan says "scrollend or 700 ms". A flat 700 ms can end while a long smooth scroll is still moving in Safari (no `scrollend`), so a scroll event also restarts a 150 ms quiet timer, with the 700 ms fallback for the nothing-scrolls case and a 3 s cap.

**Total deviations:** 4 auto-fixed (3 bugs, 1 blocking), 2 notes. **Impact:** none on scope.

## Issues Encountered

- A macOS `sed` replacement containing `\n` aborted (nothing written); the edit was redone with the Edit tool.
- Next phase note: on a phone there is currently no theme toggle and no nav (the plan hides the entire bar below 768 px). The phone top bar and pill are 03-08 and 03-09; until they land the toggle is desktop-only.

## Known Stubs

None added by this plan. The six `SectionStubs` remain the pre-existing placeholders replaced from 03-08 onward. Because the stubs are only 40 svh tall, the page bottom is reached before Education or Contact can reach the top, so after clicking Education the spy settles on Contact (bottom rule). Real section heights remove this.

## Threat Flags

None. The URL fragment is the only new input (T-03-11): the hash is decoded in a try block, compared against the seven known ids, and used only through `document.getElementById`.

## Next Phase Readiness

Ready for 03-08. `useActiveSection`, `NAV_ITEMS` (with `panelLabel`) and `SiteHeader` are what 03-09's pill consumes. The home link text is still the plain `Aaron Phan` that 03-08 replaces with the wordmark. NAV-02 stays partial until 03-09 delivers the phone half.

## Self-Check: PASSED

- Created files exist (nav-items, SiteHeader, SkipLink, useActiveSection, NavIndicator, both test files).
- Commits `9cd7291` and `7ae4a10` are ancestors of HEAD; `git rev-list --count` from the ledger base is 2.
- Acceptance greps pass for both tasks; `npm run verify` exit 0; Playwright 50 of 50.
