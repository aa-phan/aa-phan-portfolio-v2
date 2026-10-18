---
phase: 02-deployed-themed-skeleton
plan: 05
subsystem: ui
tags: [theme, dark-mode, localStorage, react-spring, inline-script, playwright, vitest]
requires:
  - phase: 02-deployed-themed-skeleton
    provides: token blocks for both themes (02-01), verify chain and setMediaQuery helper (02-04), anim import boundaries (02-04)
provides:
  - inline head script that sets html data-theme before first paint (system default, stored choice wins, junk ignored, storage and matchMedia guarded)
  - src/lib/theme.ts (Theme, THEME_STORAGE_KEY, readTheme, applyTheme)
  - src/anim barrel (ThemeThumb, springs, durations, easeOut) as the first real consumer of the animation layer
  - ThemeToggle, a native two-state button with a react-spring thumb, fixed top-right via App
  - theme unit tests against the real index.html script and five browser tests
affects: [02-06, 02-07, 02-08, 02-09]
status: complete
commits: 2
plan_head_before: deb93a07f3fde73bae14d12d05a39c79e6be87da
plan_head_after: f4b10b2ab00bbea3d704ad08bf730609c7243cdd
actuals:
  tokens: 3300
  tasks: 2
  commits: 2
tech-stack:
  added: []
  patterns: [inline classic head script as the only initial theme setter, html data-theme as the single theme state, react-spring thumb through the @/anim barrel, unit test extracts the shipped inline script from index.html at test time]
key-files:
  created:
    - src/lib/theme.ts
    - src/anim/tokens.ts
    - src/anim/physics/ThemeThumb.tsx
    - src/anim/index.ts
    - src/components/ui/ThemeToggle.tsx
    - tests/e2e/theme.spec.ts
    - tests/unit/theme-script.test.ts
    - tests/unit/theme.test.ts
  modified:
    - index.html
    - src/app/App.tsx
key-decisions:
  - "The header with the toggle lives only in React (App.tsx), not the static shell, so JS-off visitors never see a control that cannot work"
  - "ThemeThumb takes its className directly; cn() is not used because src/lib/utils lands in plan 02-07"
  - "Task 2 production files needed no change: the Task 1 script and lib already guarded every storage and matchMedia access, so the tests passed on first run"
requirements-completed: [DSN-03]
coverage:
  - id: D1
    description: "A visitor toggles light and dark from a fixed top-right button; data-theme flips, the choice is stored under 'theme' and survives reload"
    requirement: DSN-03
    verification:
      - kind: e2e
        ref: "tests/e2e/theme.spec.ts#theme: toggle switches to dark and the choice survives reload"
        status: pass
    human_judgment: false
  - id: D2
    description: "First visit follows prefers-color-scheme in both directions and a stored choice wins over the system"
    requirement: DSN-03
    verification:
      - kind: e2e
        ref: "tests/e2e/theme.spec.ts#theme: first visit follows system preference; #theme: stored choice wins over system preference"
        status: pass
      - kind: unit
        ref: "tests/unit/theme-script.test.ts (system dark, system light, stored light, stored dark)"
        status: pass
    human_judgment: false
  - id: D3
    description: "No theme flash: with every app JS file blocked the attribute and the computed body background already match the chosen theme"
    requirement: DSN-03
    verification:
      - kind: e2e
        ref: "tests/e2e/theme.spec.ts#theme: no flash, attribute and background are set before app JS runs"
        status: pass
    human_judgment: false
  - id: D4
    description: "Blocked or throwing storage, junk stored values and missing matchMedia never break the page; the toggle still switches for the session with no pageerror"
    requirement: DSN-03
    verification:
      - kind: e2e
        ref: "tests/e2e/theme.spec.ts#theme: blocked storage falls back to system preference and toggle still works"
        status: pass
      - kind: unit
        ref: "tests/unit/theme-script.test.ts (junk value, getItem throws, matchMedia missing, matchMedia throws); tests/unit/theme.test.ts (setItem throws)"
        status: pass
    human_judgment: false
  - id: D5
    description: "The thumb is animated by react-spring snappy (500/32/1) imported only through the @/anim barrel; the button is native with aria-pressed and a constant name"
    requirement: DSN-03
    verification:
      - kind: other
        ref: "npm run lint (no-restricted-imports clean); grep acceptance checks for '@/anim' import, aria-pressed, data-part, tension 500, friction 32"
        status: pass
    human_judgment: true
    rationale: "Spring feel on a real phone is tuned in Phase 4; reduced-motion snapping lands in plan 02-07"
duration: 3 min
completed: 2026-10-18
---

# Phase 2 Plan 05: Theme Toggle Summary

Two-state light/dark theme with an inline head script that sets `data-theme` before first paint (system default, stored choice wins, all storage access guarded), a native `aria-pressed` toggle fixed top-right, and a react-spring thumb routed through the new `@/anim` barrel.

## Task 1: Tracer (commit 0546df1)

- `index.html`: one classic inline script in head after the meta tags, title and favicon link; Vite emits it ahead of the module script and stylesheet in `dist/index.html`. Prettier kept it as written.
- `src/lib/theme.ts`: `readTheme` reads `html[data-theme]`; `applyTheme` writes the attribute first, then `localStorage.setItem` in try/catch.
- `src/anim/tokens.ts` (snappy 500/32/1, gentle 170/26/1, bouncy 300/14/1 in both libraries' formats; durations 120/220/420; easeOut), `ThemeThumb.tsx` (`useSpring` x 0 to 20, `x.to` into a translateX string, `aria-hidden`, `data-part="theme-thumb"`, no CSS transition utilities, initial value is the target so mount does not animate), and the `src/anim/index.ts` barrel.
- `ThemeToggle.tsx` per the markup contract (44 px button, 48x28 track, 24 px thumb), `App.tsx` renders the fixed header before `Page`.
- Tracer feedback gate: `<verify>` is automated-only, so it was re-run end to end after the commit (build, the "survives reload" browser test, lint, format check, hero parity 3 passed). Tracer verified end-to-end - expanding. No checkpoint.

## Task 2: Edge cases (TDD, commit f4b10b2)

- `tests/unit/theme-script.test.ts` (9 tests) parses the real `index.html` from disk, takes the single inline script and runs it with `new Function` in jsdom for: system dark and light, stored light over dark system, stored dark over light system, junk value, `getItem` throwing, `matchMedia` missing and throwing. It also pins that there is exactly one inline script, untyped, in the head.
- `tests/unit/theme.test.ts` (5 tests): attribute plus storage, blocked `setItem`, only the `theme` key stored, `readTheme` for dark, light, missing and unknown.
- `tests/e2e/theme.spec.ts` now has 5 tests: the tracer plus first visit per scheme, stored choice wins (init script), no flash with `**/assets/*.js` aborted (asserts the computed body background for both themes), and a throwing `localStorage` getter with a `pageerror` collector.
- TDD note: there was no separate RED commit. The Task 1 tracer already implemented the guards, so every new test passed on its first run, and a RED commit that fails by construction was not possible. To confirm the tests discriminate, the allowlist in `index.html` was temporarily mutated to `if (!t)`; the junk-value test failed as expected, and the file was restored (clean `git status`).

## Plan-level verification

| Check | Result |
|-------|--------|
| `npx vitest run` (via `npm run verify`) | 26 passed, theme-script 9, theme 5, hero-parity 3, boundaries 9 |
| `VITE_BASE=/aa-phan-portfolio-v2/ npx playwright test -g "theme"` | 5 passed |
| `VITE_BASE=/aa-phan-portfolio-v2/ npm run verify` | pass (typecheck, lint with deny-warnings, format check, tests, build) |
| Task 1 acceptance: one `<script>` in index.html, script before module script and stylesheet in `dist/index.html`, `from '@/anim'` present, `@react-spring/web` absent from ThemeToggle, `aria-pressed`, `data-part`, `tension: 500`, `friction: 32` | pass |
| Task 2 acceptance: theme-script 9 (>= 7), theme 5 (>= 4), `try` count 2 in index.html, `catch` in theme.ts, 5 `test(` in theme.spec.ts, `localStorage` in src only on `src/lib/theme.ts:17` | pass |
| Nothing pushed | pass |

## Deviations from Plan

None - plan executed exactly as written. (The only departure is procedural: Task 2 had no RED commit because the behavior already existed from the tracer; see Task 2.)

## Known Stubs

None.

## Threat Flags

None. T-02-10 (allowlist, junk-value test), T-02-11 (guarded accesses, throwing-storage browser test with no pageerror) and T-02-12 (only the `theme` key; `localStorage` appears only in `src/lib/theme.ts`) are mitigated as planned. T-02-13 is accepted as planned.

## Next

Ready for 02-06. Plan 02-07 adds the motion-preference provider so the thumb snaps under reduced motion, and extends the `@/anim` barrel.

## Self-Check: PASSED

All ten key files verified on disk; commits 0546df1 and f4b10b2 are ancestors of HEAD.
