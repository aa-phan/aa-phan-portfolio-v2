---
phase: "02"
slug: "deployed-themed-skeleton"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-10-12"
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.0.3 (jsdom 30, Testing Library 16) unit; @playwright/test 1.64.0 (Chromium) smoke |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` (Wave 0 installs) |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npm run verify && npm run test:e2e` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run` plus the single relevant script (`check:contrast`, `check:budget`, etc.)
- **After every plan wave:** Run `npm run verify`
- **Before `/gsd-verify-work`:** `npm run verify && npm run test:e2e` green locally and CI green on `main`
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Req | Plans (wave) | Behavior | Test Type | Automated Command | File Exists | Status |
|-----|--------------|----------|-----------|-------------------|-------------|--------|
| FND-01 | 02-01 (1), 02-03 (2), 02-09 (8) | Build emits assets under project base; deploy succeeds | build + CI | `VITE_BASE=/aa-phan-portfolio-v2/ npm run build && grep -q '/aa-phan-portfolio-v2/assets/' dist/index.html` | ❌ W0 | ⬜ pending |
| FND-02 | 02-03 (2), 02-04 (3), 02-06 (5), 02-09 (8) | CI runs typecheck, lint, build, case check on Linux | CI | `gh run list --workflow ci.yml --limit 1 --json conclusion` | ❌ W0 | ⬜ pending |
| FND-03 | 02-06 (5), 02-09 (8) | Initial JS <= 150,000 B gz; gate fails when exceeded | script + negative | `npm run check:budget`; `JS_BUDGET_BYTES=1000 npm run check:budget` (exit 1) | ❌ W0 | ⬜ pending |
| FND-04 | 02-04 (3) | Violating import fails lint, allowed import passes | unit | `npx vitest run tests/unit/boundaries.test.ts` | ❌ W0 | ⬜ pending |
| DSN-01 | 02-01 (1), 02-08 (7) | `tokens.css` roles equal Phase 1 palette | unit | `npx vitest run tests/unit/tokens.test.ts` | ❌ W0 | ⬜ pending |
| DSN-02 | 02-08 (7) | Every pair passes AA in both themes; matrix current | script | `npm run check:contrast` | ❌ W0 | ⬜ pending |
| DSN-03 | 02-05 (4) | System default, stored override, blocked storage, no flash | unit + e2e | `npx vitest run tests/unit/theme-script.test.ts`; `npx playwright test -g "theme"` | ❌ W0 | ⬜ pending |
| DSN-04 | 02-02 (2) | Same-origin fonts, at most 2 families | e2e + unit | `npx playwright test -g "fonts"` | ❌ W0 | ⬜ pending |
| MOT-01 | 02-02 (2, CSS guard), 02-07 (6) | Hook reacts live; spring snaps; CSS guard in built CSS | unit + e2e | `npx vitest run tests/unit/motion-preference.test.tsx`; `npx playwright test -g "reduced motion"` | ❌ W0 | ⬜ pending |
| NAV-01 | 02-01 (1), 02-02 (2), 02-04 (3) | Hero in static HTML with JS off; shell/React parity | e2e + unit | `npx playwright test -g "JS disabled"`; `npx vitest run tests/unit/hero-parity.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `playwright.config.ts`, `tests/e2e/smoke.spec.ts` (plan 02-01); `vitest.config.ts`, `tests/setup.ts`, `tests/unit/hero-parity.test.tsx`, `tests/unit/boundaries.test.ts`, `tests/fixtures/{sections,anim,motion-primitives,app}/*.tsx` (plan 02-04); remaining `tests/unit/*` with their feature plans (02-05 theme, 02-06 gates, 02-07 motion preference, 02-08 tokens)
- [ ] `scripts/{check-js-budget,check-path-case,check-colors,check-no-phone}.mjs` (plan 02-06); `scripts/check-contrast.mjs`, `scripts/lib/{color,tokens}.mjs`, `scripts/contrast-pairs.json` (plan 02-08)
- [ ] `prettier.config.mjs`, `.prettierignore` (plan 02-01); `.oxlintrc.json`, `.oxlintignore` (plan 02-04)
- [ ] Framework install (`npx playwright install chromium` locally, plan 02-01 after the Task 1 package legitimacy gate)

Plan order (9 plans, 8 waves): 02-01 (wave 1); 02-02 and 02-03 (wave 2, disjoint files, each formats only its own files); 02-04 (wave 3); then 02-05, 02-06, 02-07, 02-08, 02-09 strictly one per wave (waves 4 to 8), because each builds into `dist/` and runs the repo-wide verify chain in the one shared working tree.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GitHub Pages source set to "GitHub Actions"; first deploy | FND-01 | Repo admin setting | Plan 02-09 Task 2 checkpoint (the repository already exists and is public); confirm project URL loads |
| Staging smoke test of deployed URL | FND-01, NAV-01 | Needs live URL | Per runbook; plan 02-09 Task 3 human check |
| Toggle and role-line feel on a real phone | DSN-03, MOT-01 | Subjective, device-only | First look in plan 02-07 Task 3 and plan 02-09 Task 3 human checks; full device QA deferred to Phase 6 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
