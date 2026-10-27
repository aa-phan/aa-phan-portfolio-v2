---
phase: 02-deployed-themed-skeleton
verified: 2026-10-27T05:00:00Z
status: passed
score: 5/5 must-haves verified
covered_files:
  - ".github/workflows/ci.yml"
  - ".github/workflows/deploy.yml"
  - ".oxlintrc.json"
  - ".planning/phases/02-deployed-themed-skeleton/02-01-PLAN.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-01-SUMMARY.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-02-PLAN.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-02-SUMMARY.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-03-PLAN.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-03-SUMMARY.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-04-PLAN.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-04-SUMMARY.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-05-PLAN.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-05-SUMMARY.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-06-PLAN.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-06-SUMMARY.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-07-PLAN.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-07-SUMMARY.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-08-PLAN.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-08-SUMMARY.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-09-PLAN.md"
  - ".planning/phases/02-deployed-themed-skeleton/02-09-SUMMARY.md"
  - "docs/contrast-matrix.md"
  - "docs/deploy-runbook.md"
  - "index.html"
  - "package.json"
  - "playwright.config.ts"
  - "scripts/check-colors.mjs"
  - "scripts/check-contrast.mjs"
  - "scripts/check-js-budget.mjs"
  - "scripts/check-no-phone.mjs"
  - "scripts/lib/tokens.mjs"
  - "src/anim/MotionPreferenceProvider.tsx"
  - "src/anim/declarative/TextReveal.tsx"
  - "src/anim/useMotionPreference.ts"
  - "src/components/ui/ThemeToggle.tsx"
  - "src/layout/Container.tsx"
  - "src/layout/Section.tsx"
  - "src/lib/theme.ts"
  - "src/lib/useTheme.ts"
  - "src/main.tsx"
  - "src/styles/base.css"
  - "src/styles/index.css"
  - "src/styles/tokens.css"
  - "tests/e2e/motion.spec.ts"
  - "tests/e2e/smoke.spec.ts"
  - "tests/e2e/theme.spec.ts"
  - "tests/unit/gates.test.ts"
  - "tests/unit/layout.test.tsx"
  - "tests/unit/theme-script.test.ts"
  - "tests/unit/theme.test.ts"
  - "tests/unit/tokens.test.ts"
  - "vite.config.ts"
covered_digest: "v3:sha256:31e82a51f57507314d5bcc8e8b0be0e276d6eb0a0e79f6c8794e2815a85bbd61"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 5/5
  gaps_closed:
    - "Both human items (real-device smoke test; role-line re-reveal) passed in 02-UAT.md on 2026-10-26"
  gaps_remaining: []
  regressions: []
---

# Phase 2: Deployed Themed Skeleton Verification Report

**Phase Goal:** As a visitor, I want to open the deployed project URL and see a fast, themed hero in light or dark, so that hosting, CI, theming and motion risks are retired before content is built.
**Verified:** 2026-10-27T05:00:00Z
**Status:** passed
**Re-verification:** Yes. The earlier report went stale when 46 commits of code-review fixes landed after the deployed tip `2080f79`. Everything below was re-run at HEAD `fc03728` on branch `gsd/phase-02-deployed-themed-skeleton`. SUMMARY claims were not relied on.

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A push builds on Linux CI (typecheck, lint, build, path-case) and deploys through GitHub Actions to the project URL with correct asset paths from the env-driven `base` | VERIFIED | `ci.yml` and `deploy.yml` run on `ubuntu-latest` with `VITE_BASE=/aa-phan-portfolio-v2/` and call `npm run verify`, which chains typecheck, lint, format:check, test, check:case, check:colors, check:contrast, build, check:budget and check:no-phone. `vite.config.ts` reads `base` from `VITE_BASE` (default `/`). All actions are pinned to full commit SHAs. `gh api` shows the latest CI and Deploy runs on `2080f79` concluded `success`. The live URL returns 200 and `resume.pdf` returns 200. The live e2e run passed the JS-off, CTA and font tests, which resolve assets under the base. |
| 2 | Hero visible with JS disabled; initial JS at most 150 kB gz; CI fails the build when exceeded | VERIFIED | `index.html` holds the static shell: one `h1` "Aaron Phan", the role line, and the three CTAs (`resume.pdf` download, `mailto:`, `#contact`). Playwright "JS disabled" tests pass locally and on the live URL. `check:budget` reported 95,722 B gz of 150,000 B. `JS_BUDGET_BYTES=1000 node scripts/check-js-budget.mjs` exits 1 (checked). The budget gate sits inside `verify`, which both workflows run. The text-effect chunk (42 kB gz) is lazy and not counted as initial. |
| 3 | Toggle light/dark; first visit follows system; no theme flash; Phase 1 palette; at most 2 self-hosted font families | VERIFIED | The inline classic `<head>` script sets `data-theme` from localStorage, then matchMedia, with try/catch around both and invalid values ignored. `tokens.css` holds palette A (checked by `tokens.test.ts`). `ThemeToggle` is a native button with `aria-pressed` and a constant label. The review fixes in `theme.ts` and `useTheme.ts` keep the toggle in step with OS and cross-tab changes, and an explicit choice persists for the session when storage is blocked. All 6 theme e2e tests pass locally. Fonts are `@fontsource-variable/inter` only (`main.tsx`), and the fonts e2e asserts same-origin requests and at most 2 families. |
| 4 | Every text, UI and focus pair in both themes passes WCAG 2.2 AA per the committed matrix, checked against the real token files | VERIFIED | `npm run check:contrast` parses the shipped `src/styles/tokens.css` and printed `RESULT: PASS checks=40` (20 pairs x 2 themes; lowest ratios 3.25 focus ring on primary in light, 4.58 border on surface in dark). `docs/contrast-matrix.md` is generated and staleness-checked by the same gate. `tokens.test.ts` includes the negative run. |
| 5 | With OS reduce-motion on, a motion-primitives component and the page show all content with no animation, driven by one preference source; lint fails animation imports outside `anim/` and vendored primitives | VERIFIED | `useMotionPreference` is the single `matchMedia` source (`useSyncExternalStore`). It feeds `MotionConfig reducedMotion='always'/'never'`, `Globals.assign({skipAnimation})` and `TextReveal`. The CSS guard in `base.css` is the third consumer. Reduced-motion e2e tests pass: the thumb snaps, the role line is static with no per-word spans, and every hero element and all seven headings are visible with no running animations. Probe: `import { motion } from 'motion/react'` in `src/sections/Hero/__probe.tsx` produced two `no-restricted-imports` errors from oxlint (probe file removed afterwards, tree clean). `boundaries.test.ts` passes. |

**Score:** 5/5 truths verified. 0 present-but-behavior-unverified: each behavior-dependent truth (theme persistence, no flash, reduced-motion snap, chunk-failure fallback, role-line reveal) has a passing named e2e or unit test.

### Required Local Evidence (run at HEAD)

| Command | Result |
|---------|--------|
| `npm run verify` | exit 0. Vitest 8 files, 164 tests passed. oxlint with `--deny-warnings` clean. Prettier clean. check:case, check:colors and check:contrast pass. Build succeeded. Budget 95,722 B gz. check:no-phone OK. |
| `npm run test:e2e` | exit 0. 20 passed (10.8 s). |
| `E2E_BASE_URL=https://aa-phan.github.io/aa-phan-portfolio-v2/ npx playwright test` | 17 passed, 3 failed (see next section). |

### Live Site Run (pre-fix build at `2080f79`) Against Current Tests

The live build predates the review-fix commits. `main` and `origin/main` are both `2080f79`, and HEAD is 46 commits ahead. The 3 failures are tests for behavior added after that deploy, so they are expected and not gaps.

| Failing test | Added by | Why the live build fails it |
|--------------|----------|----------------------------|
| `motion.spec.ts:165` "role line never flashes visible, then hidden, before it is revealed" | WR-02 (`2bca9fc`) and iteration 2 WR-02 (`3631b09` area): `.reveal-pending` hide-until-mount CSS | The live build has no `reveal-pending` rule. The first opacity sample is not 0. |
| `motion.spec.ts:235` "role line fades in on its own when the entry script never loads" | IN-01 iteration 2 (`4e55301`), which tests the `reveal-pending-show` 3 s safety-net animation | The live build lacks the class and the animation. The initial opacity is not `'0'`. |
| `theme.spec.ts:132` "follows an OS scheme change while no choice is stored, then stops once chosen" | IN-02 (`1a40e87`): theme follows the OS scheme | The live build has no OS-change listener. `data-theme` stays `light`. |

The other 17 tests passed on the live URL: JS-off hero and anchors, Contact jump, React mount, CTA size and targets, fonts, the three core theme tests, the no-flash test, blocked-storage fallback, reduced-motion thumb and hero visibility, thumb animation, text effect running, and chunk-failure fallback. The live pre-fix build therefore still meets every Phase 2 success criterion.

### Notes (not gaps)

- **Fixes not yet live.** The WR-02 tagline reveal CSS, the theme fixes and the other review fixes are proven only locally and in 02-UAT. UAT was run against the live site, which is the pre-fix build. They go live on the next push to `main`.
- **`deploy.yml` job graph is untested on the runner.** The new `build` -> `e2e` -> `deploy` split (deploy needs both, build uploads the artifact once, scoped Pages permissions, no cancel-in-progress) has not run on GitHub yet. The first push after this phase is its first real exercise. Locally, the YAML is consistent: `deploy` needs `[build, e2e]`, the e2e job installs Chromium and runs `npm run test:e2e`, and the smoke curl uses a captured body to avoid the pipefail flake. Treat the first CI run as the confirmation.
- `ci.yml` still runs the same tests on every push and PR, so e2e remains gated on pull requests.
- The one earlier CI `failure` in the run history (`7014714`) predates the fixes and was followed by successes.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `.github/workflows/ci.yml`, `deploy.yml` | SHA-pinned CI and Pages deploy | VERIFIED | Both read; actions pinned to commit SHAs; `deploy.yml` job graph noted above |
| `index.html` | Static JS-off shell and pre-paint theme script | VERIFIED | h1, role line, 3 CTAs, 7 anchored sections; parity test `hero-parity.test.tsx` passes |
| `src/styles/tokens.css`, `docs/contrast-matrix.md` | Palette A, light and dark, plus matrix | VERIFIED | Gate passes 40/40 |
| `src/anim/useMotionPreference.ts`, `MotionPreferenceProvider.tsx`, `declarative/TextReveal.tsx` | One preference source and its consumers | VERIFIED | Wired through `@/anim` barrel; `Providers.tsx` mounts the provider |
| `src/lib/theme.ts`, `useTheme.ts`, `src/components/ui/ThemeToggle.tsx` | Theme store, hook and toggle | VERIFIED | Substantive; used by the toggle; e2e passes |
| `scripts/check-*.mjs`, `scripts/lib/tokens.mjs` | Budget, case, color, contrast and phone gates | VERIFIED | All run inside `verify`; unit tests include negative cases |
| `.oxlintrc.json` | Import boundary rules | VERIFIED | Probe import rejected |
| `public/resume.pdf` | Stand-in resume | VERIFIED | Live returns 200; `check:no-phone` passes on `dist` |

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| `index.html` theme script | `html[data-theme]` | `setAttribute` before paint | WIRED |
| `ThemeToggle` | `applyTheme` / `useTheme` | `src/lib/theme.ts` | WIRED |
| `useMotionPreference` | `MotionConfig`, react-spring `Globals`, `TextReveal` | `MotionPreferenceProvider` and direct hook use | WIRED |
| `TextReveal` | vendored `text-effect` | `React.lazy` with `ChunkBoundary` fallback | WIRED |
| `npm run verify` | both workflows | `run: npm run verify` | WIRED |
| `check-contrast.mjs` | `src/styles/tokens.css` | real-file parse | WIRED |

### Data-Flow Trace (Level 4)

Not applicable: Phase 2 renders static strings and theme state. There is no dynamic data source. Theme state flows from `html[data-theme]` through `useSyncExternalStore` to the toggle. Verified by the e2e toggle and reload tests.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Budget gate fails over budget | `JS_BUDGET_BYTES=1000 node scripts/check-js-budget.mjs` | exit 1 | PASS |
| Boundary lint rejects `motion/react` in a section | oxlint on a probe file | 2 errors | PASS |
| Live URL serves the page | `curl` the project URL and `resume.pdf` | 200 and 200 | PASS |

### Probe Execution

No `scripts/*/tests/probe-*.sh` files exist and no plan declares one. Skipped.

### Requirements Coverage

All 10 IDs in the phase requirement list appear in at least one PLAN's `requirements:` frontmatter, are marked `[x]` and "Complete" in `.planning/REQUIREMENTS.md`, and map to Phase 2 there. No orphaned requirements.

| Requirement | Source Plans | Status | Evidence |
|-------------|--------------|--------|----------|
| FND-01 Vite+React+TS+Tailwind v4, Actions deploy, env-driven base | 02-01, 02-03, 02-09 | SATISFIED | Truth 1; live site up |
| FND-02 Linux CI runs typecheck, lint, build, path-case | 02-03, 02-04, 02-06, 02-09 | SATISFIED | Truth 1; `check:case` in `verify` |
| FND-03 Initial JS at most 150 kB gz, CI-enforced | 02-06, 02-09 | SATISFIED | Truth 2; 95.7 kB, gate exits 1 when exceeded |
| FND-04 Layered imports enforced by lint | 02-04 | SATISFIED | Truth 5; probe and `boundaries.test.ts` |
| DSN-01 Palette and type via realtimecolors, light and dark token sets | 02-01, 02-08 | SATISFIED | `tokens.css` and `tokens.test.ts` (palette A) |
| DSN-02 Contrast matrix meets WCAG 2.2 AA | 02-08 | SATISFIED | Truth 4 |
| DSN-03 Toggle, system default, no flash | 02-05 | SATISFIED | Truth 3 |
| DSN-04 Self-hosted fonts, at most 2 families | 02-02 | SATISFIED | Truth 3 fonts e2e |
| MOT-01 One motion-preference source drives motion, react-spring and CSS guard | 02-02, 02-07 | SATISFIED | Truth 5 |
| NAV-01 Static hero with name, role, CTAs visible without JS | 02-01, 02-02, 02-04 | SATISFIED | Truth 2 |

### Anti-Patterns Found

| Scan | Result |
|------|--------|
| `TBD`, `FIXME`, `XXX`, `TODO`, `HACK` in `src`, `scripts`, `tests`, `.github`, `index.html`, `docs` (excluding ADR text) | None. The only `XXX` hit is the `\uXXXX` escape documented in `check-no-phone.mjs` and `docs/deploy-runbook.md`, which is not a marker. |
| Stub or empty-implementation patterns in phase source | None found. The hero shell is intentionally static and the section stubs are the planned Phase 3 placeholders. |
| Phone numbers | `check:no-phone` passes on `dist`. No digits were printed or recorded in this report. |

### Review, Security and UAT Cross-Check

- **Code review:** 02-REVIEW-DISPOSITION.md shows all iteration 1 findings (WR-01 to WR-06, IN-02 to IN-07) fixed. IN-01 is deferred to Phase 3 (NAV-03 copy-to-clipboard), where the Copy email behavior belongs. All iteration 2 findings (WR-01 to WR-04, IN-01 to IN-03) are fixed, each with a commit present in `git log`.
- **Security:** 02-SECURITY.md has `status: verified` and `threats_open: 0`.
- **UAT:** 02-UAT.md is `status: complete`, 2 passed and 0 issues (real-device smoke test on the live site; role-line re-reveal at 375 px). These were the only human items. None remain.

### Human Verification Required

None. The two judgment items from the earlier report are closed by 02-UAT.md.

### Gaps Summary

No gaps. All 5 ROADMAP success criteria are verified at HEAD with fresh command output, all 10 requirement IDs are satisfied, and the working tree was clean after verification. The 3 live-run failures are tests for post-deploy review fixes, as expected. The only open item is the first CI run of the new `deploy.yml` job graph, which cannot be exercised before the next push to `main`.

---

_Verified: 2026-10-27T05:00:00Z_
_Verifier: Claude (gsd-verifier)_
