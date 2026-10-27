---
phase: 03-content-complete-site
plan: "08"
subsystem: ui
tags: [theme, wordmark, phone-top-bar, use-sync-external-store, playwright]

requires:
  - phase: 03-content-complete-site
    provides: SiteHeader with desktop nav, skip link and home link (03-07); subscribeTheme, readTheme and applyTheme from the Phase 2 review work
provides:
  - useTheme hook ({ theme, toggle }) in src/hooks, the one store over html[data-theme] that every ThemeToggle uses
  - Wordmark component (PHAN by day, PHVNTM by night, swapped by CSS on [data-theme], A and V in their own glyph spans)
  - 64 px non-fixed phone top bar (below 768 px) with the home link wordmark and the theme toggle
  - Home link underline that draws left to right in 220 ms on hover and keyboard focus
  - Theme and motion e2e suites that target the one visible toggle at 1280 and 375
affects: [03-09 phone pill (the Theme row reuses ThemeToggle and the store), 03-15 footer finale (Wordmark size finale styling), 04 flip animation IX-18 (targets .wordmark-glyph)]

status: complete
commits: 2
plan_head_before: 78b24b6b33f86339bab74285fc1435e628a1dd73
plan_head_after: 4d054d45c49be61fc3a524d4cc303ae4475be394

actuals:
  tokens: 6800
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "One theme store: useSyncExternalStore(subscribeTheme, readTheme) over html[data-theme]; toggle reads the live attribute so a stale render cannot flip the wrong way"
    - "Wordmark: both strings in the DOM, aria-hidden, plain CSS on [data-theme] hides one (no dark variant utilities, no JS state, no flash)"
    - "Each bar is display none at the other size, so exactly one home link and one theme toggle are in the accessibility tree"

key-files:
  created:
    - src/hooks/useTheme.ts
    - src/layout/Wordmark.tsx
    - tests/e2e/wordmark.spec.ts
    - tests/unit/use-theme.test.tsx
  modified:
    - src/components/ui/ThemeToggle.tsx
    - src/layout/SiteHeader.tsx
    - src/styles/interactions.css
    - index.html
    - tests/unit/theme.test.ts
    - tests/e2e/theme.spec.ts
    - tests/e2e/motion.spec.ts
  deleted:
    - src/lib/useTheme.ts

key-decisions:
  - "useTheme moved from src/lib to src/hooks and now returns { theme, toggle }; the old src/lib/useTheme.ts (returned only the Theme) was deleted so there is one hook"
  - "The static shell gets a 64 px aria-hidden spacer before main so the React header (phone bar or desktop bar, both 64 px) does not push the poster down at mount"
  - "The home-link underline is a currentColor background-size transition on the wordmark span, not a pseudo-element, so it needs no extra markup and spans exactly the wordmark"

patterns-established:
  - "e2e that touches the toggle uses getByRole with an assertion of count 1, because a hidden bar is out of the accessibility tree"
  - "Raw page.evaluate lookups for the toggle filter by offsetParent so they pick the rendered instance"

requirements-completed: []
requirements-partial: [NAV-02]

duration: ~15 min
completed: 2026-10-27

coverage:
  - id: D1
    description: "Wordmark reads PHAN in light and PHVNTM in dark (both strings in aria-hidden spans, CSS shows one) at 1280 and 375; night is font-stretch 125% and the h1 stays 100%"
    verification:
      - kind: e2e
        ref: "tests/e2e/wordmark.spec.ts#wordmark at 1280 and 375 light/dark"
        status: pass
    human_judgment: false
  - id: D2
    description: "Home link name is 'Aaron Phan, home' and the h1 is 'Aaron Phan' in both themes; A and V sit in their own glyph spans"
    verification:
      - kind: e2e
        ref: "tests/e2e/wordmark.spec.ts#the home link and h1 keep their names in both themes"
        status: pass
      - kind: e2e
        ref: "tests/e2e/wordmark.spec.ts#the A and the V each sit in their own glyph span"
        status: pass
    human_judgment: false
  - id: D3
    description: "Below 768 px a 64 px non-fixed bar carries the home link and a 44 px theme toggle inside the first viewport; clicking it switches the wordmark"
    requirement: NAV-04
    verification:
      - kind: e2e
        ref: "tests/e2e/wordmark.spec.ts#phone top bar"
        status: pass
    human_judgment: false
  - id: D4
    description: "Every toggle shares one store: toggling at 1280 then resizing to 375 (and back) keeps aria-pressed in step; exactly one toggle is in the accessibility tree at both widths"
    verification:
      - kind: e2e
        ref: "tests/e2e/wordmark.spec.ts#a toggle changed at 1280 shows the same state after a resize to 375"
        status: pass
      - kind: unit
        ref: "tests/unit/use-theme.test.tsx#useTheme keeps every toggle in step with the one attribute"
        status: pass
    human_judgment: false
  - id: D5
    description: "No theme flash and blocked storage falls back to the system preference with a working toggle, at 1280 and 375"
    verification:
      - kind: e2e
        ref: "tests/e2e/theme.spec.ts#theme: no flash, attribute and background are set before app JS runs"
        status: pass
      - kind: e2e
        ref: "tests/e2e/theme.spec.ts#theme: blocked storage falls back to system preference and toggle still works at 1280 / at 375"
        status: pass
    human_judgment: false
  - id: D6
    description: "Both themes render identical text in identical order inside main (D-01 guardrail)"
    verification:
      - kind: e2e
        ref: "tests/e2e/wordmark.spec.ts#both themes render the same text in the same order inside main"
        status: pass
    human_judgment: false
  - id: D7
    description: "Storage values other than light or dark are never applied (T-03-13)"
    verification:
      - kind: unit
        ref: "tests/unit/theme.test.ts#subscribeTheme never applies a stored value other than light or dark"
        status: pass
    human_judgment: false
  - id: D8
    description: "How the nav-size wordmark, the night widening and the phone bar read visually (weight, spacing, balance against the toggle)"
    verification: []
    human_judgment: true
    rationale: "Visual taste; the e2e asserts computed styles and geometry, not how it looks on a real phone"
---

# Phase 3 Plan 08: Theme store, PHAN/PHVNTM wordmark and phone top bar Summary

**One `useTheme` store over `html[data-theme]` now drives every theme toggle; the corner home link is a PHAN/PHVNTM wordmark swapped by plain CSS (night widened to `font-stretch` 125%); and a 64 px phone top bar puts the wordmark and the day/night switch in the first viewport below 768 px.**

## Performance

- **Duration:** ~15 min
- **Tasks:** 2 of 2
- **Files:** 12 touched (4 created, 1 deleted)
- **Initial JS:** 114.9 kB gzipped (114,929 B) against the repo's 150,000 B budget; about 0.1 kB more than 03-07

## Accomplishments

- `useTheme()` returns `{ theme, toggle }` via `useSyncExternalStore(subscribeTheme, readTheme, () => 'light')`; `ThemeToggle` dropped its local logic and keeps the same markup, `aria-label` "Dark theme", `aria-pressed` and `ThemeThumb`.
- `Wordmark` (`size` nav or finale) with `.wordmark-day` ("PH", glyph "A", "N") and `.wordmark-night` ("PH", glyph "V", "NTM"), `aria-hidden`, caps typed in the markup. CSS hides one on `[data-theme]`; `.wordmark-night` has `font-stretch: 125%`, the h1 stays at 100%.
- `SiteHeader`: a shared `HomeLink` (name "Aaron Phan, home", `href="#hero"`) is used by both bars; a new `md:hidden` 64 px non-fixed top bar holds it and the `ThemeToggle`. Skip link is still the header's first child.
- Home-link underline: 2 px `currentColor` line drawn by a `background-size` transition (220 ms, `--ease-out`) on hover (hover devices only) and `focus-visible`; no transition under reduced motion.
- Tests: 15 new e2e tests in `wordmark.spec.ts`, 2 hook unit tests, 1 new storage-value unit test; `theme.spec.ts` runs first-visit and blocked-storage at 1280 and 375 and asserts one toggle; `motion.spec.ts` targets the visible toggle and thumb through `offsetParent`.

## Task Commits

1. **Task 1: Tracer, store, wordmark and phone top bar** - `00db30b` (feat). Tracer gate: the plan's verify chain was re-run end to end before expansion (unit, lint, colors, no `dark:` utilities, build, wordmark/theme/nav Playwright, 41 of 41). The `src/lib/useTheme.ts` deletion was first committed alone by a failed `git add`, then the commit was amended (local, unpushed) to carry everything.
2. **Task 2: Theme and motion tests at both widths** - `4d054d4` (test)

## Verification

- `npm run verify` exit 0 (typecheck, oxlint, prettier check, vitest 204 of 204, case, colors, contrast, build, budget, no-phone).
- Full Playwright suite: 67 of 67.
- `! grep -rnF 'dark:' src` clean; all acceptance greps for both tasks pass.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The store already partly existed under a different path and contract**
- **Found during:** Task 1 read_first
- **Issue:** `subscribeTheme` (MutationObserver, storage and OS-scheme handling) and its unit tests already existed from Phase 2, and a `src/lib/useTheme.ts` returned only the `Theme`. The plan expects `src/hooks/useTheme.ts` returning `{ theme, toggle }`.
- **Fix:** created `src/hooks/useTheme.ts` per the contract, repointed `ThemeToggle`, deleted `src/lib/useTheme.ts`. `subscribeTheme` was left as is (it already covers the storage-event rules); one test was added for a non-light/dark stored value.
- **Files modified:** src/hooks/useTheme.ts, src/lib/useTheme.ts (deleted), src/components/ui/ThemeToggle.tsx, tests/unit/theme.test.ts
- **Commit:** 00db30b

**2. [Rule 2 - Missing critical] Static shell had no space for the header**
- **Found during:** Task 1 (lesson from 03-07: the shell must match React to avoid mount shift)
- **Issue:** The new phone bar adds 64 px above the hero in React that the shell lacked, so the poster would jump on mount (the desktop bar had the same gap).
- **Fix:** an `aria-hidden` 64 px spacer div before `main` in `index.html`; React replaces it at mount. The JS-disabled "no nav element" test and the hero parity test (scoped to `main`) still pass.
- **Files modified:** index.html
- **Commit:** 00db30b

**3. `tests/e2e/smoke.spec.ts` needed no change.** Its JS-disabled test already asserts no `nav` element, and the spacer is a `div`. The file is listed in the plan but was left untouched.

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical), 1 note. **Impact:** none on scope.

## Issues Encountered

- A `MutationObserver` notifies in a microtask, so the first hook unit test needed `await act(async ...)`.
- Keyboard-focus underline test: programmatic `focus()` does not reliably match `:focus-visible`, so the test tabs (skip link, then home link).

## Known Stubs

None added. The six `SectionStubs` from earlier plans remain until their section plans land.

## Threat Flags

None. T-03-13 (storage value tampering) is mitigated: only `light` or `dark` is applied from storage or a storage event (unit-tested).

## Next Phase Readiness

Ready for 03-09 (phone pill). On phones the theme toggle and wordmark now exist in the top bar; the pill's Theme row can reuse `ThemeToggle` and the same store. NAV-02 stays partial until the pill lands; NAV-04 is deliberately not marked here per the project rules. `Wordmark size="finale"` has no styling yet (03-15).

## Self-Check: PASSED

- Created files exist (useTheme hook, Wordmark, wordmark.spec, use-theme.test); `src/lib/useTheme.ts` is gone.
- Commits `00db30b` and `4d054d4` are ancestors of HEAD; `git rev-list --count 78b24b6..HEAD` is 2.
- `npm run verify` exit 0; Playwright 67 of 67.
