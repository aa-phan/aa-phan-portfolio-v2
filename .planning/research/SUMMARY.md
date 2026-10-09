# Project Research Summary

**Project:** Aaron Phan Portfolio v2
**Domain:** Playful, tactile, mobile-first personal developer portfolio (static React SPA on GitHub Pages)
**Researched:** 2026-10-08
**Confidence:** MEDIUM-HIGH

## Executive Summary

This is a static, zero-backend, single-page portfolio. Experts build it as Vite + React + TypeScript + Tailwind v4 with content in typed TS modules, CSS-variable design tokens, and a small owned animation layer. It deploys through the official Vite GitHub Actions workflow. All four researchers agree on:
- Single page with anchors, no router.
- `motion` (via copy-in motion-primitives) as the default animation engine, with react-spring only for a short list of signature physics.
- One reduced-motion source of truth feeding both libraries plus CSS.
- Self-hosted fonts, build-time image optimization, and an env-driven Vite `base`.

The recommended approach is a walking skeleton first (scaffold, deploy rehearsal on the project URL, providers, budgets). Then a content-complete static site (tokens, light/dark, all six sections, resume and contact). Only then the motion layer, then hardening, then cutover to `aa-phan.github.io`. The core value is that the site is memorable and tactile while a recruiter still gets name, role, experience, projects, resume and contact in about 10 seconds on a phone, so motion must never gate content.

The main risks:
1. Two animation libraries fighting. Mitigation is an ownership rule: one library per DOM node, and no Tailwind `transition-*` on animated nodes.
2. Mouse-only motion-primitives (Tilt, Magnetic, Spotlight, Cursor do nothing on touch).
3. Dark-mode contrast. The seed indigo is 2.23:1 on the dark background.
4. Hidden-hero LCP and an empty SPA shell (link previews, crawlers).
5. Cutover to the live v1 repo.
6. JS budget. The probe is about 139 kB gz before content, against a roughly 150 kB target.

## Conflicts Between Researchers (resolve before requirements)

| # | Topic | Position A | Position B | Recommended resolution |
|---|-------|-----------|------------|------------------------|
| 1 | `@use-gesture/react` | STACK: do not add by default. Last release March 2024, and motion's built-in `drag`/`whileTap`/`whileHover` suffice. Add only if a react-spring drag cannot be done well otherwise. | ARCHITECTURE: adopt it (ADR-003, `anim/physics/Draggable`), since react-spring has no gesture engine. FEATURES also assumes it for the hero toy. | Do not adopt up front. Build the first signature drag with motion `drag` or hand-written pointer events. Adopt use-gesture only if a spike shows react-spring drag needs it, after a React 19 compatibility check. The result decides whether react-spring earns its +17 kB. |
| 2 | Cutover method | STACK recommends (a): push v2 into the existing `aa-phan.github.io` repo. PITFALLS requires an additive commit on top of old history, a `v1-ipod` tag first, and never replacing history. | ARCHITECTURE recommends renaming the old repo, then renaming v2 to `aa-phan.github.io`. | STACK and PITFALLS agree, so go with the additive push-into-old-repo path, tagging `v1-ipod` first. The rename path has a weaker rollback. User confirms. |
| 3 | Who owns Tilt/Magnetic | STACK and FEATURES: vendored motion-primitives versions (motion-owned, mouse-only), desktop garnish only. | ARCHITECTURE: puts `Magnetic`/`Tilt` in `anim/physics` as react-spring-owned wrappers. | Pick ONE implementation per interaction in the motion spec. Default to the vendored motion versions gated by `(hover:hover) and (pointer:fine)`. Use react-spring only for touch-capable press and drag toys. |
| 4 | shadcn init | STACK: do not run `shadcn init` (adds Radix/CVA). | PITFALLS gives a detailed `shadcn init` flow. | STACK is right. motion-primitives needs only `cn()` plus the `@` alias. PITFALLS' advice to set the alias in three places (root tsconfig, tsconfig.app.json, vite config) still applies. |
| 5 | Dialog primitive | STACK and FEATURES: MorphingDialog, accessibility unverified. | ARCHITECTURE and PITFALLS: wrap Radix Dialog or native `<dialog>` if MorphingDialog lacks a focus trap. | Verify MorphingDialog (focus trap, Escape, scroll lock, focus return) in the first spike. Fall back to native `<dialog>` before Radix. |
| 6 | Prerender / static shell | PITFALLS: decide a static hero shell or prerender at scaffold. | ARCHITECTURE: prerender is a late optional ADR, with CSR + noscript + JSON-LD as default. | Static hero shell, meta/OG tags and noscript content in `index.html` from the scaffold phase (cheap). Full prerender stays optional and late. |
| 7 | LazyMotion | STACK: optional, only if Lighthouse demands it. | PITFALLS: decide at scaffold. ARCHITECTURE: measure after the first signature interaction. | Decide at the end of the first vertical slice using the bundle visualizer. Do not half-adopt, since `AnimatePresence`/`layout`/`drag` need `domMax`. |
| 8 | Bundle numbers | ARCHITECTURE and PITFALLS said sizes were unverified. | STACK measured: +17.2 kB react-spring, +52.9 kB motion with three components, 138.6 kB combined. | Use STACK's measured numbers. The 150 kB target is nearly consumed, so the budget needs user confirmation. |
| 9 | Docs-first scope | ARCHITECTURE: P0 is an 11-document set plus 12 ADRs gating all code. | PITFALLS #16: time-box docs and decide feel with throwaway sketches on a phone. | Middle path. Keep the design brief, content inventory, IA, tokens and motion spec short and time-boxed. Write the rest as ADRs as decisions land. Use `/gsd-sketch` and `/gsd-spike`. |
| 10 | Font preload | ARCHITECTURE: preload the primary face. | STACK: Vite does not rewrite a bare preload link, and `swap` without preload is acceptable. | Skip preload initially. Add it only if Lighthouse flags it. |
| 11 | Testing scope | ARCHITECTURE: Vitest, Playwright, axe, Lighthouse CI as gates. | STACK: testing is out of the four-tool scope, but suggests the same tools. | Compatible. Adopt them as lightweight CI gates in the scaffold phase. |

## Key Findings

### Recommended Stack
Vite 8 + React 19 + TypeScript 6 + Tailwind v4 (CSS-first) was verified to build together on 2026-10-08 (see STACK.md).

**Core technologies:**
- **Vite `^8.3`, React `^19.3`, TS `~6.0.3`, `@tailwindcss/vite ^4.3`**: standard stack. Node `>=22.12` (or `^20.19`).
- **`motion ~14.0.0`** (import from `motion/react`): base for motion-primitives. It is 6 days old, so pin with `~` and commit the lockfile. Fallbacks are 12.43 and 13.5.1.
- **`@react-spring/web ~10.1.2`**: scoped to 3-5 signature physics interactions (+17 kB gz). Do not use the `react-spring` umbrella or the v11 beta, and avoid `useTransition` in core UI.
- **motion-primitives**: copy-in source, beta. Patch `import type` for Vite 8 and move files from the CLI's root `components/` into `src/`. Its interactive components are mouse-only and none handle reduced motion.
- **Tailwind dark mode**: `@custom-variant dark` on `[data-theme=dark]`, `@theme inline` over CSS variables, and an inline head script. No next-themes.
- **realtimecolors**: design tool only. Export OKLCH CSS into `@theme`, and design light and dark explicitly.
- **godly.design**: inspiration only (a feed of X posts).
- **`@fontsource-variable/*`**, **`vite-imagetools`**, and inline SVG brand icons (lucide has none).
- **Defaults for gaps:** native scroll (no Lenis), no 3D/WebGL, motion `useScroll`, no router.

### Expected Features
**Must have (table stakes):**
- Hero with name, role and CTAs, plus sticky nav with scroll-spy (thumb-reachable on mobile).
- Resume PDF and persistent contact (copy-email toast).
- Scannable Experience (5 roles) and Projects (7) with outcomes, stack tags and links.
- Light/dark theme with system default, `prefers-reduced-motion` support, touch equivalents for every hover effect.
- 60 fps on mid-range phones, keyboard and focus accessibility, OG image and favicon, About with photo and personality.

**Should have (differentiators):**
- Shared press-squish hook (highest ROI).
- Morphing project cards.
- Text effects on hero.
- Animated Number metrics.
- Skills Infinite Slider with a static fallback.
- Education flip or expand card.
- Spring theme toggle.
- Tilt/Spotlight and Magnetic as desktop-only polish.
- One easter egg.
- Signature draggable hero toy (a user decision).

**Defer (v2+):** project filter, Progressive Blur and Border Trail, opt-in UI sound, Image Comparison, skippable intro, blog, DJ mini-deck, page transitions, WebGL.

**Anti-features:** WebGL worlds, scroll-jacking, hover-only content, site-wide custom cursor, mandatory preloader, routing, skill percentage bars, stacking every effect on every card.

### Architecture Approach
Four seams: typed content, CSS-variable tokens, an internal `anim/` layer, and the build/deploy pipeline. Dependencies point down only. Only `app/Page.tsx` imports content data. Only `anim/` and the vendored primitives import `motion/react` or `@react-spring/web` (ESLint-enforced). Three tiny contexts: theme, motion preference, optionally active section.

**Major components:**
1. `app/Providers`: `ThemeProvider` plus `MotionPreferenceProvider` (wires `MotionConfig`, react-spring `Globals.skipAnimation`, and the CSS guard from one hook).
2. `anim/` barrel: `declarative/` (motion-owned) and `physics/` (react-spring-owned), with `tokens.ts` holding one spring table in both libraries' formats.
3. `sections/*` plus `layout/*`: props in, JSX out.
4. `content/*`: typed TS with `satisfies`, a schema, an image registry, and Vitest integrity tests.
5. `styles/*`: primitive plus semantic tokens and a reduced-motion CSS guard.

Content needs cleanup before typing: the Symbotic metrics conflict (Experience 76%/12% vs Projects >=50%/25%/24%/36%), inconsistent dates, and a missing resume, tagline, project links and imagery. Logos are favicon-grade and may vanish on dark backgrounds.

### Critical Pitfalls
1. **Two libraries on one node.** Write the ownership matrix, allow one library per node, and ban Tailwind `transition-*` on animated nodes. Make a measured keep-or-drop decision on react-spring after the first slice.
2. **Reduced motion covered for one system only.** Use a single `useMotionPreference` feeding `MotionConfig`, react-spring `Globals` (with a dependency array), and a CSS `@media` guard. Motion's `user` mode still animates opacity, so check text effects manually.
3. **Dark-mode contrast.** Indigo `2f27ce` on `050315` is 2.23:1 and `433bff` is 3.21:1. Use per-theme tokens (dark text and focus about `#7b75ff` or lighter) and commit a contrast matrix before styling.
4. **Hidden-hero LCP and empty SPA shell.** Visible by default, static hero shell, absolute OG tags, noscript content, `fetchpriority="high"` image, accessible split-text.
5. **Cutover and Pages.** Switch the source to Actions and merge in one sitting with a written rollback. Use an env-driven `base` and no hard-coded `/images` paths. Lint for case sensitivity (macOS vs Linux CI). Tag `v1-ipod` and never force-push. Migrate only the used assets and strip EXIF.
6. **Touch and scroll conflicts.** Design for tap and press first, prefer native `scroll-snap` carousels, use `touch-action: none` only on small draggables, gate fine-pointer effects, use `svh`/`dvh`, and test on a real iPhone and Android from the first interactive phase.
7. **Over-animation vs the 10-second test.** Make the 10-second test and a motion budget acceptance criteria.

## Implications for Roadmap

### Phase 1: Foundations and Decisions (time-boxed)
**Rationale:** Docs come first by user request, but time-boxed. The palette, type and motion-ownership decisions feed everything.
**Delivers:** Design brief and 10-second test, content inventory (metrics reconciliation, gaps), IA, palette and type with a both-theme contrast matrix, motion spec with ownership matrix and ADRs. Sketches and spikes on a real phone settle feel.
**Avoids:** Pitfalls 5, 7, 16, and the ownership part of 2.

### Phase 2: Scaffold, Walking Skeleton and Staging Deploy
**Rationale:** Prove hosting, `base` and CI before building on them.
**Delivers:** Vite/React/TS/Tailwind v4, `@` alias, ESLint boundaries, env-driven `base`, Actions deploy at the project URL, `404.html`, Linux CI with case lint, one rendered motion-primitives component as the acceptance test, providers with the reduced-motion hook, inline theme script, static hero shell with meta/OG tags, initial bundle budget.
**Avoids:** Pitfalls 1 (rehearsal), 3, 9, 10, 12.

### Phase 3: Tokens, Theme, Content and Assets (two parallel halves)
**Delivers:** `tokens.css`, `@theme`, spring theme toggle, self-hosted fonts, styleguide. Typed content with schema and tests. Image pipeline with EXIF stripped and only used assets migrated. Logo strategy. Resume PDF.
**Avoids:** Pitfalls 5, 8, 11, 12, 13.

### Phase 4: Layout, UI and Static Sections (content-complete, shippable)
**Delivers:** All six sections with real content and no motion, sticky nav with scroll-spy, skip link, landmarks, dialog primitive chosen after the accessibility check, contact with copy-email.
**Avoids:** Pitfalls 4, 7, 15.

### Phase 5: Animation Layer
**Delivers:** `anim/` wrappers, tokens in both libraries' formats, `useMotionPreference`, `useHoverCapable`, patched vendored primitives, press-squish hook. Decisions on use-gesture and LazyMotion after measuring. Reduced-motion smoke test.
**Avoids:** Pitfalls 2, 3, 14.

### Phase 6: Signature Interactions and Section Motion
**Delivers:** Hero text effects and CTAs, morphing project cards, Experience reveals and count-ups, Skills slider, Education flip, desktop-gated Tilt/Spotlight/Magnetic, one easter egg, and the hero toy if the user opts in.
**Avoids:** Pitfalls 6, 7, 14.

### Phase 7: Hardening
**Delivers:** Real-device touch audit, keyboard and VoiceOver pass, axe, Lighthouse mobile gates, bundle review and lazy-loading, contrast re-check, link-preview checks.
**Avoids:** Pitfalls 3, 4, 6, 15.

### Phase 8: Launch and Cutover
**Delivers:** OG image and favicon set, JSON-LD, optional prerender, `v1-ipod` tag, additive cutover commit on `aa-phan.github.io`, Pages source switch, post-deploy smoke test, rehearsed rollback.
**Avoids:** Pitfalls 1, 8, 9.

### Phase Ordering Rationale
- Deploy pipeline, providers and budgets first, so reduced motion is never retrofitted.
- Static content-complete before motion, so recruiter needs ship early.
- The `anim/` layer is proven before it is applied.
- Cutover last, so v1 stays live and rollback stays trivial.
- Phase 3's tokens and content halves are parallelizable. Phase 6 sections can proceed in any order after Phase 5.

### Research Flags
Needs research:
- **Phase 1:** palette, font and motion exploration.
- **Phase 5:** react-spring `Globals`/`useReducedMotion` API, use-gesture React 19 compatibility, per-component reduced-motion and accessibility in motion-primitives, LazyMotion feasibility.
- **Phase 6:** per-interaction spikes on real phones (`/gsd-spike`), including iOS `touch-action` behavior (WebKit bug 232545).
- **Phase 8:** Pages source-switch downtime and the prerender decision.

Standard patterns (skip research-phase): Phase 2, Phase 3 (light checks only), Phase 4, Phase 7.

## Decisions Needed From User (consolidated, de-duplicated across all four files)

1. **Repo and cutover:** push v2 into the existing `aa-phan.github.io` repo (recommended, additive, `v1-ipod` tag first), rename/transfer repos, or ship at the project URL first. Also confirm the current Pages source setting.
2. **Animation engines:** keep both `motion` and react-spring (+17 kB) or go motion-only. Related: whether to add `@use-gesture/react` (Conflict 1), and how far to push react-spring (default 3-5 signature interactions).
3. **Signature hero toy:** commit to a draggable, throwable toy for v1, or defer to v1.x.
4. **Touch strategy for Tilt, Magnetic, Spotlight and Dock:** desktop-only polish, or fund touch versions.
5. **3D / WebGL:** default no. If yes, OGL (+13 kB) or R3F (+241 kB, lazy).
6. **Smooth scroll:** default no. If yes, Lenis with touch left native.
7. **Navigation and project detail:** single page with a morphing dialog (default), or deep-linkable project URLs via hash routing or a `404.html` fallback.
8. **Performance and accessibility targets:** suggested mobile Lighthouse Performance >= 90, Accessibility >= 95, initial JS <= about 150 kB gz, LCP <= 2.5 s, CLS < 0.1, INP < 200 ms, WCAG 2.2 AA, full reduced-motion support. Optional visible "Reduce motion" toggle.
9. **Content and assets to supply:**
   - Resume PDF (v1 has none), hero tagline, and project links, screenshots or cover art for the 7 projects (which 3 are featured).
   - SVG or higher-resolution employer logos (UT Austin and OdderTech have none).
   - Reconcile the Symbotic metrics and confirm the date format policy.
   - Confirm that public GPA, email and the DJ Instagram link stay.
10. **Palette and type:** explore alternatives to the seed indigo and Inter via realtimecolors, with dark-mode-safe values. Confirm a maximum of 2 font families.
11. **Brand icons:** inline SVGs (default) or `simple-icons`/`react-icons`.
12. **Sound:** keep an opt-in, off-by-default nod to v1's click sounds, or drop it.
13. **TypeScript:** 6 (recommended) or 7.
14. **`.planning/` in the public cutover repo:** commit it or not.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions from `npm view` on 2026-10-08 and a probe build with measured bundles. Real-phone feel is MEDIUM, and motion 14 is days old. |
| Features | MEDIUM | Library inventory is HIGH. Exemplar sites are from general knowledge, godly X posts were unreadable by fetch (HTTP 402), and touch feasibility is inferred. |
| Architecture | MEDIUM-HIGH | Structure is solid. Some library internals were unverified (react-spring Globals page 404, use-gesture compatibility, spring-parameter mapping). |
| Pitfalls | MEDIUM-HIGH | Contrast and repo state were verified directly. iOS gesture behavior, Pages source-switch gap and per-component Tailwind v4 compatibility need device or spike confirmation. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address
- **Real-device feel and performance:** nothing measured frame rate with both libraries active. Run an early spike on an iPhone and a mid-range Android, including drag vs scroll arbitration.
- **motion-primitives accessibility and touch:** MorphingDialog focus trap and scroll lock, and the touch and reduced-motion behavior of Infinite Slider, Dock and Text effects, are undocumented. Read the source and test as each is added.
- **use-gesture:** compatibility check is open and the adoption decision is in dispute (Conflict 1).
- **JS budget:** the probe is about 139 kB gz before content, fonts and the hero toy. Plan code-splitting and a possible LazyMotion pass.
- **Pages source-switch downtime:** unverified. Rehearse on a throwaway repo or accept the risk with a rollback.
- **Content gaps (Decision 9):** these block Phases 3 and 4.
- **Unfamiliar APIs:** avoid `AnimateView` (LOW confidence). Realtime Colors' OKLCH export needs a quick check.

## Sources
**Primary (HIGH):** npm registry `npm view` (2026-10-08) and local probe builds; official docs for Vite static deploy, Tailwind v4, motion.dev, react-spring and motion-primitives; local checks of the v1 repo and computed WCAG contrast.
**Secondary (MEDIUM):** recent.design and godly.design feeds, Readymag and dev.to write-ups, GitHub Pages community threads, community shadcn and Tailwind v4 guides, Lenis README and forums, GSAP pricing.
**Tertiary (LOW):** named exemplar portfolios (Bruno Simon, Rauno, Emil Kowalski, Brittany Chiang, Josh Comeau), spring-parameter mapping between libraries, use-gesture pairing, current iOS status of the WebKit `touch-action` bug.

Detailed findings: `.planning/research/STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, `PITFALLS.md`.

---
*Research completed: 2026-10-08*
*Ready for roadmap: yes*
