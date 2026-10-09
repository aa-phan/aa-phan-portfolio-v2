# Aaron Phan Portfolio v2

## What This Is

A remake of Aaron Phan's personal portfolio (currently the click-wheel iPod site at `../aa-phan.github.io`) as a visually distinctive, playful and tactile React site. It serves recruiters/hiring managers and the design-engineering community equally: personality on the surface, key information (experience, projects, contact) reachable in seconds.

## Core Value

The site must feel crafted and memorable (tactile, physics-based motion and strong visual identity) while key info stays instantly accessible, on mobile as much as desktop.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Same six content sections as v1 (About Me, Skills, Education, Experience, Projects, Contact Me), existing copy and images reused, with new presentation (Skills/Education may become lighter treatments)
- [ ] Playful, tactile visual identity: spring/physics-driven interactions (react-spring), polished UI motion primitives (motion-primitives)
- [ ] Color palette and type system chosen via realtimecolors.com, after exploring alternatives to the initially linked palette; light and dark support
- [ ] Design direction informed by godly.design references
- [ ] Mobile-first quality: touch-friendly interactions, no desktop-only gestures required
- [ ] Deployed to GitHub Pages (GitHub Actions build) at aa-phan.github.io
- [ ] Documentation-first workflow: design/tool research and decision docs completed before any code

### Out of Scope

- Click-wheel iPod concept — user chose to drop it entirely; fresh identity
- Blog/CMS — not requested; revisit later
- Backend/server features — static site on GitHub Pages
- Next.js — Vite + React chosen as simpler fit

## Context

- Existing site: single self-contained `index.html` (vanilla JS, inline CSS), prior Bootstrap version in `index.bak.html`; content, images (`images/`, employer favicons, `about-dj.jpg`) and copy are reusable. Git history exists in `../aa-phan.github.io`.
- Author: Aaron Phan, student at UT Austin.
- Tools the user wants to try:
  - motion-primitives (github.com/ibelick/motion-primitives): React + Tailwind + `motion` components
  - godly.design/posts: curated web design inspiration (research/reference, not a dependency)
  - realtimecolors.com: palette and font visualizer. Seed link: 050315 / fbfbfe / 2f27ce / dedcff / 433bff, Inter/Inter. User wants alternatives explored.
  - react-spring.dev: physics-based animation hooks
- User asked that gaps in tooling be researched and surfaced for decision rather than assumed (e.g. any capability not covered by the four tools).
- Both motion-primitives (via `motion`) and react-spring are animation libraries; overlap/coexistence needs a researched decision.

## Constraints

- **Tech stack**: Vite + React + TypeScript + Tailwind — required by motion-primitives and react-spring
- **Hosting**: GitHub Pages — static output only, needs Actions workflow or a built-output branch
- **Platform**: Mobile must be excellent — touch interactions, performance on phones
- **Accessibility/perf**: Assumed baseline: `prefers-reduced-motion` respected, good Lighthouse scores (to confirm with user)
- **Process**: Detailed documentation before coding; research and surface findings for tooling decisions

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Drop iPod concept | User preference for a fresh identity | — Pending |
| Vite + React + TS + Tailwind | Fits motion-primitives and react-spring; static output suits GitHub Pages | — Pending |
| Playful, tactile direction | User selection | — Pending |
| Audience: recruiters and design-eng community equally | User selection | — Pending |
| Same content, new form | Reuse existing copy/images | — Pending |
| Explore palette alternatives | User not committed to the linked indigo palette; seed indigo fails contrast on dark (2.23:1), so per-theme tokens are required | — Pending |
| Signature interaction: an object you handle (ref 539, Batch Merch rail): hover/lift, neighbors shift, click opens focused detail view | User choice after reviewing references/ | — Pending |
| Mobile version of handled object: swipe rail + tap to open | Hover is unavailable on touch | — Pending |
| Draggable hero toy deferred to v1.x | Ship content-complete site first; avoid stacking two physics features | — Pending |
| Keep both motion and react-spring; only react-spring for 3-5 signature physics interactions; do not add @use-gesture/react up front | Measure after first slice, then keep or drop react-spring | — Pending |
| Cutover: additive push into existing aa-phan.github.io repo after tagging v1-ipod; never force-push | Keeps history, easy rollback | — Pending |
| No 3D/WebGL | Protects mobile budget | — Pending |
| Lenis smooth scroll adopted (touch stays native, reduced-motion respected) | User choice; +~5.6 kB gz | — Pending |
| Launch gates: mobile Lighthouse perf >=90, a11y >=95, initial JS <=150 kB gz (relaxed from a stricter 120), LCP <=2.5 s, WCAG 2.2 AA, full reduced-motion support | User first chose stricter, then relaxed JS to 150 kB because probe is ~139 kB before content; code-split to stay under | — Pending |
| Project detail is an in-page overlay (morphing dialog), no router or deep links | Avoids GitHub Pages path issues | — Pending |
| Drop click sounds for v1 | Revisit later as opt-in | — Pending |
| Keep .planning/ and references/ out of the public site repo | Public repo contains only the site | — Pending |
| Defaults pending user override: TypeScript 6, inline SVG brand icons, Tilt/Magnetic/Spotlight desktop-only polish | Researcher recommendations | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-08 after initialization*
