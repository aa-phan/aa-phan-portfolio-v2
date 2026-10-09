# Architecture

Status: Accepted

This document describes how the portfolio site is structured: layers, import rules, folder layout, data flow, the content model, the design-token pipeline and the animation layer. It is written so the scaffold can be built directly from it. Decisions with a longer rationale live in the [ADR log](adr/README.md).

## Overview

The site is a static, zero-backend, single-page React app served from GitHub Pages. There is no router, no global store and no data fetching. The architecture comes down to four seams:

1. Typed content: all copy lives in TypeScript modules checked against one schema.
2. CSS-variable design tokens: five role colors per theme drive every surface.
3. An internal animation layer: the only place the two animation libraries are imported.
4. A build and deploy pipeline: Vite build, GitHub Actions, GitHub Pages.

Everything else is conventional React composition with props flowing down.

## Layers

Dependencies point down only. A layer may import from layers below it, never above.

```text
+----------------------------------------------------------------------+
| app/        main.tsx, App.tsx, Providers, Page.tsx                    |
|             Page.tsx is the ONLY file that imports content data       |
+----------------------------------------------------------------------+
| sections/   Hero, About, Experience, Projects, Skills, Education,     |
|             Contact                      (props in, JSX out)          |
+----------------------------------------------------------------------+
| layout/     Container, Section, SiteHeader, MobileNav, Footer,        |
|             SkipLink                                                  |
+----------------------------------------------------------------------+
| components/ ui/ (Button, Tag, Card, Heading, Logo, ThemeToggle, Icon) |
|             motion-primitives/ (vendored source, treated as owned)    |
+----------------------------------------------------------------------+
| anim/       the internal animation layer: the only place that         |
|             imports motion/react and @react-spring/web               |
+-------------------------------+--------------------------------------+
| hooks/  lib/                  | styles/ (tokens.css, base.css,       |
| (useActiveSection, cn, a11y)  |  index.css = tailwind + theme map)   |
+-------------------------------+--------------------------------------+
| content/ (typed TS data)      assets/ (images, fonts via Fontsource) |
+----------------------------------------------------------------------+
Build and deploy: vite.config.ts, lint boundary rules, GitHub Actions
```

## Import rules

Only src/anim/ and src/components/motion-primitives/ may import motion/react or @react-spring/web.

Only src/app/Page.tsx imports content data.

| Importer | May import | May not import |
|----------|-----------|----------------|
| sections/* | layout, components/ui, the anim barrel (src/anim/index.ts), content types (not data) | motion/react, @react-spring/*, components/motion-primitives/* directly, content data |
| layout/*, components/ui/* | the anim barrel, lib, hooks | sections, content data |
| components/motion-primitives/* | motion/react, lib/cn | everything else (vendor code, kept out of lint autofix churn) |
| anim/* | motion/react, @react-spring/web, components/motion-primitives/*, the token mirror in styles | sections, layout |
| app/Page.tsx | content data, sections | any animation library or anim internals |

These rules are enforced by lint in the scaffold (restricted-import rules plus a boundaries plugin), so a violation fails CI rather than relying on review. A gesture library is not adopted up front. It would be added to the anim row only if a react-spring drag cannot be built well otherwise, after a React 19 compatibility check.

## Folder structure

```text
repo root
|-- public/                  URL-stable files only: favicon set, og image,
|                            resume.pdf (a phone-number-free copy), robots.txt
|-- index.html               meta and social tags, inline theme-init script,
|                            noscript fallback content
|-- vite.config.ts           base from env, Tailwind plugin, imagetools, "@" alias
|-- eslint config            import-boundary rules (see Import rules)
|-- .github/workflows/       ci.yml, deploy.yml
`-- src/
    |-- main.tsx
    |-- app/                 App.tsx, Page.tsx, Providers.tsx
    |-- sections/            one folder per section (Hero, About, Experience,
    |                        Projects, Skills, Education, Contact)
    |-- layout/              Container, Section, SiteHeader, MobileNav,
    |                        Footer, SkipLink
    |-- components/
    |   |-- ui/              Button, Tag, Card, Heading, Logo, ThemeToggle, Icon
    |   `-- motion-primitives/   vendored, patched locally, logged in an ADR
    |-- anim/
    |   |-- index.ts         public barrel: the only animation import path
    |   |-- MotionPreferenceProvider.tsx
    |   |-- useMotionPreference.ts
    |   |-- tokens.ts        springs, durations, eases in both libraries' formats
    |   |-- declarative/     motion-owned wrappers (Reveal, Stagger, Presence,
    |   |                    TextReveal, ScrollProgress, Morph)
    |   `-- physics/         react-spring-owned wrappers (PressSpring and other
    |                        pointer-driven, velocity-carrying helpers)
    |-- content/
    |   |-- schema.ts        every type
    |   |-- profile.ts, experience.ts, projects.ts, skills.ts,
    |   |   education.ts, contacts.ts     one module per section
    |   |-- images.ts        image registry
    |   `-- index.ts         assembles siteContent with satisfies
    |-- hooks/               useActiveSection, useMediaQuery, useHoverCapable
    |-- lib/                 cn.ts, date formatting, a11y helpers
    |-- styles/
    |   |-- index.css        tailwind import, dark variant, theme mapping
    |   |-- tokens.css       role tokens, derived tokens, light and dark blocks
    |   `-- base.css         resets, focus ring, reduced-motion guard, fonts
    `-- assets/images/       hashed by Vite
```

The animation folder is named anim/ rather than motion/ so it is never confused with the motion package or its motion/react import path.

## Data flow

Build time:

```text
content/*.ts --(typed, satisfies)--> app/Page --props--> sections --props--> layout, ui
assets/*     --(imagetools, hashed imports)--> image fields in content
```

Runtime, all client-side with no network use beyond same-origin assets:

- Theme: an inline script in the document head reads localStorage, falls back to prefers-color-scheme, and sets the data-theme attribute on the html element before first paint. The theme provider in React only changes the attribute and storage on a user toggle.
- Motion preference: the OS reduced-motion setting (plus an optional site override) feeds one hook, useMotionPreference, which configures both animation libraries and the wrapper components. See Reduced motion.
- Scroll-spy: an IntersectionObserver over the section ids drives useActiveSection, which highlights the current section in the navigation.
- Pointer and touch input drive react-spring values written straight to the DOM, with no React re-render per frame.
- Project detail: a click or tap sets local state in the Projects section, which opens an overlay with focus handling.

There is no global state library. Three small contexts exist: theme, motion preference and, optionally, the active section. Everything else is props.

## Content model

All types live in src/content/schema.ts:

- Profile: name, tagline, bio paragraphs, optional quote, photo (ImageAsset), contacts.
- ContactLink: kind (email, github, linkedin or instagram), label, href, whether it is external.
- ExperienceEntry: id, role, org, optional org URL, optional logo, dates (DateRange), location, bullets, optional highlights and stack.
- Project: id, title, context kind (personal, employer, course or hackathon) with a label, dates, stack, bullets, relatedExperienceId, featured, optional links and image.
- EducationEntry: id, degree, school, location, dates, gpa, optional track.
- SkillGroup: id, label, items as a string array.
- DateRange: ISO start and end (or present) plus a display label in one normalized format.
- ImageAsset: src, alt, width, height, optional srcset.

Rules:

- Content modules use satisfies against the schema so a missing field fails typecheck.
- Ordering lives in the data (array order or a priority field), never in components.
- Copy is taken verbatim from the reviewed content inventory; any edit is recorded there with before and after, not made silently in code.
- The featured flag decides what appears first on mobile, so "key info in seconds" is a data decision.
- Content tests check that ids are unique, related ids resolve, every image has alt text, every external link is https, and dates parse in descending order.
- A phone number is not a field anywhere in the model, and must never appear in site copy, metadata or the served resume.

## Design tokens

- Exactly five role tokens per theme: text, background, primary, secondary, accent. Light and dark are authored separately, not inverted.
- Derived tokens (surface, border, muted text, link, focus ring and so on) are computed from the five roles with color-mix(in oklch, ...). A palette swap therefore edits one block and every derived value follows.
- The theme is selected by the data-theme attribute on the html element.
- Tailwind v4 is configured CSS-first: a custom dark variant is bound to [data-theme=dark] with @custom-variant, and an @theme inline block maps utilities to the CSS variables. There is no tailwind.config.js.
- No raw hex values in components. Components use semantic utilities only; a CI check greps for stray hex.
- A contrast test recomputes every text, UI and focus pair in both themes against WCAG 2.2 AA (4.5:1 for body text, 3:1 for large text and UI) and fails the build on any miss.
- Spring and duration values that JavaScript needs are mirrored in CSS variables, with src/anim/tokens.ts as the canonical source for springs.

## Animation layer

src/anim/index.ts is the only animation import path for the rest of the app. It exposes a handful of semantic components and hooks, not library primitives.

| Interaction class | Owner |
|-------------------|-------|
| Mount and unmount, presence, exit animations | motion |
| Layout and shared-element transitions | motion |
| Scroll-linked values and in-view reveals | motion |
| Text and number effects, stagger, ready-made motion-primitives prefabs | motion |
| Velocity-carrying physics: press-squish, rail hover lift with neighbor shift, theme toggle thumb | react-spring |
| Color and hover transitions, native scroll-snap rail swipe | CSS |
| Desktop wheel smoothing only | Lenis |

The rule: one library animates any given element. Never both libraries on one element or one property, and no Tailwind transition utilities on an element a library animates. If a vendored primitive duplicates a physics wrapper, one implementation is chosen per interaction and the other stays unused.

Spring and duration tokens are defined once in src/anim/tokens.ts, exported in both libraries' formats (motion's stiffness and damping, react-spring's tension and friction), so the two feel like one system. Fine-pointer effects such as tilt, magnetic pull and spotlight are gated by (hover: hover) and (pointer: fine); touch gets a tap or press equivalent, or nothing. Every wrapper reads the motion preference, renders an instant equivalent when reduced, forwards className, and never hides content in its initial CSS state.

## Reduced motion

One preference source, useMotionPreference, combines the OS prefers-reduced-motion setting with an optional site override and feeds three consumers:

- motion: the provider renders MotionConfig with its reducedMotion setting. This disables transform and layout animation but not opacity or color, so wrappers handle parallax, scroll-linked and autoplay effects explicitly.
- react-spring: the provider calls Globals.assign({ skipAnimation }) so every spring jumps to its target; the effect cleans up on change.
- CSS: a @media (prefers-reduced-motion: reduce) guard in base.css shortens transitions and animations and keeps scroll behavior native.

Content is visible by default and is never hidden until JavaScript runs. Hidden initial states are applied client-side inside wrappers, and a noscript rule guarantees visibility. Pressed, focused and selected states must read without motion (color, outline, shape). Lenis is off under reduced motion. The provider listens for changes to the media query so a live OS toggle takes effect without a reload.

## Assets

- Images live in src/assets/images/ and are imported as modules (hashed, long-cached). vite-imagetools produces AVIF and WebP variants and srcset with intrinsic width and height to prevent layout shift. Below-the-fold images lazy-load; the hero image is high priority.
- Fonts are self-hosted through Fontsource (variable, latin subset, font-display swap), at most two families. No third-party font CDN.
- Brand icons (GitHub, LinkedIn, Instagram, email) are inline SVG, because the UI icon set has no brand glyphs. See the ADR log.
- The resume PDF served from public/ is a phone-number-free copy of the source resume.
- Only images that are actually used migrate from the previous site, with EXIF metadata stripped. Template leftovers are left behind.

## Build and deploy

GitHub Actions builds the site and publishes it to GitHub Pages. The Vite base comes from the VITE_BASE environment variable: the project URL path (for example /aa-phan-portfolio-v2/) while staging, and / after the cutover to the user-site URL. Assets are module-imported so no absolute asset paths exist; anything under public/ that JavaScript references goes through import.meta.env.BASE_URL. CI also builds with the project-path base so a broken sub-path is caught before launch. Steps, settings, cutover and rollback are in the deploy runbook (deploy-runbook.md, written later in the documentation phase).

## Quality gates

| Gate | Fails the build when |
|------|----------------------|
| Typecheck (tsc --noEmit, satisfies) | A content field is missing or a reference is wrong |
| Lint including import boundaries | A section imports an animation library or content data |
| Build | The Vite build errors |
| Path-case check on Linux CI | An import differs in case from the file on disk |
| Initial JS budget | Initial JavaScript exceeds 150 kB gzipped |
| Token contrast test | Any text, UI or focus pair is below AA in either theme |
| Reduced-motion smoke test | Content is hidden or a transform animation is running with reduced motion emulated |
| axe | Serious or critical violations in light or dark |
| Mobile Lighthouse | Targets set in the scaffold milestone are missed |

## Stack

Verified 2026-10-08; re-verify at scaffold.

| Technology | Version | Purpose |
|------------|---------|---------|
| Vite | ^8.3.4 | Build and dev server |
| React and React DOM | ^19.3.0 | UI |
| TypeScript | ~6.0.3 | Types |
| @vitejs/plugin-react | ^6.1.2 | React transform |
| Tailwind CSS and @tailwindcss/vite | ^4.3.3 | Styling, first-party Vite plugin |
| motion | ~14.0.0 | Declarative animation, imported from motion/react |
| @react-spring/web | ~10.1.2 | Spring physics |
| clsx | ^2.1.1 | Class composition |
| tailwind-merge | ^3.7.0 | Class conflict resolution |
| lucide-react | ^1.53.0 | UI icons |
| lenis | 1.3.x | Desktop wheel smoothing |
| vite-imagetools | ^12.0.1 | Image resize and format variants |

Not used: the react-spring umbrella package, the react-spring v11 beta, raw framer-motion imports, shadcn init, tailwind.config.js, a client-side router, 3D or WebGL.

## Decisions

Individual decisions, their status and the list of still-open decisions are tracked in the [ADR log](adr/README.md).
