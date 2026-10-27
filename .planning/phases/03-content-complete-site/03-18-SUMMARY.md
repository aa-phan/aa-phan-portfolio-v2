---
phase: 03-content-complete-site
plan: "18"
subsystem: qa
tags: [awwwards-loop, axe-core, lighthouse-style-gates, critic, hover, container-query]

requires:
  - phase: 03-content-complete-site
    provides: the shipped Phase 3 site (03-05 to 03-17) and the pinned tooling approval (03-01)
provides:
  - scripts/check-qa-shots.mjs, the D-24 threshold gate over .shots/summary.json and .shots/audit.txt
  - scripts/qa-extra-shots.mjs, open-dialog (1440 and 390, light and dark) and dark hero, Projects and footer frames
  - axe-core 4.13.0 as a pinned devDependency, so the QA pass never loads it from the CDN
  - 03-QA.md, the pass record with thresholds, WARN triage, critic idea, scores, ranked fix list and open gaps
  - a theme toggle hover answer and sleeve titles that fit the sleeve
affects: [03-19 staging check, gap plan from /gsd-plan-phase 3 --gaps, Phase 5 section treatments, Phase 6 launch assets and visual QA]

status: complete
commits: 5
plan_head_before: d0a9a0891000bbf77df291d41f757482117aa748
plan_head_after: e934d761ecbdb5cdbdb495debc01375ab176ca68

actuals:
  tokens: 8000
  tasks: 2
  commits: 5

tech-stack:
  added: ["axe-core 4.13.0 (devDependency, pinned)"]
  patterns:
    - "QA gate script reads the tool's summary.json and audit.txt and exits non-zero on any D-24 threshold miss or skipped axe pass"
    - "Hover answer on the toggle sits on the track (scale and border) so react-spring keeps the thumb alone"
    - "Sleeve is an inline-size container; the title is sized in cqw and capped at the type token"

key-files:
  created:
    - scripts/check-qa-shots.mjs
    - scripts/qa-extra-shots.mjs
    - .planning/phases/03-content-complete-site/03-QA.md
  modified:
    - package.json
    - package-lock.json
    - .gitignore
    - src/components/ui/ThemeToggle.tsx
    - src/sections/Projects/Sleeve.tsx
    - src/styles/interactions.css

key-decisions:
  - "The critic ran on the final state and scored 7.0 overall; the areas under 8 are recorded as open gaps, not patched in this plan"
  - "Fix 5 (404 to home page transition) is owner-declined under D-25 to D-28 and not planned"
  - "Canonical, robots.txt, sitemap and OG meta stay triaged as Phase 6 launch assets, but the critic scores them now, so Markup (5) and Semantics/SEO (6) need an owner decision on pulling them forward"

requirements-completed: []

duration: not timed (two executor segments split around the critic run)
completed: 2026-10-27
---

# Phase 3 Plan 18: QA pass, critic and open gaps Summary

**The awwwards QA loop runs end to end on a production build and passes every D-24 threshold; the independent critic scored the site 7.0 overall, with eight areas under 8 recorded as open gaps.**

## Performance

- Home: mobile LCP 988 ms, CLS 0.001. 404: mobile LCP 572 ms, CLS 0.003.
- axeSerious, noVisibleFocus, invisibleFocus and noHoverChange are all 0 on both pages. Audit: 0 FAIL, 8 WARN (all triaged as Phase 6 launch assets).
- Desktop and mobile FPS 60. No overflow, smallTargets 0, no page errors. `idleMotion` false is expected (D-27).
- `node scripts/check-qa-shots.mjs` prints `QA: PASS`; `VITE_BASE=/aa-phan-portfolio-v2/ npm run verify` exits 0 (initial JS 124.8 kB gz of 150 kB); the full `npm run test:e2e` passes 149 of 149.

## Accomplishments

- Tracer (Task 1): the QA pass runs from build to gate, with axe-core from the pinned devDependency, the extra dialog and dark frames, and a gate script that fails on a skipped axe pass.
- Two fixes found by the pass, each its own commit: the theme toggle hover answer and the sleeve title fit.
- Every frame in `.shots/` was read; findings and the WARN triage are in `03-QA.md`.
- The critic (a fresh subagent given only `.shots/critic-brief.md`) read back the concept card's core idea from the frames: "He's a software engineer by day and a DJ called PHVNTM by night". It missed the crate metaphor and the light-theme hint of the alter ego (compared with DESIGN.md section 4 only after the reply).

## Critic scores (as returned)

| Area                   | Score |
| ---------------------- | ----- |
| Design                 | 7     |
| Usability              | 7     |
| Creativity             | 7     |
| Content                | 7     |
| Semantics/SEO          | 6     |
| Animations/Transitions | 6     |
| Accessibility          | 8     |
| WPO                    | 9     |
| Responsive             | 7     |
| Markup/Meta-data       | 5     |

Weighted overall: 0.4x7 + 0.3x7 + 0.2x7 + 0.1x7 = 7.0. Evidence, the ranked fix list and the gaps are in `03-QA.md`.

## Open gaps (summary)

Under 8: Design 7 (fixes 1, 7, 8, 9, 10), Usability 7 (6, 4), Creativity 7 (2), Content 7 (1, 9), Semantics/SEO 6 (3), Animations/Transitions 6 (4; fix 5 owner-declined, D-25 to D-28), Responsive 7 (6), Markup/Meta-data 5 (3). No area rests only on owner-declined items. Markup and Semantics/SEO items need an owner decision on whether the Phase 6 launch assets (OG image, canonical, robots.txt, sitemap) are pulled forward. These feed `/gsd-plan-phase 3 --gaps`. Notes: the 404 "A" sliver (D-01, Phase 6 visual QA); the experience-row and dialog-control hover pairs were read only in static frames.

## Task Commits

1. Task 1, tracer: `a496c33` feat(03-18) QA loop tracer with pinned axe-core, extra dialog and dark frames, and the D-24 threshold gate
2. Task 2, fixes: `3321fb2` theme toggle hover, focus and press answer; `c09b208` sleeve titles fit the sleeve
3. Task 2, record: `e7a0d06` QA pass record up to the critic step; `e934d76` critic idea, scores, fix list and open gaps

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Tracer verify failed once on noHoverChange**
- **Found during:** Task 1 verify
- **Issue:** `h-01 button "Dark theme"` had no hover answer.
- **Fix:** In Task 2, a track grow of 8 percent (scale 1.08) with a darker border on hover, focus and press; a 2 px inset border instead of movement under reduced motion. No threshold was loosened.
- **Files modified:** src/components/ui/ThemeToggle.tsx, src/styles/interactions.css
- **Commit:** 3321fb2

**2. [Rule 1 - Bug] Sleeve titles broke mid-word between 768 and 1500 px**
- **Found during:** Task 2 frame review ("Recommendati / on Hub")
- **Fix:** The sleeve is an inline-size container; the title is `clamp(1.25rem, 12cqw, var(--text-l))`. A probe at 320, 390, 768, 1024, 1280, 1440 and 1920 px found every longest word inside its box.
- **Files modified:** src/sections/Projects/Sleeve.tsx, src/styles/interactions.css
- **Commit:** c09b208

### Environment and tool notes (not site defects)

**3. Smooth-scroll timing in the stock tool.** `html { scroll-behavior: smooth }` (no-preference motion) made the stock `shoot.mjs` hover pass capture `h-07 a "Download resume"` mid-scroll, so the pair read `none`. The final pass used a patched copy at `/tmp/shoot-patched/` with one wait raised from 900 to 2600 ms. No threshold changed, no page was dropped, and the shared tool was not modified. The stock tool needs the same wait raised (a tool follow-up).

**4. Skill symlink.** `~/.claude/skills/awwwards` is a symlink, so `serve.mjs` must be invoked by its real path, `/Users/aphan/.agents/skills/awwwards/scripts/serve.mjs`.

## Requirements

NAV-04 and CNT-04 are not marked here; the orchestrator owns them. Evidence for NAV-04: the fast path, navigation, focus, hover and mobile performance figures above and in `03-QA.md`. NAV-02 is handled in the state step below, only if the shared-ID gate allows it.

## Known Stubs

None added by this plan.

## Threat Flags

None. The plan adds dev scripts and a pinned devDependency (axe-core) and no runtime surface.

## Self-Check: PASSED

- Files present: scripts/check-qa-shots.mjs, scripts/qa-extra-shots.mjs, .planning/phases/03-content-complete-site/03-QA.md.
- Commits a496c33, 3321fb2, c09b208, e7a0d06 and e934d76 are ancestors of HEAD; `git rev-list --count d0a9a08..HEAD` was 5 before this SUMMARY.
