---
phase: 03-content-complete-site
plan: "13"
subsystem: ui
tags: [contrast-gate, tokens, inverted-band, sleeve-grounds, tailwind]

requires:
  - phase: 03-content-complete-site
    provides: palette D and the contrast gate (03-01), Projects crate, sleeves with data-kind and the dialog sibling (03-12)
provides:
  - Band-aware token parser: parseTokensCss returns { light, dark, bandOnLight, bandOnDark }
  - Contrast gate over four themes (light, dark, band-on-light, band-on-dark) with an optional per-pair themes field
  - "[data-theme='light'] .band-invert and [data-theme='dark'] .band-invert blocks carrying the opposite theme's complete token block"
  - Four neutral sleeve ground tokens (personal, employer, hackathon, course) audited in the band themes only
  - Projects section and its static shell on the inverted band; each sleeve grounded by its context kind
affects: [Phase 4 sleeve physics (the sleeve keeps data-kind and its band tokens), Phase 6 visual QA of the band in both themes]

status: complete
commits: 2
plan_head_before: 9951dcf71be78f987eeae13e3123a60ef0b56c86
plan_head_after: 0ac6e3ea67a975470c7b2d3004e160366dbf6e1d

actuals:
  tokens: 10100
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "The band wears the opposite theme's complete token block, never a variable swap, so derived tokens (muted, link, border, focus ring) are correct inside it"
    - "Band-only tokens (the sleeve grounds) are absent from the page themes; resolveTheme reads them only with { band: true } and a pair using one must limit its themes to the band"
    - "tokens.css stays flat: any at-rule makes the gate exit 2"

key-files:
  created: []
  modified:
    - scripts/lib/tokens.mjs
    - scripts/check-contrast.mjs
    - scripts/contrast-pairs.json
    - src/styles/tokens.css
    - docs/contrast-matrix.md
    - tests/unit/tokens.test.ts
    - src/sections/Projects/Projects.tsx
    - src/sections/Projects/Sleeve.tsx
    - src/sections/Projects/project-types.ts
    - index.html

key-decisions:
  - "Sleeve percentages tuned from the UI-SPEC starting recipe: personal text 19% into background, course text 5% into secondary (employer 24% and hackathon secondary 100% unchanged). The starting recipe put employer and course on the same lightness in the dark-page band and personal within 0.01 of hackathon, so the four grounds were not distinct; the tuned set keeps every step more than 0.03 lightness apart from each other and from the band ground in both bands"
  - "ProjectRow.context.kind narrowed from string to the four-kind union so the sleeve ground map is exhaustive at compile time instead of falling back silently"
  - "The static shell's projects section also wears band-invert so first paint matches React (no flash of the page ground)"

patterns-established:
  - "Negative gate tests tamper a temp copy of tokens.css and assert the failing row names its band theme"

requirements-completed: [CNT-01]

duration: 5 min
completed: 2026-10-27

coverage:
  - id: D1
    description: "Projects sits on an inverted band built from the opposite theme's complete token block, audited in both page themes"
    requirement: NAV-04
    verification:
      - kind: test
        ref: "tests/unit/tokens.test.ts#inverted band in src/styles/tokens.css"
        status: pass
      - kind: command
        ref: "npm run check:contrast (RESULT: PASS checks=112)"
        status: pass
    human_judgment: true
    rationale: "That the band reads as a landmark to a scrolling recruiter is a visual judgment; computed band colors were confirmed in Chromium but not reviewed by eye"
  - id: D2
    description: "The parser files band blocks into their own maps, rejects at-rules and reads an unterminated last declaration"
    requirement: CNT-01
    verification:
      - kind: test
        ref: "tests/unit/tokens.test.ts#parseTokensCss and resolveTheme"
        status: pass
    human_judgment: false
  - id: D3
    description: "Four neutral sleeve grounds from text, secondary and background only, audited in the band themes only"
    requirement: CNT-01
    verification:
      - kind: test
        ref: "tests/unit/tokens.test.ts#derives each sleeve ground from --text, --secondary and --background only"
        status: pass
      - kind: command
        ref: "npm run verify"
        status: pass
    human_judgment: true
    rationale: "Whether the four steps read as a sorted collection is an art-direction call; lightness spacing is asserted (more than 0.03) but not looked at"
---

# Phase 3 Plan 13: Inverted band and sleeve grounds Summary

**The Projects crate now sits on the opposite theme's complete token block, with four neutral sleeve grounds, and the CI contrast gate audits both in four themes (112 checks) so an unaudited band color cannot ship.**

## Performance

- **Duration:** 5 min (2026-10-27T19:02:11Z to 19:07Z)
- **Tasks:** 2 of 2
- **Files modified:** 10

## Accomplishments

- Task 1 (tracer): `parseTokensCss` now returns `bandOnLight` and `bandOnDark` and files any `.band-invert` selector there, never into the page maps. The gate evaluates light, dark, band-on-light and band-on-dark. `tokens.css` gained the two band blocks (the five role values and nine derived lines of the opposite theme, with `color-scheme` flipped), and the Projects section and its static shell carry `band-invert bg-background text-text`. Two pairs were added (`--background` on `--text`, `--muted` on `--secondary`): 22 pairs x 4 themes = 88 checks.
- Task 2: `COLOR_TOKENS` grew to 18 names; `BAND_ONLY_TOKENS` lists the four sleeve grounds; `resolveTheme(raw, { band })` resolves them only for a band; a pair may carry `themes`, and a pair using a band-only token without band-only themes exits 2. Twelve sleeve pairs (text, muted, focus ring on each ground) run in the two band themes only: 88 + 24 = 112 checks. Each sleeve takes its ground from its context kind.
- The parser already rejected at-rules, read an unterminated last declaration and used `Object.hasOwn` for categories (Phase 2 review fixes), so those behaviors only needed tests and were already covered by existing ones; no code change was required for them.
- Verified in Chromium (both page themes) that the section background and the seven sleeve backgrounds equal the values the gate resolves.

## Task Commits

1. **Task 1: Inverted Projects band with a band-aware contrast gate** - `0d23a5d` (feat)
2. **Task 2: Four neutral sleeve grounds audited in the band themes only** - `0ac6e3e` (feat)

Tests were written first in each task and observed failing (Vitest suite failed to load without the new parser output / exports) before the implementation; each task is a single commit containing tests and implementation.

## Files Created/Modified

- `scripts/lib/tokens.mjs` - four-map parser, `BAND_ONLY_TOKENS`, band-aware `resolveTheme`
- `scripts/check-contrast.mjs` - four themes, `themes` field validation and filtering
- `scripts/contrast-pairs.json` - 34 pairs (22 evaluated everywhere, 12 band-only)
- `src/styles/tokens.css` - band blocks and sleeve tokens
- `docs/contrast-matrix.md` - regenerated, 112 rows
- `tests/unit/tokens.test.ts` - band filing, band tamper, sleeve tamper, themes-field and validation negatives, sleeve derivation and distinctness
- `src/sections/Projects/Projects.tsx`, `Sleeve.tsx`, `project-types.ts`, `index.html` - band class, per-kind ground, narrowed kind type, shell parity

## Decisions Made

See key-decisions in the frontmatter. The main one is the percentage tuning: employer 24% / hackathon secondary 100% stayed, personal moved 8% to 19% and course 16% to 5%. The employer muted ratio on the dark-page band is 4.55:1 (ceiling is 24%, as the UI-SPEC warned).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Existing tamper test broke once the band carried a second copy of the light primary**
- **Found during:** Task 1
- **Issue:** `expect(tampered).not.toContain('oklch(0.5113')` failed because the dark-page band block legitimately holds the light `--primary` value.
- **Fix:** Assert exactly one remaining occurrence (the band's) after tampering the page theme.
- **Files modified:** tests/unit/tokens.test.ts
- **Commit:** 0d23a5d

**2. [Rule 2 - Missing critical] Band-only token pairs without a themes field would crash the gate**
- **Found during:** Task 2
- **Issue:** A pair naming a sleeve token with no `themes` would index an undefined page-theme color. Added validation so the gate exits 2 with a clear message, plus validation of unknown or empty `themes`.
- **Files modified:** scripts/check-contrast.mjs, tests/unit/tokens.test.ts
- **Commit:** 0ac6e3e

**3. [Rule 3 - Blocking] ProjectRow.context.kind typed as string could not index the ground map**
- **Fix:** Narrowed to the four-kind union (content already produces that union).
- **Files modified:** src/sections/Projects/project-types.ts
- **Commit:** 0ac6e3e

**4. [Plan-permitted tuning] Sleeve percentages** - see key-decisions.

**Total deviations:** 3 auto-fixed (1 bug, 1 missing critical, 1 blocking), 1 plan-permitted tuning. **Impact:** none on scope; the gate is stricter than specified.

## Issues Encountered

None.

## Known Stubs

None.

## Threat Flags

None. T-03-18 is mitigated: band maps are separate from page maps, at-rules are rejected, negative tests cover band tamper, sleeve tamper and misfiling, and the matrix is compared byte for byte.

## Verification

- `npx vitest run tests/unit/tokens.test.ts`: 36 passed
- `npm run check:contrast`: `RESULT: PASS checks=112` (computed total from the pairs file: 112)
- `npm run check:colors`: OK
- `VITE_BASE=/aa-phan-portfolio-v2/ npx playwright test --project=chromium tests/e2e/project-dialog.spec.ts tests/e2e/theme.spec.ts`: 24 passed
- `VITE_BASE=/aa-phan-portfolio-v2/ npm run verify`: exit 0; initial JS 121.3 kB gz of the 150 kB budget (up 0.1 kB)
- Acceptance greps for both tasks: all pass; no `@media`, `@layer` or `@supports` in tokens.css

## Requirements

CNT-01 is delivered (typed sleeves render on the band). NAV-04 is advanced (the band is the landmark and its pairs are audited) but deliberately not marked complete here, per the orchestrator's instruction.

## Next Phase Readiness

Ready for the next plan. Phase 6 should look at the band by eye in both themes; the full 113-test e2e run was not repeated here (only the plan's chromium specs plus the verify chain).

## Self-Check: PASSED

- All ten modified files exist and are committed; commits `0d23a5d` and `0ac6e3e` are ancestors of HEAD.
