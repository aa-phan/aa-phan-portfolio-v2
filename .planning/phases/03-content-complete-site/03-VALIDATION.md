---
phase: "3"
slug: "content-complete-site"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-10-19"
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.0.3 (jsdom 30, Testing Library 16) unit; @playwright/test ~1.64.0 (Chromium) e2e |
| **Config file** | `vitest.config.ts` (add `imagetools()`), `playwright.config.ts` (add `mobile` project) |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `VITE_BASE=/aa-phan-portfolio-v2/ npm run verify && VITE_BASE=/aa-phan-portfolio-v2/ npm run test:e2e` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run` plus the single relevant script (`check:contrast`, `check:images`, `check:no-phone`, `check:budget`)
- **After every plan wave:** Run `VITE_BASE=/aa-phan-portfolio-v2/ npm run verify`
- **Before `/gsd-verify-work`:** Full suite green locally and in CI, then the real-phone 10-second test
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

Task IDs are assigned by the planner; this table is keyed by requirement until plans exist.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | CNT-01 | — | N/A | unit | `npx vitest run tests/unit/content.test.ts tests/unit/sections.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | CNT-01 | — | Content imported only via `Page.tsx` | lint | `npm run lint` | ✅ | ⬜ pending |
| TBD | TBD | TBD | CNT-02 | — | N/A | unit | `npx vitest run tests/unit/content-inventory.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | CNT-02 | — | N/A | e2e | `npx playwright test tests/e2e/content.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | CNT-04 | T-3-PII | No phone-shaped string in PDF text, annotations or metadata | unit | `npx vitest run tests/unit/gates.test.ts -t "pdf"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | CNT-04 | T-3-PII | Shipped resume is clean and real | script | `npm run check:no-phone` | ✅ extend | ⬜ pending |
| TBD | TBD | TBD | CNT-04 | — | N/A | e2e | `npx playwright test -g "resume"` | ⚠ partial | ⬜ pending |
| TBD | TBD | TBD | CNT-05 | T-3-EXIF | No EXIF in shipped images; only AVIF/WebP | script + unit | `npm run check:images && npx vitest run tests/unit/gates.test.ts -t "images"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | NAV-02 | — | N/A | unit + e2e | `npx vitest run tests/unit/active-section.test.ts && npx playwright test tests/e2e/nav.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | NAV-02 | — | N/A | e2e | `npx playwright test -g "skip link"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | NAV-02 | — | N/A | e2e mobile | `npx playwright test --project=mobile` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | NAV-02 | — | N/A | e2e | `npx playwright test -g "reduced motion"` | ⚠ extend | ⬜ pending |
| TBD | TBD | TBD | NAV-03 | — | N/A | e2e + unit | `npx playwright test -g "copy email" && npx vitest run tests/unit/copy.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | NAV-04 | — | N/A | e2e mobile | `npx playwright test tests/e2e/mobile/ten-second.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | D-02/03 | — | N/A | unit + script + e2e | `npm run check:contrast && npx vitest run tests/unit/tokens.test.ts && npx playwright test -g "fonts"` | ✅ update | ⬜ pending |
| TBD | TBD | TBD | D-01 | — | N/A | e2e | `npx playwright test -g "wordmark" && npx playwright test -g "404"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | D-08 | — | N/A | e2e | `npx playwright test -g "project dialog"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | FND-03 | — | N/A | script | `npm run check:budget` | ✅ | ⬜ pending |
| TBD | TBD | TBD | D-24 | — | N/A | script (audit) | `env -u VITE_BASE npm run build && mkdir -p .shots && node ~/.claude/skills/awwwards/scripts/audit.mjs dist > .shots/audit.txt` (exits 1 on any FAIL) | ✅ skill script | ⬜ pending |
| TBD | TBD | TBD | D-24 | — | N/A | script (visual QA) | Serve with `node ~/.claude/skills/awwwards/scripts/serve.mjs dist --port 4400` in the background, then `node ~/.claude/skills/awwwards/scripts/shoot.mjs http://127.0.0.1:4400/ --crawl --nav`; pass when every page in `.shots/summary.json` has `mobileLcpMs` under 2500, `mobileCls` under 0.05, `axeSerious` 0 (null means axe was skipped and fails), `noVisibleFocus` 0, `invisibleFocus` 0, `noHoverChange` 0 | ⚠ needs axe-core (W0) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/content.test.ts`, `content-inventory.test.ts`, `sections.test.tsx`, `active-section.test.ts`, `copy.test.ts`
- [ ] `tests/e2e/content.spec.ts`, `nav.spec.ts`, `tests/e2e/mobile/ten-second.spec.ts`, `tests/e2e/mobile/pill.spec.ts`
- [ ] `scripts/check-images.mjs` and the `check:images` entry in the `verify` script (after `build`)
- [ ] PDF fixtures built at runtime in `tests/unit/gates.test.ts` (no committed phone-shaped literal)
- [ ] `vitest.config.ts`: register `imagetools()`; TS types for `*?as=picture` imports
- [ ] `playwright.config.ts`: `mobile` project with `testIgnore`/`testMatch` split
- [ ] Update pinned values in `tokens.test.ts`, `smoke.spec.ts`, `theme.spec.ts`, `motion.spec.ts`, `hero-parity.test.tsx`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| First-time visitor finds name, role, experience, projects, resume and contact in 10 s or less | NAV-04 | Needs a real phone and a human first-time viewer | On a real phone with motion on, open the staging URL cold; time locating all six items; pass if 10 s or less |
| Owner-supplied phone-free resume PDF, repo URLs, write-up and quote approvals | CNT-02, CNT-04 | Owner inputs | `checkpoint:human-verify` before content finalization |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
