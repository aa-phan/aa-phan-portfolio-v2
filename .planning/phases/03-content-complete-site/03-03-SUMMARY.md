---
phase: 03-content-complete-site
plan: "03"
subsystem: ui
tags: [typography, fontsource, archivo, tailwind, tailwind-merge, font-metrics, playwright]

requires:
  - phase: 03-content-complete-site
    provides: palette D tokens and the pinned smoke and theme tests (plan 03-01)
provides:
  - Archivo Variable (wdth.css) as the only web font, Inter package removed
  - Poster type ladder text-mega, text-xl, text-l, text-m, text-body, text-s, text-xs with phone text-mega override
  - Radius rule rounded-hold (4 px), rounded-pill (9999 px), rounded-panel (28 px); sm, md, lg deleted
  - Archivo Fallback metric faces that hold the hero h1 box still while the font loads
  - Brand-pair text selection
  - Tokens doc Typography and radius record for the shipped system
affects: [every Phase 3 section plan (built directly on the ladder and radii), 03-06 hero restyle, 03-17 and 03-18 QA loops]

status: complete
commits: 2
plan_head_before: 33af9d9648ae7a5f3556995b0d79d41b35e01f25
plan_head_after: ec4e5ce56cd6ce0468152064f24ed8ef860047d5

actuals:
  tokens: 9000
  tasks: 2
  commits: 2

tech-stack:
  added: ["@fontsource-variable/archivo ~5.3.0 (5.3.0 installed)"]
  removed: ["@fontsource-variable/inter"]
  patterns:
    - "Custom Tailwind utility names (text-l, text-body, rounded-hold ...) are registered with tailwind-merge in cn() so they are not mistaken for colors"
    - "Fallback font metrics are measured with a throwaway Playwright probe (woff2 aborted versus loaded), not guessed"
    - "--t-mega media step lives in base.css; tokens.css stays flat"

key-files:
  created: []
  modified:
    - package.json
    - package-lock.json
    - src/main.tsx
    - src/styles/index.css
    - src/styles/base.css
    - src/layout/Section.tsx
    - src/sections/Hero/Hero.tsx
    - src/lib/utils.ts
    - index.html
    - tests/e2e/smoke.spec.ts
    - tests/unit/hero-parity.test.tsx
    - .planning/phases/01-decisions-and-documentation/01-DESIGN-TOKENS.md

key-decisions:
  - "D-03: Archivo Variable is the single family; the 1.2 modular scale is replaced by the seven-step poster ladder with per-step line-height, tracking and weight modifiers"
  - "D-06: held things 4 px, pressed things 9999 px, expanded pill panel 28 px; the sm, md and lg card radii are deleted"
  - "Archivo Fallback is two @font-face rules (Arial for weights 100-599, Arial Bold for 600-900) because one size-adjust cannot match both the 800 poster and the 400-500 body"

patterns-established:
  - "Register every custom utility group in cn() (extendTailwindMerge) when adding Tailwind theme names that collide with the text-* color namespace"

requirements-completed: [NAV-04]

duration: ~25 min
completed: 2026-10-27
---

# Phase 3 Plan 03: Archivo Variable and the Poster Ladder Summary

**Archivo Variable with a seven-step poster type ladder (phone text-mega override), the 4 / 9999 / 28 px hold-versus-press radius rule, a measured two-face metric fallback that moves the hero h1 box 0 px, and the tokens doc updated to match.**

NAV-04 is delivered as a foundation here (the phone `text-mega` override that fits name, role and CTAs into 375 x 667). The requirement itself stays pending until phase-level acceptance, per the project rule; `requirements mark-complete` was not called.

## Accomplishments

- Inter out, `@fontsource-variable/archivo` 5.3.0 in (`npm ls` shows 5.3.0; no install script; OK legitimacy verdict from the RESEARCH audit, so no checkpoint). `src/main.tsx` imports `@fontsource-variable/archivo/wdth.css`.
- `src/styles/index.css`: `--font-sans` and `--font-display` start with `'Archivo Variable', 'Archivo Fallback'`; every modular `--text-*` step and the display tracking token are deleted; the ladder is defined with `--line-height`, `--letter-spacing` and `--font-weight` modifiers exactly as the UI-SPEC values; `--radius-hold: 4px`, `--radius-panel: 28px`, `--radius-pill: 9999px`.
- `src/styles/base.css`: `--t-mega` is `clamp(3.75rem, 0.9rem + 22vw, 6.75rem)` below 768 px and `clamp(3.75rem, 0.9rem + 12.2vw, 12rem)` from 768 px (both 6.75rem at 768, no jump); `Archivo Fallback` `@font-face` rules; `::selection` uses `--primary` on `--on-primary`.
- Hero h1 (`text-mega`), role line (`text-l text-muted`) and every h2 (`text-xl`) migrated in `Hero.tsx`, `Section.tsx` and the `index.html` shell, so the parity test holds.
- `tests/e2e/smoke.spec.ts` fonts test pins `Archivo Variable` (at most 2 families, h1 computed font-family starts with it, every request same-origin).
- `01-DESIGN-TOKENS.md` Typography records Archivo 5.3.0, `wdth.css`, weight 100-900, width 62%-125%, latin woff2 90,104 B (about 42 kB over Inter's 48 kB), the ladder table, the phone override and the night rule (only wordmarks widen to 125%); the radius bullet records 4 px, 9999 px and 28 px.

## Fallback override values (final) and measured deltas

Measured with a throwaway Playwright probe (kept outside the repo in `/tmp`): the page built with `VITE_BASE=/aa-phan-portfolio-v2/`, once with `**/*.woff2` aborted so the fallback face renders, once after `document.fonts.ready` with Archivo loaded. Unwrapped text widths gave the size-adjust ratios; ascent and descent are Archivo's measured 0.90 and 0.25 em divided by size-adjust.

| Face | Source | font-weight | size-adjust | ascent-override | descent-override | line-gap-override |
|------|--------|-------------|-------------|-----------------|------------------|-------------------|
| regular | local Arial, Helvetica Neue, Helvetica | 100 599 | 100.9% | 89.2% | 24.8% | 0% |
| bold | local Arial Bold, Arial-BoldMT, Helvetica Neue Bold, Helvetica-Bold | 600 900 | 103.1% | 87.3% | 24.2% | 0% |

Width ratios (Archivo / fallback) after tuning: h1 1.0001, role line 0.9998, identical at 390 and 1280 px.

Measured shift when Archivo replaces the fallback in the shipped build (fallback minus loaded):

| Viewport | h1 top | h1 height | role line top | first CTA top | h1 text width |
|----------|--------|-----------|---------------|---------------|---------------|
| 390 px | 0 px | 0 px | 0 px | 0 px | -4.6 px (two-line wrap, widest line) |
| 1280 px | 0 px | 0 px | 0 px | 0 px | -0.1 px |

Every layout delta is 0 px, under the 2 px criterion at both widths. The 390 px text-width difference is a per-word kerning difference inside the same two-line wrap and moves no box. (The h1 and role line have fixed line-heights, so box position depends on line count and widths, which the width ratios pin.)

## Task Commits

1. Task 1 (tracer): Archivo Variable, poster ladder, radius rule, hero and h2 migration, smoke pin - `deda000`
2. Task 2: metric fallback faces, `::selection`, tokens doc record - `ec4e5ce`

Tracer gate (interactive, `end-of-phase`, automated-only verify): `npm run typecheck`, the parity test, the production build, the smoke and theme Playwright runs (12 passed), the old-utility grep, the package check, `check:colors` and `format:check` were re-run end to end after the final tracer edits before expanding.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] tailwind-merge dropped `text-l` when merged with `text-muted`**
- **Found during:** Task 1 (parity test failed: the React hero role line lacked `text-l`)
- **Issue:** `cn()` uses `twMerge`, which only knows Tailwind's default font-size names. It read the new `text-l` as a text color and let `text-muted` override it, so the React render and the static shell diverged (the exact flash-of-different-layout the parity test guards against).
- **Fix:** `src/lib/utils.ts` now builds `twMerge` with `extendTailwindMerge`, registering `text-{mega,xl,l,m,body,s,xs}` as font sizes and `rounded-{hold,panel,pill}` as radii.
- **Files modified:** `src/lib/utils.ts`
- **Verification:** `tests/unit/hero-parity.test.tsx` and the full unit suite (164 tests) pass.
- **Commit:** `deda000`

**2. [Rule 3 - Blocking] Parity comparator self-check required more than one class on the h1**
- **Found during:** Task 1
- **Issue:** `tests/unit/hero-parity.test.tsx` asserted `tokens.length > 1` on the shell h1. The plan makes the h1 a single `text-mega` class (the ladder sets size, weight and tracking), so the guard failed even though the comparator is fine.
- **Fix:** relaxed the precondition to `> 0`; dropping the only token still changes the class list, so the self-check still proves the comparator detects a removed token.
- **Files modified:** `tests/unit/hero-parity.test.tsx`
- **Commit:** `deda000`

**3. [Rule 2 - Missing critical] Single fallback face could not match both poster and body weights**
- **Found during:** Task 2
- **Issue:** probing showed Arial needs a different `size-adjust` for the 800 poster (about 1.031) than for 400-500 text (about 1.009); one face would have left the h1 off by about 2-3% in width.
- **Fix:** two `@font-face` rules for `Archivo Fallback` split at weight 600 (table above).
- **Files modified:** `src/styles/base.css`
- **Commit:** `ec4e5ce`

**Total deviations:** 3 auto-fixed (1 bug, 1 blocking, 1 missing critical). **Impact:** none on scope; all inside the planned files plus `src/lib/utils.ts` and the parity test.

## Authentication Gates

None.

## Issues Encountered

- `vite preview` run by hand must carry `VITE_BASE`, otherwise it serves at `/` and the probe page loads unstyled. Noted for later probes; Playwright's own webServer already inherits the variable.
- The shared `npm run verify` is green (exit 0): typecheck, lint, format, 164 unit tests, case, colors, contrast, build, JS budget (96.0 kB gz initial of 150 kB), no-phone.

## Known Stubs

None. `public/resume.pdf` is still the stand-in (owner export pending) and was not touched.

## Threat Flags

None. No new network surface: Archivo is self-hosted, and the smoke test asserts every request is same-origin (T-03-02). The font package entered the lockfile with an OK legitimacy verdict and a `~5.3.0` pin (T-03-SC); `npm install` printed only the existing `fsevents` allowScripts note.

## Next Phase Readiness

Every later Phase 3 section plan can use the ladder (`text-mega` to `text-xs`) and radii (`rounded-hold`, `rounded-pill`, `rounded-panel`) directly. Plan 03-06 restyles the hero; the role line still carries `text-muted` until then.

## Self-Check: PASSED

- Files: all `key-files.modified` entries exist and are tracked.
- Commits: `deda000` and `ec4e5ce` are ancestors of HEAD.
- Acceptance criteria (both tasks) re-run and passing: Archivo import, `Archivo Variable` in index.css, `text-mega` in Hero.tsx and index.html, `radius-hold` and `radius-panel`, parity test 4/4, `size-adjust` and `ascent-override`, tokens doc names Archivo Variable 5.3.0, `wdth.css`, the night rule, 4 px, 9999 px and 28 px.
- Plan verification: `VITE_BASE=/aa-phan-portfolio-v2/ npm run verify` exit 0; smoke and theme Playwright 12 passed; no old size or radius utility in `src` or `index.html`.
