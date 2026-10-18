---
phase: 02-deployed-themed-skeleton
plan: 06
subsystem: build-gates
tags: [budget, bundle-size, path-case, raw-colors, phone-number, verify, vitest]
requires:
  - phase: 02-deployed-themed-skeleton
    provides: verify chain and Vitest collection (02-04), finished theme toggle for the colors proof (02-05), build under a sub-path base (02-01)
provides:
  - scripts/check-js-budget.mjs, 150,000 B gzip gate over the module script and modulepreloads, inclusive boundary
  - scripts/check-path-case.mjs, import case gate that works on case-insensitive disks
  - scripts/check-colors.mjs, raw color and Tailwind default palette gate over src
  - scripts/check-no-phone.mjs, phone-shape and tel link gate over dist, logs file and offset only
  - npm run verify chaining all gates, so both workflows run them unchanged
  - architecture.md quality gates table naming the real commands
affects: [02-07, 02-08, 02-09]
status: complete
commits: 3
plan_head_before: 3db5e1c6b699a2d3c06409451bb118fc4a910340
plan_head_after: db54ecaae0728312e16b82c49df808264356381d
actuals:
  tokens: 6200
  tasks: 2
  commits: 3
tech-stack:
  added: []
  patterns: [gate scripts take --root or --dist so tests run them against temp directories, phone probes assembled at runtime from separate digit groups, segment-by-segment directory listing to detect case mismatches]
key-files:
  created:
    - scripts/check-js-budget.mjs
    - scripts/check-path-case.mjs
    - scripts/check-colors.mjs
    - scripts/check-no-phone.mjs
    - tests/unit/gates.test.ts
  modified:
    - package.json
    - tsconfig.app.json
    - docs/architecture.md
key-decisions:
  - "tel: is matched as a URI scheme (after a quote, backtick, parenthesis, equals sign or tag end, plus after whitespace in html and txt), not as a bare substring"
  - "check-colors also skips HTML entities such as &#169; via a lookbehind, so the hex rule does not misfire on markup"
  - "Initial JS total at plan close is 85,571 B gzipped (85.6 kB) of 150,000 B"
requirements-completed: [FND-03, FND-02]
coverage:
  - id: D1
    description: "verify fails when the initial JS exceeds the budget; the boundary is inclusive and JS_BUDGET_BYTES overrides it"
    requirement: FND-03
    verification:
      - kind: command
        ref: "npm run build && check:budget; JS_BUDGET_BYTES=1000 exits 1; =85571 exits 0; =85570 exits 1; missing referenced file exits 2"
        status: pass
    human_judgment: false
  - id: D2
    description: "An import whose case differs from the file on disk fails check:case with a readable message; the real repository passes"
    requirement: FND-02
    verification:
      - kind: unit
        ref: "tests/unit/gates.test.ts (check-path-case: alias, relative, directory segment, CSS @import, exact case, package and missing ignored, real repo)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Raw hex, rgb, hsl, oklch, oklab and Tailwind default palette utilities in src fail check:colors; token utilities and anchors pass; the real repository including the theme toggle passes"
    requirement: FND-02
    verification:
      - kind: unit
        ref: "tests/unit/gates.test.ts (check-colors: 6 cases including real repo)"
        status: pass
    human_judgment: false
  - id: D4
    description: "A phone-shaped string or tel: link in any served file fails check:no-phone, and the output names only file and offset"
    verification:
      - kind: unit
        ref: "tests/unit/gates.test.ts (check-no-phone: separated shape, dot shape, tel link variants, ten-digit in HTML, ten-digit constant in JS allowed, bare tel key allowed, clean dist, missing dist exits 2); digit groups asserted absent from output"
        status: pass
    human_judgment: false
duration: 4 min
completed: 2026-10-18
---

# Phase 2 Plan 06: Build Gates Summary

Four gate scripts (initial JS gzip budget, import path case, raw colors, phone numbers in dist) wired into `npm run verify`, each proven to fail in its negative direction; the current initial JS is 85,571 B gzipped of the 150,000 B budget.

## Task 1: Tracer (commit 868002c)

- `scripts/check-js-budget.mjs` parses `dist/index.html` tag by tag for the module script and every `modulepreload`, de-duplicates in a Set, maps each href to a dist file by stripping the base or falling back to the `assets/` segment, and gzips each at level 9. Dynamic-import chunks are not in the HTML, so they are excluded by construction. Exit 2 for no initial JS, a missing `index.html` or a referenced file that does not exist; a non-numeric `JS_BUDGET_BYTES` also exits 2.
- Measured on the real build under `/aa-phan-portfolio-v2/`: **85,571 B gzipped (85.6 kB)** for the single `assets/index-*.js` file (Vite reports 86.78 kB with its own gzip level). Boundary proven: `JS_BUDGET_BYTES=85571` exits 0, `85570` exits 1, `1000` exits 1. A dist built with a different base still resolved the file via the `assets/` fallback; removing the file exits 2 with a message naming the href.
- Tracer feedback gate: `<verify>` is automated-only, so it was re-run end to end after the commit (`npm run verify` through `check:budget`, exit 0). Tracer verified end-to-end, expanding. No checkpoint.

## Task 2: Case, color and phone gates (TDD, commits bf1294b RED, db54eca GREEN)

- RED (bf1294b): `tests/unit/gates.test.ts` written first; 20 of 21 tests failed because the scripts did not exist. Probe strings are assembled at runtime from separate digit groups, so no committed file holds a phone-shaped literal.
- GREEN (db54eca): the three scripts, `package.json` scripts (`check:case`, `check:colors`, `check:no-phone`, and `verify` in the contract order), `forceConsistentCasingInFileNames: true` in `tsconfig.app.json`, and the quality gates table in `docs/architecture.md` (command column added, rows name the real scripts, axe and Lighthouse stay as later gates).
- `check-path-case` walks `index.html`, root `*.config.*`, and `src`, `tests`, `scripts`; resolves `@/` and relative specifiers with the extension and index forms, and compares each path segment against a directory listing, so a case-insensitive disk cannot hide a mismatch. Also reports two walked paths that differ only by case.
- `check-colors` flags hex (three to eight digits, not preceded by `&` or a word character), `rgb(a)`, `hsl(a)`, `oklch`, `oklab`, and default palette utilities, skipping `src/styles/tokens.css` and `src/components/motion-primitives/`. Section anchors such as `#contact` and `#education` do not match.
- `check-no-phone` scans `.html .js .css .json .txt .svg .xml .webmanifest .pdf` in dist as latin1 so indexes are byte offsets, and prints `no-phone: FILE at offset N (label)` only.
- Final `npm run verify` under the sub-path base: exit 0; 52 unit tests (gates.test.ts has 26), `path-case: OK`, `colors: OK`, `initial JS: 85571 B`, `no-phone: OK`.

## Plan-level verification

| Check | Result |
|-------|--------|
| `VITE_BASE=/aa-phan-portfolio-v2/ npm run verify` | exit 0, prints the budget line and the three OK lines |
| `JS_BUDGET_BYTES=1000 npm run check:budget` after a build | exit 1 |
| `npx vitest run tests/unit/gates.test.ts` | 26 passed (criterion: at least 10) |
| verify script lists check:case, check:colors, build, check:budget, check:no-phone in order | pass |
| `grep forceConsistentCasingInFileNames` in tsconfig.app.json; `check-js-budget.mjs` and `check-no-phone.mjs` named in docs/architecture.md | pass |
| architecture.md grep for private paths, planning decision IDs and phone shapes | clean |
| OD-01 history guard over `origin/main..HEAD` | prints nothing |
| Nothing pushed | pass |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] tel: substring flagged React DOM's input-type list**
- **Found during:** Task 2, first full `npm run verify`
- **Issue:** The plan's "any `tel:` substring" rule matched `tel:!0` inside the minified bundle (an object key in React DOM's list of input types), so `check:no-phone` failed the real build with a false positive.
- **Fix:** Match `tel:` as a URI scheme: after a quote, backtick, opening parenthesis, equals sign or tag end (and after whitespace in `.html` and `.txt` only). Real links (`href="tel:..."`, unquoted href, JS string, template string, CSS `url(tel:...)`) still fail; the bare key passes. Five tests added to pin both directions. Phone-shaped numbers are untouched and nothing was allowlisted.
- **Files modified:** scripts/check-no-phone.mjs, tests/unit/gates.test.ts
- **Verification:** verify exit 0; gates.test.ts 26 passed
- **Commit:** db54eca

**Total deviations:** 1 auto-fixed (1 bug). **Impact:** none on scope; the gate is stricter about syntax and still catches every tel link form tested.

## Known Stubs

None.

## Threat Flags

None. T-02-14 and T-02-15 (check:no-phone in verify, output limited to file and offset, digits asserted absent), T-02-16 (runtime-assembled probes, history guard clean over unpushed commits), T-02-17 (inclusive budget boundary proven both ways) and T-02-18 (each gate has a negative test or forced failure) are mitigated as planned. The history guard over the already-public remote refs remains for plan 02-09.

## Next

Ready for 02-07. Plan 02-08 inserts `check:contrast` after `check:colors` in the verify chain.

## Self-Check: PASSED

All nine key files verified on disk; commits 868002c, bf1294b and db54eca are ancestors of HEAD.
