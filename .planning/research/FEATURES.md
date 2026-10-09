# Feature Research

**Domain:** Playful, tactile, design-forward personal developer portfolio (design-engineering audience plus recruiters)
**Researched:** 2026-10-08
**Confidence:** MEDIUM (library capabilities HIGH from official docs; "what award portfolios do" MEDIUM, see Source Caveats)

## Source Caveats (read first)

- **godly.design/posts is not a gallery of full sites.** Fetched 2026-10-08: it is a feed of about 24 X (Twitter) posts by designer-engineers (Cambree Bernkopf, Breeje Anadkat, Jakub Antalik, terkelg, rit3zh, erdemkirmit x2, Swaraj "Another day, another widget", HAFEEZOLAMIDE1 "Activity log", AndrewPrifer, and others). Only two have titles. The X status pages return HTTP 402 to fetchers, so individual interaction details could not be read. Treat it as a feed of interaction and micro-UI demos, which is a useful signal in itself: this community rewards a single well-made tactile interaction (widgets, toggles, logs, dials) more than a sprawling site.
- **godly.website** (the site gallery) 301-redirects to **recent.design**. Its recent feed shows the same taste: "Vibe Selector Microinteraction", "Effort Slider Microinteraction", "Brain Effort Dial", "Skale Website Footer", "Infinite Media Player Loop", "WebGL Portfolio Explorer", "Alim Joldaspayev Portfolio" (https://recent.design/i/ltdfyfe-alim-joldaspayev-portfolio), "Paper Peel Motion Site". Tags were inferred by the fetcher, not verified.
- **Named exemplar portfolios** (Bruno Simon's drivable 3D site, Rauno Freiberg's rauno.me, Emil Kowalski's emilkowal.ski, Brittany Chiang's brittanychiang.com, Josh Comeau's joshwcomeau.com) come from general knowledge and a web search that surfaced Bruno Simon and Readymag's Websites of the Year write-up. They were not re-fetched here. Confidence MEDIUM. Verify the specific interaction before citing it in a requirement.
- **motion-primitives docs pages never document touch behavior** (Tilt, Dock, Spotlight, Cursor, Magnetic, Infinite Slider, Morphing Dialog all silent). Every "mobile-feasibility" rating below for those components is an inference from "described as mouse/hover driven". It must be tested on a real phone, or the source read, before committing.

## Library Inventory (what the tools give us)

**motion-primitives component list (official docs sidebar, HIGH):**

| Category | Components |
|----------|-----------|
| Core | Accordion, Animated Background, Animated Group, Border Trail, Carousel, Cursor, Dialog, Disclosure, In View, Infinite Slider, Transition Panel |
| Text Effects | Text Effect, Text Loop, Text Morph, Text Roll, Text Scramble, Text Shimmer, Text Shimmer Wave |
| Number Effects | Animated Number, Sliding Number |
| Interactive | Dock, Glow Effect, Image Comparison, Scroll Progress, Spotlight, Spinning Text, Tilt |
| Toolbars | Toolbar Dynamic, Toolbar Expandable |
| Advanced | Magnetic, Morphing Dialog, Morphing Popover, Progressive Blur |

Documented props worth knowing: Magnetic (`intensity` 0.6, `range` 100, `actionArea` self/parent/global, `springOptions`), Tilt (`rotationFactor` 15, `isRevese` [sic], `springOptions`), Dock (`spring` {mass 0.1, stiffness 150, damping 12}, `magnification`, `distance`), Spotlight (`size` 200, `springOptions` {bounce 0}), Infinite Slider (`speed` 100 px/s, `speedOnHover`, `gap`, `direction`), Cursor (`springConfig`, `attachToParent`), Morphing Dialog (Escape and click-outside close; `triggerRef` for focus; no documented focus trap, ARIA, or reduced-motion handling, so verify).

**react-spring (docs nav, MEDIUM; only useSpring was described on the fetched page):** useSpring, useSprings, useTrail, useTransition, useChain, plus utilities useScroll, useResize, useInView, useReducedMotion, and Parallax/ParallaxLayer. Gesture-driven physics (drag, fling, rubber-band) needs `@use-gesture/react` alongside it (standard pairing; not fetched in this session).

**Overlap note:** motion-primitives is built on `motion`, so "spring physics" arrives from two engines. Practical split for requirements: use motion-primitives components as shipped for text, number, dialog, and layout effects. Use react-spring (+ use-gesture) for the bespoke tactile pieces (drag-and-toss, press squish, springy hero). Do not hand-wire the same interaction in both.

## Feature Landscape

### Table Stakes (Users Expect These)

Missing any of these and a recruiter bounces or a design-engineer reads the site as unfinished.

| Feature | Why Expected | Complexity | Mobile | Notes |
|---------|--------------|------------|--------|-------|
| Above-the-fold identity: name, role/one-liner, status, primary CTA | Recruiters decide in under 10 seconds; guidance repeatedly says lead with specialty | LOW | Yes | Include "Software Engineer, UT Austin ECE, Capital One intern" style line from existing copy. Hero is the place for the first spring moment |
| Sticky navigation to the six sections (anchor links with scroll-spy active state) | Fast path to Experience/Projects/Contact | LOW-MEDIUM | Yes (bottom bar or compact top bar) | Mobile: thumb-reachable bar or menu button, not a hover-revealed menu. A Dock or Toolbar Dynamic/Expandable can be the styled version |
| Resume download (PDF) in nav and hero | #1 recruiter action | LOW | Yes | **Gap: v1 repo has no resume link or PDF.** User must supply the PDF. Also surface Experience as scannable text, not only a PDF |
| Persistent contact CTA (email, LinkedIn, GitHub; DJ Instagram optional) | Contact is the primary conversion on a portfolio | LOW | Yes | v1 has 4 contact entries (mailto, GitHub, LinkedIn, DJ Instagram). Copy-email-to-clipboard with a toast is a cheap upgrade |
| Experience section, scannable (company, role, dates, 3 bullets each) | Recruiters read this first | LOW-MEDIUM | Yes | 5 roles in v1, logos for 3. Present reverse-chronological with logos; collapsible detail OK, but headline facts visible without interaction |
| Projects section with title, one-line outcome, stack tags, link | The design-engineering audience judges the work here | MEDIUM | Yes | 7 projects in v1 with stack arrays and 2-4 bullets. **Gap: no project URLs/screens in v1 data.** Need GitHub/demo links or images from user |
| Light and dark theme (system default + manual toggle) | In PROJECT.md active requirements; expected by this audience | MEDIUM | Yes | Toggle should itself be a tactile interaction (spring-flip). Persist choice; avoid flash of wrong theme |
| `prefers-reduced-motion` support | Baseline accessibility; judged by design engineers | MEDIUM | Yes | Every spring effect needs a static or fade fallback. react-spring exposes useReducedMotion; motion has its own. Decide one global policy |
| Touch equivalents for every hover effect | "No desktop-only gestures" is a stated constraint | MEDIUM | Core | Hover is decoration only; never the sole access to content. Tilt/Magnetic/Spotlight/Dock/Cursor all need a tap or idle fallback |
| Fast load and smooth 60fps scroll on mid-range phones | Slow portfolios are a deal-breaker; mobile excellence is Core Value | MEDIUM | Core | Animate transform/opacity only, lazy-load images, cap simultaneous animated elements, no heavy WebGL on first paint |
| Keyboard navigation, focus states, semantic landmarks, alt text | Design engineers will tab through it | LOW-MEDIUM | n/a | Verify Morphing Dialog focus trap and return (undocumented) |
| Responsive layout with fluid type | Mobile first | MEDIUM | Core | Type system comes from the realtimecolors step |
| Meta/OG image, favicon, page title | Link previews matter when shared on X/LinkedIn | LOW | n/a | A custom OG card is a cheap polish win |
| About with photo and personality (DJ PHVNTM, cooking, EDM) | The playful identity is the differentiator for a human reader | LOW | Yes | Reuse `about-dj.jpg` and bio + quote from v1 |

### Differentiators (Competitive Advantage)

Align with Core Value: crafted, memorable, tactile, physics-based, while info stays instant. Do not try all of them. Pick one signature plus a few supporting.

| Feature | Value Proposition | Complexity | Mobile | Notes |
|---------|-------------------|------------|--------|-------|
| **Signature hero toy**: a draggable, throwable, springy object cluster (stickers, chips, or tech-stack tokens) that settles with spring physics | The memorable "I can build tactile UI" moment; fits the godly feed taste for single-interaction demos | HIGH | Yes, if built on pointer events/use-gesture (touch drag is natural) | react-spring + `@use-gesture/react`. Keep hero text readable without touching it. Idle auto-motion for reduced-motion users |
| Press-and-release squish on all buttons/cards (scale spring on pointerdown/up) | Cheap, consistent "tactile" feel across the whole site | LOW | Yes (pointer events fire on touch) | One shared `usePressSpring` hook. Highest ROI tactile feature |
| Morphing project cards: card expands into a detail view (shared-element layout animation) | Projects as hero; reveals bullets and stack without a page change | MEDIUM | Yes with care (full-screen sheet on phones) | motion-primitives **Morphing Dialog**. Verify focus trap, scroll lock, Escape, back-gesture on mobile |
| Projects as a physical stack/deck or horizontal snap carousel with drag + momentum | Browsing 7 projects feels like handling objects | MEDIUM-HIGH | Yes (swipe is native) | motion-primitives Carousel or react-spring + use-gesture drag. Fallback to a plain vertical list for reduced motion |
| Tilt + Spotlight/Glow on project cards | Depth and light on hover; classic "design-forward" cue | LOW | **Hover-only; degrade to flat on touch** (or tilt via pointer drag on the card) | motion-primitives Tilt + Spotlight/Glow Effect. Docs say mouse driven, so detect `(hover: hover)` and skip otherwise |
| Magnetic CTA buttons (Resume, Contact) | Delightful and draws attention to the recruiter fast-path | LOW | Hover-only; use press-squish on touch | motion-primitives Magnetic. `actionArea: 'self'` to stay subtle |
| Text effects on hero and section headings (Text Scramble, Text Roll, Text Morph, Text Loop for rotating role/title) | Instant personality; cycling roles ("Engineer / Artist / DJ") fits the bio | LOW | Yes | Run once per view with In View; keep the final text in the DOM for screen readers/SEO |
| Animated Number / Sliding Number for impact stats ("100K+ events/day", "30% efficiency", "25% defect detection") | Turns resume bullets into scannable proof for recruiters | LOW | Yes | Numbers exist in v1 copy. Trigger on in-view; show final value immediately under reduced motion |
| Infinite Slider marquee for Skills (tool/language chips drifting) | Skills becomes a lighter, ambient treatment instead of a section | LOW | Yes (auto-scrolls); `speedOnHover` is hover-only | Group by the 4 v1 categories as rows moving opposite directions. Pause under reduced motion; ensure the list is also available as static text |
| Skills as springy chips you can poke/drag (physics playground variant) | Playful alternative to marquee | MEDIUM-HIGH | Yes | Only if the signature hero toy is not already this. Avoid duplicating the same mechanic twice |
| Education as a compact "ID card / transcript strip" with flip or expand | Lighter treatment: two entries (UT Austin ECE, Data Science track, GPA 3.2, Dec 2026; high school) | LOW | Yes | Tap-to-flip card with spring rotation, or Disclosure/Accordion with a Text Effect. Keep degree and date visible on the front |
| Experience as an interactive timeline: logos on a spring-scrubbed rail, tap to open a role | Fast to scan, rewarding to explore | MEDIUM | Yes (vertical on mobile) | Accordion or Disclosure + In View. Alternatively Morphing Popover per role |
| Animated Background / Border Trail accents on active section or featured project | Subtle ambient identity | LOW-MEDIUM | Yes, watch GPU cost | Limit to one or two instances on screen |
| Scroll progress indicator + section-aware nav indicator that springs between items | Orientation and polish | LOW | Yes | motion-primitives Scroll Progress; or react-spring useScroll |
| Dock-style nav (magnifying icons on desktop; plain bottom tab bar on mobile) | Strongly associated with macOS-flavored design-eng sites | MEDIUM | **Magnification is hover-based; on touch render without magnification** | motion-primitives Dock. Doubles as the sticky nav, so do not build a second nav |
| Playful theme toggle (spring flip, sun/moon morph, or sliding thumb with overshoot) | Small tactile moment found on nearly every design-eng portfolio | LOW | Yes | Also satisfies the theme requirement |
| Easter egg / hidden detail (konami, long-press logo, DJ deck scratch) | Readymag's winners-of-the-year write-up cites hidden details as a hallmark | LOW-MEDIUM | Prefer tap/long-press, not keyboard-only | One or two, never gating content |
| Image Comparison slider (e.g. before/after of a project UI) | Showcases process if screenshots exist | LOW | Yes (drag) | Only if the user has before/after assets; otherwise skip |
| Copy-email with toast / confirmation spring | Contact feels alive | LOW | Yes | Toast needs `aria-live` |
| Optional UI sound (opt-in, off by default) | v1 had click-wheel blips; ties old identity to new | LOW-MEDIUM | iOS audio unlock needed | Only as an off-by-default toggle. See anti-features |
| Page-load intro (short, skippable, under about 1.5s) | First impression moment | MEDIUM | Yes | Must never delay content; see anti-features |
| Progressive Blur on edge of scrolling regions | Premium feel on lists and carousels | LOW | Yes | motion-primitives Progressive Blur; check Safari cost |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full 3D / WebGL world (Bruno Simon style) or WebGL portfolio explorer | Wins awards and wow | Heavy download, battery drain on phones, fails Mobile-excellent bar, kills recruiter fast-path, large build scope for a student site | One small contained spring/physics toy in the hero (use-gesture + react-spring); no three.js |
| Scroll-jacking, pinned horizontal scroll takeover, or custom scroll physics | Cinematic feel | Breaks native touch scrolling, anchor links, accessibility; frequent mobile bugs | Native scroll with In View reveals and a Scroll Progress bar |
| Hover-only content or interactions (tooltip-only info, hover-reveal project details) | Looks slick on desktop | Invisible on touch, violates "no desktop-only gestures" | Tap/click to expand; hover adds polish only |
| Custom cursor site-wide (motion-primitives Cursor) | Distinctive, common in award sites | Meaningless on touch, hurts precision/accessibility, fights native cursors; docs do not describe touch behavior | Use attached-to-parent Cursor on one hero element at most, desktop only, or skip |
| Content hidden behind a puzzle or required gesture (must find the egg to see projects) | Fun and memorable | Recruiters will not dig; "creativity shows skill, usability wins jobs" | Easter eggs are bonus layers only |
| Mandatory long preloader / loading animation | Theatrical entrance | Delays content, hurts Lighthouse, annoys repeat visitors | Under-1.5s skippable intro or none; skeleton-free instant paint |
| Autoplaying sound | v1 click-wheel had sound | Browsers block it; startles recruiters at work | Off-by-default opt-in toggle |
| Everything animates, everything springs | "Tactile" taken literally | Motion fatigue, janky phones, devalues the signature moment | Motion budget: shared press-squish baseline, 1 signature toy, a few supporting effects per viewport |
| Heavy per-pixel mouse effects on every card (spotlight + tilt + magnetic + glow stacked) | Looks premium in demos | Layering cost; clutter; no touch equivalent | Pick one or two per element type, e.g. Tilt+Spotlight on project cards only |
| Blog / CMS / backend contact form | "Real" portfolio features | Out of Scope per PROJECT.md; static GitHub Pages | mailto + copy-to-clipboard; link to external writing if ever needed |
| Skills as percentage bars or star ratings | Common template pattern | Meaningless data, reads as junior/template | Grouped chips (Languages, Frameworks, Developer Tools, Libraries) |
| Separate full pages per section / client-side routing | App-like feel | Slows recruiter fast-path; extra deploy complexity (GitHub Pages SPA 404) | Single-page with anchors; project detail as a morphing dialog |
| Retaining the iPod click-wheel | Nostalgia | Out of Scope; user chose fresh identity | Carry only the optional sound idea if desired |
| Cookie banner, analytics popups | Defaults from templates | Noise on a static personal site | Privacy-friendly analytics without a banner, or none |

## Section-by-Section Interaction Mapping

Constraint: content is fixed (v1 copy). "Weight" signals how much presentation budget each section gets. Projects is the hero.

| Section | Weight | Presentation | Primary Interactions (all mobile-feasible unless noted) | Components / Library | Complexity |
|---------|--------|--------------|--------------------------------------------------------|----------------------|------------|
| Hero / header (not a content section, but anchors everything) | High | Name, cycling role line, status, Resume + Contact CTAs, signature toy | Text Loop or Text Scramble on the role; draggable springy toy; Magnetic CTAs (desktop) / press-squish (touch) | motion-primitives Text Loop/Scramble, Magnetic; react-spring + use-gesture | MED-HIGH |
| About Me | Medium | Photo (`about-dj.jpg`), two-line bio, quote; personality block | Photo tilts/wobbles on pointer or drag; Text Effect reveal of the quote; DJ easter egg (tap vinyl) | Tilt, Text Effect, In View | LOW-MED |
| Skills | **Light** | One ambient strip, not a section with its own page height | Two or three counter-moving Infinite Slider rows grouped by category; tap a chip to pop a spring "label". Static list for reduced motion and screen readers | Infinite Slider, Animated Group | LOW |
| Education | **Light** | Two compact cards or a single "ID card" | Tap to flip or expand for GPA/track; Animated Number on GPA; date highlighted | Disclosure/Accordion or react-spring flip; Animated Number | LOW |
| Experience | High (recruiter priority) | Vertical timeline or stacked cards with logos; headline facts always visible | Tap/click to expand bullets (Accordion/Disclosure); Animated Number on metrics (100K+ events/day, 30%, 12 hours); scroll-linked rail | Accordion, Disclosure, Animated Number, In View, Scroll Progress | MEDIUM |
| Projects | **Hero** | 7 projects: feature the top 3 large, others compact. Card grid or draggable deck | Morphing Dialog from card to detail; Tilt + Spotlight on hover (desktop); swipe carousel on mobile; stack tags as chips; filter-by-tech chips with layout spring reorder | Morphing Dialog, Carousel, Tilt, Spotlight/Glow Effect, Animated Group, react-spring useTransition for filter | MED-HIGH |
| Contact Me | High (conversion) | Large CTA block, 4 links, also persistent from nav | Magnetic mailto button; copy-email with toast; links spring on press; footer with Text Roll sign-off | Magnetic, Text Roll/Text Morph, toast | LOW |
| Global | n/a | Sticky nav, theme toggle, scroll progress | Dock or Toolbar for nav (desktop); bottom bar (mobile); spring theme toggle; shared press-squish | Dock, Toolbar Dynamic/Expandable, Scroll Progress | MEDIUM |

## Feature Dependencies

```
Design tokens (palette, type, light/dark) 
    └──required by──> every visual feature below

Shared motion foundation (reduced-motion policy + press-squish hook + hover:hover detection)
    ├──required by──> Magnetic CTAs, Tilt/Spotlight cards, Dock nav, Infinite Slider, Text effects
    └──required by──> Signature hero toy

Sticky nav (anchors + scroll-spy)
    └──requires──> Section IDs / single-page layout
    └──enhanced by──> Dock styling, Scroll Progress

Resume PDF  ──required by──> Hero CTA, nav CTA   (asset must be provided by user)
Project URLs/images ──required by──> Morphing project cards, Image Comparison (assets must be provided by user)

Morphing project cards
    └──requires──> Project data model (title, sub, stack[], body[], links, image)
    └──requires──> Focus trap / scroll lock verification (Morphing Dialog)
    └──enhanced by──> Tilt + Spotlight, Carousel

Signature hero toy ──conflicts──> Skills physics playground (do not ship the same mechanic twice)
Custom cursor ──conflicts──> touch-first requirement
Page-load intro ──conflicts──> recruiter fast-path / Lighthouse
Magnetic / Tilt / Spotlight / Dock magnification ──requires──> touch fallback (hover:hover gate)
```

### Dependency Notes

- **Everything visual requires design tokens:** palette and fonts are chosen in the realtimecolors step, so build components against CSS variables, not literal colors, to keep light/dark and later palette swaps cheap.
- **Shared motion foundation first:** a single reduced-motion policy and a pointer-capability gate (`(hover: hover) and (pointer: fine)`) prevent retrofitting each effect later. Without it, Magnetic/Tilt/Spotlight/Dock each get a different mobile bug.
- **Sticky nav requires single-page sections:** anchors and scroll-spy depend on that, which is why routing is an anti-feature.
- **Morphing cards require data model and assets:** v1 project data has stack and bullets but no links or images. The user must decide on screenshots or generated stylized thumbnails.
- **Signature toy vs skills playground:** both are drag/toss physics. Doing both dilutes the signature and doubles perf cost.
- **Resume PDF is a content dependency, not a code one.** Raise it with the user during requirements.

## MVP Definition

### Launch With (v1)

Minimum to meet Core Value (crafted and memorable, info instantly accessible, mobile excellent).

- [ ] Design tokens, light/dark theme with spring toggle, fluid type, reduced-motion policy, pointer-capability gate
- [ ] Hero with name, cycling role text effect, Resume + Contact CTAs (Magnetic on desktop, press-squish on touch)
- [ ] Sticky nav (Dock on desktop, bottom/compact bar on mobile) with scroll-spy
- [ ] Experience: timeline/cards with logos, expandable bullets, Animated Number on key metrics
- [ ] Projects as hero: card grid with Tilt+Spotlight (desktop), Morphing Dialog detail, stack chips, swipeable on mobile
- [ ] Skills as a light Infinite Slider strip (plus static accessible list)
- [ ] Education as a compact flip/expand card
- [ ] About with photo and personality; one tiny easter egg
- [ ] Contact block with copy-email toast and all four links
- [ ] Shared press-squish on all interactive elements
- [ ] OG image, favicon, GitHub Pages deploy, Lighthouse and a11y pass

### Add After Validation (v1.x)

- [ ] Signature draggable/throwable hero toy (react-spring + use-gesture) — promote to launch if time allows; it is the biggest identity lever, so consider it v1 if the user wants "award-level"
- [ ] Project filter by tech with layout-spring reorder
- [ ] Progressive Blur and Border Trail accents
- [ ] Opt-in UI sound toggle (echoes v1)
- [ ] Image Comparison on a project, if assets exist
- [ ] Short skippable intro

### Future Consideration (v2+)

- [ ] Blog/writing section (Out of Scope for now)
- [ ] Interactive DJ mini-deck (ties to PHVNTM identity)
- [ ] Page transitions / View Transitions API
- [ ] WebGL accents (only if performance budget allows, likely never)

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Hero + Resume/Contact CTAs | HIGH | LOW | P1 |
| Sticky nav + scroll-spy | HIGH | LOW-MED | P1 |
| Experience scannable + expand | HIGH | MEDIUM | P1 |
| Projects cards + Morphing Dialog | HIGH | MEDIUM | P1 |
| Light/dark theme with spring toggle | HIGH | MEDIUM | P1 |
| Reduced-motion + touch fallback foundation | HIGH | MEDIUM | P1 |
| Press-squish shared hook | MEDIUM | LOW | P1 |
| Skills Infinite Slider strip | MEDIUM | LOW | P1 |
| Education flip/expand card | LOW-MED | LOW | P1 |
| Text effects (role loop, scramble headings) | MEDIUM | LOW | P1 |
| Animated Number metrics | MEDIUM | LOW | P2 |
| Tilt + Spotlight project cards | MEDIUM | LOW | P2 |
| Magnetic CTAs | MEDIUM | LOW | P2 |
| Copy-email toast | MEDIUM | LOW | P2 |
| Signature draggable hero toy | HIGH | HIGH | P2 (candidate P1) |
| Carousel / deck browsing for projects | MEDIUM | MED-HIGH | P2 |
| Easter egg | MEDIUM | LOW-MED | P2 |
| Project filter + layout reorder | LOW-MED | MEDIUM | P3 |
| UI sound toggle | LOW | LOW-MED | P3 |
| Image Comparison | LOW | LOW | P3 (asset dependent) |
| Intro animation | LOW | MEDIUM | P3 |

**Priority key:** P1 must have for launch; P2 should have when possible; P3 nice to have.

## Competitor / Reference Feature Analysis

| Feature | Reference | How they do it | Our Approach |
|---------|-----------|----------------|--------------|
| Single memorable interaction as identity | godly.design feed (terkelg, rit3zh, erdemkirmit, AndrewPrifer posts; "Activity log", "Another day, another widget") and recent.design ("Vibe Selector", "Effort Slider", "Brain Effort Dial") | Isolated polished micro-interaction as the shareable unit | One signature spring toy in hero; the rest stays restrained |
| Full playful world | Bruno Simon (drivable 3D) | WebGL/three.js | Deliberately avoid (anti-feature) |
| Hidden details / small interactions with smooth nav | Readymag Websites of the Year write-up (cited via search) | Small animations and discoverable details; navigation never overwhelmed | One or two easter eggs; stable nav |
| Clean recruiter-optimised dev portfolio | Brittany Chiang (MEDIUM, not re-fetched) | Sticky side nav, scannable experience, project cards with links, resume link | Borrow IA and fast-path; add tactile layer on top |
| Design-engineer craft showpiece | Rauno Freiberg, Emil Kowalski (MEDIUM, not re-fetched) | Polished micro-interactions, thoughtful hover/press states, writing | Press-squish baseline, careful spring tuning, but no blog (Out of Scope) |
| Footer as playful moment | recent.design "Skale Website Footer" | Animated footer | Contact block + sign-off with Text Roll |
| Skills as ambient marquee | Common across godly-style sites | Infinite logo/text slider | Infinite Slider, grouped by category, static fallback |

## Open Questions for Requirements

1. **Resume PDF:** v1 repo has none. Needs user-supplied file (and decision on whether to link LinkedIn only).
2. **Project assets:** links, screenshots, or generated cover art for the 7 projects? Which 3 are featured?
3. **Hero toy:** commit to a signature draggable toy for v1, or defer? This is the largest single scope and identity decision.
4. **Touch behavior of motion-primitives hover components:** run a 30-minute spike on a real phone (Tilt, Magnetic, Spotlight, Dock, Infinite Slider, Morphing Dialog focus trap) before locking requirements.
5. **Animation engine split:** confirm "motion-primitives for text/number/dialog/layout; react-spring + use-gesture for bespoke drag/press physics" as a stack decision (feeds STACK.md).
6. **Sound:** keep an opt-in nod to v1's click sounds, or drop entirely?
7. **DJ Instagram link:** keep in Contact (v1 has it) given the recruiter audience?

## Sources

- godly.design/posts (fetched 2026-10-08): feed of X posts; details unreadable (HTTP 402) — confidence LOW for specific interactions, HIGH for "what kind of content it curates"
- https://recent.design/?ref=godly (godly.website redirect target; fetched 2026-10-08) — MEDIUM, tags inferred
- https://motion-primitives.com/docs and component pages: morphing-dialog, magnetic, tilt, dock, spotlight, cursor, infinite-slider (fetched 2026-10-08) — HIGH for props and install; touch behavior undocumented
- https://www.react-spring.dev/docs/getting-started (fetched 2026-10-08) — MEDIUM, only useSpring described; other hooks seen in nav
- Web search results: Readymag "What sets award-winning portfolios apart" (https://blog.readymag.com/award-winning-portfolios/), dev.to "Best developer portfolio websites and why they work" (https://dev.to/jtrevdev/best-developer-portfolio-websites-and-why-they-work-3bdk), Bruno Simon's portfolio, interactive-portfolio guidance (mobile must work, don't hide content behind interactions, offer skip for intros) — MEDIUM
- Hover vs touch and reduced-motion guidance (Lightning Design System kinetics, general accessible-motion guidance from search) — MEDIUM
- v1 content: /Users/aphan/aa-phan.github.io/index.html (data arrays for ABOUT, SKILLS, EDUCATION, PROJECTS, EXPERIENCE, CONTACT) — HIGH

---
*Feature research for: playful, tactile developer portfolio*
*Researched: 2026-10-08*
