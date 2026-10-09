# Roadmap: Aaron Phan Portfolio v2

## Overview

The journey runs from decisions to a live site in six phases. It starts with a short, time-boxed documentation phase (design brief, content inventory, wireframes, tokens, motion spec, architecture) because no code is written until the big decisions have written answers. A deployed, themed, budgeted skeleton then proves hosting, CI, theming and reduced-motion handling before anything is built on top. Next comes a content-complete site with navigation, resume and copy-email, so the recruiter fast path works before any motion is layered on. The motion system and the signature project rail (reference 539: hover/lift on desktop, swipe and tap on touch, focused overlay) come after that. The rail is the first real use of the animation layer, and the phase ends with measured keep-or-drop decisions on react-spring and LazyMotion. Section treatments (experience cards, skills slider, education card, hero text effect) follow. Real-device hardening and the additive cutover into `aa-phan.github.io` come last, so the v1 iPod site stays live and rollback stays trivial until the new site has passed every gate.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Decisions and Documentation** - Time-boxed design, content, IA, tokens, motion and architecture docs that gate all code
- [ ] **Phase 2: Deployed Themed Skeleton** - Vite/React/TS/Tailwind app live on the project URL with CI, JS budget, light/dark tokens and one motion-preference source
- [ ] **Phase 3: Content-Complete Site** - All six sections with real content, resume download, copy-email and navigation, passing the 10-second phone test
- [ ] **Phase 4: Motion System and Signature Rail** - Shared motion rules plus the handled-object project rail with overlay, touch and keyboard paths
- [ ] **Phase 5: Section Treatments** - Expandable experience cards, skills slider, education card and hero text effect
- [ ] **Phase 6: Hardening and Cutover** - Lighthouse, real-device, keyboard/VoiceOver/axe gates, launch assets, and the additive cutover with a written rollback

## Phase Details

### Phase 1: Decisions and Documentation

**Goal:** As a site owner, I want to have time-boxed design, content, motion and architecture docs, so that every major decision is settled before any code is written.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: DOC-01, DOC-02, DOC-03, DOC-04, DOC-05, DOC-06, CNT-03
**Success Criteria** (what must be TRUE):

  1. A design brief exists that states the 10-second test (name, role, experience, projects, resume and contact findable on a phone within 10 seconds) and records the chosen references (539 handled rail, 445 morphing pill nav, 355 tone).
  2. A content inventory lists every section and item to carry over (5 experience entries, 7 projects, education with GPA, public email, DJ Instagram link, resume), with the Symbotic metrics conflict and date formats resolved against `references/Aaron_Phan_Resume.pdf`, and each content gap marked as supplied, deferred or dropped.
  3. Information architecture and wireframes exist at 375, 768 and 1280 px showing the recruiter fast path, plus the project rail and overlay in both a desktop (hover) form and a touch (swipe and tap) form.
  4. A design tokens doc records the palette and type chosen via realtimecolors after exploring alternatives to the seed indigo, as light and dark sets, with a contrast matrix of text, UI and focus pairs in both themes that meets WCAG 2.2 AA on paper.
  5. A motion spec lists each interaction with its owner library, touch equivalent and reduced-motion fallback, and an architecture doc, an ADR log (open decisions listed) and a deploy runbook draft exist.

**Plans:** 1/7 plans executed

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Tracer: Contact Me slice through inventory, wireframes, tokens and contrast checker; design brief; motion catalog seed (wave 1)

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 01-02-PLAN.md — docs/architecture.md, ADR log, ADR-0001 doc split, ADR-0002 skeleton-gate skip, ignore references/ (wave 2)
- [ ] 01-03-PLAN.md — Content inventory reconciled against the resume, gap rulings checkpoint (wave 2)
- [ ] 01-04-PLAN.md — Three palette and type candidates, user pick, contrast matrix and tokens (wave 2)
- [ ] 01-05-PLAN.md — Motion spec: tokens, reduced motion, ownership matrix, 17 interactions (wave 2)

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 01-06-PLAN.md — ADR-0003..0006 (Pages source, TS 6, SVG icons, dialog a11y) and deploy runbook (wave 3)

**Wave 4** *(blocked on Wave 3 completion)*

- [ ] 01-07-PLAN.md — IA and wireframes at 375/768/1280, rail/overlay/nav states, cross-doc check (wave 4)

**Cross-cutting constraints:**

- No file under docs/ contains a phone number, a private planning path or a planning decision ID

### Phase 2: Deployed Themed Skeleton

**Goal:** As a visitor, I want to open the deployed project URL and see a fast, themed hero in light or dark, so that hosting, CI, theming and motion risks are retired before content is built.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: FND-01, FND-02, FND-03, FND-04, DSN-01, DSN-02, DSN-03, DSN-04, MOT-01, NAV-01
**Success Criteria** (what must be TRUE):

  1. A push builds on Linux CI (typecheck, lint, build, path-case check) and deploys through GitHub Actions to the project URL, where the page loads with correct asset paths from the env-driven `base`.
  2. The hero (name, role, CTAs) is visible with JavaScript disabled, and initial JS stays at or under 150 kB gzipped, with CI failing the build when it does not.
  3. Visitor can toggle light and dark, the first visit follows the system preference, and the page loads with no theme flash, using the palette from Phase 1 and at most 2 self-hosted font families.
  4. Every text, UI and focus color pair in both themes passes WCAG 2.2 AA according to the committed contrast matrix, checked against the real token files.
  5. With the OS reduce-motion setting on, a rendered motion-primitives component and the page show all content with no animation, driven by one preference source, and lint fails any import of `motion/react` or `@react-spring/web` outside `anim/` and the vendored primitives.

**Plans**: TBD
**UI hint**: yes

### Phase 3: Content-Complete Site

**Goal:** As a recruiter on a phone, I want to find Aaron's role, experience, projects, resume and contact details within seconds, so that I can decide whether to reach out without hunting for information.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: CNT-01, CNT-02, CNT-04, CNT-05, NAV-02, NAV-03, NAV-04
**Success Criteria** (what must be TRUE):

  1. All six sections (About Me, Skills, Education, Experience, Projects, Contact Me) render from typed content modules with every v1 item present: 5 experience entries, all 7 projects, education with GPA, public email and the DJ Instagram link, using the reconciled metrics and dates.
  2. Visitor can download the resume PDF and copy the email address with one tap or click, and sees a confirmation toast.
  3. On desktop a sticky nav highlights the section in view (scroll-spy), on mobile a thumb-reachable pill nav morphs in place to reveal the sections, and a keyboard user can jump past the nav with a skip link.
  4. Only the images the page uses ship, as optimized AVIF/WebP with EXIF stripped.
  5. On a phone, a first-time visitor can find name, role, experience, projects, resume and contact within 10 seconds (the 10-second acceptance test).

**Plans**: TBD
**UI hint**: yes

### Phase 4: Motion System and Signature Rail

**Goal:** As a visitor, I want to hover, swipe and open the projects as a physical rail, so that the portfolio feels crafted and memorable on both desktop and phone.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: MOT-02, MOT-03, MOT-04, MOT-05, SIG-01, SIG-02, SIG-03, SIG-04
**Success Criteria** (what must be TRUE):

  1. On a desktop with a fine pointer, hovering a project lifts it out of the rail and its neighbors shift aside; none of these hover effects run or trap interaction on touch devices.
  2. On a touch device, the visitor swipes the rail sideways without hijacking vertical page scroll, and a tap opens the project.
  3. Opening a project shows a focused overlay with a blurred backdrop, prev/next and close controls; focus is trapped inside, Escape closes it, and focus returns to the item that opened it.
  4. A keyboard-only user can reach, open, step through and close every item on the rail.
  5. Pressing buttons and cards gives the same press-squish feel from shared spring tokens, desktop wheel scrolling is smoothed by Lenis while touch scrolling stays native and reduced motion turns it off, and no element is animated by two libraries according to the ownership matrix.

**Plans**: TBD
**UI hint**: yes

### Phase 5: Section Treatments

**Goal:** As a visitor, I want to see each section given a light, purposeful treatment, so that the portfolio feels playful throughout without slowing me down.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04
**Success Criteria** (what must be TRUE):

  1. In Experience, each role is a card that expands and collapses to show its details, its logo stays legible in both themes, and its metrics animate when they scroll into view (final numbers appear immediately with reduced motion).
  2. Skills appear as a slider strip that moves or can be dragged, and a static list shows every skill when reduced motion is on or JavaScript is off.
  3. Education is a compact card that expands or flips by click, tap or keyboard to reveal the full details including GPA.
  4. The hero role line has a text effect that stays readable and accessible (screen readers get the full text, reduced motion shows static text) and does not delay the name, role or CTAs from appearing.

**Plans**: TBD
**UI hint**: yes

### Phase 6: Hardening and Cutover

**Goal:** As a site owner, I want to verify the finished site on real devices and swap it in for the iPod site with a tested rollback, so that visitors get the new portfolio and the old one is never lost.
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: QA-01, QA-02, QA-03, LCH-01, LCH-02
**Success Criteria** (what must be TRUE):

  1. Mobile Lighthouse on the deployed site reports performance of at least 90 and accessibility of at least 95, with LCP at or under 2.5 s and CLS under 0.1.
  2. On a real iPhone and a real Android phone, rail swiping does not fight page scroll, every touch fallback works, and the 10-second phone test still passes with all motion enabled.
  3. A keyboard-only walkthrough and a VoiceOver walkthrough complete every flow (nav, rail and overlay, copy email, resume download), and an axe check reports no violations.
  4. Sharing the URL shows a correct link preview (OG image), the favicon set appears in browser tabs and on a phone home screen, the page has a meta description, and a visitor without JavaScript sees `noscript` content with the key information.
  5. The `v1-ipod` tag exists, an additive commit (no force-push) puts the new site into `aa-phan.github.io` with the Pages source switched to Actions, the live URL serves the new site, and a written rollback restores the iPod site.

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Decisions and Documentation | 1/7 | In Progress|  |
| 2. Deployed Themed Skeleton | 0/0 | Not started | - |
| 3. Content-Complete Site | 0/0 | Not started | - |
| 4. Motion System and Signature Rail | 0/0 | Not started | - |
| 5. Section Treatments | 0/0 | Not started | - |
| 6. Hardening and Cutover | 0/0 | Not started | - |
