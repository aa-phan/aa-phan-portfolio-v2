---
phase: 02-deployed-themed-skeleton
verified: 2026-10-26T00:00:00Z
status: human_needed
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
  - "index.html"
  - "package.json"
  - "scripts/check-contrast.mjs"
  - "scripts/check-js-budget.mjs"
  - "scripts/check-no-phone.mjs"
  - "src/anim/MotionPreferenceProvider.tsx"
  - "src/anim/declarative/TextReveal.tsx"
  - "src/anim/useMotionPreference.ts"
  - "src/components/ui/ThemeToggle.tsx"
  - "src/lib/theme.ts"
  - "src/main.tsx"
  - "src/styles/base.css"
  - "src/styles/index.css"
  - "src/styles/tokens.css"
  - "vite.config.ts"
covered_digest: "v3:sha256:180aada00640cdff8fa8401c6f01ee25daea66da8cc3bafc0241a64520bc77aa"
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "D5 - Real-device smoke test on a phone against https://aa-phan.github.io/aa-phan-portfolio-v2/ (runbook smoke section): hero renders at phone width, theme toggle switches and survives reload, Download resume opens the stand-in PDF, Copy email hands off to the mail app, no console errors or 404s"
    expected: "Hero (name, role, 3 CTAs) readable without horizontal scroll; toggle persists across reload in both light and dark; resume.pdf shows only 'Resume coming soon.'; mailto opens the mail app"
    why_human: "Phone feel, mail-app hand-off and real-device console inspection are outside headless Chromium (plan 02-09 Task 3 human-check, coverage item D5)"
  - test: "Role-line re-reveal at 375 px (Research Open Question 2, backstop prohibition in plan 02-07): load the live site on a 375 px viewport (or phone) with reduce-motion off and watch the tagline"
    expected: "The brief (about 0.35 s) hide-then-word-by-word reveal when the lazy TextEffect chunk lands reads as intentional, not as a flicker. Code review WR-02 flags that the text is visible, then hidden, then revealed"
    why_human: "Perceived quality of a sub-second transition is a judgment; plan 02-07 explicitly deferred it to the end-of-phase review"
---

# Phase 2: Deployed Themed Skeleton Verification Report

**Phase Goal:** As a visitor, I want to open the deployed project URL and see a fast, themed hero in light or dark, so that hosting, CI, theming and motion risks are retired before content is built.
**Verified:** 2026-10-26
**Status:** human_needed (all automated checks pass; two judgment items remain)
**Re-verification:** No, initial verification

All evidence below was re-run in this verification (branch `gsd/phase-02-deployed-themed-skeleton`, HEAD `c01f67d`; code since the deployed tip `2080f79` is unchanged except the Phase 3 `DESIGN.md`). SUMMARY claims were not relied on.

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Push builds on Linux CI (typecheck, lint, build, path-case) and deploys via Actions to the project URL with correct asset paths from env-driven `base` | VERIFIED | `ci.yml` and `deploy.yml` on `ubuntu-latest`, `VITE_BASE=/aa-phan-portfolio-v2/`, both run `npm run verify` (typecheck, lint, format, test, check:case, colors, contrast, build, budget, no-phone); `gh run list` shows latest CI and Deploy runs on main (2080f79) `success`. Live curl: HTTP 200, `text/html`; `/aa-phan-portfolio-v2/assets/index-*.js`, `rolldown-runtime-*.js`, `index-*.css`, `favicon.svg`, `resume.pdf` all under the base and all return 200; no root-absolute asset URLs. Actions pinned to full SHAs |
| 2 | Hero visible with JS disabled; initial JS <= 150 kB gz; CI fails the build when exceeded | VERIFIED | Live HTML contains exactly one `<h1>`, the role line "Software engineer building cloud-native backends in Go.", resume link, mailto and `#contact` in static markup. Playwright "JS disabled" tests pass locally and against the live URL. `check:budget`: 86,937 B gz of 150,000 B; `JS_BUDGET_BYTES=1000` exits 1 (checked). Budget gate is inside `verify`, which both workflows run |
| 3 | Toggle light/dark, first visit follows system, no theme flash, Phase 1 palette, at most 2 self-hosted font families | VERIFIED | Inline classic script in `<head>` sets `data-theme` before paint (localStorage then matchMedia, both try/catch, invalid values ignored); `tokens.css` carries palette A (light and dark blocks, oklch values match Phase 1); `ThemeToggle` is a native button with `aria-pressed`. Playwright theme tests (toggle plus reload, system preference, stored wins, no flash with app JS blocked, blocked storage) pass. Only `Inter Variable` via `@fontsource-variable/inter`; fonts e2e asserts same-origin only and at most 2 families; no `fonts.googleapis` reference |
| 4 | Every text, UI and focus pair in both themes passes WCAG 2.2 AA per committed matrix, checked against real token files | VERIFIED | `npm run check:contrast` reads the shipped `src/styles/tokens.css`: `RESULT: PASS checks=40` (20 pairs x 2 themes; lowest ratios 3.25 focus on primary, 4.58 border on surface). `docs/contrast-matrix.md` is generated and staleness-checked; `tests/unit/tokens.test.ts` includes negative runs (lightened primary fails) |
| 5 | With OS reduce-motion on, a motion-primitives component and the page show all content with no animation, one preference source; lint fails animation imports outside `anim/` and vendored primitives | VERIFIED | `useMotionPreference` (single `matchMedia` source via `useSyncExternalStore`) feeds `MotionConfig reducedMotion always/never`, `Globals.assign({skipAnimation})` and `TextReveal`; CSS guard in `base.css` is the third consumer and is in the built CSS. e2e "reduced motion" tests (thumb snaps, role line is static with no per-word spans, all hero elements and 7 headings opacity 1 with no running animations) pass. `oxlint -c .oxlintrc.json --no-ignore tests/fixtures/sections/Imports.tsx` reports `motion/react`, `@react-spring/web`, deep `@/anim/*` and content imports as errors; `boundaries.test.ts` passes |

**Score:** 5/5 truths verified. 0 present-but-behavior-unverified (every behavior-dependent truth has a passing named e2e or unit test).

### Plan-level must-haves spot-checked

| Must-have | Status | Evidence |
|-----------|--------|----------|
| Hero CTA order Download resume, Copy email (mailto), Contact (#contact); 44 px targets | VERIFIED | Static shell in `index.html`; e2e "CTA targets are at least 44px and resolve" passes |
| Shell and React hero cannot drift | VERIFIED | `tests/unit/hero-parity.test.tsx` passes (part of 72 unit tests) |
| Seven anchors, no nav element in JS-off HTML | VERIFIED | e2e "all seven section anchors exist with headings" passes; no nav added (Phase 3) |
| Stand-in resume: 200, `application/pdf`, `%PDF-`, no phone | VERIFIED | Live `resume.pdf`: HTTP/2 200, `content-type: application/pdf`, first bytes `%PDF-1.4`; `check:no-phone` over `dist` OK |
| No phone number or `tel:` served | VERIFIED | `check:no-phone: OK`; live HTML has zero `tel:`. No digits printed in this report |
| Lazy TextEffect keeps initial JS small, falls back if chunk fails | VERIFIED | Build: `text-effect-*.js` 50.7 kB gz is a separate chunk, not in initial 86.9 kB; e2e "role line stays readable when the effect chunk fails to load" passes |
| Vendored primitive is the only source exempt from boundary lint | VERIFIED | `.oxlintrc.json` override for `**/motion-primitives/**` only; `.oxlintignore` not used to hide source (green lint with `--deny-warnings`) |
| Pages source is Actions; repo public | VERIFIED | Deploy runs use `deploy-pages`; live URL serves; 02-09 records `build_type workflow` |

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `index.html` (static shell, theme-init script, `%BASE_URL%` hrefs) | VERIFIED | Present, substantive, rewritten under base in live HTML |
| `src/styles/tokens.css`, `index.css`, `base.css` | VERIFIED | Palette A tokens, `@theme inline` map, focus ring and reduced-motion guard |
| `src/anim/*` (hook, provider, TextReveal, ThemeThumb, tokens, barrel) | VERIFIED | Wired: provider in `Providers`, Hero imports `TextReveal` from `@/anim`, toggle imports `ThemeThumb` from `@/anim` |
| `src/components/motion-primitives/text-effect.tsx` | VERIFIED | Vendored, lazy-loaded, ADR-0007 present |
| `.github/workflows/ci.yml`, `deploy.yml` | VERIFIED | SHA-pinned, `npm run verify` in both, deploy curl check |
| `scripts/check-*.mjs`, `scripts/lib/*`, `contrast-pairs.json`, `docs/contrast-matrix.md` | VERIFIED | All gates execute and pass; negative-proof tests in `gates.test.ts` and `tokens.test.ts` |
| `.oxlintrc.json`, `tests/unit/boundaries.test.ts`, 4 fixtures | VERIFIED | Negative and positive proofs |
| `docs/adr/0007`, `0008`, `docs/deploy-runbook.md`, `docs/adr/README.md` | VERIFIED | Present |

### Key Link Verification

| From | To | Status | Details |
|------|----|--------|---------|
| `vite.config.ts` VITE_BASE | `index.html` / built assets | WIRED | Live URLs are under `/aa-phan-portfolio-v2/` |
| `ThemeToggle` | `@/anim` `ThemeThumb`, `lib/theme` `applyTheme` | WIRED | Imports confirmed; e2e toggle test passes |
| `TextReveal` | vendored `text-effect` | WIRED | `lazy()` dynamic import, separate chunk in build |
| `MotionPreferenceProvider` | `useMotionPreference` | WIRED | `reduced` drives `MotionConfig` and `Globals.assign` |
| `package.json verify` | both workflows | WIRED | `npm run verify` appears once in each workflow |
| `check-contrast` | `src/styles/tokens.css` and `docs/contrast-matrix.md` | WIRED | Reads real file; stale matrix fails |

### Data-Flow Trace (Level 4)

Not applicable beyond static content: the phase renders fixed hero copy and theme state. Theme state flows localStorage/matchMedia to `data-theme` to CSS tokens, verified by e2e.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full unit suite | `npm run test` | 7 files, 72 tests passed | PASS |
| Path case / raw colors / contrast | `check:case`, `check:colors`, `check:contrast` | OK / OK / PASS checks=40 | PASS |
| Build + budget + no-phone | `npm run build`, `check:budget`, `check:no-phone` | 86,937 B of 150,000 B; OK | PASS |
| Budget gate fails when exceeded | `JS_BUDGET_BYTES=1000 node scripts/check-js-budget.mjs` | exit 1 | PASS |
| Local e2e (preview under base) | `npx playwright test` | 17 passed | PASS |
| Live-URL e2e | `E2E_BASE_URL=https://aa-phan.github.io/aa-phan-portfolio-v2/ npx playwright test` | 17 passed | PASS |
| Boundary lint rejects bad imports | `oxlint -c .oxlintrc.json --no-ignore tests/fixtures/sections/Imports.tsx` | errors for motion/react, @react-spring/web, deep anim, content | PASS |

### Probe Execution

No `probe-*.sh` scripts declared or present: SKIPPED.

### Requirements Coverage

All 10 phase IDs appear in PLAN frontmatter and in REQUIREMENTS.md (Traceability: Phase 2, Complete). No orphans: REQUIREMENTS.md maps exactly FND-01..04, DSN-01..04, MOT-01, NAV-01 to Phase 2 and every one is claimed by at least one plan.

| Requirement | Source Plans | Status | Evidence |
|-------------|--------------|--------|----------|
| FND-01 | 02-01, 02-03, 02-09 | SATISFIED | Vite 8 + React 19 + TS 6 + Tailwind v4; live deploy via Actions with env-driven base |
| FND-02 | 02-03, 02-04, 02-06, 02-09 | SATISFIED | Linux CI runs typecheck, lint, build, `check:case`; green runs on main |
| FND-03 | 02-06, 02-09 | SATISFIED | 86.9 kB vs 150 kB; gate in `verify`; exit 1 on overrun |
| FND-04 | 02-04 | SATISFIED | `.oxlintrc.json` boundaries with negative-fixture proofs |
| DSN-01 | 02-01, 02-08 | SATISFIED | Palette A light/dark token sets; test reproduces Phase 1 swatches and ratios |
| DSN-02 | 02-08 | SATISFIED | 40 checks PASS against shipped tokens; generated matrix, staleness-gated |
| DSN-03 | 02-05 | SATISFIED | Toggle, system default, pre-paint script, 5 e2e theme tests |
| DSN-04 | 02-02 | SATISFIED | Inter Variable only, same-origin |
| MOT-01 | 02-02, 02-07 | SATISFIED | One hook, three consumers, content visible with motion off |
| NAV-01 | 02-01, 02-02, 02-04 | SATISFIED | Static shell with name, role and CTAs visible without JS, parity-tested |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `DESIGN.md` | n/a | `prettier --check .` fails on this Phase 3 file (added in 32216f7 "docs(03): capture phase context") | Warning | Not a Phase 2 artifact and not on deployed `main` (which is green). But `npm run verify` exits 1 at `format:check` on this branch, so merging the branch to `main` would fail CI and block deploy until DESIGN.md is formatted or ignored. All other verify steps pass when run individually |
| `src/anim/declarative/TextReveal.tsx` | 36-54 | Visible, then hidden, then revealed (REVIEW WR-02) | Warning (advisory) | Feeds the human role-line item below |
| debt markers | n/a | No `TBD`, `FIXME`, `XXX` found as blockers in scanned phase sources | none | n/a |

### Code Review (02-REVIEW.md) - Advisory, does not gate

`02-REVIEW.md` reports 0 critical, 6 warnings (WR-01 no-phone gate misses space-separated numbers and PDF internals; WR-02 role-line flash; WR-03 deploy not gated on e2e and over-permissive/cancellable; WR-04 typecheck skips tests/scripts; WR-05 "thumb animates" e2e can't fail if animation is missing; WR-06 check-colors misses directional palette utilities) and 7 info (IN-01 "Copy email" is a mailto, not a copy; IN-02 theme does not follow OS after load; IN-03 to IN-07 minor). `02-REVIEW-DISPOSITION.md` lists all 13 as open. Noted, not blocking. WR-01 is worth fixing before Phase 3 introduces the real resume, since the phone rule is a hard constraint.

### Deferred Items

None filtered. IN-01 (real copy-to-clipboard with toast) is covered by NAV-03 in Phase 3.

### Human Verification Required

#### 1. D5 - Real-device smoke test

**Test:** On a phone, open https://aa-phan.github.io/aa-phan-portfolio-v2/ and follow the runbook smoke test: hero at phone width, toggle light/dark and reload, Download resume, Copy email (mail app hand-off), check for console errors or 404s.
**Expected:** No horizontal scroll; theme persists across reload; the PDF shows only "Resume coming soon."; mailto opens the mail app.
**Why human:** Phone feel, mail app hand-off and device console inspection cannot be covered by headless Chromium.

#### 2. Role-line re-reveal at 375 px

**Test:** At 375 px (or on the phone) with reduce-motion off, reload and watch the tagline.
**Expected:** The roughly 0.35 s re-reveal (7 words) after the lazy chunk arrives reads as intentional rather than a flicker (see REVIEW WR-02).
**Why human:** Subjective perceptual judgment, explicitly deferred to the end-of-phase review by plan 02-07.

### Gaps Summary

No gaps. All five roadmap success criteria and all 10 requirement IDs are verified against the actual code, local gates, the CI run history and the live site. The status is `human_needed` solely because of the two judgment items above. One non-gating note for the orchestrator: `DESIGN.md` (Phase 3) fails Prettier, which will fail the `verify` chain on any push of this branch to `main` until it is formatted.

---

_Verified: 2026-10-26_
_Verifier: Claude (gsd-verifier)_
