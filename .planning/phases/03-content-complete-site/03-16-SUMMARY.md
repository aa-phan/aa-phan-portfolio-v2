---
phase: 03-content-complete-site
plan: "16"
subsystem: ui
tags: [404, static-page, second-vite-entry, theme-script, wordmark, github-pages]

requires:
  - phase: 03-content-complete-site
    provides: inline theme-init script in index.html (Phase 2), finale wordmark classes and cqi constants (03-15), .cta flood markup (03-05/03-06), Archivo wdth font import
provides:
  - 404.html, a static "Dead air." page built as a second Vite entry (no React, no module script)
  - src/styles/not-found.css, the 404 stylesheet (Archivo, shared styles, the stuck-glyph rule)
  - build.rolldownOptions.input naming index.html and 404.html
  - Unit test locking the 404 inline theme script to index.html's byte for byte
  - not-found.spec.ts (6 chromium tests: light, dark, stored choice, glyph, 320 px in both themes)
affects: [03-17 doc catch-ups, 03-19 staging check of the real 404 status (research A2), Phase 4 A/V flip (glyph span), Phase 6 visual QA]

status: complete
commits: 2
plan_head_before: 113f3d3678f816896750b0aa06f56505f20d4c9d
plan_head_after: cb439df9e3acf75e602ffd5fc456a1f85e372f36

actuals:
  tokens: 2900
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "A second HTML entry is a static page: Vite rewrites %BASE_URL% and the stylesheet link to base-prefixed asset URLs, so the page works when GitHub Pages serves it from any depth"
    - "The 404 carries data-theme=\"light\" on <html> as its no-JavaScript default; the inline theme script (identical to index.html's) overrides it before paint"
    - "Stuck glyph: .wordmark-glyph becomes inline-block with perspective(600px) rotateX(84deg), static, so A (day) and V (night) read as a thin sliver"

key-files:
  created:
    - 404.html
    - src/styles/not-found.css
    - tests/e2e/not-found.spec.ts
  modified:
    - vite.config.ts
    - src/styles/index.css
    - tests/unit/theme-script.test.ts

key-decisions:
  - "With JavaScript off the 404 shows the light theme, not the system preference. html carries data-theme=\"light\" so the day wordmark (PHAN) shows alone; without the attribute both PHAN and PHVNTM render, because the wordmark swap rules key on html[data-theme]"
  - "No prefers-color-scheme CSS fallback was added: it would copy a third dark token block into the heavily gated tokens.css (or trip check:colors if placed elsewhere). The theme script is the only theme logic, on both entries"
  - "check:budget keeps reading dist/index.html only, as the research said; the 404 ships zero JavaScript so it has nothing to budget"

patterns-established:
  - "Static second-entry pages mirror component markup (CtaLink, Wordmark, Footer) as literal HTML with the same classes; Tailwind scans them through an @source line in index.css"

requirements-completed: []
# Plan frontmatter declares NAV-04. It is deliberately NOT marked complete here, per the owner's instruction for this run.

duration: 25 min
completed: 2026-10-27

coverage:
  - id: D1
    description: "An unknown URL gets the designed 404: h1 'Dead air.', 'This page isn’t in the set.', a 'Back to the home page' CTA whose href is the site base, aria-hidden wordmark, robots noindex, no .js request, light palette"
    requirement: NAV-04
    verification:
      - kind: test
        ref: "tests/e2e/not-found.spec.ts#404 page, light says Dead air. with a way home, in the light palette"
        status: pass
      - kind: command
        ref: "dist/404.html exists, holds 'Dead air.', has no type=\"module\", has /aa-phan-portfolio-v2/assets/ URLs"
        status: pass
    human_judgment: false
  - id: D2
    description: "The page ships no JavaScript beyond the inline theme script and is built as a second Vite entry with base-prefixed assets"
    requirement: NAV-04
    verification:
      - kind: command
        ref: "npm run build; grep checks on dist/404.html; npm run check:budget (124.8 kB, unchanged)"
        status: pass
      - kind: test
        ref: "tests/unit/theme-script.test.ts#is exactly one classic inline script in the head"
        status: pass
    human_judgment: false
  - id: D3
    description: "The 404 inline theme script is byte-identical to index.html's, and a one-character change is detected"
    requirement: NAV-04
    verification:
      - kind: test
        ref: "tests/unit/theme-script.test.ts#is byte-identical to the one in index.html"
        status: pass
      - kind: test
        ref: "tests/unit/theme-script.test.ts#the identity check reports a one-character change as different"
        status: pass
    human_judgment: false
  - id: D4
    description: "Dark: the dark palette D background and the night wordmark follow the system theme; a stored light choice beats a dark system; both glyphs carry a non-none transform that leaves a thin sliver"
    requirement: NAV-04
    verification:
      - kind: test
        ref: "tests/e2e/not-found.spec.ts#404 page, dark follows the system theme: dark palette, night wordmark, no script file"
        status: pass
      - kind: test
        ref: "tests/e2e/not-found.spec.ts#404 page, dark a stored light choice beats a dark system"
        status: pass
      - kind: test
        ref: "tests/e2e/not-found.spec.ts#404 page, light glyph and fit the day wordmark shows PHAN with the A stuck edge-on"
        status: pass
    human_judgment: false
  - id: D5
    description: "'Dead air.' at the phone text-mega clamp causes no horizontal overflow at 320 px in either theme"
    requirement: NAV-04
    verification:
      - kind: test
        ref: "tests/e2e/not-found.spec.ts#404 page, light glyph and fit no horizontal overflow at 320 px (light)"
        status: pass
      - kind: test
        ref: "tests/e2e/not-found.spec.ts#404 page, light glyph and fit no horizontal overflow at 320 px (dark)"
        status: pass
    human_judgment: false
  - id: D6
    description: "check:no-phone and check:images cover and pass with the new page in dist"
    requirement: NAV-04
    verification:
      - kind: command
        ref: "npm run check:no-phone (no-phone: OK); npm run check:images (check-images: OK)"
        status: pass
    human_judgment: false
  - id: D7
    description: "The page reads well: Dead air. headline, CTA, and the edge-on glyph sliver in the fitted wordmark"
    requirement: NAV-04
    verification:
      - kind: command
        ref: "Chromium screenshots at 1280 (light) and 320 (dark) viewed by the executor"
        status: pass
    human_judgment: true
    rationale: "The look of the sliver in the wordmark (a thin A or V in the middle of PHAN or PHVNTM) and the amount of open ground are a visual judgment; the owner has not reviewed them (Phase 6 visual QA)"
  - id: D8
    description: "GitHub Pages serves 404.html with a real 404 status for unknown paths under the project URL (research A2)"
    requirement: NAV-04
    verification: []
    human_judgment: true
    rationale: "vite preview falls back to index.html, so the real status can only be confirmed on the deployed site; plan 03-19 checks it with a live request"
---

# Phase 3 Plan 16: 404 page "Dead air." Summary

**A static second Vite entry serves "Dead air." in the site's voice: filled CTA home, the fitted finale wordmark with the A (day) or V (night) stuck edge-on, noindex, no JavaScript beyond an inline theme script that a unit test keeps byte-identical to index.html's.**

## Performance

- **Duration:** about 25 min (2026-10-27, 14:25 to 14:47 local; start time not recorded precisely)
- **Tasks:** 2 of 2
- **Files modified:** 6 (3 created, 3 modified)

## Accomplishments

- Task 1 (tracer): `404.html` with the index.html head (charset, viewport-fit, color-scheme, `%BASE_URL%` icon), `robots` noindex, title "Dead air. | Aaron Phan", a 130-character description, the inline theme script, and a stylesheet link to `not-found.css`. Body: `main` with the h1 at `text-mega`, the line at `text-l`, the "Back to the home page" CTA (same classes and flood span as `CtaLink`, `href="%BASE_URL%"`), and a footer with the finale wordmark markup and "Aaron Phan. DJs as PHVNTM.". `vite.config.ts` names both HTML entries under `build.rolldownOptions.input`; `index.css` gains `@source '../../404.html'`. The built `dist/404.html` has base-prefixed CSS, icon and CTA URLs and no module script; `check:budget` still reads `dist/index.html` (124.8 kB, unchanged); `check:no-phone` and `check:images` pass with the page in dist.
- Task 2: `tests/unit/theme-script.test.ts` gains three cases: the 404 script is one classic inline head script with no external or module script, it equals index.html's script as a string, and a one-character alteration is reported as different. `.wordmark-glyph` in `not-found.css` becomes `inline-block` with `perspective(600px) rotateX(84deg)` so it reads as a thin static sliver. Five new e2e cases cover the dark palette and night wordmark, a stored light choice beating a dark system, the glyph's matrix3d with a y scale under 0.15, and no overflow at 320 px in both themes (after `document.fonts.ready`).
- Looked at Chromium screenshots at 1280 light and 320 dark: the headline wraps to two lines at 320 and stays inside the viewport, the CTA is a 44 px pill, and the wordmark fills the width with the sliver in place of the A or V.

## Task Commits

1. **Task 1 (tracer): static 404 page 'Dead air.' as a second Vite entry with no JavaScript** - `e030e95` (feat)
2. **Task 2: 404 theme script locked to index.html, glyph stuck edge-on, both themes at 320 px** - `cb439df` (feat)

Tracer gate: auto mode is off and `human_verify_mode` is end-of-phase with an automated-only `<verify>`, so the tracer chain was run end to end (build, dist greps, check:no-phone, check:images, the chromium spec) before expanding: all green. Logged "Tracer verified end-to-end, expanding".

## Verification

- `npx vitest run tests/unit/theme-script.test.ts`: 13 passed.
- `npx playwright test --project=chromium tests/e2e/not-found.spec.ts`: 6 passed.
- `VITE_BASE=/aa-phan-portfolio-v2/ npm run verify`: exit 0 (typecheck, lint, format:check, unit tests, check:case, check:colors, check:contrast, build, check:budget 124.8 kB of 150 kB, check:no-phone, check:images).
- `VITE_BASE=/aa-phan-portfolio-v2/ npm run test:e2e`: 147 passed (141 before plus 6 new), chromium and mobile.
- All task acceptance criteria re-run: pass.

## Files Created/Modified

- `404.html`, `src/styles/not-found.css` - the page and its stylesheet
- `vite.config.ts`, `src/styles/index.css` - second entry and Tailwind `@source`
- `tests/unit/theme-script.test.ts`, `tests/e2e/not-found.spec.ts` - coverage

## Decisions Made

See key-decisions in the frontmatter.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The 404 showed both wordmarks with JavaScript off**
- **Found during:** Task 1 (reading the wordmark swap rules against a page that runs no script in the tracer spec)
- **Issue:** `.wordmark-day` and `.wordmark-night` are hidden only under `html[data-theme]`. With JavaScript off the theme script never sets the attribute, so the plan's own "works with JavaScript disabled" criterion would render PHAN and PHVNTM stacked, and the light tokens apply only because they also sit on `:root`.
- **Fix:** `<html lang="en" data-theme="light">` in `404.html`. The inline script (still byte-identical to index.html's) overwrites it before paint when it runs.
- **Files modified:** `404.html`
- **Commit:** `e030e95`

**2. [Interpretation] The dark e2e cases run with JavaScript enabled**
- The plan says the dark case runs with JavaScript disabled and shows the dark palette and night wordmark. With the script off nothing can select dark: the theme logic lives only in the inline script, and a `prefers-color-scheme` CSS fallback would duplicate a third dark token block in `tokens.css` (gated by check:contrast and its parser) or trip `check:colors` elsewhere. The dark tests therefore enable JavaScript, so the page's own inline script runs, and still assert that no `.js` file is requested. The light cases and the light 320 px case run with JavaScript off.

**3. [Interpretation] Palette D background compared as oklch**
- The plan names "the light palette D background"; Chromium reports computed colors as the oklch string (as `theme.spec.ts` already asserts), so the spec compares `oklch(0.9696 0.003 290)` and `oklch(0.1491 0.0128 292.39)`.

**4. [Interpretation] Task 2 production-code changes**
- The glyph rule was added to `not-found.css` (the acceptance criteria allow either file) rather than as an inline style in `404.html`. The script-identity test passed on first run because the script was copied byte for byte in Task 1, so there was no separate red step; the one-character self-check proves the comparison can fail.

**Total deviations:** 1 auto-fixed (1 bug), 3 interpretations. **Impact:** none on scope; the no-JavaScript page is consistent and the dark cases still prove no script file loads.

## Issues Encountered

- With JavaScript disabled a dark-mode visitor sees the light 404 (documented in key-decisions); the day wordmark shows alone. Phase 6 can add a media-query fallback if the owner wants it.
- UI-SPEC's 404 table mentions "Back to the start" in one cell; the Copywriting Contract's "Back to the home page" is used, as the plan flagged.
- The real 404 status on GitHub Pages is not testable locally (research A2); plan 03-19 checks it on staging.
- NAV-04 is deliberately not marked complete in REQUIREMENTS.md, per the instruction for this run.

## Known Stubs

None.

## Threat Flags

None. The 404 adds a static page with only public copy; T-03-22 (script drift) is mitigated by the identity unit test, T-03-32 by the noindex e2e assertion and the check:no-phone scan of `dist/404.html`.

## Next Phase Readiness

Ready for 03-17.
