# Motion Spec (DOC-05)

Status: Draft

Phase 1 plan 01-01 created this file with the ownership rule, the fixed 17-row interaction catalog and the first fully specified interaction (IX-09). Plan 01-05 adds the other 16 interaction subsections in the same format, plus tokens, easing and the reduced-motion policy.

## Ownership rule

- Exactly one library animates any element: motion, react-spring, CSS or Lenis. Never two on the same element or property.
- No Tailwind transition utilities on an element a library animates.
- react-spring is scoped to IX-02, IX-03, IX-06 and IX-10 (velocity-carrying, tactile physics). Everything else uses motion, CSS or Lenis as the catalog says.

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
