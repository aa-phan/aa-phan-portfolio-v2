---
phase: 03-content-complete-site
plan: "01"
subsystem: ui
tags: [design-tokens, oklch, tailwind, contrast, wcag, playwright, vitest]

requires:
  - phase: 02-deployed-themed-skeleton
    provides: token file, contrast gate, matrix generator, pinned unit and e2e tests
provides:
  - Palette D (neutral grounds, indigo as signal) in src/styles/tokens.css for both themes
  - Regenerated docs/contrast-matrix.md, gate RESULT PASS checks=40
  - Tokens doc candidate D with "Chosen palette: D", RESULT PASS palettes=4 checks=152
  - Unit and e2e pins moved from palette A to palette D
  - Owner legitimacy approval for pdfjs-dist@6.3.289 and axe-core@4.13.0
affects: [03-03 fonts and type ladder, 03-17 PDF text-layer gate, 03-18 axe QA loop, every Phase 3 section plan]

status: complete
commits: 1
plan_head_before: fb5cafa62bdbb8d6edfd92d3841b974b6279c570
plan_head_after: 7cbed4dbcabf2f2e5bb82a24557ddcd49cb4c2b1

actuals:
  tokens: 14000
  tasks: 2
  commits: 1

tech-stack:
  added: []
  patterns:
    - "Derived hexes and ratios in tests are computed from resolveTheme and the gate output, never typed by hand"
    - "E2E background pins use Chromium computed-style strings"

key-files:
  created: []
  modified:
    - src/styles/tokens.css
    - docs/contrast-matrix.md
    - tests/unit/tokens.test.ts
    - tests/e2e/theme.spec.ts
    - tests/e2e/smoke.spec.ts
    - .planning/phases/01-decisions-and-documentation/01-DESIGN-TOKENS.md

key-decisions:
  - "D-02: palette D replaces palette A in place; only --text, --background and --secondary change, --primary, --accent and the derived block are untouched"
  - "T-03-SC: pdfjs-dist@6.3.289 and axe-core@4.13.0 approved by the owner before plans 03-17 and 03-18 install them"

patterns-established:
  - "Palette swap flows token file -> contrast gate -> regenerated matrix -> tokens doc -> pinned tests in one commit"

requirements-completed: [NAV-04, CNT-04]

duration: n/a (two sessions, checkpoint in between)
completed: 2026-10-27
---

# Phase 3 Plan 01: Palette D Tracer and Package Approval Summary

**Palette D ships in both themes with the contrast gate at PASS checks=40, the tokens doc at PASS palettes=4 checks=152, all palette A pins moved to D, and the owner's approval of the two flagged dev packages recorded.**

## Accomplishments

- `src/styles/tokens.css`: light and dark `--text`, `--background`, `--secondary` set to the DESIGN.md section 5 palette D values; `--primary`, `--accent` and the derived block left unchanged.
- `docs/contrast-matrix.md` regenerated; `npm run check:contrast` ends `RESULT: PASS checks=40` with no stale-matrix line.
- `01-DESIGN-TOKENS.md`: Candidate D section added, `Chosen palette: D`, chosen-system and matrix sections name D; `contrast-check.mjs --require-chosen` ends `RESULT: PASS palettes=4 checks=152`.
- `tests/unit/tokens.test.ts` describe title is now `palette D in src/styles/tokens.css`, with HEX and RATIOS tables computed from the shipped file; `tests/e2e/theme.spec.ts` and `tests/e2e/smoke.spec.ts` background pins use Chromium's computed strings.
- Task 2 checkpoint resolved (below).

## Task Commits

1. Task 1 (tracer): palette D through tokens, gate, matrix, tokens doc, pinned tests - `7cbed4d`
2. Task 2 (checkpoint:human-verify, blocking-human): no code; approval recorded in this file. Nothing installed.

Plan 03-02 committed `6daa23a` (touching only `01-CONTENT-INVENTORY.md`) between this plan's commits; it is not a 03-01 commit. A raw `git rev-list --count plan_head_before..HEAD` therefore reads 2, while 03-01's own count is 1. `plan_head_after` is set to 03-01's last commit (`7cbed4d`) for that reason.

## Package Legitimacy Approval (T-03-SC, D-24)

Checkpoint: owner asked to confirm `pdfjs-dist@6.3.289` (plan 03-17, CNT-04 PDF text-layer gate) and `axe-core@4.13.0` (plan 03-18, D-24 QA loop) as devDependencies. Both were flagged SUS only for being too new on their `latest` tags; the pinned versions are older releases with no postinstall script.

Owner's verbatim reply: "approved"

Approved: pdfjs-dist@6.3.289, axe-core@4.13.0

## Deviations from Plan

**1. [Rule 3 - Blocking] `prettier --write DESIGN.md` was a no-op.** DESIGN.md is listed in `.prettierignore` (commit `611a851`, "ignore DESIGN.md in prettier"), so the plan's step 1 formatting never applied and the format check no longer covers it. No DESIGN.md change was needed or made.

**2. [Rule 1 - Format] Prettier rewrites `oklch(0.9696 0.0030 290.00)` as `oklch(0.9696 0.003 290)`.** The acceptance grep for the literal `oklch(0.9696 0.0030 290.00)` in tokens.css therefore fails, while the value is identical, `format:check` passes, and the gate and unit tests are green. E2E pins use the Chromium computed-style strings instead of the literal.

**3. RATIOS table kept at 38 rows** as specified; ratios are the two-decimal values the gate prints for the new file.

## Known Stubs

None.

## Threat Flags

None. No new network, auth, or file-access surface; token values only.

## Self-Check: PASSED

- Commit `7cbed4d` is an ancestor of HEAD.
- All six modified files exist.
