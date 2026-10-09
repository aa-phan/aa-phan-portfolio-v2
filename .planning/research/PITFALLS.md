# Pitfalls Research

**Domain:** Animation-heavy, playful personal portfolio (Vite + React + TS + Tailwind v4, `motion`/motion-primitives + react-spring), static-hosted on GitHub Pages, mobile-first, recruiter-facing, replacing a live site repo (`aa-phan.github.io`)
**Researched:** 2026-10-08
**Confidence:** MEDIUM-HIGH (contrast math, repo state, Motion/Tailwind/Vite/Pages docs verified directly; iOS gesture behavior and some bundle sizes need on-device/measured confirmation, flagged inline)

Confidence tags used below: [V] = verified this session (docs fetched, command run, or computed); [K] = well-established knowledge not re-fetched this session; [?] = unverified, must be measured or tested before relying on it.

## Facts established about the starting state (drives several pitfalls)

- `aa-phan.github.io` local clone: branch `main`, remote `https://github.com/aa-phan/aa-phan.github.io`, 16 commits, 346 tracked files, **no `.github/` directory, no `CNAME`**. So Pages is almost certainly set to "Deploy from a branch: main / root" [V for repo state; the Pages setting itself is inferred, check it in Settings > Pages].
- Tracked junk that must not follow into v2: `.DS_Store`, `.sass-cache/`, `prepros-6.config`, jQuery/Bootstrap/OwlCarousel JS, `google_map.js`, a Bootstrap-era `index.bak.html`. `images/` is 2.5 MB; several JPEGs are 270-570 KB (`img-1.jpg` 570 KB, `img-3.jpg` 522 KB, `about.jpg` 278 KB, `cover_bg_1.jpg` 272 KB). Many look like leftover template images, not content the current page uses. Only `about-dj.jpg` and `images/logos/{capitalone,spectrum,symbotic}.png` are clearly live content [V].
- `git config core.ignorecase` is `true` on this Mac (case-insensitive FS), while GitHub Actions runners are Linux (case-sensitive) [V].
- Seed palette is the realtimecolors URL order text/background/primary/secondary/accent: text `050315`, bg `fbfbfe`, primary `2f27ce`, secondary `dedcff`, accent `433bff`. That is a **light-theme** palette. realtimecolors' dark preview just swaps text and bg, keeping the indigos [K; consistent with the URL order].

---

## Critical Pitfalls

### Pitfall 1: Pushing the Vite project onto `main` before the Pages source is switched (live site goes down, or shows the wrong thing)

**What goes wrong:**
v1 is served straight from `main` root. If v2 source (or a `dist/` committed wrong) lands on `main` while Settings > Pages is still "Deploy from a branch", GitHub serves/Jekyll-renders the raw repo root: a README page or a 404 instead of the portfolio. The opposite order has its own gap: switching the source to "GitHub Actions" before a workflow has successfully deployed can leave the site 404 until the first deploy completes (exact behavior of the old deployment during the switch is [?], assume a gap). Separately, `actions/configure-pages` / `deploy-pages` fails with "Get Pages site failed" if Pages isn't enabled for Actions yet.

**Why it happens:**
The Pages source is a repo *setting*, not code, so it is not in the PR and is easy to forget. Recruiters hit the live URL during the job search, so a broken window is costly.

**How to avoid:**
1. Build and rehearse the whole pipeline in the **new** repo (`aa-phan-portfolio-v2`) deployed as a *project site* first (needs `base` set, see Pitfall 9). Treat that as staging.
2. Before touching `aa-phan.github.io`: tag the current head (`git tag v1-ipod && git push origin v1-ipod`) and push a `v1-ipod` branch. Never force-push `main`; history stays intact.
3. Cutover = a normal PR/commit on top of old history in a fresh clone of `aa-phan.github.io`: `git switch -c v2-cutover`, `git rm -r` the v1 files, copy in v2 source + `.github/workflows/deploy.yml` + `public/.nojekyll`, commit, merge. Do **not** replace the repo by pushing the new repo's unrelated history over `main`.
4. Order at cutover: merge to `main` and flip Settings > Pages > Source to "GitHub Actions" in the same sitting, then trigger the workflow (`workflow_dispatch`) and watch it; do it off-peak and not during an active application push.
5. Rollback plan written down beforehand: set source back to branch + `git revert` the cutover commit (or reset a branch to `v1-ipod` via PR). v1 is one self-contained `index.html`, so restoring is fast.
6. Rehearse the source-switch behavior on a throwaway `<user>.github.io`-style test repo if there is any doubt about the downtime window.

**Warning signs:**
Settings > Pages still says "Deploy from a branch" while `.github/workflows/` exists; workflow green but site unchanged; site renders README; `configure-pages` error in the log.

**Phase to address:**
Deploy/Cutover phase (final). The *rehearsal* belongs in the scaffold phase (Pitfall 9) so the cutover is a non-event.

---

### Pitfall 2: Two animation libraries both animating the same node (jank, last-writer-wins, doubled bundle)

**What goes wrong:**
- `motion` (via motion-primitives) and react-spring each write inline `style.transform`/`opacity` directly to the DOM outside React. If both target one element, or a wrapper and child fight over the same property, one overwrites the other each frame: stutter, snap-back, animations that "do nothing" in one library.
- React re-rendering an element whose `style` React also owns resets values that a spring was driving.
- Tailwind `transition-*` / `transition-all` classes on a node that Motion/react-spring is driving produce a CSS transition *on top of* a JS-driven value, causing laggy, rubber-banding, or doubled easing. This is the single most common "why is my spring slow" cause [K].
- Two rAF loops, two mental models for interruption, velocity and `prefers-reduced-motion`.
- Bundle: the full `motion` component is ~34 kB and cannot tree-shake below that; `m` + `LazyMotion` is ~4.6 kB initial, +~15 kB for `domAnimation` (animations, variants, exit, hover/tap/focus) or +~25 kB for `domMax` (adds drag/pan and layout animations) [V, motion.dev bundle-size docs]. react-spring's `@react-spring/web` adds its own tens of kB [?, measure; do not trust recalled numbers].
- `LazyMotion strict` throws if a `motion.*` component renders inside it. motion-primitives components import `motion` from `motion/react` [K, verify on first component add], so adopting LazyMotion means editing every copied component to use `m.*`.

**Why it happens:**
The project brief asks for both libraries ("tools the user wants to try") without defining who owns what; tutorials show each library in isolation.

**How to avoid:**
- Write an **ownership rule** into the design doc before coding: default `motion` owns enter/exit, layout, scroll reveal, hover/tap, text effects (it is what motion-primitives is built on). react-spring owns only a short, named list of "signature physics" interactions (e.g. one drag-with-momentum/toss object, one parallax-y spring toy). **One library per DOM node, never both.** If a signature interaction needs both, nest them on different elements (outer wrapper = one library, inner = the other) and never animate the same CSS property in both.
- Never put `transition`, `transition-all`, `transition-transform`, or `animate-*` Tailwind classes on an element driven by either library (use `transition-colors` only for non-animated props).
- Decision gate: after the first vertical slice, run `rollup-plugin-visualizer` / `vite build` size output and decide whether react-spring earns its bytes. Dropping it (doing springs with Motion's `type: "spring"`, which supports stiffness/damping/mass) is a legitimate, probably better outcome. Flag this honestly to the user rather than keeping both for ceremony.
- Set an initial-JS budget (suggested: <= ~150 kB gzip for the entry chunk on the critical path). Lazy-load below-the-fold/signature-interaction code with `React.lazy` + dynamic `import()`.
- If adopting LazyMotion: decide in the scaffold phase, wrap with `strict`, and convert copied motion-primitives components to `m`. Don't half-adopt.
- Be sure to import from `motion/react` (current package) not legacy `framer-motion`, and not both; avoid duplicate copies in the bundle.

**Warning signs:**
Animation visibly "double-eases"; an element snaps at the end of a spring; `grep -R "transition" src` finds Tailwind transition classes on animated nodes; bundle analyzer shows both `motion` and `@react-spring/*` in the entry chunk; `framer-motion` and `motion` both in `package.json`.

**Phase to address:**
Design/decision-doc phase (ownership matrix) + Scaffold phase (budget, LazyMotion decision) + Motion phase (enforce with review checklist).

---

### Pitfall 3: Reduced-motion handled for one library only (or only for JS, not CSS)

**What goes wrong:**
`<MotionConfig reducedMotion="user">` makes Motion components skip transform and layout animations but **keeps opacity and color animations** [V, motion.dev]. It does nothing to react-spring, CSS keyframes/Tailwind `animate-*`, `scroll-behavior: smooth`, autoplaying video/Lottie, or custom rAF loops. react-spring has its own `useReducedMotion` hook and `Globals.assign({ skipAnimation })`, which must be wired once at the app root [V, react-spring docs]. The result: a user with "Reduce motion" on iOS still gets springing cards, parallax, and infinite floating blobs.

**Why it happens:**
Reduced motion is treated as a single switch; with two libraries plus CSS there are three independent systems.

**How to avoid:**
- Create ONE `useMotionPreference` source of truth (a `matchMedia('(prefers-reduced-motion: reduce)')` hook/context) and fan it out: `MotionConfig reducedMotion="user"`, react-spring `Globals.assign({ skipAnimation: reduced })`, and CSS via Tailwind `motion-reduce:` / `motion-safe:` variants plus a global `@media (prefers-reduced-motion: reduce)` block that sets `scroll-behavior: auto` and disables keyframes.
- "Reduced" does not mean "none": replace movement with short opacity/color changes (which Motion keeps) so the site still feels responsive.
- Treat infinite/looping/ambient animation (floating shapes, marquees, gradient drift) as the first thing to remove under reduced motion; also pause them when off-screen or tab hidden.
- Test by toggling the OS setting (macOS: Accessibility > Display > Reduce motion; iOS: Settings > Accessibility > Motion) and DevTools "Emulate CSS prefers-reduced-motion", on every signature interaction, not just the hero.
- Optionally offer a visible in-page "Reduce motion" toggle (also helps recruiters on slow devices/low-power mode).

**Warning signs:**
Something still moves with emulation on; react-spring code imports no reduced-motion hook; `grep -R "animate-" src` has no `motion-reduce:` companion; smooth-scroll still animates.

**Phase to address:**
Scaffold phase (provider + hook) and Motion phase (per-interaction check); verified in the Hardening/audit phase.

---

### Pitfall 4: Content hidden until JS animation runs (hurts LCP, recruiters, crawlers, link previews)

**What goes wrong:**
The Vite output is a client-rendered SPA: the HTML body is an empty `<div id="root">` until the JS bundle downloads and executes. If the hero text/image then starts at `opacity: 0` (or per-character split text with blur, as in text-effect style components), the LCP element is not painted/counted until the animation starts, so LCP = JS download + hydration + animation delay. On Slow-4G mobile that is easily > 4 s. Also: no-JS/crawler/link-preview/ATS scrapers see nothing; the `<title>`/OG tags are the only thing they get; per-character spans without `aria-label` make screen readers read letters.

**Why it happens:**
"Animate in on load" is the default tactile-portfolio flourish, and Vite has no SSR by default.

**How to avoid:**
- Progressive enhancement: content is visible by default; animation *adds* motion. Don't start primary headline/name/role/contact at `opacity: 0`. Animate transform (and optionally small blur-free opacity from ~0.6+) over <= ~300-400 ms, or don't animate the LCP element at all.
- Put critical first-paint content in the static `index.html` (name, role, one-line pitch, links as plain anchors) or add build-time prerendering (e.g. `vite-react-ssg`/`vite-plugin-prerender`-style) [?, pick and verify one in the scaffold phase]. At minimum, a lightweight HTML skeleton of the hero inside `#root` that React replaces.
- Static meta in `index.html`: `<title>`, description, `lang`, favicon, canonical, **Open Graph/Twitter image** (crawlers don't run JS; LinkedIn/iMessage previews are how recruiters first see the link). OG image must be an absolute URL.
- For split-text effects: keep one accessible text node (`aria-label` on the wrapper, `aria-hidden` on the animated spans) and cap total stagger time (< ~600 ms for a heading).
- Hero image: `<img>` with explicit `width`/`height`, `fetchpriority="high"`, no `loading="lazy"`, modern format (AVIF/WebP with JPEG fallback), `srcset`/`sizes`. Never a CSS `background-image` for the LCP image (not discoverable by the preload scanner). Do not animate the hero image with blur/scale from 0.

**Warning signs:**
Lighthouse mobile LCP > 2.5 s on throttled run; "LCP element" in the trace is a late-appearing node; View Source shows an empty body; disabling JS yields a blank page; LinkedIn post inspector shows no image.

**Phase to address:**
Scaffold (index.html shell + meta + optional prerender decision) and Content/Layout phase (hero); gated in Hardening phase with Lighthouse CI.

---

### Pitfall 5: Palette contrast failures, especially indigo on dark (seed palette)

**What goes wrong:**
Computed WCAG 2.x contrast ratios for the seed palette [V, calculated this session]:

| Pair | Ratio | Verdict |
|------|-------|---------|
| text `050315` on bg `fbfbfe` (light theme body) | 19.73 | pass AAA |
| primary `2f27ce` on `fbfbfe` (light-theme links/buttons-as-text) | 8.83 | pass AAA |
| accent `433bff` on `fbfbfe` | 6.15 | pass AA (normal text) |
| `fbfbfe` text on primary `2f27ce` (filled button label) | 8.83 | pass |
| `fbfbfe` text on accent `433bff` | 6.15 | pass |
| `dedcff` (secondary) on `fbfbfe` | 1.29 | fail for text/borders; decorative fill only |
| `050315` on secondary `dedcff` (text on tint) | 15.32 | pass |
| **primary `2f27ce` on dark bg `050315`** | **2.23** | **FAIL everything (text 4.5, UI/focus 3.0)** |
| **accent `433bff` on dark bg `050315`** | **3.21** | **FAIL for text (4.5); only passes 3:1 for large text/UI components** |
| `dedcff` on dark bg `050315` | 15.32 | pass |
| primary `2f27ce` vs accent `433bff` (adjacent) | 1.44 | indistinguishable by color alone |

So the seed palette works in light mode. In dark mode, indigo links, outlines, icons, focus rings, and any indigo text on near-black are unreadable (2.23:1 and 3.21:1). Dark-mode-ready indigo needs to be much lighter; for reference on `050315`: `#6c66ff` = 4.84, `#7b75ff` = 5.66, `#8a85ff` = 6.68, `#9d99ff` = 8.19 [V]. Raising surfaces (cards `#0d0a2a`-ish) lowers these ratios again, so re-check on every surface.

**Why it happens:**
realtimecolors presents one set of brand colors against swapped backgrounds; designers eyeball "indigo glows nicely on black". The user also said they want to explore alternatives, so the final palette will change, but the failure mode will recur with any saturated mid-lightness hue.

**How to avoid:**
- Define **separate token sets per theme** (`--primary-fg` light/dark, `--accent-fg`, `--ring`, `--border`) rather than one hue for both. Light: use `2f27ce`-class values; dark: lift to roughly `#7b75ff`+ for text/icons/focus rings. Use filled-indigo-with-light-label for dark-mode buttons (passes at 6-9:1).
- Gate the palette decision on a contrast table committed in the design doc: every foreground/background pair actually used, including hover/active/disabled, placeholder, borders of inputs (3:1), focus ring (3:1 against both adjacent colors), text over images/gradients (test the worst pixel region, add a scrim).
- Tools: run a script (like the one used here) or APCA/WCAG checker in CI-less form for tokens; Lighthouse/axe catch only a subset (they miss text over gradients/images).
- Don't communicate state by color alone (primary vs accent differ by 1.44:1).

**Warning signs:**
Indigo-on-navy link text looks "dim"; focus ring hard to see in dark mode; axe "color-contrast" violations; secondary tint used as a border or text color on white.

**Phase to address:**
Design tokens/palette phase (before any component styling); re-verify in Hardening phase.

---

### Pitfall 6: Touch gestures fighting page scroll on mobile (and pointer-only/hover-only interactions)

**What goes wrong:**
- Drag-to-toss/swipe cards implemented with Motion `drag` or react-spring gesture hooks hijack the finger: the user tries to scroll the page and the card eats the touch, or vice versa. On iOS Safari, `touch-action: pan-y` on a draggable element does **not** reliably stop a horizontal gesture from turning into native vertical scroll when the page itself isn't horizontally scrollable (WebKit bug 232545, reported regressed in iOS 15; current status [?]), producing `pointercancel` mid-drag. `dragDirectionLock` only governs Motion's own response, not the browser's native panning.
- Edge-swipes conflict with iOS Safari's back gesture; full-screen draggable layers trap scrolling.
- Tailwind v4's `hover:` variant only applies under `@media (hover: hover)` [K], so hover-driven "tactile" effects silently do nothing on phones. Tap feedback must use `active:` / `whileTap`.
- Desktop-only flourishes (custom cursor, magnetic buttons, cursor-follow spotlights, parallax on `mousemove`) are dead weight or broken on touch; tooltips/info revealed on hover are inaccessible.
- `100vh` heroes get cut/jump when the iOS URL bar collapses.

**Why it happens:**
Playful physics demos are built and tested with a mouse; mobile emulation in DevTools does not reproduce iOS Safari gesture arbitration.

**How to avoid:**
- Design the physics for **tap and press** first (springy press-down, release overshoot, tilt on tap), and make drag an optional extra on isolated, non-scroll-critical objects. Never make drag the *only* way to reach content; give every draggable a button/keyboard alternative.
- For horizontal carousels, prefer native CSS `overflow-x: auto; scroll-snap-type: x mandatory` (browser-owned gesture) over JS drag. Where JS drag is needed: `touch-action: none` on the small draggable object only (you then own the gesture, so keep it small and not full-width), or `touch-action: pan-y` plus a movement threshold before committing; set `overscroll-behavior: contain` where relevant.
- Gate pointer-fine effects behind `@media (pointer: fine) and (hover: hover)`; render nothing for them on touch.
- Use `100svh`/`100dvh` (Tailwind v4 `h-svh`, `min-h-dvh`), not `100vh`.
- Never set `user-scalable=no` / `maximum-scale=1` in the viewport meta.
- Real-device test matrix from the first interactive phase: at least one iPhone (Safari) and one mid-range Android (Chrome). Remote-debug via Safari Web Inspector. This is cheap early and expensive late.

**Warning signs:**
Page won't scroll when starting a swipe on a card; `pointercancel` events in logs; hover effect missing on phone; layout jump when scrolling the first screen on iOS.

**Phase to address:**
Motion/Interaction phase (design for touch) with real-device verification; Hardening phase for the full matrix.

---

### Pitfall 7: Over-animation that makes the site slower to *use* than to admire (recruiter 10-second test)

**What goes wrong:**
Splash/loader screens, scroll-jacking, long staggered reveals on every paragraph, sections that stay blank if you scroll fast or jump via anchor link, key facts only revealed on hover/click, nav that hides content behind a playful metaphor (the v1 iPod hid six sections behind a click wheel). Recruiters skim: they need name, role/school, experience, projects, resume/contact within seconds. Godly-style reference sites are curated for visual awards, are often desktop-first and WebGL-heavy, and routinely fail mobile, performance and accessibility, so copying their mechanics (rather than their feel) imports those failures.

Specific mechanical traps:
- Motion `whileInView` with a high `viewport.amount` never fires on elements taller than the viewport (the threshold can't be reached on a phone), leaving a section permanently invisible.
- In-page anchor jumps to a section whose reveal hasn't triggered yet; sticky header covering the anchor target (no `scroll-margin-top`).
- Content that reveals once at scroll speed can't be screenshot, printed, or Ctrl-F'd.

**How to avoid:**
- Define a **"10-second test"** in the requirements: on a phone, within one screen and zero interaction, a visitor sees name, what he does, and links to Experience/Projects/Contact/Resume. All six sections' text is in the DOM and visible without hover.
- Motion budget: one signature moment per section at most; entrance animations <= ~300-500 ms, stagger caps; no animation gates reading. Use `whileInView` with `once: true` and a **small** `amount` (e.g. 0.1-0.2) or `margin` tolerances; default state is visible (see Pitfall 4).
- Persistent, always-reachable navigation and contact (sticky nav or bottom bar on mobile) with `scroll-margin-top` on sections.
- Playfulness lives in micro-interactions (press, hover/focus, toggles, cursor-free delights) and one memorable hero, not in obstacles.
- Treat godly.design as mood/typography/layout reference only; explicitly list "mechanics we will not copy" (scroll-jack, heavy WebGL, preloader).

**Warning signs:**
Time-to-first-meaningful-content > 1 s in a throttled mobile run; testers ask "where's the resume?"; blank areas when fast-scrolling; need to hover to read anything.

**Phase to address:**
Requirements/Design-doc phase (the 10-second test and motion budget as acceptance criteria), enforced in Layout and Motion phases, verified in Hardening via a recorded 5-person-style skim test.

---

### Pitfall 8: Overwriting or contaminating the live repo `aa-phan.github.io` (history, junk, secrets, metadata)

**What goes wrong:**
- `git push --force` or "init new repo and push to same remote" destroys 16 commits of history and the v1 fallback.
- Copying the whole v1 tree into v2 drags in `.DS_Store`, `.sass-cache/`, `prepros-6.config`, jQuery/Bootstrap, 5 MB of unused JPEGs, and they get shipped to users via `public/`.
- Re-using `about-dj.jpg` / personal photos with EXIF intact leaks GPS/device metadata publicly.
- `mailto:aaron.phan240@gmail.com` is in plain HTML in v1 (scrapeable). Low severity, but note it.
- Two sources of truth: a `gh-pages`/`dist` branch and `main` both existing, confusing Actions and Pages.

**How to avoid:**
- Cutover method as in Pitfall 1 (additive commit on `main`, tag/branch `v1-ipod` first). Do work in the separate v2 repo until cutover; it has its own history, which is fine; document that v2's pre-cutover history will *not* be carried over unless desired (squash into the cutover commit).
- Asset migration is an explicit step: inventory which images v1 `index.html`/JS actually references (grep shows `images/logos/*` and `about-dj.jpg`; confirm against JS-built strings), copy only those, re-encode, and **strip EXIF** (`sharp`, `squoosh`, or `exiftool -all=`). Add `.DS_Store` to the global gitignore and project `.gitignore` before the first commit.
- Don't commit build output to `main`; only Actions-built artifact is deployed. Add `.nojekyll` to `public/` anyway (harmless, prevents Jekyll mangling if the source ever flips).
- Contact: keep `mailto:` but consider a contact link text without obfuscation hacks; do not add a backend form (out of scope).
- README on `main` after cutover describes v2 and where v1 lives.

**Warning signs:**
`git log` on `main` shorter than 16 commits after cutover; `dist/` contains `sass`, `js/jquery*`, `.DS_Store`; `exiftool about-dj.jpg` shows GPS tags.

**Phase to address:**
Content/Asset migration phase (asset inventory + EXIF) and Cutover phase (git procedure).

---

### Pitfall 9: GitHub Pages path, routing and case-sensitivity bugs that only appear after deploy

**What goes wrong:**
- **Base path:** For a *user site* (`<user>.github.io`, or a custom domain) Vite `base` must be `'/'` (default); for a *project site* (`<user>.github.io/<repo>/`) it must be `'/<repo>/'` [V, vite.dev]. Because the plan is to rehearse in the repo `aa-phan-portfolio-v2` (project site) and then ship to `aa-phan.github.io` (user site), the base path changes between environments; hard-coded `/images/x.png`, `<img src="/...">` in `index.html`, or `public/` assets referenced absolutely break one environment.
- **SPA 404:** GitHub Pages has no rewrite rules. A client-side route like `/projects/foo` returns HTTP 404 on refresh/deep link; the common `404.html` redirect trick shows content after JS runs but the HTTP status is still 404 (crawlers may not index; redirect query strings can get indexed) [V for mechanism; status-code detail from general knowledge]. The `404.html` also must be in the published root (copying it into `dist` is a classic miss).
- **Case sensitivity:** macOS dev is case-insensitive (`core.ignorecase=true` here [V]); Linux runner and GitHub's servers are case-sensitive. `import './Hero.tsx'` vs file `hero.tsx`, `Image.JPG` vs `image.jpg`, or a case-only rename git didn't record all pass locally and fail in CI or silently 404 an image in production.
- **Stale workflow tutorials:** old examples pin deprecated action versions (the `upload-artifact` v3 deprecation broke older Pages workflows) or use `gh-pages` branch pushes with `peaceiris`; Vite needs Node 20.19+/22.12+ [V via guide]. Missing committed lockfile breaks `npm ci`.
- **Custom domain (if ever added):** with the Actions deployment source, a `CNAME` file is ignored and the domain is set in Settings > Pages; docs are inconsistent, and some users report it resetting or 404ing if the artifact lacks `CNAME` — put `public/CNAME` in anyway (harmless) and re-verify the domain field and HTTPS after switching source [V]. DNS (A/AAAA for apex or CNAME for subdomain) and "Enforce HTTPS" are separate steps.

**How to avoid:**
- **Avoid client-side routing entirely.** Single-page layout with section anchors (`#experience`) covers the six sections, needs no router, no `404.html` trick, and no base-path-sensitive route config. If project detail pages are later wanted, prefer prerendered static routes or hash routing over a `404.html` redirect.
- Make base configurable: `base: process.env.VITE_BASE ?? '/'`; staging workflow sets `VITE_BASE=/aa-phan-portfolio-v2/`; production leaves default. Import assets through Vite (`import img from './x.jpg'`) or use `import.meta.env.BASE_URL`; never write `/foo.png` literals in components or `index.html`.
- Ship a real, styled `public/404.html` with a link home (cheap polish; covers mistyped URLs).
- Enforce case: ESLint `import/no-unresolved` (+ `forceConsistentCasingInFileNames` in tsconfig), and run the CI build on Linux from the first commit. When renaming only case use `git mv`.
- Pin Node via `.nvmrc`/`engines`, commit the lockfile, use current-major `checkout`, `setup-node`, `configure-pages`, `upload-pages-artifact`, `deploy-pages` as shown in the current Vite static-deploy guide (copy from there, not from a blog).
- Add a post-deploy smoke test step/checklist: load `/`, a hashed asset, `404.html`, OG image URL.

**Warning signs:**
Blank page with 404 for `/assets/index-*.js` (wrong base); images work in `vite preview` but not live; build green locally, red on Actions with "Could not resolve"; refresh on a deep link shows GitHub's 404 page.

**Phase to address:**
Scaffold phase (workflow, base config, case lint, staging deploy) and Cutover phase (user-site switch).

---

### Pitfall 10: Tailwind v4 + shadcn + motion-primitives install gotchas

**What goes wrong:**
- shadcn's Vite doc path can still show the v3 flow (`tailwindcss init -p`, `tailwind.config.js`, `postcss.config.js`); v4 uses `@import "tailwindcss";` plus the `@tailwindcss/vite` plugin and no JS config [V via setup guides; the shadcn page may have been updated since, check current docs].
- Vite's default `tsconfig.json` is a solution-style file with `references`; the shadcn CLI doesn't resolve `paths` through references. The `@/*` alias must exist in **root `tsconfig.json`, `tsconfig.app.json`, and `vite.config.ts`** (needs `@types/node` for `path.resolve`) *before* running `shadcn init` [V].
- `components.json` for v4 needs `tailwind.config` blank (`""`) and `css` pointing at the real entry stylesheet (`src/index.css`); leftover `tailwind.config.*` and Vite's starter CSS fight the theme [V].
- motion-primitives install: `npm install motion`, a `cn` helper (`clsx` + `tailwind-merge`) in `lib/utils.ts`, `lucide-react`, then `npx motion-primitives@latest add <component>`; components are copied into your repo (you own and can edit them), and individual components may pull extra deps (e.g. measuring hooks) [V for the documented steps; per-component extra deps [?]]. The docs don't state a Tailwind version; many components/snippets were authored for Tailwind v3 and shadcn-v3-era variable names.
- Tailwind v4 renames/changes that make copy-pasted v3 snippets look subtly off: `shadow-sm`->`shadow-xs` (and `shadow`->`shadow-sm`), `rounded-sm`->`rounded-xs`, `outline-none`->`outline-hidden`, `bg-gradient-to-*`->`bg-linear-to-*`, default `ring` width 3px->1px, default border color `currentColor`, `@apply` in separate CSS files needs `@reference`, and the `tailwindcss-animate` plugin replaced by `tw-animate-css` in shadcn v4 setups [K for list; spot-check against the v4 upgrade guide].
- Tailwind v4 browser floor: Chrome 111, Safari 16.4, Firefox 128 [V]. Fine for a 2026 recruiter audience, but older iPhones (iOS < 16.4) get a broken, unstyled-looking page rather than graceful degradation. State this as a conscious decision.
- Bun and some package managers have reported shadcn CLI problems; use pnpm or npm [V via guide, single source, MEDIUM].
- shadcn is optional here: a portfolio needs few of its primitives. Installing the whole design-system scaffolding for 2-3 components adds theme-variable machinery you must then keep contrast-clean (Pitfall 5).

**How to avoid:**
- Follow the *current* Tailwind-v4 Vite install and shadcn Vite install in order: create Vite React-TS -> `tailwindcss @tailwindcss/vite` -> `@import "tailwindcss"` -> add alias in 3 places -> `@types/node` -> `shadcn init` -> confirm `components.json` -> then `motion-primitives add`.
- Prefer copying only the motion-primitives components actually used; review each for v3-isms and `transition-*` classes (Pitfall 2) at the time of adding, and record "owned and modified" in the doc.
- Do the install in a clean scaffold phase with a CI build and one rendered motion-primitives component as the acceptance test (proves path alias, CSS, and `motion` import all work in production build, not just dev).
- Define the theme tokens with `@theme` in CSS (single source), and dark mode with `@custom-variant dark (&:where(.dark, .dark *));` [V] or a `data-theme` variant, rather than the default media-query-only dark mode if a manual toggle is wanted.

**Warning signs:**
`shadcn init` says it can't find an import alias; styles missing in prod build only; components render with wrong radius/shadow/ring vs. the motion-primitives demo site; both `tailwind.config.js` and `@theme` exist.

**Phase to address:**
Scaffold phase.

---

## Moderate Pitfalls

### Pitfall 11: Font loading flash and layout shift

**What goes wrong:** Google Fonts `<link>` (as in v1's VT323) adds a render-blocking cross-origin request chain; `font-display: swap` shows fallback then swaps (FOUT + CLS when metrics differ, notably for a wide display face); `block` shows invisible text (hurts LCP). A playful display font plus Inter plus many weights multiplies this. The user wants alternatives to Inter, so the font will likely be a new, possibly less cache-warm font.
**Prevention:** Self-host via Fontsource (e.g. `@fontsource-variable/*`), Latin subset only, one variable file per family, <= 2 families. Preload only the critical woff2 (hashed filenames make this fiddly in Vite; import the font CSS in the entry and verify the `<link rel="preload" as="font" crossorigin>` target matches the hashed URL, or accept `swap` with a metric-matched fallback using `@font-face { src: local(Arial); size-adjust; ascent-override; ... }`). Use `font-display: swap` for body, `optional` for decorative display fonts that aren't the LCP. Never animate the heading text in at `opacity:0` waiting for the font.
**Warning signs:** visible reflow of the hero heading on reload; CLS attributed to text nodes; request waterfall shows font.css -> font.woff2.
**Phase:** Design tokens/type phase + Hardening.

### Pitfall 12: Dark-mode flash (FOUC) and theme transition glitches

**What goes wrong:** Theme set in a React effect/`ThemeProvider` runs after first paint, so dark-preference users see a white flash; global `transition-colors` makes the page visibly animate from light to dark on load; `color-scheme` and `<meta name="theme-color">` unset leaves a wrong browser chrome/scrollbar/overscroll color; employer logos (`capitalone.png`, `spectrum.png`, `symbotic.png`) may be dark-on-transparent and vanish on a dark background.
**Prevention:** Inline blocking script in `<head>` of `index.html` that sets the `dark` class (or `data-theme`) from `localStorage` falling back to `prefers-color-scheme`, exactly as Tailwind's docs prescribe [V]; set `color-scheme` and a media-query `theme-color` meta; style `html` background in plain CSS; add the transition class only *after* first paint (or only on explicit toggle); keep the toggle's initial UI state derived from the DOM class, not React state default; inspect all logos/images in both themes (give them a neutral chip/background or provide variants). Offer system/light/dark (three states), not just a toggle.
**Warning signs:** white flash on hard refresh in dark OS mode; toggle icon wrong on load; invisible logos.
**Phase:** Scaffold (script) + Design tokens phase.

### Pitfall 13: CLS and image weight from reused v1 assets

**What goes wrong:** Reused JPEGs of 270-570 KB are served as-is, without `width`/`height`, causing shifts and slow mobile loads; below-fold images eager-load and compete with LCP; animated "layout" changes that alter the box size (animating `height`, margins) register as layout shift when not user-initiated.
**Prevention:** Pipeline images at build (e.g. `vite-imagetools` or `sharp` script): AVIF/WebP + JPEG fallback, 1-3 widths, explicit intrinsic dimensions or `aspect-ratio`; `loading="lazy"` and `decoding="async"` below the fold; budget total page weight (suggest < 500 KB of images on first load). Animate with transform/opacity (or Motion `layout` which uses transforms), reserve space for anything that appears (skeleton/min-height). Remove unused template images from the migration (Pitfall 8).
**Warning signs:** Lighthouse CLS > 0.1; "Avoid enormous network payloads"; images popping in and pushing text.
**Phase:** Asset migration + Layout phase; Hardening.

### Pitfall 14: Main-thread and GPU cost of "tactile" effects on mid-range phones (INP, battery, thermal)

**What goes wrong:** `setState` on `pointermove`/scroll re-renders React per event (INP spikes); animating `width/height/top/left/box-shadow/filter: blur()`; large `backdrop-filter` or stacked blurs; `will-change: transform` on everything (memory, layer explosion); many simultaneously animating elements; infinite ambient loops running off-screen; scroll-linked JS effects on iOS (scroll events fire coarsely). Springs configured never to settle (very low friction) keep the rAF loop alive and drain battery.
**Prevention:** Drive pointer/scroll effects through Motion `useMotionValue`/`useTransform` or react-spring `useSpring` (they bypass React rendering), never component state. Animate only transform and opacity; use `will-change` sparingly and only during an interaction. Limit blur radius/area and test on a real mid-range Android. Pause off-screen loops (`useInView`/IntersectionObserver) and under reduced motion/hidden tab. Tune springs to settle (adequate damping; Motion `bounce` <= ~0.3, or `restDelta`). Profile in Chrome Performance with 4x CPU throttle and Safari's Timelines on a real iPhone.
**Warning signs:** Interaction latency > 200 ms in INP; frame drops in Performance panel; device warm after 30 s; React DevTools profiler shows renders on every pointermove.
**Phase:** Motion phase; Hardening.

### Pitfall 15: Accessibility basics lost under the animation layer

**What goes wrong:** Custom "playful" controls that are `div` + `onClick` (no keyboard, no role); drag-only interactions; focus indicator removed (`outline-none` in v4 is now `outline-hidden`, which keeps a forced-colors outline, but `outline-none` literally removes it); modal/drawer project details with no focus trap/Escape/return-focus; `AnimatePresence` exit animations leaving focus on a removed node or keeping removed content in the a11y tree; tap targets < 44x44 px on mobile (WCAG 2.5.8 AA minimum is 24 px; 44 px is the usual mobile target); decorative animated shapes read by screen readers; missing `lang`, landmarks, skip link, heading order broken by visual design; text over animated backgrounds.
**Prevention:** Use real `<button>`/`<a>`; visible `:focus-visible` ring meeting 3:1 in both themes (Pitfall 5); use a proven dialog primitive (Radix/shadcn Dialog) rather than hand-rolled; mark decorative layers `aria-hidden`; one `<h1>`, ordered headings; skip-to-content link; test with keyboard only and VoiceOver (iOS + macOS) once per milestone; run axe in dev. Note automated tools cover roughly a third of issues.
**Warning signs:** Can't tab to a control; focus ring invisible on indigo; VoiceOver reads "T, h, e, ..." for a split-text heading.
**Phase:** Layout/Motion phases for build; Hardening for audit.

### Pitfall 16: Scope trap: documentation-first and "try four tools" with no prototype feedback loop

**What goes wrong:** The brief mandates docs before code and exploration of four tools plus palette/font alternatives; docs can't tell you how a spring feels on a phone or whether a palette reads at 2 AM. Risk is months of decision docs and a late, rushed build, or a site that is a tool showcase rather than a portfolio. Content (recruiters' need) ships last.
**Prevention:** Time-box the doc phase; use throwaway HTML/React sketches (the project has sketch/spike workflows) to decide palette, type, and one signature interaction *on a phone*. Ship a content-complete, mostly-static v2 on staging early (all six sections, contact, resume), then layer motion. Define explicit "done" criteria per decision.
**Phase:** Planning/Design-doc phase; ordering in roadmap.

---

## Minor Pitfalls

### Pitfall 17: StrictMode double effects mislead animation debugging
Dev-only double-invoke of effects can run enter animations twice or double-register listeners (matchMedia, IntersectionObserver). Always return cleanups; judge animation from `vite preview` builds, not `vite dev`.

### Pitfall 18: Smooth scrolling and anchor behavior
`scroll-behavior: smooth` ignores nothing by default—gate it behind `motion-safe`. Anchor targets need `scroll-margin-top` for sticky nav. Don't add a JS smooth-scroll library (Lenis etc.) without testing iOS momentum scroll and reduced motion; it also fights browser find-in-page and anchor restoration.

### Pitfall 19: Over-importing icons/utilities
`lucide-react` named imports tree-shake; `import * as Icons` does not. Verify with the bundle visualizer.

### Pitfall 20: Pages cache and stale assets
GitHub Pages sends short cache lifetimes (about 10 min) and you cannot set headers [K]. Hashed filenames from Vite make this safe; do not reference un-hashed `public/` assets that change often (OG image: version the filename when changing).

### Pitfall 21: Private data in the repo
Public repo means source, commit history, and `.planning/` are public if committed to the Pages repo. Keep planning docs out of the deployed artifact (they're outside `dist`, fine) but decide deliberately whether `.planning/` is committed to the public cutover repo.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep both `motion` and react-spring "to try both" with no ownership rule | Satisfies brief | Double bundle, jank, confusing code | Only with a written ownership matrix and a measured keep/drop decision |
| Hard-coded `/images/...` paths | Works in dev | Breaks in staging project-site vs user-site | Never |
| Using `framer-motion` snippets from blogs alongside `motion` | Copy-paste speed | Duplicate lib in bundle, API drift | Never |
| Skip real-device testing until the end | Faster iteration | Gesture/perf rewrites | Only for the very first throwaway sketch |
| `transition-all` utility everywhere | Quick hover polish | Fights JS animation, animates layout props | Never on animated nodes; only `transition-colors` on static ones |
| Client-only SPA with no prerender/skeleton | Simplest build | Poor LCP, empty link previews | Acceptable if hero is lightweight static HTML shell + OG meta |
| Single indigo for both themes | One token | Dark-mode contrast failure | Never |
| Copying all v1 `images/` | Zero audit effort | 2.5 MB of unused weight, EXIF risk | Never |
| Skipping `404.html` | Less work | Raw GitHub 404 on bad URL | Only if no routes beyond `/` (still cheap to add) |
| Leaving Lighthouse until the end | More build time | Late perf redesign | Never; run it in CI from the scaffold phase |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GitHub Pages (user site) | Using project-site `base` from tutorials | `base: '/'` for `aa-phan.github.io`; configurable via env for staging [V] |
| GitHub Pages source | Switching to Actions without a successful deploy ready | Rehearse in staging repo; switch + deploy in one sitting; rollback plan |
| GitHub Actions | Copying stale workflow (deprecated artifact versions, `gh-pages` branch pushes) | Use the current Vite static-deploy workflow; pin Node >= 20.19 |
| Custom domain | Relying on `CNAME` file when source = Actions | Set domain in Settings, keep `public/CNAME` too, verify DNS/HTTPS after switch [V] |
| shadcn CLI | Running `init` before alias is in root tsconfig | Alias in 3 places first [V] |
| motion-primitives | Assuming v3-era snippets match Tailwind v4 | Review each copied component; test in prod build |
| react-spring | Assuming React 19 works on v9 | Use v10 (React 19 support); check peer deps with `npm view @react-spring/web peerDependencies` [V partial] |
| Motion | Assuming `MotionConfig reducedMotion` covers everything | It covers Motion only; transform/layout off, opacity/color kept [V] |
| Google Fonts | Runtime `<link>` to googleapis | Self-host with Fontsource |
| LinkedIn/iMessage previews | Setting OG tags with JS or relative image URLs | Static absolute-URL OG tags in `index.html` |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Hero at `opacity:0` until JS animates | Late LCP, blank first paint | Visible-by-default hero; static shell | Immediately on throttled mobile (Slow 4G) |
| Full `motion` + react-spring in entry chunk | Large JS, slow TTI | LazyMotion/`m`, lazy-load signature interactions, budget | Mid-range Android, > ~150 kB gzip entry |
| React state on pointermove/scroll | High INP, dropped frames | Motion values / springs outside React | Any touch device with multiple animated elements |
| Unoptimized reused JPEGs | LCP and data cost | AVIF/WebP + srcset + dimensions | Cellular networks |
| Blur/backdrop-filter stacks | Jank, thermal throttle | Limit area/radius; test real devices | Older/mid-range phones |
| Infinite ambient loops | Battery drain, jank when scrolling | Pause off-screen/hidden/reduced-motion | Long sessions; low-power mode |
| Per-character split text for long copy | DOM bloat, slow reveal | Use only for short headings | > ~60 characters animated |
| Custom fonts w/ many weights | FOUT/CLS, extra requests | 1-2 variable files, subset, metric fallback | First visit, cold cache |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| EXIF/GPS left in reused photos (`about-dj.jpg`) | Leaks location/device | Strip metadata on re-encode (LOW-MEDIUM) |
| Plain-text email in HTML | Spam scraping | Accept, or use a contact link pattern; no backend form (out of scope) (LOW) |
| Secrets/`.env` or analytics keys committed to a public repo | Exposure | `.gitignore` first; only `VITE_`-prefixed public values in client code (anything `VITE_*` is public) |
| Third-party scripts/embeds | Tracking, perf, CSP impossible on Pages | Avoid; if needed, self-host and `rel="noopener noreferrer"` on external links |
| Force-pushing live repo | Lost history | Additive cutover; tag first |
| Outdated npm deps via copied components | Supply-chain/vuln noise | Lockfile, `npm audit` in CI, Dependabot |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Playful nav metaphor hides sections (v1 iPod pattern) | Recruiters can't find info quickly | Plain, persistent nav; play in the content, not the wayfinding |
| Resume/contact not visible on first screen on mobile | Lost conversions | Sticky/bottom contact + resume link |
| Reveal-on-scroll leaves blanks when scrolling fast | Content missed, looks broken | Default-visible, `once`, small `amount` |
| Hover-only affordances | Invisible on touch | `active`/focus equivalents; always-visible cues |
| Long intro animation / preloader | Bounce | None, or <= 300 ms and skippable |
| Dark-only or light-only | Eye strain / mismatch | System default + toggle |
| Dense tiny text over playful backgrounds | Illegible | Solid surfaces under body text; 16 px+ body |
| Projects without outbound links or outcomes | Recruiters can't verify | Each project: one-line outcome, stack, links |
| Skills/Education given heavy visuals | Wastes attention | Lighter treatments (as planned) |

## "Looks Done But Isn't" Checklist

- [ ] **Reduced motion:** Toggle OS setting; confirm Motion, react-spring, CSS keyframes, smooth scroll and ambient loops all calm down.
- [ ] **Dark mode:** Hard-refresh in dark OS mode (no white flash); contrast table passes for every token pair incl. focus ring and employer logos.
- [ ] **Mobile:** Tested on a real iPhone Safari + mid-range Android; scrolling never blocked by a draggable; `svh/dvh` used; no hover-only content.
- [ ] **Performance:** Lighthouse mobile (throttled) LCP < 2.5 s, CLS < 0.1, INP < 200 ms in CI; entry JS under budget; images next-gen with dimensions.
- [ ] **Deployment:** Staging (project-site base) and production (user-site base `/`) both load assets; Pages source = GitHub Actions; `404.html` present; no case-sensitivity errors on Linux.
- [ ] **Link previews:** LinkedIn Post Inspector / iMessage show title, description, image.
- [ ] **No-JS / slow-JS:** Name, role, and contact visible in raw HTML or within the first paint.
- [ ] **Keyboard + screen reader:** Full tab order, visible focus, dialogs trap/restore focus, split-text headings read as words.
- [ ] **Cutover safety:** `v1-ipod` tag/branch exists on remote; `main` history intact; rollback steps written and rehearsed.
- [ ] **Assets:** Only used assets migrated; EXIF stripped; no `.DS_Store`/`.sass-cache` in repo or `dist`.
- [ ] **Bundle:** Visualizer shows one animation-lib strategy (documented), no `framer-motion` duplicate.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Live site broken after cutover | LOW | Set Pages source back to branch + revert cutover commit (or restore from `v1-ipod`); redeploy |
| Force-push wiped history | HIGH | Recover from local clone `../aa-phan.github.io` (has all 16 commits) or GitHub reflog/support; push to restore |
| Two animation libs jank | MEDIUM | Apply ownership matrix; replace react-spring usage with Motion springs; remove Tailwind transitions on animated nodes |
| Dark-mode contrast failures | LOW-MEDIUM | Introduce per-theme tokens; re-run contrast table; adjust components using raw palette colors |
| Poor LCP from hidden hero | MEDIUM | Make hero visible by default; add static shell/prerender; preload hero image |
| Wrong base path / broken assets | LOW | Set `base`, replace literals with imports/`BASE_URL`, redeploy |
| Case-sensitivity break | LOW | `git mv` to correct case; add lint rule |
| Gesture/scroll conflicts found late | HIGH | Replace JS drag with native scroll-snap or press-based interaction; limit drag to small objects |
| EXIF leaked | LOW (but public history) | Re-encode, replace file; history retains old blob (rewrite only if sensitive) |

## Pitfall-to-Phase Mapping

Phase names below are suggestions for the roadmapper; map to actual phases as defined.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1 Pages source / live site downtime | Cutover (rehearsal in Scaffold) | Staging deploy green; cutover checklist; rollback tested on throwaway repo |
| 2 Two animation libs | Design-doc (ownership), Scaffold (budget), Motion | Bundle visualizer; grep for Tailwind transitions on animated nodes; ownership matrix reviewed |
| 3 Reduced motion | Scaffold (provider), Motion, Hardening | OS toggle test per interaction |
| 4 Hidden hero / empty shell / OG | Scaffold, Layout, Hardening | Lighthouse LCP; no-JS view; link-preview inspector |
| 5 Contrast | Design tokens | Committed contrast table; axe pass; manual dark-mode review |
| 6 Touch/scroll conflicts | Motion/Interaction, Hardening | Real-device matrix |
| 7 Over-animation / recruiter usability | Requirements/Design-doc, Layout, Motion, Hardening | 10-second test; skim test with 3-5 people |
| 8 Overwriting live repo / junk / EXIF | Asset migration, Cutover | Remote history count; `dist` contents; `exiftool` clean |
| 9 Pages path/routing/case | Scaffold, Cutover | Both-base builds; Linux CI; post-deploy smoke test |
| 10 Tailwind v4/shadcn/motion-primitives install | Scaffold | Prod build renders one motion-primitives component with correct styles |
| 11 Font loading | Design tokens/type, Hardening | CLS attribution; waterfall |
| 12 Dark-mode flash | Scaffold, Design tokens | Hard-refresh test; logos in both themes |
| 13 Images/CLS | Asset migration, Layout | Lighthouse; image budget |
| 14 Main-thread/GPU cost | Motion, Hardening | Throttled profile; INP |
| 15 Accessibility basics | Layout, Motion, Hardening | Keyboard + VoiceOver + axe |
| 16 Docs-first scope trap | Planning | Time-boxed docs; staging content-complete before motion polish |

Suggested ordering implication: put the **deploy pipeline + theme/reduced-motion providers + budgets** in the first build phase (walking skeleton on staging), **content-complete static layout** second, **motion layer** third, **hardening/audit** fourth, **cutover** last. Phases flagged for deeper phase-specific research: Motion/Interaction (iOS gesture behavior on current iOS, WebKit bug status), Scaffold (prerender/static-shell option for Vite, motion-primitives per-component deps and Tailwind v4 compatibility), Cutover (Pages source-switch downtime behavior).

## Sources

- Motion docs, reduce bundle size (`motion` ~34 kB, `m`+LazyMotion ~4.6 kB, `domAnimation` +15 kB, `domMax` +25 kB, `strict`): https://motion.dev/docs/react-reduce-bundle-size (HIGH, official)
- Motion docs, accessibility / `MotionConfig reducedMotion="user"` disables transform/layout, keeps opacity/color: https://motion.dev/docs/react-accessibility (HIGH, official)
- react-spring docs, `useReducedMotion` and `Globals.assign({ skipAnimation })`: https://www.react-spring.dev/docs/utilities/use-reduced-motion (HIGH, official); v10 adds React 19 support (changelog via search, MEDIUM)
- Vite static deploy guide (base `/` for user site, `/<repo>/` for project site, Actions workflow outline): https://vite.dev/guide/static-deploy.html (HIGH, official)
- Tailwind v4 compatibility (Chrome 111, Safari 16.4, Firefox 128): https://tailwindcss.com/docs/compatibility (HIGH, official)
- Tailwind dark mode (`@custom-variant dark`, inline head script to avoid FOUC): https://tailwindcss.com/docs/dark-mode (HIGH, official)
- motion-primitives installation (`npm install motion`, `cn` helper, `lucide-react`, `npx motion-primitives@latest add`): https://motion-primitives.com/docs/installation (HIGH, official; no Tailwind version stated)
- shadcn + Tailwind v4 + Vite setup gotchas (alias in 3 places, `components.json` `config: ""`, Vite plugin not PostCSS, Node 20.19+): https://shadcnstudio.com/blog/how-to-set-up-shadcn-with-tailwind-4-using-vite/ and https://docs.lottiefiles.com/en/creator-plugins/ui-library/installation/registry (MEDIUM, community guides; official shadcn Vite page may show v3 flow, https://ui.shadcn.com/docs/installation/vite)
- GitHub Pages custom domain with Actions (CNAME ignored; docs inconsistent): https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site and https://github.com/github/docs/issues/36593 (MEDIUM-HIGH)
- GitHub Pages SPA 404 behavior and `404.html` redirect trade-offs (status code stays 404): https://dev.to/lico/handling-404-error-in-spa-deployed-on-github-pages-246p (MEDIUM, community)
- iOS Safari `touch-action: pan-y` vs horizontal gesture turning into vertical scroll: https://bugs.webkit.org/show_bug.cgi?id=232545 and https://lists.w3.org/Archives/Public/public-pointer-events/2019JulSep/0068.html (MEDIUM; current iOS status unverified, test on device); Motion drag docs https://motion.dev/docs/react-drag
- Local verification this session: `/Users/aphan/aa-phan.github.io` git state, file sizes, `core.ignorecase=true`; WCAG 2.x contrast ratios computed with the standard relative-luminance formula (HIGH)

---
*Pitfalls research for: animation-heavy playful React portfolio on GitHub Pages (mobile-first, recruiter-facing)*
*Researched: 2026-10-08*
