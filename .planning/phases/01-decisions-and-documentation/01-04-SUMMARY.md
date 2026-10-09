---
phase: 01-decisions-and-documentation
plan: 04
subsystem: docs
tags: [design-tokens, oklch, wcag, contrast, typography, tailwind-v4, fontsource]

requires:
  - phase: 01-01
    provides: "Tracer 01-DESIGN-TOKENS.md with candidate A, the format spec and contrast-check.mjs"
provides:
  - "01-DESIGN-TOKENS.md (Accepted, Chosen palette: A): three candidates, 14-token chosen system, 38-row contrast matrix, typography, spacing/radius/elevation/z-index/breakpoints, Tailwind v4 mapping"
affects: [01-07-wireframes, phase-02-scaffold, phase-02-tokens-css, phase-02-contrast-gate]

actuals:
  tokens: 7100
  tasks: 3
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Exactly 5 role tokens per theme plus 9 derived tokens defined only as mix() of roles, so a palette swap edits one block"
    - "Contrast claims are recomputed by contrast-check.mjs (--require-chosen) and matrix rows are copied from its output"
    - "Fluid display type via rem plus vw clamp between the 375 and 1280 px viewports"

key-files:
  created: []
  modified:
    - .planning/phases/01-decisions-and-documentation/01-DESIGN-TOKENS.md

key-decisions:
  - "Chosen palette A: tuned seed indigo with light --primary 5046e5 (retuned from 281fb4 so the focus ring holds 3:1 on page, card, secondary tint and filled primary)"
  - "Typography: Inter only (@fontsource-variable/inter 5.3.0), one family, weights 400 to 700, scale ratio 1.200; no display face"
  - "Candidates B (Clay and cream, Fraunces + Inter) and C (Lagoon and amber, Bricolage Grotesque + Inter) kept in the doc as Not chosen for traceability and still pass all 19 pairs in both themes"
  - "Light-theme --primary and --accent are close in hue, so state is never conveyed by color alone (shape and weight also)"

patterns-established:
  - "Not chosen candidates stay in the doc and the checker keeps validating them (114 checks across 3 palettes)"

requirements-completed: [DOC-04]

duration: not captured
completed: 2026-10-09
status: complete
---

# Phase 1 Plan 04: Design tokens Summary

**Palette A (tuned seed indigo) and Inter-only typography chosen after comparing two alternatives (clay/cream, lagoon/amber); the tokens doc now holds a 14-token chosen system, a 38-row light and dark contrast matrix that passes WCAG 2.2 AA on paper, a 1.200 fluid type scale, spacing to z-index tokens and the Tailwind v4 mapping.**

## Performance

- **Duration:** not captured (execution was split across a checkpoint and a continuation agent)
- **Completed:** 2026-10-09
- **Tasks:** 3 (2 auto, 1 decision checkpoint)
- **Files modified:** 1

## Accomplishments

- Task 1: candidates B (Fraunces + Inter) and C (Bricolage Grotesque + Inter) authored per theme beside a refined A, each with type pairing, two realtimecolors preview links, rationale against the brief's Personality adjectives, and a 19-row contrast table. Light primary hues are 277 (A), 42 (B) and 186 (C), more than 60 degrees apart pairwise. The 19-pair list and the Exemptions note were added. All three palettes pass 114 checks.
- Task 2: the user picked a candidate (reply recorded below).
- Task 3: added `Chosen palette: A`, `Status: Accepted`, `Chosen.` / `Not chosen.` markers, the Chosen system table (5 roles plus 9 derived, light and dark oklch and hex, Defined as formulas), the 38-row Contrast matrix copied from checker output (all PASS), Typography, Spacing/radius/elevation/z-index/breakpoints, Tailwind v4 mapping and a Motion tokens pointer to 01-MOTION-SPEC.md.
- `contrast-check.mjs --require-chosen` prints `CHOSEN A` and `RESULT: PASS palettes=3 checks=114`.

## User decision (Task 2)

User reply recorded as: **"A"** (Candidate A, tuned seed indigo, Inter only; use the retuned light `--primary` 5046e5 documented in Candidate A, not 281fb4).

## Font packages

| Package | Version | Role |
|---------|---------|------|
| `@fontsource-variable/inter` | 5.3.0 | Chosen: display and body (one family) |
| `@fontsource-variable/fraunces` | 5.3.0 | Candidate B display, not chosen |
| `@fontsource-variable/bricolage-grotesque` | 5.3.0 | Candidate C display, not chosen |

All three were confirmed with `npm view` before being recorded. Phase 2 applies its own package-legitimacy gate before installing Inter.

## Task Commits

1. **Task 1: Candidates B and C, refined A, 19-pair matrix** - `94293ab` (docs)
2. **Task 2: Palette and type decision** - checkpoint, no commit (reply "A")
3. **Task 3: Chosen system, contrast matrix, typography, spacing to z-index, Tailwind mapping** - `b5a78e1` (docs)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Typography section named three Fontsource packages**
- **Found during:** Task 3 verify (distinct-package count was 3, limit is 2)
- **Issue:** The explanatory sentence about a later display-face swap spelled out the full `@fontsource-variable/fraunces` and `@fontsource-variable/bricolage-grotesque` names inside the Typography section.
- **Fix:** Reworded to name the faces (Fraunces, Bricolage Grotesque) and point to the candidate sections for package names; the section now names only `@fontsource-variable/inter`.
- **Files modified:** 01-DESIGN-TOKENS.md
- **Commit:** b5a78e1 (fixed before commit)

Otherwise the plan executed as written. Derived values for `--text-sm` (0.9rem half-step) and the fluid clamp coefficients were computed for the 375 to 1280 px range and spot-checked at both ends.

## Known Stubs

None. The doc is a specification; Phase 2 writes tokens.css from it.

## Threat Flags

None. Phone-number regex gate returned nothing in both auto tasks (T-01-12); matrix rows copied from checker output (T-01-10); package names confirmed via `npm view` (T-01-11).

## Self-Check: PASSED

- 01-DESIGN-TOKENS.md exists; contains `Chosen palette: A`, `Status: Accepted`, 38 matrix rows, no FAIL
- Commits 94293ab and b5a78e1 exist in `git log`
- Checker: `CHOSEN A`, `RESULT: PASS palettes=3 checks=114`
