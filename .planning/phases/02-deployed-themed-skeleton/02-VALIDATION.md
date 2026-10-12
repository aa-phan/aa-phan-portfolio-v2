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

| Req | Behavior | Test Type | Automated Command | File Exists | Status |
|-----|----------|-----------|-------------------|-------------|--------|
| FND-01 | Build emits assets under project base; deploy succeeds | build + CI | `VITE_BASE=/aa-phan-portfolio-v2/ npm run build && grep -q '/aa-phan-portfolio-v2/assets/' dist/index.html` | ❌ W0 | ⬜ pending |
| FND-02 | CI runs typecheck, lint, build, case check on Linux | CI | `gh run list --workflow ci.yml --limit 1 --json conclusion` | ❌ W0 | ⬜ pending |
| FND-03 | Initial JS <= 150,000 B gz; gate fails when exceeded | script + negative | `npm run check:budget`; `JS_BUDGET_BYTES=1000 npm run check:budget` (exit 1) | ❌ W0 | ⬜ pending |
| FND-04 | Violating import fails lint, allowed import passes | unit | `npx vitest run tests/unit/boundaries.test.ts` | ❌ W0 | ⬜ pending |
| DSN-01 | `tokens.css` roles equal Phase 1 palette | unit | `npx vitest run tests/unit/tokens.test.ts` | ❌ W0 | ⬜ pending |
| DSN-02 | Every pair passes AA in both themes; matrix current | script | `npm run check:contrast` | ❌ W0 | ⬜ pending |
| DSN-03 | System default, stored override, blocked storage, no flash | unit + e2e | `npx vitest run tests/unit/theme-script.test.ts`; `npx playwright test -g "theme"` | ❌ W0 | ⬜ pending |
| DSN-04 | Same-origin fonts, at most 2 families | e2e + unit | `npx playwright test -g "fonts"` | ❌ W0 | ⬜ pending |
| MOT-01 | Hook reacts live; spring snaps; CSS guard in built CSS | unit + e2e | `npx vitest run tests/unit/motion-preference.test.tsx`; `npx playwright test -g "reduced motion"` | ❌ W0 | ⬜ pending |
| NAV-01 | Hero in static HTML with JS off; shell/React parity | e2e + unit | `npx playwright test -g "JS disabled"`; `npx vitest run tests/unit/hero-parity.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts`, `playwright.config.ts`, `tests/unit/*`, `tests/e2e/smoke.spec.ts`, `tests/fixtures/{sections,anim}/*.tsx`
- [ ] `scripts/{check-contrast,check-js-budget,check-path-case,check-colors,check-no-phone}.mjs`, `scripts/lib/color.mjs`, `scripts/contrast-pairs.json`
- [ ] `.oxlintrc.json`, `.oxlintignore`, `prettier.config.mjs`, `.prettierignore`
- [ ] Framework install (`npx playwright install chromium` locally)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GitHub Pages source set to "GitHub Actions"; first deploy | FND-01 | Repo admin setting | Follow runbook; confirm project URL loads |
| Staging smoke test of deployed URL | FND-01, NAV-01 | Needs live URL | Per runbook |
| Toggle and role-line feel on a real phone | DSN-03, MOT-01 | Subjective, device-only | Deferred to Phase 6/QA |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
