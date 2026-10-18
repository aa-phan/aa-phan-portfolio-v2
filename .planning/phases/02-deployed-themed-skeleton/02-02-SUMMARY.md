---
phase: 02-deployed-themed-skeleton
plan: 02
subsystem: ui
tags: [react, tailwind-v4, playwright, fontsource, accessibility, reduced-motion]
requires:
  - phase: 02-deployed-themed-skeleton
    provides: static hero shell, Container, Page, tokens.css, Playwright smoke spec (plan 02-01)
provides:
  - Section layout component and six empty labelled anchored section stubs, in React and in the static shell (seven registry anchors, no nav)
  - base.css with focus-visible ring on --focus-ring and the prefers-reduced-motion CSS guard (MOT-01 layer L1)
  - Phone-free stand-in public/resume.pdf and monogram public/favicon.svg, both served under the base
  - Self-hosted Inter Variable (wght.css) as the only font family, verified same-origin
  - Smoke spec extended to 6 tests (anchors, Contact jump, 44 px CTAs and asset resolution, fonts)
affects: [02-03, 02-04, 02-05, 02-07, 02-09, 03-content]
status: complete
commits: 2
plan_head_before: 1d98a38e69d940b794364469cd29882f628582d4
plan_head_after: a8b2f4fb1c0f9ba0bcd3f32a77db394268a59638
actuals:
  tokens: 5200
  tasks: 2
  commits: 2
tech-stack:
  added: []
  patterns: [static-shell-mirrors-react-sections, labelled-section-wrapper (aria-labelledby id-heading), CSS-layer-base reduced-motion guard]
key-files:
  created: [src/layout/Section.tsx, src/sections/Stubs/SectionStubs.tsx, src/styles/base.css, public/resume.pdf, public/favicon.svg]
  modified: [index.html, src/app/Page.tsx, src/styles/index.css, src/main.tsx, tests/e2e/smoke.spec.ts]
key-decisions:
  - "Stand-in resume generated from scratch by a throwaway Node script kept outside the repo; nothing derived from the private reference folder"
  - "Static shell stubs duplicate the Section markup verbatim so the plan 02-04 parity test can compare them"
requirements-completed: [NAV-01, DSN-04, MOT-01]
---

# Phase 2 Plan 02: Section Stubs, Resume Stand-in and Self-hosted Inter Summary

Seven labelled, anchored sections (hero plus six empty stubs, no nav) in both the static HTML and React, a Contact CTA that lands on the Contact Me heading, a generated phone-free "Resume coming soon." PDF, a monogram favicon, self-hosted Inter Variable with only same-origin requests, and a `prefers-reduced-motion` CSS guard plus focus ring shipped in the built CSS.

## Task 1: Tracer (commit 613e318)

- `Section` wrapper (id, `aria-labelledby="${id}-heading"`, `scroll-mt-6 py-16`, Container, h2) and `SectionStubs` rendering Experience, Projects, About Me, Skills, Education and Contact Me with `min-h-[40svh]`; `Page` renders Hero then SectionStubs.
- The same six sections added to the `index.html` shell (D-06); no `nav` element anywhere (D-04).
- `base.css` inside `@layer base`: `-webkit-text-size-adjust`, `:focus-visible` outline `2px solid var(--focus-ring)`, smooth scroll under `no-preference`, and the `reduce` block (animation/transition duration 0.01ms, iteration count 1, `scroll-behavior: auto`, all `!important`). Imported from `index.css` directly after `tokens.css`.
- Tests written first: `JS disabled: all seven section anchors exist with headings` and `hero: Contact jumps to the Contact Me heading`.
- Verified: build under `VITE_BASE=/aa-phan-portfolio-v2/`, built CSS contains `prefers-reduced-motion` and `focus-visible`, 3 Playwright tests passed, Prettier clean on owned files.
- Tracer feedback gate: `<verify>` is automated-only, so it was re-run end to end and passed (`Tracer verified end-to-end - expanding`); no checkpoint.

## Task 2: Resume, favicon, Inter, 44 px targets (commit a8b2f4f)

- `public/resume.pdf`: 594-byte one-page PDF 1.4 (Helvetica, `Resume coming soon.`) built by a scratch script outside the repo. `pdftotext` prints only `Resume coming soon.`; no phone-shaped string.
- `public/favicon.svg`: 32 by 32 viewBox, `#5046e5` rounded square, white A path (no text element); `<link rel="icon" ... href="%BASE_URL%favicon.svg">` after the title (built href `/aa-phan-portfolio-v2/favicon.svg`).
- `src/main.tsx` line 1 is `import '@fontsource-variable/inter/wght.css'`. No CDN link, no preload (OD-08).
- Tests written first and seen failing (PDF content-type was the SPA HTML fallback; no font faces), then passing: `hero: CTA targets are at least 44px and resolve` (375 by 667; height and width >= 44; resume 200, `application/pdf`, `%PDF-`; favicon 200) and `fonts: only same-origin requests and at most 2 font families` (all requests share the origin, FontFace families <= 2 and include Inter Variable, h1 computed family starts with Inter Variable).
- Verified: full `npm run test:e2e` 6 passed; `npm run typecheck` clean; no `dark:` under `src`; Prettier clean on owned files.

## Plan-level verification

| Check | Result |
|-------|--------|
| `VITE_BASE=/aa-phan-portfolio-v2/ npm run test:e2e` | 6 passed |
| `npm run typecheck` | exit 0 |
| Built CSS has reduced-motion and focus-visible rules | yes |
| Prettier run only on owned files (plan 02-03 shares the wave) | yes |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Acceptance grep for section count is formatter-unstable**
- **Found during:** Task 1 acceptance check
- **Issue:** `grep -c '<section id=' index.html` equals 2, not 7, because Prettier (printWidth 100) wraps the longer `<section` openings onto several lines, so only the two that fit stay on one line.
- **Fix:** No code change; the intent (seven section elements, seven `aria-labelledby`) was verified with `grep -cE '^\s*<section' index.html` = 7 and `grep -c 'aria-labelledby=' index.html` = 7, and by the JS-disabled Playwright test asserting the seven ids in order. `grep -c '<nav'` = 0.
- **Files modified:** none

**Total deviations:** 1 (a stale acceptance-criterion regex, no behavior impact).

## Auth gates

None.

## Known Stubs

Intentional per D-04; Phase 3 content plans fill them. Not blockers for this plan's goal (anchors and labels).

| File | Line | Reason |
|------|------|--------|
| src/sections/Stubs/SectionStubs.tsx | 6-11 | Six empty sections (Experience, Projects, About Me, Skills, Education, Contact Me) awaiting Phase 3 content |
| index.html | 41-97 | Matching static-shell copies of the six stubs |
| public/resume.pdf | n/a | Stand-in "Resume coming soon."; Phase 3 CNT-04 replaces it with the phone-free real resume |

Both intentional stubs (the section stubs and the resume stand-in) were appended to the cross-phase `.planning/WINDOWS.md` ledger (kind `stub`, phase 02) so the ship gate sees them until Phase 3 resolves them.

## Threat Flags

None. T-02-01 (resume leak) mitigated: generated from scratch, header and text checked, no phone-shaped string. T-02-02 mitigated by the same-origin fonts test. T-02-31 mitigated: Prettier ran only on this plan's files.

## Self-Check: PASSED

- Created files present: src/layout/Section.tsx, src/sections/Stubs/SectionStubs.tsx, src/styles/base.css, public/resume.pdf, public/favicon.svg.
- Commits 613e318 and a8b2f4f exist on `gsd/phase-02-deployed-themed-skeleton`; ledger-measured `commits: 2` from `plan_head_before`.
- All acceptance criteria re-run and passing (see deviation 1 for the section-count grep).
