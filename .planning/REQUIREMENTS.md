# Requirements: Aaron Phan Portfolio v2

**Defined:** 2026-10-09
**Core Value:** The site must feel crafted and memorable (tactile, physics-based motion, strong visual identity) while key info stays instantly accessible, on mobile as much as desktop.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundations

- [x] **FND-01**: Site builds as Vite + React + TypeScript + Tailwind v4 and deploys via GitHub Actions to the project URL, with an env-driven `base`
- [x] **FND-02**: CI on Linux runs typecheck, lint, build and a path-case consistency check
- [x] **FND-03**: Initial JS is at most 150 kB gzipped, enforced by a CI budget check
- [x] **FND-04**: Layered imports are enforced by lint (only `anim/` and vendored primitives may import `motion/react` or `@react-spring/web`; only the page root imports content)

### Design System

- [x] **DSN-01**: Palette and type are chosen via realtimecolors after exploring alternatives to the seed palette, delivered as light and dark token sets
- [x] **DSN-02**: A contrast matrix covers every text, UI and focus pair in both themes and meets WCAG 2.2 AA
- [x] **DSN-03**: User can toggle light/dark, defaulting to system preference, with no flash on load
- [x] **DSN-04**: Fonts are self-hosted, with at most 2 families

### Content

- [ ] **CNT-01**: All six sections (About Me, Skills, Education, Experience, Projects, Contact Me) render from typed content modules
- [ ] **CNT-02**: All v1 content is carried over: 5 experience entries, all 7 v1 projects (RecipeCart, A.T.L.A.S, Suspect Genie, MediaDash, Full-Stack Library Simulator, FPGA-Based Stopwatch, Smart Mirror), education entries including GPA, public email, and the DJ Instagram link
- [x] **CNT-03**: `references/Aaron_Phan_Resume.pdf` is the source of truth: where it conflicts with v1, the resume wins; v1-only items it does not cover (4 extra projects, ITS Student Consultant role) are kept from v1. The resume's own metric overlap (Symbotic 76% accuracy vs Suspect Genie >=50%) is shown only where the resume places each figure, and date formats are normalized, all recorded in a content inventory before typing
- [ ] **CNT-04**: Visitor can download a resume PDF generated from `references/Aaron_Phan_Resume.pdf` with the phone number removed. The phone number must not appear anywhere on the site, including the PDF, meta tags, JSON-LD and OG data
- [x] **CNT-05**: Only used images are migrated, optimized (AVIF/WebP) and stripped of EXIF

### Navigation and Recruiter Fast Path

- [x] **NAV-01**: Hero shows name, role and CTAs in a static shell that is visible without JavaScript
- [ ] **NAV-02**: Sticky nav with scroll-spy on desktop, a thumb-reachable morphing pill nav on mobile (reference 445), and a skip link
- [ ] **NAV-03**: Visitor can copy the email address with a confirmation toast
- [ ] **NAV-04**: A visitor can find name, role, experience, projects, resume and contact within 10 seconds on a phone (acceptance test)

### Signature Interaction

- [ ] **SIG-01**: Projects render as a handled object in the style of reference 539, with hover lift and neighbors shifting aside on desktop
- [ ] **SIG-02**: On touch devices the visitor swipes the rail and taps to open
- [ ] **SIG-03**: Opening a project shows a focused overlay with blurred backdrop, prev/next, close, focus trap, Escape key, and focus return
- [ ] **SIG-04**: Every item on the rail has a keyboard path

### Motion System

- [x] **MOT-01**: One motion-preference source drives motion, react-spring and a CSS guard, and all content is visible with motion off
- [ ] **MOT-02**: One library animates any given element, with an ownership matrix documented
- [ ] **MOT-03**: Shared press-squish behavior and spring tokens are used across the site
- [ ] **MOT-04**: Fine-pointer effects are gated by `(hover: hover) and (pointer: fine)`
- [ ] **MOT-05**: Lenis smooth scroll applies on desktop only, with touch left native and reduced motion respected

### Section Treatments

- [ ] **SEC-01**: Experience shows expandable role cards with logos and animated metrics
- [ ] **SEC-02**: Skills appear as a slider strip with a static fallback
- [ ] **SEC-03**: Education is a compact expand or flip card
- [ ] **SEC-04**: Hero has a text effect on the role line

### Quality and Launch

- [ ] **QA-01**: Mobile Lighthouse performance >= 90, accessibility >= 95, LCP <= 2.5 s, CLS < 0.1
- [ ] **QA-02**: Tested on a real iPhone and Android (drag versus scroll, touch fallbacks)
- [ ] **QA-03**: Keyboard and VoiceOver pass, plus an axe check
- [ ] **LCH-01**: OG image, favicon set, meta description and `noscript` content exist
- [ ] **LCH-02**: `v1-ipod` tag, additive cutover commit on `aa-phan.github.io`, Pages source switched to Actions, and a written rollback

### Documentation (gates all code)

- [x] **DOC-01**: Design brief with the 10-second test and the user's references
- [x] **DOC-02**: Content inventory
- [x] **DOC-03**: Information architecture and wireframes at 375, 768 and 1280
- [x] **DOC-04**: Design tokens doc with palette exploration and contrast matrix
- [x] **DOC-05**: Motion spec with per-interaction owner library, touch equivalent and reduced-motion fallback
- [x] **DOC-06**: Architecture doc, ADRs as decisions land, and a deploy runbook

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Interactions

- **V2-01**: Draggable, throwable hero toy
- **V2-02**: Project filter
- **V2-03**: Opt-in UI sound (off by default)
- **V2-04**: Deep-linkable project URLs
- **V2-05**: Progressive Blur and Border Trail effects
- **V2-06**: DJ mini-deck

### Infrastructure

- **V2-07**: Full prerender
- **V2-08**: Blog

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| 3D/WebGL | Protects the mobile performance budget; user chose no |
| Client-side router | GitHub Pages cannot rewrite paths; overlay covers project detail |
| Site-wide custom cursor | Fails on touch, adds accessibility cost |
| Preloader / intro blocking content | Hurts the 10-second test and LCP |
| Scroll-jacking | Hurts usability and accessibility |
| Hover-only content | Not reachable on touch |
| Skill percentage bars | Low-signal for recruiters |
| `references/` in any public repo, or the planning area in the site repo (`aa-phan.github.io`) | The private reference folder never goes into any public repo, and the site repo receives only the site at cutover. This public development repo carries its planning notes by owner decision on 2026-10-18, reversing the original row (ADR-0008) |
| Phone number anywhere on the site | User instruction; the source resume contains it, so the web copy must strip it |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 2 | Complete |
| FND-02 | Phase 2 | Complete |
| FND-03 | Phase 2 | Complete |
| FND-04 | Phase 2 | Complete |
| DSN-01 | Phase 2 | Complete |
| DSN-02 | Phase 2 | Complete |
| DSN-03 | Phase 2 | Complete |
| DSN-04 | Phase 2 | Complete |
| CNT-01 | Phase 3 | Pending |
| CNT-02 | Phase 3 | Pending |
| CNT-03 | Phase 1 | Complete |
| CNT-04 | Phase 3 | Pending |
| CNT-05 | Phase 3 | Complete |
| NAV-01 | Phase 2 | Complete |
| NAV-02 | Phase 3 | Pending |
| NAV-03 | Phase 3 | Pending |
| NAV-04 | Phase 3 | Pending |
| SIG-01 | Phase 4 | Pending |
| SIG-02 | Phase 4 | Pending |
| SIG-03 | Phase 4 | Pending |
| SIG-04 | Phase 4 | Pending |
| MOT-01 | Phase 2 | Complete |
| MOT-02 | Phase 4 | Pending |
| MOT-03 | Phase 4 | Pending |
| MOT-04 | Phase 4 | Pending |
| MOT-05 | Phase 4 | Pending |
| SEC-01 | Phase 5 | Pending |
| SEC-02 | Phase 5 | Pending |
| SEC-03 | Phase 5 | Pending |
| SEC-04 | Phase 5 | Pending |
| QA-01 | Phase 6 | Pending |
| QA-02 | Phase 6 | Pending |
| QA-03 | Phase 6 | Pending |
| LCH-01 | Phase 6 | Pending |
| LCH-02 | Phase 6 | Pending |
| DOC-01 | Phase 1 | Complete |
| DOC-02 | Phase 1 | Complete |
| DOC-03 | Phase 1 | Complete |
| DOC-04 | Phase 1 | Complete |
| DOC-05 | Phase 1 | Complete |
| DOC-06 | Phase 1 | Complete |

**Coverage:**

- v1 requirements: 41 total
- Mapped to phases: 41 ✓
- Unmapped: 0

**Per phase:** Phase 1: 7, Phase 2: 10, Phase 3: 7, Phase 4: 8, Phase 5: 4, Phase 6: 5

---
*Requirements defined: 2026-10-09*
*Last updated: 2026-10-09 after roadmap creation*
