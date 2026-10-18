---
phase: 02-deployed-themed-skeleton
plan: 04
subsystem: testing
tags: [vitest, jsdom, oxlint, no-restricted-imports, prettier, parity-test, import-boundaries]
requires:
  - phase: 02-deployed-themed-skeleton
    provides: static shell, Page, Hero, Section stubs (02-01, 02-02); ci.yml and deploy.yml calling npm run verify (02-03)
provides:
  - npm run verify chaining typecheck, lint, format check, unit tests and build - the single gate both workflows run
  - Vitest jsdom config limited to tests/unit, with a matchMedia stub and setMediaQuery helper
  - tests/unit/hero-parity.test.tsx - index.html shell versus rendered Page, with a comparator self-check
  - .oxlintrc.json no-restricted-imports boundaries with anim, motion-primitives, Page.tsx and tests/unit overrides
  - tests/unit/boundaries.test.ts - per-line lint proofs over four fixtures
affects: [02-05, 02-06, 02-07, 02-08, 02-09]
status: complete
commits: 3
plan_head_before: de5bfec30dc0d058b03141f360e6b63b06673201
plan_head_after: 39b5780a687a77ab71adaf85871624209ecf8507
actuals:
  tokens: 5200
  tasks: 2
  commits: 3
tech-stack:
  added: []
  patterns: [oxlint --ignore-path file so fixtures can be linted with --no-ignore, path-segment override globs, canonical DOM comparator for shell parity, JSON lint output parsed per line]
key-files:
  created:
    - vitest.config.ts
    - tests/setup.ts
    - tests/unit/hero-parity.test.tsx
    - tests/unit/boundaries.test.ts
    - tests/fixtures/sections/Imports.tsx
    - tests/fixtures/anim/Imports.tsx
    - tests/fixtures/motion-primitives/Ok.tsx
    - tests/fixtures/app/Page.tsx
    - .oxlintrc.json
    - .oxlintignore
  modified:
    - package.json
    - docs/architecture.md
key-decisions:
  - "Boundary glob patterns use ** (not *) so nested paths such as @/anim/physics/ThemeThumb and motion/react/client are rejected; a single * only matched one segment"
  - "Re-exports from an animation library are flagged by oxlint, so no limitation note was added to the architecture doc; the doc states re-exports are covered"
  - "Boundary test de-duplicates diagnostic lines because motion/react matches both the paths list and the animation-subpath pattern and is reported twice on one line"
requirements-completed: [FND-02, FND-04, NAV-01]
coverage:
  - id: D1
    description: "npm run verify exits non-zero when any of typecheck, lint, format check, tests or build fails and is the chain both workflows call"
    requirement: FND-02
    verification:
      - kind: other
        ref: "npm run verify (exit 0); grep -c 'npm run verify' on ci.yml and deploy.yml equals 1 each"
        status: pass
    human_judgment: false
  - id: D2
    description: "Shell versus React parity test fails on any tag, attribute, class token or text drift"
    requirement: NAV-01
    verification:
      - kind: unit
        ref: "tests/unit/hero-parity.test.tsx#comparator self-check: dropping one class token from the shell h1 is detected"
        status: pass
    human_judgment: false
  - id: D3
    description: "Animation and content imports outside their layers fail lint on their own line (static, dynamic, deep, direct primitive, content, upward from anim, re-export)"
    requirement: FND-04
    verification:
      - kind: unit
        ref: "tests/unit/boundaries.test.ts (9 tests)"
        status: pass
    human_judgment: false
duration: 2 min
completed: 2026-10-18
---

# Phase 2 Plan 04: Verify Chain, Parity Test and Import Boundaries Summary

`npm run verify` now runs typecheck, oxlint (--deny-warnings), the Prettier check, Vitest and the build as one chain that both workflows already call, with a shell-versus-React parity test and oxlint import-boundary rules proven line by line over four fixtures.

## Task 1: Tracer, verify chain and parity gate (commit a2dcead)

- vitest.config.ts (jsdom, `tests/unit/**/*.test.{ts,tsx}` only, setup file, restoreMocks, `@` alias) and tests/setup.ts (matchMedia stub with a live `matches` getter, change listeners, legacy addListener, `setMediaQuery(query, matches)` exported, reset after each test, `cleanup` registered).
- Parity test reads index.html from disk, parses it with DOMParser and compares a canonical form (tag, sorted attributes, class as a sorted token set, `%BASE_URL%` substituted, trimmed direct text, recursive children) with the rendered `Page`. The self-check removes one class token from the shell h1 and asserts the gate would fail. A third test pins one h1 and the seven section ids in order. 3 passed.
- Scripts added: `lint` (`oxlint --deny-warnings --ignore-path .oxlintignore`), `test` (`vitest run`), `verify` (the exact chain from the plan). `.oxlintignore` holds dist/, tests/fixtures/ and src/components/motion-primitives/ only.
- Tracer feedback gate: `<verify>` is automated-only, so it was re-run end to end (`npm run verify` green, parity 3 passed, each workflow calls verify exactly once). Tracer verified end-to-end - expanding. No checkpoint.
- No Node-globals override was needed; oxlint reported nothing on config, test or script files.

## Task 2: Import boundaries (TDD) (commits b7ef340 RED, 39b5780 GREEN)

- RED: four fixtures (sections, anim, motion-primitives, app/Page.tsx) and boundaries.test.ts committed first; six tests failed against a config with no boundary rule.
- GREEN: global `no-restricted-imports` (paths and three pattern groups) plus overrides: anim (upward patterns only), motion-primitives (off), app/Page.tsx (animation restrictions without the content group) and tests/unit (off). The test spawns `oxlint -c .oxlintrc.json --no-ignore --format json` and asserts rule and line per diagnostic.
- docs/architecture.md: the Import rules sentence now names `no-restricted-imports` with per-folder overrides in `.oxlintrc.json`, covering dynamic `import()` and re-exports; the folder tree lists `.oxlintrc.json` instead of an ESLint config. The plan's docs grep (no private paths, decision IDs or phone-shaped strings) passes.
- Re-export result: `export { useScroll } from 'motion/react'` is flagged, so the limitation sentence the plan allowed for was not needed. A test asserts it.

## Plan-level verification

| Check | Result |
|-------|--------|
| npm run verify | pass (12 tests, build green) |
| npx vitest run | pass, hero-parity 3 and boundaries 9 |
| Both workflows call npm run verify exactly once | pass |
| Task 2 automated verify (vitest boundaries, lint, format:check, docs greps) | pass |
| Acceptance: `"files"` count in .oxlintrc.json is 4, four fixture files, sections fixture exits non-zero, motion-primitives fixture prints no no-restricted-imports | pass |
| Nothing pushed | pass |

## Deviations from Plan

**1. [Rule 1 - Bug] Single-star boundary patterns missed nested paths**
- **Found during:** Task 2 (anim fixture was not flagged for `@/sections/Hero/Hero`), then confirmed with a throwaway probe for `@/anim/physics/ThemeThumb`, `@/components/motion-primitives/x/y`, `@/content/projects/data`, `@react-spring/web/foo/bar` and `motion/react/client`.
- **Issue:** the plan's pattern groups used `@/sections/*`, `@/anim/*`, `motion/*` and similar. In oxlint a single `*` does not cross a path separator, so deeper imports passed the rule, which would have left FND-04 open for any file below one level.
- **Fix:** switched the `/*` groups to `/**` in the global rule, the anim override and the Page.tsx override. Added four nested-path lines to the sections fixture (no fifth fixture file) with a test that each is flagged, and a test that every import line except the `@/anim` barrel is flagged.
- **Files modified:** .oxlintrc.json, tests/fixtures/sections/Imports.tsx, tests/unit/boundaries.test.ts
- **Verification:** boundaries.test.ts 9 passed; probe flagged all seven nested specifiers.
- **Commit:** 39b5780

**2. [Rule 3 - Blocking] Duplicate diagnostics on one line**
- **Found during:** Task 2
- **Issue:** `motion/react` and `@react-spring/web` match both the `paths` entry and the `motion/**` or `@react-spring/**` pattern, so oxlint reports two diagnostics on the same line. The plan's "exactly one diagnostic" wording would fail on an implementation detail.
- **Fix:** the test helper de-duplicates by line, so assertions are "this exact line is flagged" and "no other line is". The plan-specified `paths` entries were kept.
- **Files modified:** tests/unit/boundaries.test.ts
- **Commit:** 39b5780

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking). **Impact:** the boundary rule is stricter than specified; no scope change.

## Known Stubs

None.

## Threat Flags

None. T-02-08 (dynamic import line is flagged and asserted), T-02-09 (ignore files exempt only fixtures, dist and the vendored folder; no real source added) and T-02-33 (both workflows call npm run verify once) are mitigated as planned.

## Next

Ready for 02-05. Plans 02-06 and 02-08 extend the verify script; the workflows stay unchanged.

## Self-Check: PASSED

Created files verified on disk; commits a2dcead, b7ef340 and 39b5780 are ancestors of HEAD.
