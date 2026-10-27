# Motion Spec (DOC-05)

Status: Accepted

Phase 1 plan 01-01 seeded this file with the ownership rule, the fixed 17-row interaction catalog and the first fully specified interaction (IX-09). Plan 01-05 completed it: principles, tokens, reduced-motion layers, ownership matrix, vendored primitives, the other 16 interaction specs and the element ownership check.

## Ownership rule

- Exactly one library animates any element: motion, react-spring, CSS or Lenis. Never two on the same element or property.
- No Tailwind transition utilities on an element a library animates.
- react-spring is scoped to IX-02, IX-03, IX-06 and IX-10 (velocity-carrying, tactile physics). Everything else uses motion, CSS or Lenis as the catalog says.

## Principles

- Motion never gates content. Name, role and CTAs are visible at first paint. The hero text effect runs only on the role line and never delays it.
- Animate transform and opacity only, plus motion layout animations where an interaction needs them (IX-05, IX-07, IX-08, IX-11, IX-14).
- Fine-pointer effects are gated by the media query `(hover: hover) and (pointer: fine)` and carry no hover-only content (MOT-04). Touch gets a tap or press equivalent, or nothing.
- `touch-action` is set only on small draggables. The project rail uses native horizontal scrolling, so vertical page scroll is never captured.
- Infinite or looping motion pauses when off-screen or when the tab is hidden.
- Motion budget: entrance animations take at most 420 ms; stagger is at most 60 ms per item for at most 6 items; nothing blocks input.

## Motion tokens

Canonical home is `src/anim/tokens.ts`, with CSS mirrors `--dur-fast`, `--dur-base`, `--dur-slow` and `--ease-out`. One table drives both libraries so they feel like one system.

| Token | Kind | motion format (stiffness, damping, mass) | react-spring format (tension, friction, mass) | Value |
|-------|------|------------------------------------------|-----------------------------------------------|-------|
| snappy | spring | 500, 32, 1 | 500, 32, 1 | presses, toggles |
| gentle | spring | 170, 26, 1 | 170, 26, 1 | rail lift, layout settling |
| bouncy | spring | 300, 14, 1 | 300, 14, 1 | playful overshoot, used sparingly |
| fast | duration | n/a | n/a | 120 ms |
| base | duration | n/a | n/a | 220 ms |
| slow | duration | n/a | n/a | 420 ms |
| ease-out | easing | n/a | n/a | cubic-bezier(0.22, 1, 0.36, 1) |

react-spring `tension` equals motion `stiffness` and `friction` equals `damping`. The spring numbers are starting values, to be tuned on a real iPhone and a real Android phone during the signature-rail work (Phase 4).

## Reduced motion

One preference source (MOT-01): `useMotionPreference` reads `prefers-reduced-motion` with a `change` listener (users toggle it live) and feeds three consumers:

- motion: `MotionConfig` `reducedMotion` (from `motion/react`).
- react-spring: `Globals.assign({ skipAnimation })` from `@react-spring/web`, set in an effect with a dependency array and a cleanup that resets it.
- CSS: the guard `@media (prefers-reduced-motion: reduce)`, which also gates smooth scroll behind `no-preference`.

Lenis is not started under reduced motion (MOT-05). Motion's `user` mode still animates opacity, so text effects and other opacity-driven wrappers branch manually on the hook's `reduced` value.

| Layer | Mechanism | Covers |
|-------|-----------|--------|
| L0 Progressive enhancement | Content is visible by default in HTML and CSS. Reveal wrappers set the hidden initial state only after mount on the client, and `<noscript>` guarantees visibility. | JS failure, slow hydration, crawlers, screenshots |
| L1 CSS guard | `@media (prefers-reduced-motion: reduce)` collapses animation and transition durations to near zero, runs animations once and sets `scroll-behavior: auto`. | CSS transitions, keyframes, anchor scroll |
| L2 motion | `MotionConfig` `reducedMotion` ("user", or "always" and "never" from an override). Disables transform and layout animations, keeps opacity and color. | All motion components, including vendored primitives |
| L3 react-spring | `Globals.assign({ skipAnimation })` in the provider effect. Springs jump to their target. | All spring physics |
| L4 Wrapper branches | Wrappers branch on `reduced` to drop parallax and scroll-linked transforms, stop loops and autoplay (text loop, infinite slider), disable fling, and swap transforms for short fades or nothing. | What L2 and L3 do not cover |
| L5 Non-motion feedback | Pressed, focus and selected states read without motion, through color, outline or shape. | Reduced-motion users still get feedback |
| L6 Visible toggle | Optional "Reduce motion" control persisted to localStorage and fed into `useMotionPreference`. Open decision, not committed. | Users whose OS setting is off but who want calm |

## Ownership matrix

MOT-02. Every interaction class has exactly one owner.

| Interaction class | Owner | Why |
|-------------------|-------|-----|
| Mount, unmount and presence | motion (`AnimatePresence`) | Mature exit handling under React 19 |
| Layout and shared-element morphs | motion (`layout`, `layoutId`) | react-spring has no equivalent |
| Scroll-linked values and in-view reveals | motion (`useScroll`, `whileInView`) | Already bundled |
| Text and number effects, motion-primitives prefabs | motion | The primitives are written against it |
| Velocity physics, press-squish, rail lift with neighbor shift, theme toggle thumb | react-spring (`useSpring`, `useSprings`) | Continuous retargeting gives the tactile signature |
| Color and hover transitions, native scroll-snap rail | CSS | Zero JS cost |
| Desktop wheel smoothing | Lenis | Wheel only, off on touch |

Constraints:

- Install `@react-spring/web` at `~10.1.x` only; never the umbrella `react-spring` package.
- Avoid `useTransition` in core UI; presence is motion's job, which keeps the react-spring v11 migration trivial.
- `@use-gesture/react` is not added up front.
- Import motion only from `motion/react`, never raw `framer-motion`.
- Whether react-spring stays at all is decided after the rail is measured (bundle cost and feel).

## Vendored motion-primitives

Copied in as owned source under `src/components/motion-primitives/`, not installed from npm.

| Component | Used for | Notes |
|-----------|----------|-------|
| TextEffect or TextLoop | IX-01 | Role line only |
| MorphingDialog | IX-05 | Adoption is subject to the overlay accessibility ADR and its spike |
| AnimatedNumber with InView | IX-12 | Once |
| InfiniteSlider | IX-13 | not vendored (IX-13 dropped) |
| Tilt, Magnetic, Spotlight | IX-17 | Fine pointer only |

Not vendored: Cursor, Dock and any other mouse-only primitive. Each vendored file is patched for type-only imports and gets a reduced-motion branch.

## Interaction catalog index

IX-01 to IX-17 are fixed. IX-18 was added by the Phase 3 art direction. Wireframes annotate with them and the motion plan fills them in.

| ID | Interaction | Section | Requirement | Owner |
|----|-------------|---------|-------------|-------|
| IX-01 | Hero role-line text effect | {#hero} | SEC-04 | motion |
| IX-02 | Press-squish on buttons and cards | global | MOT-03 | react-spring |
| IX-03 | Rail hover lift and neighbor shift | {#projects} | SIG-01 MOT-04 | react-spring |
| IX-04 | Rail swipe on touch | {#projects} | SIG-02 | CSS |
| IX-05 | Project overlay open, close, prev/next | {#projects} | SIG-03 | motion |
| IX-06 | Rail keyboard focus lift | {#projects} | SIG-04 | react-spring |
| IX-07 | Mobile morphing pill nav | global | NAV-02 | motion |
| IX-08 | Desktop sticky nav scroll-spy indicator | global | NAV-02 | motion |
| IX-09 | Copy-email confirmation toast | {#contact} | NAV-03 | motion |
| IX-10 | Theme toggle thumb | global | DSN-03 | react-spring |
| IX-11 | Experience card expand and collapse | {#experience} | SEC-01 | motion |
| IX-12 | Experience metric count-up | {#experience} | SEC-01 | motion |
| IX-13 | Skills slider strip (dropped) | {#skills} | SEC-02 | none |
| IX-14 | Education card expand or flip (optional) | {#education} | SEC-03 | motion |
| IX-15 | Section in-view reveal | all sections | MOT-01 | motion |
| IX-16 | Desktop smooth wheel scroll | global | MOT-05 | Lenis |
| IX-17 | Desktop pointer polish (Tilt on the About photo, Magnetic on CTA wrappers, Spotlight on experience cards) | {#hero} {#about} {#experience} {#contact} | MOT-04 | motion |
| IX-18 | Wordmark flip | global | DSN-03 | motion |

## Interactions

Each interaction is a subsection of bullet lines in the form `- Label: value`, with the 12 labels in this order: Section, Trigger, Element, Owner library, API, Properties, Token, Touch equivalent, Keyboard path, Reduced-motion fallback, Requirement, Build phase.

### IX-01 Hero role-line text effect

- Section: {#hero}
- Trigger: on mount, once the role line is in view
- Element: the role line only; the name, the CTAs and the rest of the hero are never animated by this effect
- Owner library: motion
- API: motion-primitives TextEffect or TextLoop
- Properties: opacity and translateY per word or character, within the 420 ms entrance budget
- Token: duration slow 420 ms, ease-out; stagger at most 60 ms per item for at most 6 items
- Touch equivalent: none needed, runs without input
- Keyboard path: none needed, not interactive; screen readers get the full role text through the element's text or an aria-label, never per-character spans
- Reduced-motion fallback: the static full role line is rendered immediately, with no loop and no per-character animation
- Requirement: SEC-04
- Build phase: 4

### IX-02 Press-squish on buttons and cards

- Section: global
- Trigger: pointerdown and pointerup on buttons and cards, and Enter or Space keydown and keyup on focused buttons
- Element: the inner button or card surface (for CTAs, the inner button inside the Magnetic wrapper)
- Owner library: react-spring
- API: useSpring on an animated element
- Properties: transform scale only (about 0.96 pressed)
- Token: spring snappy
- Touch equivalent: pointerdown and pointerup are the touch events, so a tap squishes the same way
- Keyboard path: native buttons; Enter and Space keydown and keyup drive the same spring
- Reduced-motion fallback: no scale; the pressed state is shown by color or shade change (L5)
- Requirement: MOT-03
- Build phase: 4

### IX-03 Rail hover lift and neighbor shift

- Section: {#projects}
- Trigger: pointer hover over a rail item, active only under (hover: hover) and (pointer: fine)
- Element: the outer rail item and its neighbors
- Owner library: react-spring
- API: useSprings over the rail items
- Properties: translateY and translateX (neighbor shift) only
- Token: spring gentle
- Touch equivalent: none needed, IX-04 provides the touch path
- Keyboard path: IX-06 triggers the same lift from :focus-visible
- Reduced-motion fallback: no lift or shift; the hovered item gets an elevation and outline change instead (L5)
- Requirement: SIG-01, MOT-04
- Build phase: 4

### IX-04 Rail swipe on touch

- Section: {#projects}
- Trigger: horizontal swipe on touch, or trackpad and shift-wheel on desktop; tap on an item opens IX-05
- Element: the rail scroll container
- Owner library: CSS
- API: native horizontal overflow with scroll-snap-type x mandatory and scroll-snap-align on items; no JS animation library
- Properties: native scroll position only
- Token: none, native scroll physics
- Touch equivalent: this is the touch path; vertical page scroll stays untouched because no touch-action is set on the rail
- Keyboard path: the container and items are focusable; arrow keys move between items (see IX-06) and the browser scrolls the focused item into view
- Reduced-motion fallback: unchanged because the motion is user-driven; scroll-behavior stays auto
- Requirement: SIG-02
- Build phase: 4

### IX-05 Project overlay open, close, prev/next

- Section: {#projects}
- Trigger: tap, click, or Enter on a rail item; close by close button, backdrop or Escape; prev/next by buttons or arrow keys
- Element: the inner card element of the rail item (layoutId source) and the overlay panel (layoutId target), plus the blurred backdrop
- Owner library: motion
- API: AnimatePresence plus a shared layoutId morph from the rail item's inner card element; prev/next crossfade; index shown as "NN / 07"
- Properties: layout transform, opacity and backdrop blur
- Token: spring gentle for the morph, duration base 220 ms for the crossfade and backdrop
- Touch equivalent: tap opens, backdrop tap or close button closes, previous and next buttons replace arrow keys
- Keyboard path: focus trap, Escape and focus return to the originating rail item come from the dialog primitive chosen by the overlay accessibility ADR, not from motion
- Reduced-motion fallback: instant open and close with no morph and no blur transition
- Requirement: SIG-03
- Build phase: 4

### IX-06 Rail keyboard focus lift

- Section: {#projects}
- Trigger: :focus-visible on a rail item
- Element: the outer rail item and its neighbors, the same elements as IX-03
- Owner library: react-spring
- API: the same useSprings instance as IX-03, driven by focus-visible state
- Properties: translateY and translateX only
- Token: spring gentle
- Touch equivalent: none needed, IX-04 provides the touch path and focus-visible does not fire on tap
- Keyboard path: arrow keys move between items, Enter opens IX-05
- Reduced-motion fallback: outline only, no lift
- Requirement: SIG-04
- Build phase: 4

### IX-07 Mobile morphing pill nav

- Section: global
- Trigger: tap on the Menu segment of the bottom pill below 768 px (the Experience and Projects segments are plain anchors that jump straight to their sections)
- Element: the bottom pill, which expands in place into a frosted panel (reference 445)
- Owner library: motion
- API: layout animation on the pill and panel container, AnimatePresence for the panel content
- Properties: layout transform and opacity
- Token: spring gentle
- Touch equivalent: tap to expand, tap a link or the close button to collapse
- Keyboard path: the pill is a native button with aria-expanded; Escape and a close button collapse it and return focus to the pill
- Reduced-motion fallback: instant state switch
- Requirement: NAV-02
- Build phase: 3 (structure and motion, m with LazyMotion through the anim barrel)

### IX-08 Desktop sticky nav scroll-spy indicator

- Section: global
- Trigger: scrolling a section into the active band, detected with IntersectionObserver; shown at 768 px and up
- Element: the indicator under the active nav link
- Owner library: motion
- API: layoutId indicator that slides between links
- Properties: layout transform only
- Token: spring snappy
- Touch equivalent: none needed on touch; the mobile pill (IX-07) is the nav below 768 px, and a tablet at 768 px or wider taps the same links
- Keyboard path: nav links are native anchors; Tab and Enter navigate, and the indicator follows the active section
- Reduced-motion fallback: the indicator jumps to the active link with no slide
- Requirement: NAV-02
- Build phase: 3 (structure and motion, m with LazyMotion through the anim barrel)

### IX-09 Copy-email confirmation toast

- Section: {#contact}
- Trigger: tap or click on Copy email, or Enter/Space on the focused button
- Element: toast region
- Owner library: motion
- API: AnimatePresence around the toast
- Properties: opacity and translateY only
- Token: duration base 220 ms, ease-out
- Touch equivalent: tap, same toast
- Keyboard path: native button; toast text announced through an aria-live polite region that exists in the DOM before the toast appears
- Reduced-motion fallback: toast appears and disappears with no transform or fade, announcement unchanged, 4 s auto-dismiss unchanged
- Requirement: NAV-03
- Build phase: 3 (copy, toast and motion)

### IX-10 Theme toggle thumb

- Section: global
- Trigger: tap, click, or Enter/Space on the theme toggle
- Element: the toggle thumb (the track and the button itself are not animated by react-spring)
- Owner library: react-spring
- API: useSpring on an animated thumb element
- Properties: translateX only
- Token: spring snappy
- Touch equivalent: tap, same toggle
- Keyboard path: a native button with aria-pressed; Enter and Space toggle
- Reduced-motion fallback: the thumb jumps to its position
- Requirement: DSN-03
- Build phase: 4

### IX-11 Experience card expand and collapse

- Section: {#experience}
- Trigger: tap, click, or Enter/Space on the card header button
- Element: the card body
- Owner library: motion
- API: layout height animation with AnimatePresence for the body content
- Properties: layout transform and opacity
- Token: spring gentle
- Touch equivalent: tap, same expansion
- Keyboard path: a button with aria-expanded and aria-controls; Enter and Space toggle
- Reduced-motion fallback: instant expand and collapse
- Requirement: SEC-01
- Build phase: 4

### IX-12 Experience metric count-up

- Section: {#experience}
- Trigger: the metric scrolls into view, once
- Element: the metric number text
- Owner library: motion
- API: motion-primitives AnimatedNumber with InView, once
- Properties: the rendered numeric text only
- Token: duration slow 420 ms, ease-out
- Touch equivalent: none needed, triggered by scroll position
- Keyboard path: none needed, not interactive; the final value is in the DOM from the start for screen readers
- Reduced-motion fallback: final numbers shown immediately; the same applies with no JS
- Requirement: SEC-01
- Build phase: 4

### IX-13 Skills slider strip

- Section: {#skills}
- Trigger: dropped by owner decision (2026-10-19): the four-sentence skills statement replaces the slider, so nothing triggers
- Element: none; the skills statement is static text
- Owner library: none
- API: none; InfiniteSlider is not vendored
- Properties: none
- Token: none
- Touch equivalent: none needed, nothing moves and nothing is dragged to read a skill
- Keyboard path: none needed, the statement is static text
- Reduced-motion fallback: none needed, the statement reads the same with motion off and with JS off
- Requirement: SEC-02
- Build phase: none

### IX-14 Education card expand or flip

- Section: {#education}
- Trigger: optional, because the education facts layout needs no hidden face; if built, click, tap, Enter or Space on the card
- Element: the education card body
- Owner library: motion
- API: layout expand (react-spring stays scoped to four interactions, so no flip physics)
- Properties: layout transform and opacity
- Token: spring gentle
- Touch equivalent: tap, same expansion
- Keyboard path: a button with aria-expanded and aria-controls; Enter and Space toggle
- Reduced-motion fallback: instant expand and collapse
- Requirement: SEC-03
- Build phase: 5, only if wanted

### IX-15 Section in-view reveal

- Section: all sections
- Trigger: the section enters the viewport, once
- Element: each section's content wrapper
- Owner library: motion
- API: whileInView with once; the hidden initial state is applied only after mount on the client, so content is visible by default in HTML and CSS
- Properties: opacity and a small translateY
- Token: duration base 220 ms, ease-out
- Touch equivalent: none needed, triggered by scroll position
- Keyboard path: none needed, not interactive; keyboard focus on a not-yet-revealed element reveals it
- Reduced-motion fallback: none, content is shown with no reveal
- Requirement: MOT-01
- Build phase: 4

### IX-16 Desktop smooth wheel scroll

- Section: global
- Trigger: mouse wheel on desktop
- Element: the page scroll root
- Owner library: Lenis
- API: ReactLenis with syncTouch false, anchors true and respectReducedMotion true
- Properties: scroll position only
- Token: Lenis defaults, tuned in Phase 4
- Touch equivalent: touch scroll stays native because syncTouch is false
- Keyboard path: native keyboard scrolling and in-page anchors keep working (anchors true); focus is not moved by smoothing
- Reduced-motion fallback: Lenis is not started (MOT-05), so scrolling is fully native
- Requirement: MOT-05
- Build phase: 4

### IX-17 Desktop pointer polish

- Section: {#hero} {#about} {#experience} {#contact}
- Trigger: pointer move over the element, only under (hover: hover) and (pointer: fine)
- Element: Tilt on the About photo, Magnetic on the outer wrapper of the hero and contact CTAs, Spotlight on experience cards; no Tilt on rail items
- Owner library: motion
- API: motion-primitives Tilt, Magnetic and Spotlight
- Properties: transform and gradient position, with no hover-only content
- Token: spring gentle
- Touch equivalent: none, IX-02 gives touch feedback
- Keyboard path: none needed, purely decorative; all content and actions stay reachable by keyboard
- Reduced-motion fallback: disabled
- Requirement: MOT-04
- Build phase: 4

### IX-18 Wordmark flip

- Section: global
- Trigger: the theme toggle
- Element: the A or V glyph span in the nav and footer wordmarks
- Owner library: motion
- API: rotateX animation on the glyph span
- Properties: rotateX, with the glyph swapped at 90 degrees
- Token: duration slow 420 ms, perspective 600 px
- Touch equivalent: the same on tap
- Keyboard path: the toggle button
- Reduced-motion fallback: the glyphs swap instantly
- Requirement: DSN-03
- Build phase: 4

## Element ownership check

Elements touched by more than one interaction, with a single owner library per element.

| Element | Interactions | Owner(s) | Resolution |
|---------|--------------|----------|------------|
| Rail item | IX-03, IX-06, IX-05 | react-spring on the outer item; motion on the inner card element | IX-03 and IX-06 lift the outer item. The IX-05 layoutId sits on the inner card element, so the two libraries animate nested elements, never the same one. react-spring settles before the morph measures. |
| CTA buttons | IX-02, IX-17 | react-spring on the inner button; motion on the outer wrapper | Magnetic moves the outer wrapper and the squish scales the inner button, so no element has two animators. |
| Experience card | IX-11, IX-15, IX-17 | motion | IX-11 height, IX-15 reveal and IX-17 Spotlight are all motion. |
| Theme toggle | IX-10 | react-spring on the thumb | IX-02 is not applied to the toggle; the thumb is the only animated element. |

No element has two owner libraries.
