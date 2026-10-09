# Motion Spec (DOC-05)

Status: Draft

Phase 1 plan 01-01 created this file with the ownership rule, the fixed 17-row interaction catalog and the first fully specified interaction (IX-09). Plan 01-05 adds the other 16 interaction subsections in the same format, plus tokens, easing and the reduced-motion policy.

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
| InfiniteSlider | IX-13 | Pauses off-screen, on focus and hover, and when the tab is hidden |
| Tilt, Magnetic, Spotlight | IX-17 | Fine pointer only |

Not vendored: Cursor, Dock and any other mouse-only primitive. Each vendored file is patched for type-only imports and gets a reduced-motion branch.

## Interaction catalog index

The 17 IDs below are fixed. Wireframes annotate with them and the motion plan fills them in.

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
| IX-13 | Skills slider strip | {#skills} | SEC-02 | motion |
| IX-14 | Education card expand or flip | {#education} | SEC-03 | motion |
| IX-15 | Section in-view reveal | all sections | MOT-01 | motion |
| IX-16 | Desktop smooth wheel scroll | global | MOT-05 | Lenis |
| IX-17 | Desktop pointer polish (Tilt on the About photo, Magnetic on CTA wrappers, Spotlight on experience cards) | {#hero} {#about} {#experience} {#contact} | MOT-04 | motion |

## Interactions

Each interaction is a subsection of bullet lines in the form `- Label: value`, with the 12 labels in this order: Section, Trigger, Element, Owner library, API, Properties, Token, Touch equivalent, Keyboard path, Reduced-motion fallback, Requirement, Build phase.

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
- Build phase: 3 for copy and toast, 4 for motion
