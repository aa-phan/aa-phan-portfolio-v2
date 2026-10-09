# Technology Stack

**Project:** Aaron Phan Portfolio v2 (playful, tactile React portfolio on GitHub Pages)
**Researched:** 2026-10-08
**Overall confidence:** HIGH on versions, build, deploy and coexistence. MEDIUM on runtime feel on phones (not browser-tested). LOW only where flagged.

How this was verified: package versions come from `npm view` on 2026-10-08. I also built a throwaway probe app (Vite 8 + React 19.3 + TS + Tailwind 4 + `motion` 14 + `@react-spring/web` 10.1 + three real motion-primitives components) and measured gzipped bundles. Docs claims come from motion.dev, react-spring.dev, vite.dev, tailwindcss.com, ui.shadcn.com and the GitHub repos. Probe numbers are marked "(measured)".

---

## Bottom Line

1. **Vite 8 + React 19 + TypeScript + Tailwind v4 (CSS-first)** is the standard stack. Everything below was verified to build together.
2. **motion-primitives and react-spring can coexist.** They share no globals, run separate rAF loops, and both support React 19. The measured cost of adding react-spring on top of `motion` is **+17 kB gzipped**. It needs a clear rule about who owns what (see "Division of Responsibility").
3. **Three things in motion-primitives will bite you** (details below): its interactive components are mouse-only, none of them handle `prefers-reduced-motion`, and the source needs `import type` fixes to build under Vite 8. All are cheap to fix because you own the copied source.
4. **Most "gaps" are already covered by `motion` itself** (scroll-driven, drag, page/presence transitions). Real gaps needing a decision: smooth scroll, 3D/WebGL, image optimization, and icon library. Dark mode needs only Tailwind v4 plus about 10 lines of inline script.
5. **Deploy at `https://aa-phan.github.io` with `base: '/'`**, via the official Vite Actions workflow. The repo must be named `aa-phan.github.io` for this (see Decisions Needed).

---

## Recommended Stack

### Core Framework

| Technology | Version (verified 2026-10-08) | Purpose | Why | Confidence |
|------------|-------------------------------|---------|-----|------------|
| Vite | `^8.3.4` | Build/dev server | Current `latest`. `create-vite` 9.2.1 scaffolds it. Rolldown-based, fast. Needs Node `^20.19 \|\| >=22.12`. | HIGH |
| React / React DOM | `^19.3.0` | UI | Current `latest`. motion 14 and react-spring 10.1 both declare React 19 support. | HIGH |
| TypeScript | `~6.0.3` (scaffold default) | Types | `create-vite` pins `~6.0`. **TS 7.0.2 (native compiler) also passed `tsc -b` on the probe**, so it is a safe drop-in later. No reason to be adventurous in v1. | HIGH |
| @vitejs/plugin-react | `^6.1.2` | React transform | Required pairing for Vite 8 (peer `vite ^8`). | HIGH |
| Tailwind CSS | `^4.3.3` | Styling | CSS-first config (`@import "tailwindcss"` + `@theme`). No `tailwind.config.js`. motion-primitives' own repo is on Tailwind v4. | HIGH |
| @tailwindcss/vite | `^4.3.3` | Tailwind plugin | First-party Vite plugin, peer `vite ^5.2 \|\| ^6 \|\| ^7 \|\| ^8`. Use this, not PostCSS. | HIGH |
| motion | `~14.0.0` | Declarative animation (what motion-primitives builds on) | Import from `motion/react`. React 19 compatible. Released 2026-10-02, so pin with `~` and commit the lockfile (see risk below). | HIGH on compat, MEDIUM on age |
| @react-spring/web | `~10.1.2` | Physics/spring hooks | **Install this package, not `react-spring`.** The umbrella `react-spring` package is lagging (10.0.4, has a `deprecated` dist-tag) and the v11 beta removes it. Docs say `@react-spring/web` for React 19. | HIGH |
| clsx + tailwind-merge | `^2.1.1` / `^3.7.0` | `cn()` helper | Required by every motion-primitives component (`import { cn } from '@/lib/utils'`). tailwind-merge v3 is the Tailwind-v4 line. | HIGH |
| lucide-react | `^1.53.0` | UI icons | motion-primitives components import it. **It has no GitHub/LinkedIn brand icons** (probe: 0 matches), see Gaps. | HIGH |

### Database

None. Static site. Content lives in typed TS modules (`src/content/*.ts`) migrated from v1's `index.html`.

### Infrastructure

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| GitHub Pages, "GitHub Actions" source | n/a | Hosting | Required by constraints. Vite docs: set Settings, Pages, Source to **GitHub Actions**. | HIGH |
| actions/checkout, setup-node, configure-pages, upload-pages-artifact, deploy-pages | v7, v7, v6, v5, v5 | CI deploy | Versions from the current Vite static-deploy guide. (GitHub's own custom-workflow doc still shows older v5/v4. Either works. Use the Vite guide's newer ones.) | MEDIUM-HIGH |
| Node | `lts/*` in CI, `>=22.12` locally | Runtime | Vite 8 engine floor is `^20.19 \|\| >=22.12`. Local machine is Node 26.9. | HIGH |

### Fonts and Color

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @fontsource-variable/inter | `^5.3.0` | Self-hosted Inter variable font | Self-hosting removes the render-blocking Google Fonts request and works offline/on Pages with no third party. Family name is `'Inter Variable'`. Realtime Colors takes any Google Font name, and Fontsource packages every Google font the same way, so whatever you pick there installs as `@fontsource-variable/<name>` (or `@fontsource/<name>` for non-variable). | HIGH |
| realtimecolors.com | web tool | Palette + type exploration | Design tool, not a dependency. See "How to use the four tools". | HIGH |

### Supporting Libraries (recommended now)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vite-imagetools | `^12.0.1` | Build-time resize + AVIF/WebP + srcset | Always, for the `images/` and `about-dj.jpg` assets. **Verified**: builds under Vite 8 and emits AVIF/WebP via `?w=400;800&format=avif;webp&as=picture`. Peer is `vite >=8`. Needs `sharp`. |
| sharp | pulled in by imagetools (0.35.x) | Image engine | Transitive. Only run `npm install-scripts ls` if npm warns. |
| simple-icons or react-icons (`react-icons/si`) | `simple-icons ^16`, `react-icons ^5.7` | GitHub/LinkedIn/email brand glyphs | Contact section. Lucide dropped brand icons. Prefer 3 hand-inlined SVGs if only 3-4 are needed (zero deps). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| oxlint (scaffold default) | Lint | `create-vite` 9.2.1 ships `oxlint` in `npm run lint`. Keep it. |
| @types/node | `vite.config.ts` path alias | Needed for `node:path` / `import.meta.dirname`. |
| Prettier + `prettier-plugin-tailwindcss` | Class sorting | Optional, recommended once Tailwind classes grow. |

---

## Verified Bundle Costs (measured, gzipped JS, Vite 8 production build)

| Build | JS gz | Delta vs. baseline |
|-------|-------|--------------------|
| Baseline: React 19.3 + Tailwind CSS (2.2 kB gz CSS) | 68.6 kB | n/a |
| + react-spring only (`useSpring`, `useTrail`, `useSprings`) | 85.8 kB | **+17.2 kB** |
| + motion with TextEffect, Tilt, Magnetic, `MotionConfig` | 121.5 kB | **+52.9 kB** |
| + both | 138.6 kB | **+70.0 kB** |
| Lenis (ReactLenis) alone | 74.2 kB | +5.6 kB |
| OGL (minimal Renderer/Program/Mesh) | 81.4 kB | +12.8 kB |
| GSAP core + ScrollTrigger | 112.7 kB | +44.1 kB |
| three + @react-three/fiber (one box) | 309.5 kB | **+240.9 kB** |

Takeaways:
- Coexistence costs about +17 kB beyond motion. That is acceptable for a portfolio, but it is the marginal price of the "both libraries" decision, so use react-spring where it earns it.
- Full `motion` component is the heavy part (about 53 kB with presence/spring/gesture features). motion.dev's own figures: `motion` about 34 kB, `m` + `LazyMotion` about 4.6 kB initial (+15 kB `domAnimation`, +25 kB `domMax`), `useAnimate` mini about 2.3 kB. **Optional optimization (not tested):** because motion-primitives is copy-pasted source, you could swap `motion.x` for `m.x` and wrap the app in `LazyMotion`. `AnimatePresence`/`layout`/`drag` need `domMax`, which erodes the saving. Do this only if Lighthouse demands it.
- Code-split below-the-fold sections with `React.lazy` so the hero ships alone. Any 3D must be lazy-loaded (see Gaps).
- Not measured: runtime frame rate on a real phone. That belongs in an early performance spike.

---

## The Four Named Tools

### 1. motion-primitives (ibelick) : USE, as a copy-in source library. Confidence: MEDIUM-HIGH

What it is: a shadcn-style **registry of copy-pasted components**, not an npm library. It is MIT, about 6.5k stars, and its README still says **"beta... significant updates to the code"**. 35 components across text effects, number effects, interactive, toolbars and advanced effects. The repo is active (last push 2026-09-28).

How to install (verified):
- Only deps are `motion`, `clsx`, `tailwind-merge`, `lucide-react`, plus a `@/lib/utils` `cn()` helper. **No shadcn init required.**
- Components are served as shadcn-registry JSON at `https://motion-primitives.com/c/<name>.json` (HTTP 200 verified).
- The official CLI is `npx motion-primitives@latest add <name>`. It works (tested) but the npm package is stale (0.1.0, March 2025) and **drops files into `./components/motion-primitives/` at the project root, not `src/`**. Either move them to `src/components/motion-primitives/` or skip the CLI and copy the registry JSON content. Decide once and document it.
- Needs the `@` alias in both `vite.config.ts` (`resolve.alias`) and `tsconfig.app.json` (`paths: { "@/*": ["./src/*"] }`). With TS 6/7, `paths` works **without** `baseUrl` (verified in the probe). shadcn's Vite doc still says to add `baseUrl`. You do not need it.

Compatibility verdict (what I actually tested): TextEffect, Tilt and Magnetic compiled and bundled against **motion 14.0.0 + React 19.3 + Tailwind 4.3 + Vite 8**. The motion-primitives repo itself targets motion `^11.12` and React 18, so this is newer than upstream tests. Other components are untested here; motion's 12/13/14 changelogs list no breaking changes to the public API used by these components (13.0 only made `isValidProp` explicit; 14.0 removed internal APIs only), so expect them to work. Verify per component as you add it.

**Three gotchas (all verified in source or build):**

1. **Type imports break the build.** `tilt.tsx` imports `MotionStyle` and `SpringOptions` as values. Under Vite 8 (Rolldown) with the scaffold's `verbatimModuleSyntax: true` this fails (`MISSING_EXPORT`, plus TS1484 from `tsc`). Fix: `type MotionStyle`, `type SpringOptions`. Expect to fix the same in any other component that imports types. You own the source, so just patch it on add.
2. **The interactive components are mouse-only.** `Magnetic`, `Tilt`, `Spotlight`, `Cursor` use `mousemove`/`onMouseMove`, with no pointer or touch handling. On a phone they simply do nothing, and `Cursor` is meaningless on touch. Project requirement is "no desktop-only gestures required", so treat these as desktop enhancement only, and design a touch equivalent (tap/press spring, device-tilt is a separate permission, so avoid). Where you want tactile feel on phones, build it with react-spring press/drag (or motion `whileTap`/`drag`).
3. **None of the components handle `prefers-reduced-motion`** (zero `useReducedMotion` in `components/core`). Handle it globally once: `<MotionConfig reducedMotion="user">` at the app root. Per motion docs, "user" disables transform and layout animations but keeps opacity/color. Text effects that blur-reveal by opacity+filter will still animate, so check them manually.

Best-fit components for this brief: TextEffect/TextLoop/TextMorph/TextScramble (hero and name), InView and AnimatedGroup (section reveals), MorphingDialog and MorphingPopover (project detail without a router), Dock or Toolbar (nav), AnimatedBackground (tab/pill nav), AnimatedNumber, ScrollProgress, InfiniteSlider (employer logos), Tilt/Magnetic/Spotlight (desktop polish only).

### 2. react-spring : USE, scoped. Confidence: HIGH

- Install `@react-spring/web@~10.1.2`. Import `useSpring, useSprings, useTrail, useChain, useTransition, animated, config` from `@react-spring/web`.
- Version note: `react-spring` (the umbrella, 10.0.4) is behind and v11.0.0-beta (beta.1 released 2026-10-01) is **removing it**, going ESM-only, and deprecating `useTransition` in favor of new `usePresence`/`usePresenceList`. Stay on 10.1.x stable. Avoid `useTransition` for new core UI (use motion's `AnimatePresence`) so the v11 migration stays trivial.
- Reduced motion is built in: `useReducedMotion` is exported from `@react-spring/web` (confirmed in the type definitions), and the global flag `Globals.assign({ skipAnimation: true })` snaps every spring to its target. Wire it once (snippet below).
- Dependencies are tiny and tree-shakable. Measured at about +17 kB gz for `useSpring/useTrail/useSprings`.

### 3. realtimecolors.com : USE as a design tool, with caveats. Confidence: HIGH

- The seed (`050315 / fbfbfe / 2f27ce / dedcff / 433bff`, Inter/Inter) is Text, Background, Primary, Secondary, Accent. Note `050315` on `fbfbfe` is the **light** theme pairing (dark text on light bg). The tool's light/dark toggle (Alt+T) lets you design both modes in one session. The project requires light and dark, so design both explicitly rather than inverting.
- It shows AA/AAA contrast traffic lights per role. Use them as the accessibility gate for text and interactive colors.
- Exports: CSS variables, Tailwind CSS, SCSS, and custom templates, in HEX/RGB/HSL/OKLAB/OKLCH. The tool lists a `tailwind.config.js` style Tailwind export and does not mention v4. **Export "CSS" with OKLCH and paste into `@theme`**, not the Tailwind-config export:

```css
@import "tailwindcss";
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

:root { --bg: oklch(...); --fg: oklch(...); --primary: oklch(...); --secondary: oklch(...); --accent: oklch(...); }
[data-theme=dark] { --bg: oklch(...); --fg: oklch(...); /* ... */ }

@theme inline {
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-accent: var(--accent);
  --font-sans: 'Inter Variable', ui-sans-serif, system-ui, sans-serif;
}
```
`@theme inline` makes `bg-bg`/`text-primary` resolve to the runtime variables, so dark mode is just swapping variables with no `dark:` prefix on every class.
- Its type-scale presets (1.067 to 1.618) map to a `--text-*` ladder in `@theme`.
- The user wants alternatives explored: do that in the design phase (Realtime Colors' scheme generators: analogous/complementary/triadic, plus randomize with Space). Keep exactly 5 role tokens plus derived tints so swapping palettes later is a single-block edit.

### 4. godly.design/posts : USE as inspiration only, not a dependency. Confidence: MEDIUM

- `godly.design/posts` is a curated **feed of linked social posts** (mostly X links to designers' UI interaction clips), with category nav (Websites, Tools, Templates, etc.). No dates, tags, RSS, or API were visible. Treat it as a mood-board source: capture screenshots/links into the planning docs, then extract motion patterns (spring feel, press states, cursor effects) into a written reference list before coding. (Probe also noted `godly.website` currently 301-redirects to `recent.design`, so the brand's structure may have shifted. Rely on `godly.design/posts/` and verify when you actually browse.)
- No code or package implications.

---

## Division of Responsibility (motion vs react-spring)

The libraries overlap heavily on springs. Without a rule you get two mental models and double bundle cost for the same effect. Recommended rule:

| Concern | Owner | Why |
|---------|-------|-----|
| Mount/unmount, `AnimatePresence`, exit animations | **motion** | Mature, handles React 19 strict mode and transitions (13.1.1 and 13.4.6 fixes). |
| Layout and shared-element transitions (`layout`, `layoutId`, Morphing Dialog) | **motion** | react-spring has no equivalent. |
| Scroll-linked values (`useScroll`, `useTransform`, ScrollProgress, in-view reveals) | **motion** | Already bundled. 13.4.x moved offsets onto hardware-accelerated `ViewTimeline` where supported. |
| Text/number effects, stagger reveals, all motion-primitives prefabs | **motion** | They are written against it. |
| Simple drag, `whileTap`, `whileHover` | **motion** | Built in. No extra gesture lib. |
| Velocity-carrying physics: flick/toss, drag-release with momentum, rubber-band, pointer-chasing follower, squish-on-press toys | **react-spring** | `useSpring` with continuous retargeting is its sweet spot and gives the "tactile" signature. |
| Staggered chains of springs (`useTrail`, `useChain`) for playful sets of elements | **react-spring** | Concise API. |
| Anything in `@react-spring/three` | **react-spring** | Only if 3D is adopted. |

Hard rules:
1. **One library per element, never both on the same CSS property.** A `motion.div` may contain `animated.div` children. Do not animate `transform` on one node from both.
2. Keep react-spring to a short list of "signature interactions" (say 3-5). Everything else uses motion/CSS.
3. Share one `src/lib/motion-tokens.ts` with named spring presets (`snappy`, `soft`, `bouncy`) expressed in each library's terms (stiffness/damping/mass for motion, tension/friction/mass for react-spring, same damped-harmonic-oscillator model) so the two feel like one personality.
4. Prefer CSS transitions for hover color/opacity. Reserve JS springs for transform/physics.
5. Pointer events, not mouse events, for anything you write. `touch-action` set explicitly on draggables.

Reduced motion, wired once at the app root:

```tsx
import { MotionConfig } from 'motion/react'
import { Globals, useReducedMotion } from '@react-spring/web'
import { useEffect } from 'react'

function SpringReducedMotion() {
  const reduce = useReducedMotion()
  useEffect(() => { Globals.assign({ skipAnimation: reduce }) }, [reduce])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SpringReducedMotion />
      {children}
    </MotionConfig>
  )
}
```
(Do not copy the react-spring docs demo verbatim: it sets the global in an effect with no dependency array.) Add a CSS `@media (prefers-reduced-motion: reduce)` guard for any CSS keyframes, and Tailwind's `motion-safe:` / `motion-reduce:` variants for utilities.

Coexistence evidence: separate internal frame loops, no shared global state, both peer React 19, both built together in one Vite 8 bundle with zero errors or warnings (measured). Runtime confidence is MEDIUM until a real-device spike confirms 60 fps with both active.

---

## Tailwind v4 Notes

- v4 `hover:` only applies under `@media (hover: hover)`, so hover styles never stick after a tap on phones. This matches the "no desktop-only gestures" requirement. Do **not** restore v3 behavior with `@custom-variant hover (&:hover)`.
- Browser floor: Safari 16.4+, Chrome 111+, Firefox 128+ (uses `@property`, `color-mix()`). Fine for this audience.
- No `tailwind.config.js`; `tw-animate-css` (the shadcn replacement for tailwindcss-animate) is not needed since motion handles animation.

## Dark Mode (covered: Tailwind v4 + tiny script)

Use the data-attribute variant above and the Tailwind-documented inline script in `index.html` `<head>` (runs before paint, no flash):

```html
<script>
  (function () {
    var t = localStorage.theme;
    var dark = t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  })();
</script>
```
Add a three-state toggle (light / dark / system) and update `<meta name="theme-color">`. `next-themes` (0.4.6) is not needed outside Next.js.

## Font Loading

- `import '@fontsource-variable/inter/wght.css'` in `main.tsx`. Verified: it declares `font-display: swap`, `font-weight: 100 900`, and per-script `unicode-range`, so a browser downloads only the **latin subset (48 kB woff2)** for English copy (latin-ext is 85 kB and only fetched if used). Vite emits all subsets to `dist/` (harmless unused files).
- `@fontsource-variable/inter/opsz.css` adds optical sizing (latin 73 kB). Worth it only if you want display-size tuning.
- **Preload is not automatic**: a bare `<link rel="preload" href="@fontsource-variable/inter/files/...">` in `index.html` is *not* rewritten by Vite (verified, stays unresolved). If you want a preload, use a small `transformIndexHtml` plugin or `import url from '...woff2?url'`. Skipping preload is acceptable with `font-display: swap`; revisit if Lighthouse flags it.
- If the design adds a display face from Realtime Colors, use the same Fontsource route (one variable family, latin only), and keep to 2 families total for mobile performance.

## GitHub Pages Deploy

User site `aa-phan.github.io`: Vite docs say set `base` to `'/'` (the default) when the repo is `<username>.github.io`. A project repo (`aa-phan-portfolio-v2`) would serve under `/aa-phan-portfolio-v2/` and need `base: '/aa-phan-portfolio-v2/'`. Make it env-driven so either works:

```ts
// vite.config.ts
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss(), imagetools()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
})
```
Reference assets via imports or `import.meta.env.BASE_URL`, never hard-coded `/images/...` strings, so a base change cannot break them.

`.github/workflows/deploy.yml` (pattern from the Vite static-deploy guide; pin to the SHAs listed there if you want supply-chain hardening):

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version: lts/*, cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v6
      - uses: actions/upload-pages-artifact@v5
        with: { path: ./dist }
      - id: deployment
        uses: actions/deploy-pages@v5
```
Notes: Settings, Pages, Source must be "GitHub Actions". Single-page design (no router) means no `404.html` SPA workaround is needed. Add a real `public/404.html` for a friendly not-found page.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Vite + React | Next.js / Astro | Next explicitly out of scope. Astro would be lighter on JS but the user wants React islands everywhere and these two React animation libs. |
| Animation split | motion for UI choreography + react-spring for signature physics | react-spring only | Loses `layoutId`/`AnimatePresence`/scroll and every motion-primitives component. |
| Animation split | (same) | motion only | Viable and smaller (saves 17 kB), but the user explicitly wants to try react-spring. Revisit if the spike shows react-spring adds nothing. |
| react-spring package | `@react-spring/web` | `react-spring` umbrella | Lagging, `deprecated` tag present, removed in v11 beta. |
| Installing primitives | Copy via registry JSON / CLI, then patch | Wait for an npm package | None exists. Source ownership is the model. |
| Styling | Tailwind v4 | Tailwind v3.4 | Only for pre-2023 browsers. motion-primitives and shadcn are on v4. |
| TypeScript | 6.0.x | 7.0.x | 7.0.2 compiled the probe cleanly, so it is available, but v6 is the scaffold default. Take 7 post-launch. |
| Dark mode | Tailwind data-attr + inline script | next-themes | Next-oriented abstraction we do not need. |
| Fonts | Fontsource self-hosted | Google Fonts `<link>` | Third-party request, render-blocking, privacy. |

## What NOT to Use

| Do not use | Why |
|------------|-----|
| `react-spring` umbrella package | Deprecated tag, removed in v11. Use `@react-spring/web`. |
| `react-spring` v11 beta | Beta, breaking `onRest`/`immediate` semantics. Wait for stable. |
| Raw `framer-motion` imports | motion 14 depends on `framer-motion` internally. Always import from `motion/react` so there is one copy. |
| motion-primitives `Cursor`, `Magnetic`, `Tilt`, `Spotlight` as *primary* interactions | Mouse-only. They are desktop garnish. |
| `shadcn init` | Unneeded; adds Radix/CVA you will not use. |
| `tailwind.config.js`, `@tailwind base/components/utilities` | v3 patterns. |
| `@use-gesture/react` by default | Last published March 2024, and motion already provides drag/tap/hover. Only add if a react-spring-driven drag cannot be done well otherwise. |
| `vite-plugin-image-optimizer` as the primary image tool | Compress-only (no srcset/format variants). Last publish Oct 2025. |
| Hard-coded absolute asset paths | Break when `base` changes. |
| Both libraries animating the same element/property | The one real coexistence hazard. |

---

## Gaps: capabilities the four tools do NOT cover

Each row: what is missing, 1-2 candidates (measured cost where available), my default pick. See "Decisions needed from user" for the ones that need an answer.

| Gap | Already covered? | Candidate A (default) | Candidate B | Notes |
|-----|------------------|-----------------------|-------------|-------|
| **Scroll-driven animation** | **Yes, by `motion`** (`useScroll`, `useTransform`, `scroll()`, motion-primitives ScrollProgress/InView) | motion `useScroll` (+0 kB) | GSAP ScrollTrigger (+44 kB gz measured). GSAP is now fully free incl. plugins per gsap.com. | Only choose GSAP for pinned/scrubbed multi-step timelines. Not needed for six sections. |
| **Smooth scroll** | No | **None (native scroll)** | Lenis 1.3.26 (+5.6 kB measured). `lenis/react` provides `ReactLenis`. | Lenis smoothing is **off on touch by default** (`syncTouch: false`), honors reduced motion by default (`respectReducedMotion: true`), but needs `anchors: true` for in-page nav and community reports it can feel unlike native scroll and conflict with focus/keyboard behavior. Smooth scroll is a taste item, not a requirement. Default: skip until the design wants it. |
| **3D / WebGL** | No | **None** (use CSS 3D via Tilt and react-spring transforms for tactility) | (a) OGL 1.0.11 for one hero shader/blob (+12.8 kB measured); (b) three 0.186 + @react-three/fiber 9.8.1 (+241 kB gz measured, peer `react >=19 <19.4`) with `@react-spring/three` | R3F is the one thing in this list that can blow the mobile budget. If 3D is wanted, lazy-load it, cap DPR, and pause off-screen. |
| **Gesture / drag** | **Yes, by `motion`** (`drag`, `dragConstraints`, `whileTap`, `Reorder`) | motion `drag` | `@use-gesture/react` 10.3.1 only for react-spring-driven drag | `@use-gesture` is stale (Mar 2024). react-spring has no pointer handling itself, so a react-spring drag needs it or hand-written pointer events. |
| **Page transitions** | **Partly** (`AnimatePresence`; new `AnimateView` in motion 13.4.0 for React 19.3 `ViewTransition`, 2026-09-14, so very new) | **Single page, no router.** Use MorphingDialog/MorphingPopover for project detail | If real routes are wanted: `react-router` (library mode) or `wouter` 3.13 with hash routing + motion `AnimatePresence` | GitHub Pages cannot rewrite SPA URLs. Real routes need a `404.html` copy of `index.html` or hash routing. Note `react-router` 8.4.0 requires Node `>=22.22` and React `>=19.2.7`. `react-router-dom` 7.18.4 still publishes. `AnimateView` is LOW confidence until proven. |
| **Image optimization** | No | **vite-imagetools 12.0.1** (verified on Vite 8) | Manual pre-resize with `sharp` script, commit outputs | Use `<picture>` with AVIF/WebP + explicit `width`/`height` + `loading="lazy"` below the fold + `fetchpriority="high"` on the hero/LCP image to prevent layout shift. |
| **Theming / dark mode** | Tailwind v4 | Tailwind `@custom-variant` + inline script (above) | `next-themes` | Covered, see Dark Mode. |
| **Icons (brand)** | lucide has none | 3-4 inline SVGs for GitHub/LinkedIn/email | `simple-icons` 16.x or `react-icons/si` 5.7 | Lucide for UI glyphs only. |
| **Physics "toys" (stack/pile of objects, rigid-body)** | No | None (react-spring + motion drag can fake most) | matter-js 0.20.0 (last release 2023) or Rapier via `@react-three/rapier` | Only if a falling-objects/gravity playground is part of the identity. Lazy-load. |
| **Lottie/Rive illustrations** | No | None | `@rive-app/react-canvas` 4.36 (interactive, state machines) | Only if designed assets exist. |
| **Analytics, forms, contact** | No | `mailto:` / static links | Formspree-style form post | No backend (out of scope). |
| **Testing** | Not requested | Vitest + Playwright (visual/mobile viewport + axe) | none | Out of the four-tool scope; suggest a mobile-viewport Lighthouse CI check in the deploy workflow. |

---

## Installation

```bash
# Scaffold (Node >=22.12 recommended)
npm create vite@latest aa-phan-portfolio-v2 -- --template react-ts
cd aa-phan-portfolio-v2

# Core
npm install tailwindcss@^4.3.3 @tailwindcss/vite@^4.3.3 motion@~14.0.0 @react-spring/web@~10.1.2 \
  clsx tailwind-merge lucide-react @fontsource-variable/inter

# Dev
npm install -D @types/node vite-imagetools

# Then add motion-primitives components one at a time (patch type imports, move to src/)
npx motion-primitives@latest add text-effect   # lands in ./components/motion-primitives/ (root!)
```

Required config: `@import "tailwindcss";` in `src/index.css`; `tailwindcss()` and `imagetools()` in `vite.config.ts`; `resolve.alias['@']` and `tsconfig.app.json` `paths: {"@/*": ["./src/*"]}`; `src/lib/utils.ts` with `cn()`.

---

## Decisions needed from user

1. **Repo and domain cutover.** For `https://aa-phan.github.io` with `base: '/'` the Pages repo must be named `aa-phan.github.io`, which is the existing v1 repo (`../aa-phan.github.io`). Options: (a) develop v2 here and, at launch, push it into `aa-phan.github.io` (switching its Pages source to GitHub Actions); (b) rename/transfer so this repo takes that name; (c) ship at the project URL `/aa-phan-portfolio-v2/` first (needs `VITE_BASE`). Recommendation: (a), keeping v1 history intact.
2. **Smooth scroll: yes or no?** Default recommendation is no (native scroll, best on phones). If yes: Lenis, desktop-weighted, with touch left native.
3. **3D / WebGL: yes or no?** Default is no. If yes, choose OGL (single shader accent, +13 kB) or R3F (+241 kB, lazy-loaded). This is the single biggest mobile performance decision.
4. **Navigation model: one page or real routes?** Default is a single scrolling page with MorphingDialog for project details (no router, no GitHub Pages 404 workaround). If you want deep-linkable project URLs, pick hash routing or the `404.html` fallback.
5. **How far to push react-spring?** Default is a handful of signature interactions (+17 kB). The cheaper alternative is motion only. Confirm you want both.
6. **Touch-equivalent behavior for Tilt/Magnetic/Spotlight.** They are mouse-only. Accept as desktop-only polish, or fund building touch versions (press/drag springs) in the interaction phase.
7. **Brand icons:** inline SVGs (zero deps) vs `simple-icons`/`react-icons`.
8. **Performance and accessibility targets** (from PROJECT.md "to confirm"): suggested gate is mobile Lighthouse Performance >= 90, Accessibility >= 95, initial JS <= about 150 kB gz, LCP <= 2.5 s on a throttled phone, full reduced-motion support.
9. **TypeScript 6 (scaffold) vs 7 (native compiler).** Recommend 6 for launch.

---

## Risks to Carry Into Roadmap

| Risk | Severity | Mitigation |
|------|----------|------------|
| motion 14.0.0 is 6 days old and motion releases very frequently (multiple minor versions per month) | Medium | Pin `~14.0.0`, commit lockfile, keep 12.43 / 13.5.1 as fallback versions, avoid `AnimateView` and other brand-new APIs. |
| motion-primitives is "beta", code is copy-in | Low | Treat as owned code. Patch and commit, do not expect upgrades. |
| Mouse-only interactive primitives | Medium | Design touch equivalents early (interaction phase). |
| Combined JS (about 139 kB gz in probe, before real content and fonts) | Medium | Code-split sections, measure on a real mid-range phone in the first phase. |
| react-spring v11 transition | Low | Pin 10.1.x, avoid `useTransition` for core UI. |
| `lucide-react` v1 has no brand icons | Low | Inline SVGs. |

## Sources

- npm registry (`npm view`), 2026-10-08: versions, peer deps, dist-tags, publish dates for motion, @react-spring/web, react-spring, vite, @vitejs/plugin-react, tailwindcss, @tailwindcss/vite, typescript, lenis, gsap, three, @react-three/fiber, vite-imagetools, react-router, ogl. HIGH.
- Local probe builds (Vite 8.3.4, React 19.3.0, motion 14.0.0, @react-spring/web 10.1.2, Tailwind 4.3.3, TS 6.0.3 and 7.0.2). HIGH (measured).
- https://github.com/ibelick/motion-primitives, raw `public/c/*.json` registry, `components/core/*.tsx` source, README, package.json. HIGH.
- https://motion-primitives.com/docs/installation (CLI, `cn()` helper, deps). HIGH.
- https://github.com/motiondivision/motion/blob/main/CHANGELOG.md (12.x to 14.0.0). HIGH.
- https://motion.dev/docs/react-reduce-bundle-size and https://motion.dev/docs/react-motion-config (bundle sizes, `reducedMotion`). HIGH.
- https://www.react-spring.dev/docs/getting-started, https://react-spring.dev/guides/accessibility, GitHub releases for pmndrs/react-spring (10.1.x, 11.0.0-beta). HIGH.
- https://vite.dev/guide/static-deploy.html (GitHub Pages base + workflow), https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages. HIGH.
- https://tailwindcss.com/docs/installation/using-vite, /docs/upgrade-guide, /docs/dark-mode. HIGH.
- https://ui.shadcn.com/docs/installation/vite (alias setup). HIGH.
- https://www.realtimecolors.com (feature/export set). MEDIUM (tool UI page; export syntax not exercised).
- https://godly.design/posts/ (content type). MEDIUM.
- https://github.com/darkroomengineering/lenis (README: syncTouch, respectReducedMotion, anchors). HIGH. Community mobile-feel reports: MEDIUM-LOW (forum threads, undated).
- https://gsap.com/pricing/ (free including plugins). MEDIUM (license text not reviewed).
