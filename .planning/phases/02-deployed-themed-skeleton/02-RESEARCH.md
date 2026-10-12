# Phase 2: Deployed Themed Skeleton - Research

**Researched:** 2026-10-09
**Domain:** Vite 8 + React 19 + TypeScript 6 + Tailwind v4 static SPA on GitHub Pages; CSS-variable theming; dual animation-library reduced-motion plumbing; CI quality gates
**Confidence:** HIGH (the riskiest claims were verified by building and testing a throwaway probe app in the scratchpad: build, bundle size, lint boundaries, contrast script, Playwright smoke, Vitest)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Repo and first deploy**
- **D-01:** Phase 2 includes creating the GitHub repo `aa-phan-portfolio-v2`, pushing `main`, setting Pages source to GitHub Actions and deploying staging. Follow `docs/deploy-runbook.md` "First staging deploy". Repo creation and the Pages setting are user-run checkpoint steps. Run the OD-01 phone-number history guard search before any push and stop if it prints anything.
- **D-02:** Repo visibility is public.
- **D-03:** Workflows follow the runbook: ci.yml on push/PR, deploy.yml on push to `main` plus `workflow_dispatch`, actions pinned by commit SHA with the version in a comment. `VITE_BASE` is env-driven (`/aa-phan-portfolio-v2/` for staging).

**Skeleton hero**
- **D-04:** Ship the real hero (name as h1, role line "Software engineer building cloud-native backends in Go.", three CTAs in the HERO-03 order from the content inventory) plus empty, labelled, anchored section stubs for the seven registry anchors so CTAs have targets. No nav in this phase.
- **D-05:** CTAs are real links: Resume links to the PDF (placeholder file if the real one is not yet copied in; never a file containing the phone number), Copy email is a `mailto:` link for now, Contact jumps to `#contact`. Phase 3 upgrades copy-email and adds the toast. CTA tap targets at least 44 px.
- **D-06:** Hero name, role and CTAs are in the static HTML and visible with JavaScript disabled (NAV-01).

**Theme toggle**
- **D-07:** Two-state light/dark toggle. First visit follows `prefers-color-scheme`; once the user toggles, the choice is stored in localStorage and wins. Inline head script sets `data-theme` before first paint (no flash). All storage access wrapped in try/catch.
- **D-08:** The toggle sits fixed in the top-right corner in Phase 2; Phase 3 moves it into the sticky nav and pill menu. Thumb animation is react-spring (IX-10) and snaps with reduced motion.

**Reduced-motion proof**
- **D-09:** Vendor motion-primitives `TextEffect` (into `src/components/motion-primitives/`) and render it on the hero role line (IX-01). It must never delay name, role or CTAs. With reduce-motion the role line is static text. The theme toggle thumb (react-spring) also reads the same preference source, so both libraries are proven to honor `useMotionPreference`.

**CI gates and tests**
- **D-10:** Required CI steps: typecheck, lint (with import-boundary rules for FND-04), build, path-case check, 150 kB gz JS budget.
- **D-11:** Additional CI gates chosen: contrast check run against the real token files (DSN-02), Prettier check with `prettier-plugin-tailwindcss`, and tests.
- **D-12:** Tests are Vitest unit tests (motion preference hook, theme logic) plus a small Playwright smoke run against the built output: hero present with JS disabled, no theme flash, reduced-motion shows all content. Full Playwright/axe suites are Phase 6. Lighthouse CI is not added in Phase 2.

**Locked by Phase 1 (carry forward, do not re-decide)**
- **D-13:** Palette A (tuned seed indigo), Inter variable only via `@fontsource-variable/inter` (`wght.css`), one font family. Tokens per `01-DESIGN-TOKENS.md` "Chosen system" (5 role tokens plus derived tokens, `@theme inline` mapping, no `dark:` variants in components).
- **D-14:** Folder structure, layering and import rules per `docs/architecture.md`; TypeScript 6.0.x (ADR-0004); stack versions per `.claude/CLAUDE.md`.

### Claude's Discretion
Scaffold details (create-vite template adjustments), exact lint tool config for the boundary rules, JS budget script implementation, path-case check implementation, placeholder resume handling, stub section markup, Vitest/Playwright config.

### Deferred Ideas (OUT OF SCOPE)
- Lighthouse CI thresholds, full Playwright/axe/VoiceOver suites: Phase 6.
- Three-state system/light/dark toggle, visible reduce-motion toggle (OD-09): later.
- Token showcase page: not now.
- Nav, copy-email toast, real content: Phase 3.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FND-01 | Vite + React + TS + Tailwind v4 builds and deploys via GitHub Actions to the project URL, env-driven `base` | Probe build with `VITE_BASE=/aa-phan-portfolio-v2/` rewrote every asset URL and `%BASE_URL%` in HTML; workflow YAML with SHA-pinned actions below; Pages is NOT yet enabled on the remote (see Key Finding 1) |
| FND-02 | Linux CI runs typecheck, lint, build, path-case check | `npm run verify` composite script; path-case script prototype (fails on a wrong-case import, passes otherwise) |
| FND-03 | Initial JS <= 150 kB gz, CI-enforced | Budget script prototype parses `dist/index.html`; measured 86.2 kB with lazy TextEffect vs 136.5 kB eager |
| FND-04 | Layered imports enforced by lint | oxlint `no-restricted-imports` + `overrides` verified: blocks static AND dynamic imports of `motion/react` / `@react-spring/web` outside `anim/` and `motion-primitives/`; blocks deep `@/anim/*` imports |
| DSN-01 | Palette and type delivered as light and dark token sets | `tokens.css` built verbatim from the chosen palette A (Phase 1); Inter via Fontsource |
| DSN-02 | Contrast matrix covers every pair in both themes at WCAG 2.2 AA | CSS-parsing checker reproduced all 38 Phase 1 ratios from a real `tokens.css`; extra pairs for the toggle also pass |
| DSN-03 | Toggle light/dark, default to system, no flash | Inline head script verified by Playwright with the app bundle blocked; localStorage override verified |
| DSN-04 | Fonts self-hosted, at most 2 families | `@fontsource-variable/inter/wght.css` only; Playwright same-origin request assertion |
| MOT-01 | One motion-preference source drives motion, react-spring and a CSS guard; all content visible with motion off | Provider + hook verified in Vitest and Playwright (spring thumb snaps to translateX 20 immediately under reduce, animates under no-preference) |
| NAV-01 | Hero name, role, CTAs in a static shell visible without JS | Static shell inside `#root` of `index.html`; Playwright with `javaScriptEnabled: false` passes |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

Source: `/Users/aphan/aa-phan-portfolio-v2/.claude/CLAUDE.md` and the user's auto-memory. Treat as locked.

- Stack: Vite + React + TypeScript + Tailwind v4; hosting is GitHub Pages (static output only, Actions workflow).
- Use versions from the CLAUDE.md stack table: `motion ~14.0.0` (import from `motion/react` only, never raw `framer-motion`), `@react-spring/web ~10.1.2` (never the `react-spring` umbrella, never the v11 beta), Tailwind `^4.3.3` + `@tailwindcss/vite`, `@vitejs/plugin-react ^6.1.2`, `vite ^8.3.4`, TypeScript `~6.0.3`, `clsx ^2.1.1`, `tailwind-merge ^3.7.0`.
- Do NOT use: `shadcn init`, `tailwind.config.js`, `@tailwind base/components/utilities`, `@custom-variant hover (&:hover)` (v3 hover behaviour), `@use-gesture/react` by default, hard-coded absolute asset paths, both libraries animating the same element or property, `useTransition` in core UI.
- `@` alias in BOTH `vite.config.ts` (`resolve.alias`) and `tsconfig.app.json` (`paths`), without `baseUrl` (ADR-0004).
- Fonts: `import '@fontsource-variable/inter/wght.css'` in `main.tsx`; at most 2 families.
- `prefers-reduced-motion` respected; mobile must be excellent; hover styles rely on Tailwind v4 `hover:` gating.
- Process: documentation before code; the phone number must never appear anywhere on the site, including the PDF, meta, JSON-LD, OG data (also in auto-memory: "never publish phone number; resume PDF is source of truth").
- GSD workflow enforcement: file edits happen through a GSD command (`/gsd-execute-phase` for this work).
- No project skills directory content found (CLAUDE.md "Project Skills: none").

## Summary

Phase 2 is a greenfield scaffold into a repo root that already holds `docs/`, `.planning/` and `.claude/`. All the load-bearing mechanisms were prototyped end to end in a throwaway Vite 8 app (create-vite 9.2.1 template, then the real stack pinned): production build with an env-driven base, bundle measurement, oxlint boundary rules with negative fixtures, a CSS-parsing contrast checker, a JS-budget script, a path-case script, Vitest unit tests and Playwright smoke tests (JS disabled, no theme flash, reduced motion, spring thumb snapping). Everything the phase needs works with the Phase 1 decisions as written. The approach is conventional; the value of this research is the concrete configs and the six surprises listed in Key Findings.

The JS budget risk flagged in STATE.md is retired by one decision: lazy-load the vendored `TextEffect` (and therefore the full `motion` component runtime) behind `React.lazy` inside `src/anim/`. Initial JS drops from 136.5 kB gz (eager) to 86.2 kB gz, leaving about 64 kB of headroom for Phase 3 content and the nav, while the role line stays visible in static HTML and the effect plays when the chunk arrives. `MotionConfig` stays in the entry chunk (it is cheap) so there is still exactly one preference source.

**Primary recommendation:** Scaffold at the repo root with `oxlint` (scaffold default, kept) as the only linter, drive everything through one `npm run verify` script used by both workflows, put the hero in a static HTML shell inside `#root` with a parity test, lazy-load TextEffect from `src/anim/`, and write `src/styles/tokens.css` so a Node script can parse it for the contrast gate. Do the Pages-source checkpoint BEFORE the first push of workflow files.

### Key Findings (read first)

1. **The remote repo already exists and has `main` pushed** [VERIFIED: `gh repo view` this session: `{"isEmpty":false,"visibility":"PUBLIC","url":"https://github.com/aa-phan/aa-phan-portfolio-v2","pushedAt":"2026-10-09T20:31:42Z"}`; `git remote -v` shows `origin https://github.com/aa-phan/aa-phan-portfolio-v2.git`; `origin/main` is `7ca940b`]. Pages is NOT enabled (`gh api repos/aa-phan/aa-phan-portfolio-v2/pages` returns HTTP 404 "Not Found"). So D-01's "create the repo, push main" is already done; what remains is the Pages-source checkpoint, then pushing Phase 2 code. The OD-01 guard search was re-run this session and printed nothing (0 lines for `git log --all -G'[0-9]{3}[-. )]+[0-9]{3}[-.][0-9]{4}' -E --oneline`; `git grep` over the working tree is also empty).
2. **The public repo contains `.planning/` and `.claude/`** [VERIFIED: `gh api repos/aa-phan/aa-phan-portfolio-v2/contents` lists `.claude`, `.gitignore`, `.planning`, `docs`]. That contradicts REQUIREMENTS.md "Out of Scope: `.planning/` and `references/` in the public repo" and ADR-0001 ("The planning area and the reference folder ... never go into the public site repo"). The deploy workflow only publishes `dist/`, so nothing private is *served*, but it is browsable on GitHub. Needs a user decision (Open Question 1). Not a Phase 2 blocker.
3. **Lazy TextEffect cuts initial JS from 136.5 kB to 86.2 kB gz** (measured, table below). Without it the 150 kB cap leaves only about 13 kB for all of Phase 3.
4. **oxlint alone enforces FND-04.** `no-restricted-imports` with `paths` + `patterns` and file `overrides` works in oxlint 1.87.0, including `import()` expressions. No ESLint, no `eslint-plugin-boundaries` needed (the architecture doc's "boundaries plugin" wording can be corrected). Overrides REPLACE rule options rather than merging, so put every restriction in the global rule and only switch it `off` in `anim/**`.
5. **Tailwind v4 auto source detection scans `docs/` and `.planning/` markdown** and emits utilities for class-like words found there (probe: `bg-accent` in a markdown file generated `.bg-accent`). Use `@import 'tailwindcss' source(none);` plus explicit `@source` lines [VERIFIED in probe: bogus class disappeared, real classes and the `index.html` shell classes remained].
6. **motion 14.1.0 was published today (2026-10-09T19:38Z)**; keep `~14.0.0` (14.0.0, published 2026-10-02, was exercised in the probe: `tsc -b` clean, build clean, no warnings, depends on `framer-motion 14.0.0`). Do not let `npm install motion` float to 14.1.x.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Hero first paint with JS off (name, role, CTAs, anchors) | CDN / Static (`index.html`) | Browser (React replaces it on mount) | NAV-01 must hold with no script; the HTML is the contract |
| Theme selection before first paint | Browser (inline head script) | Browser (React toggle on user action) | Must run synchronously before CSS paints; React is too late |
| Theme tokens and derived colors | CDN / Static (CSS in the bundle) | — | Pure CSS variables; no runtime cost |
| Reduced-motion preference | Browser (`matchMedia` via one hook) | CSS guard (`@media`) | One source feeds motion, react-spring and CSS |
| Role-line text effect | Browser (lazy chunk) | CDN / Static (static text fallback) | Decoration only; must never gate content |
| Theme toggle thumb physics | Browser (react-spring in `anim/`) | — | IX-10; the only animated element is the thumb |
| Contrast, budget, case, boundary gates | CI (Linux runner) | Local `npm run verify` | Build-time enforcement; nothing at runtime |
| Hosting and deploy | GitHub Pages via Actions | — | Static output only |
| Resume file | CDN / Static (`public/resume.pdf`) | — | URL-stable file; placeholder this phase |

## Standard Stack

### Core (all versions confirmed with `npm view` this session; installable together in the probe)

| Library | Version to pin | Purpose | Why Standard |
|---------|---------------|---------|--------------|
| vite | `^8.3.4` (8.3.4, published 2026-10-08) | Build/dev | Locked by CLAUDE.md. Engines `^20.19.0 \|\| >=22.12.0` [VERIFIED: npm view vite@8.3.4 engines] |
| react / react-dom | `^19.3.0` (19.3.0) | UI | Locked |
| typescript | `~6.0.3` (6.0.3; `latest` is 7.0.2, do NOT float) | Types | ADR-0004. create-vite 9.2.1 template pins `~6.0.2`, bump to `~6.0.3` |
| @vitejs/plugin-react | `^6.1.2` | React transform | Locked; peer `vite ^8` |
| tailwindcss + @tailwindcss/vite | `^4.3.3` (4.3.3) | Styling | Locked; CSS-first |
| motion | `~14.0.0` (14.0.0; 14.1.0 exists, hours old, avoid) | Declarative animation | Locked; `motion/react` only |
| @react-spring/web | `~10.1.2` (10.1.2) | Spring physics | Locked |
| clsx / tailwind-merge | `^2.1.1` / `^3.7.0` | `cn()` for vendored primitives | Required by `@/lib/utils` in motion-primitives |
| @fontsource-variable/inter | `^5.3.0` (5.3.0) | Self-hosted Inter | Locked (D-13) |

Not needed in Phase 2: `lucide-react` (TextEffect does not import it; the toggle can use inline SVG or no glyph), `vite-imagetools` and `sharp` (Phase 3 images), `lenis` (Phase 4). Do not install them yet; each adds bytes or an install script.

### Supporting (dev)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| oxlint | scaffold's `^1.81.0` resolves to 1.87.0 | Lint + import boundaries | `npm run lint` (kept from scaffold per CLAUDE.md) |
| vitest | `^5.0.3` (engines `^22.12 \|\| ^24 \|\| >=26`) | Unit tests | Motion preference hook, theme script, token/palette, parity, boundary negative test |
| jsdom | `^30.1.2` | Vitest environment | Hook + theme-script tests |
| @testing-library/react | `^16.3.3` | `renderHook`/`render` | Hook and hero parity tests |
| @playwright/test | `~1.64.0` (1.64.0; browser = Chromium 156, revision 1248) | Smoke e2e | JS-off, no-flash, reduced-motion, same-origin fonts |
| prettier + prettier-plugin-tailwindcss | `^3.9.9` / `^0.8.1` | Format check (D-11) | Needs `tailwindStylesheet` option for Tailwind v4 (verified working) |
| @types/node | `^24` (scaffold default, 24.19.2) | `vite.config.ts` path/alias | Matches Node 24 LTS |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| oxlint-only boundaries | ESLint 10 + typescript-eslint + eslint-plugin-boundaries 7.2.0 | Heavier toolchain, second linter next to the scaffold's oxlint; no capability the phase needs. Rejected. |
| Static shell in `index.html` | Build-time prerender (`vite build --ssr` + `renderToString` + `hydrateRoot`) | Single source of truth, but needs an SSR entry, hydration-safe theme/motion hooks, and is OD-07 ("full prerender: late, optional"). Revisit later; the parity test makes the shell safe now. |
| Lazy TextEffect | Eager import | Simpler, but 136.5 kB gz initial (13.5 kB headroom). Rejected. |
| Own gzip-measuring script | `vite-bundle-visualizer`, `bundlesize` packages | New dependencies for a 20-line script. Rejected. |

**Installation (after the supply-chain checkpoint):**
```bash
npm install react@^19.3.0 react-dom@^19.3.0 motion@~14.0.0 @react-spring/web@~10.1.2 \
  clsx@^2.1.1 tailwind-merge@^3.7.0 @fontsource-variable/inter@^5.3.0
npm install -D vite@^8.3.4 @vitejs/plugin-react@^6.1.2 typescript@~6.0.3 tailwindcss@^4.3.3 \
  @tailwindcss/vite@^4.3.3 oxlint @types/node@^24 @types/react @types/react-dom \
  vitest@^5.0.3 jsdom @testing-library/react@^16.3.3 @playwright/test@~1.64.0 \
  prettier prettier-plugin-tailwindcss
```

**Version verification (npm view, 2026-10-09):** vite 8.3.4, react 19.3.0, typescript 7.0.2 latest / 6.0.3 on the 6.0 line, @vitejs/plugin-react 6.1.2, tailwindcss 4.3.3, @tailwindcss/vite 4.3.3, motion 14.1.0 latest / 14.0.0 pinned, @react-spring/web 10.1.2, clsx 2.1.1, tailwind-merge 3.7.0, lucide-react 1.54.0 (not used), @fontsource-variable/inter 5.3.0, vitest 5.0.3, jsdom 30.1.2, @testing-library/react 16.3.3, @playwright/test 1.64.0, oxlint 1.87.0, prettier 3.9.9, prettier-plugin-tailwindcss 0.8.1, create-vite 9.2.1.

### Measured bundle (probe, Vite 8.3.4, production, `VITE_BASE=/aa-phan-portfolio-v2/`)

| Variant | Initial JS gz (Vite reporter) | Own script (gzip level 9, entry + modulepreload) |
|---------|-------------------------------|--------------------------------------------------|
| Eager `TextEffect` + `MotionConfig` + react-spring thumb | 136.52 kB | 134.5 kB |
| **Lazy `TextEffect` (recommended)** | entry 86.83 kB + runtime 0.36 kB; lazy chunk 50.72 kB | 86.2 kB (85,874 B + 368 B) |

CSS is 3.6 to 3.75 kB gz and is not part of the JS budget. Define the budget as **150,000 bytes** (kB = 1000, same unit as Vite's reporter and STACK.md) of gzip-level-9 over the module script plus every `<link rel="modulepreload">` in `dist/index.html`. Dynamic-import chunks are by construction not initial.

## Package Legitimacy Audit

Run: `gsd-tools query package-legitimacy check --ecosystem npm ...` on 2026-10-09. Every package is a long-established mainstream package named in the project's own stack decisions (CLAUDE.md, architecture.md) or in official docs. No `SLOP` verdicts. The `SUS` verdicts below are all reason `too-new` (the **latest release** was published within the last two weeks, a recency heuristic, not package age) or `unknown-downloads` (the `@types/*` packages), and none has a postinstall script (checked `npm view <pkg> scripts.postinstall` for vite, @vitejs/plugin-react, motion, oxlint, vitest: all empty).

| Package | Registry | Latest publish | Downloads/wk | Source Repo | Verdict | Disposition |
|---------|----------|---------------|--------------|-------------|---------|-------------|
| react, react-dom | npm | 2026-09-09 | 186M / 175M | github.com/react/react | OK | Approved |
| typescript | npm | 2026-07-08 | 304M | microsoft/TypeScript | OK | Approved |
| tailwindcss, @tailwindcss/vite | npm | 2026-07-16 | 135M / 49M | tailwindlabs | OK | Approved |
| @react-spring/web | npm | 2026-06-24 | 5.2M | pmndrs/react-spring | OK | Approved |
| clsx | npm | 2024-04-23 | 127M | lukeed/clsx | OK | Approved |
| @fontsource-variable/inter | npm | 2026-07-19 | 4.5M | fontsource | OK | Approved |
| @testing-library/react | npm | 2026-08-27 | 68M | testing-library | OK | Approved |
| prettier-plugin-tailwindcss | npm | 2026-07-15 | 9.7M | tailwindlabs | OK | Approved |
| vite | npm | 2026-10-08 | 194M | vitejs/vite | SUS (too-new) | Flagged, see checkpoint |
| @vitejs/plugin-react | npm | 2026-10-05 | 97M | vitejs/vite-plugin-react | SUS (too-new) | Flagged |
| motion | npm | 2026-10-09 (14.1.0; pinned 14.0.0 is 2026-10-02) | 24M | motiondivision/motion | SUS (too-new) | Flagged |
| tailwind-merge | npm | 2026-09-12 | 87M | dcastil/tailwind-merge | SUS (too-new) | Flagged |
| vitest, jsdom | npm | 2026-09-30 / 2026-10-04 | 122M / 111M | vitest-dev / jsdom | SUS (too-new) | Flagged |
| @playwright/test | npm | 2026-10-07 | 73M | microsoft/playwright | SUS (too-new) | Flagged |
| oxlint | npm | 2026-10-05 | 25M | oxc-project | SUS (too-new) | Flagged |
| prettier | npm | 2026-09-23 | 139M | prettier/prettier | SUS (too-new) | Flagged |
| @types/node, @types/react, @types/react-dom | npm | 2026-09-09 to 10-09 | 456M / unknown / unknown | DefinitelyTyped | SUS (too-new / unknown-downloads) | Flagged |

**Packages removed due to SLOP verdict:** none.
**Packages flagged SUS:** vite, @vitejs/plugin-react, motion, tailwind-merge, vitest, jsdom, @playwright/test, oxlint, prettier, @types/node, @types/react, @types/react-dom. **Planner: insert ONE consolidated `checkpoint:human-verify` before the first `npm install`** (confirm the list above against the stack table, review the generated lockfile, run `npm audit`, confirm no `postinstall` in the lockfile's `hasInstallScript` entries beyond the known `fsevents`). One checkpoint is proportionate because every flagged package is on the project's own approved list and the flag is release recency.

Install-script note: npm 11.19.1 prints `install-scripts ... fsevents@2.3.3` warnings; they are warnings only and `npm ci` still succeeds. `sharp` (Phase 3) will need `npm install-scripts approve`.

## Architecture Patterns

### System Architecture Diagram

```text
                         BUILD (Linux CI and local `npm run verify`)
 src/**, index.html, public/ ──> typecheck (tsc -b) ──> oxlint (+ boundary rules)
        │                                  │
        │                       prettier --check, vitest (unit)
        ▼
 check:colors (no raw hex) ─> check:case ─> check:contrast (parses src/styles/tokens.css)
        ▼
 vite build (VITE_BASE) ──> dist/ ──> check:budget (initial JS gz <= 150,000 B)
                                  └─> check:no-phone ──> playwright smoke vs `vite preview`
                                                              │ (JS off | no-flash | reduced motion)
        ▼ (main only)
 upload-pages-artifact(dist) ──> deploy-pages ──> https://aa-phan.github.io/aa-phan-portfolio-v2/

                         RUNTIME (browser)
 HTML request ─> <head>: inline theme script sets <html data-theme> (sync, before CSS paints)
             ─> CSS (tokens.css + tailwind) paints static hero shell in #root (works with JS off)
             ─> entry JS (React + MotionPreferenceProvider + react-spring toggle)
                  ├─ createRoot replaces shell with identical React hero
                  ├─ useMotionPreference (matchMedia, live) ─┬─> MotionConfig reducedMotion
                  │                                          ├─> Globals.assign({skipAnimation})
                  │                                          └─> RoleLine: reduced ? static <p> : lazy TextEffect
                  └─ ThemeToggle click ─> set data-theme + localStorage (try/catch) ─> spring thumb
 lazy chunk (~51 kB gz): vendored TextEffect + motion runtime, requested after first paint
```

### Recommended Project Structure (repo root, additive to `docs/`, `.planning/`, `.claude/`)

```text
index.html                  static hero shell inside #root, inline theme script, %BASE_URL% hrefs
vite.config.ts              base from VITE_BASE, react(), tailwindcss(), '@' alias
vitest.config.ts            jsdom, alias, tests/unit
playwright.config.ts        webServer = vite preview on base path
tsconfig.json / tsconfig.app.json (paths @/*) / tsconfig.node.json (configs, scripts types)
.oxlintrc.json  .oxlintignore  prettier.config.mjs  .prettierignore
.github/workflows/ci.yml  deploy.yml
public/                     favicon.svg (no 404), resume.pdf (placeholder, no phone number)
scripts/                    check-contrast.mjs  check-js-budget.mjs  check-path-case.mjs
                            check-colors.mjs  check-no-phone.mjs  contrast-pairs.json  lib/color.mjs
src/main.tsx                imports '@fontsource-variable/inter/wght.css' and styles
src/app/                    App.tsx  Providers.tsx  Page.tsx
src/sections/Hero/          Hero.tsx   src/sections/Stubs (six anchored stubs)
src/layout/                 Container.tsx, Section.tsx
src/components/ui/          ThemeToggle.tsx (imports anim barrel only)
src/components/motion-primitives/text-effect.tsx   vendored, patched, lint/prettier-ignored
src/anim/                   index.ts (barrel) useMotionPreference.ts MotionPreferenceProvider.tsx
                            tokens.ts  declarative/TextReveal.tsx  physics/ThemeThumb.tsx
src/lib/utils.ts            cn()
src/styles/                 index.css (tailwind+theme map)  tokens.css  base.css
tests/unit/                 *.test.ts(x)   tests/e2e/smoke.spec.ts   tests/fixtures/ (lint negatives)
docs/contrast-matrix.md     generated, committed, CI-checked for staleness
```

This matches `docs/architecture.md` (layers, folders) with these deltas: `scripts/`, `tests/`, `docs/contrast-matrix.md`, and `app/Page.tsx` imports no content yet (no `content/` in this phase; wire the lint rule anyway so Phase 3 inherits it).

### Pattern 1: Static shell + identical React hero, guarded by a parity test (NAV-01)
**What:** `index.html` contains the real hero markup (h1, role `<p>`, three CTA anchors) and the seven section anchors inside `<div id="root">`. `createRoot(...).render()` replaces the children on mount. The Tailwind classes in the shell are the same strings as in `Hero.tsx` (Tailwind scans `index.html` via an explicit `@source`). **Not** `hydrateRoot`: no prerender exists, so there is nothing to hydrate.
**When:** Phase 2 and until OD-07 (prerender) is taken.
**Why:** verified in the probe: Playwright `javaScriptEnabled: false` sees h1, role text, resume link and the `#contact` link; hrefs use `%BASE_URL%resume.pdf`, which Vite rewrote to `/aa-phan-portfolio-v2/resume.pdf` (Vite does NOT rewrite a plain `/resume.pdf` in `<a href>`, hence the token).
**Drift guard (design, not yet run in the probe):** Vitest renders `<Hero />` with Testing Library (initial synchronous render, where the lazy `TextEffect` is still its Suspense fallback `<p>`), parses the shell out of `index.html`, replaces `%BASE_URL%` with `/`, and asserts same tag, `class`, text and `href` for the h1, role, and each CTA. Do not use `renderToStaticMarkup` for this: it would have to resolve the `React.lazy` boundary.
**Stub sections:** give each stub `min-height` (for example `min-h-[40svh]`) so the Contact CTA visibly scrolls; each is `<section id="..." aria-labelledby="...-h"><h2 id="...-h">Title</h2></section>` (IA wireframes: one h1, every other section one h2, labelled with `aria-labelledby`).

### Pattern 2: One preference hook feeds three consumers (MOT-01)
```tsx
// src/anim/useMotionPreference.ts   [VERIFIED in probe: Vitest 4 tests + Playwright]
import { useSyncExternalStore } from 'react'
const QUERY = '(prefers-reduced-motion: reduce)'
function subscribe(cb: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', cb)
  return () => mql.removeEventListener('change', cb)
}
const getSnapshot = () => window.matchMedia(QUERY).matches
const getServerSnapshot = () => false
export function useMotionPreference() {
  return { reduced: useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) }
}
```
```tsx
// src/anim/MotionPreferenceProvider.tsx   [VERIFIED in probe]
import { useEffect, type ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import { Globals } from '@react-spring/web'
import { useMotionPreference } from './useMotionPreference'
export function MotionPreferenceProvider({ children }: { children: ReactNode }) {
  const { reduced } = useMotionPreference()
  useEffect(() => {
    Globals.assign({ skipAnimation: reduced })
    return () => Globals.assign({ skipAnimation: false })
  }, [reduced])
  // 'always'/'never' (not 'user') so motion does not read its own matchMedia: one source.
  return <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>{children}</MotionConfig>
}
```
The third consumer is the CSS guard in `base.css` (see Code Examples). `MotionConfig`, `Globals`, `useSpring` and `animated` imports exist only under `src/anim/`.

### Pattern 3: Lazy decorative primitive with a static fallback (D-09)
```tsx
// src/anim/declarative/TextReveal.tsx   [VERIFIED in probe, including the measured bundle]
import { lazy, Suspense } from 'react'
import { useMotionPreference } from '../useMotionPreference'
const TextEffect = lazy(() =>
  import('@/components/motion-primitives/text-effect').then((m) => ({ default: m.TextEffect })),
)
export function TextReveal({ children, className }: { children: string; className?: string }) {
  const { reduced } = useMotionPreference()
  const plain = <p className={className}>{children}</p>
  if (reduced) return plain
  return (
    <Suspense fallback={plain}>
      <TextEffect per="word" preset="fade" speedReveal={3} speedSegment={2} className={className}>
        {children}
      </TextEffect>
    </Suspense>
  )
}
```
Timing (computed from the vendored source, read this session): `defaultStaggerTimes.word` is `0.05`, divided by `speedReveal`; `baseDuration = 0.3 / speedSegment`; the string is split with `text.split(/(\s+)/)`, so the 7-word role line is **13 animated segments** (words and whitespace). Defaults give 12 × 0.05 + 0.3 = 0.9 s, over the 420 ms motion budget in the motion spec. With `speedReveal={3}`, `speedSegment={2}`: 12 × 0.0167 + 0.15 = **about 0.35 s**, inside the budget. TextEffect's hidden state is `opacity: 0`, so the role line blinks (static text, then re-reveal) when the lazy chunk lands. That is inherent to a reveal effect on text already present in HTML; accepted because the static text is in the first paint, the effect is under 0.4 s and name and CTAs are never touched. Flagged as an Open Question for the user's taste, not a blocker.

### Pattern 4: Theme init script + two-state toggle (DSN-03)
- Script is a classic inline `<script>` in `<head>` after the meta tags and before the module script and stylesheet. Vite leaves it untouched [VERIFIED: appears byte-for-byte in `dist/index.html`].
- `html[data-theme]` is the only theme state. React reads it on mount (`document.documentElement.getAttribute('data-theme') === 'dark'`) and writes it plus `localStorage` on toggle, with the write wrapped in try/catch.
- With JS disabled no `data-theme` is set; `:root` falls back to the light block. Accepted (Open Question 3 offers a `@media` dark fallback at the cost of duplicating the token values).
- The toggle is a native `<button aria-pressed>`; only the thumb is animated (react-spring, `snappy` = 500/32/1 from the motion spec); the button and track are not (ownership matrix).

### Pattern 5: Vendoring a motion-primitive
1. Source of truth: `https://motion-primitives.com/c/text-effect.json` (HTTP 200; `dependencies: ["motion"]`, `registryDependencies: []`, one file `text-effect.tsx`). Download the JSON and write `files[0].content` to `src/components/motion-primitives/text-effect.tsx`; do not use the stale CLI (it writes to repo-root `./components/`).
2. It imports `cn` from `@/lib/utils` (create it) and `motion/react` (allowed in this folder). It already uses `import type` for types.
3. It compiled unmodified under the scaffold's strict flags (`verbatimModuleSyntax`, `noUnusedLocals`, `erasableSyntaxOnly`) and builds with no Rolldown warnings, even with its top-level `'use client'`.
4. It FAILS the scaffold lint: oxlint `correctness` flags `no-unsafe-optional-chaining` at lines 239 and 244 (`.transition?.staggerChildren`). Per architecture ("vendor code, kept out of lint autofix churn"): add `src/components/motion-primitives/` to `.oxlintignore` and `.prettierignore` rather than patching upstream logic.
5. Record the vendoring (source URL, retrieval date, any patches) in a new ADR (architecture.md: "vendored, patched locally, logged in an ADR").

### Anti-Patterns to Avoid
- **Importing `motion/react` or `@react-spring/web` anywhere but `src/anim/` and `src/components/motion-primitives/`** (FND-04). `sections/`, `layout/`, `components/ui/` consume only the `@/anim` barrel; deep `@/anim/*` imports are lint errors.
- **Per-override restriction lists**: an oxlint override replaces the whole `no-restricted-imports` option object (probe: a sections-only override silently dropped the motion restriction). Keep one global list; override only to `off`.
- **Tailwind default palette utilities** (`bg-white`, `text-red-500`): with `--color-*: initial` they compile to nothing, silently. The color check script flags them.
- **Setting `data-theme` from a React effect**: causes a flash. Only the inline script sets the initial value.
- **Both libraries on one element**: the toggle's track/button have no library; only the thumb span is spring-driven.
- **Hard-coded `/resume.pdf` in HTML**: breaks under the project base. Use `%BASE_URL%` in `index.html` and `import.meta.env.BASE_URL` in TSX.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Text reveal effect | Own per-word animator | Vendored motion-primitives `TextEffect` (D-09) | Already specified; handles sr-only copy and aria-hidden segments |
| `cn()` | Own class joiner | `clsx` + `tailwind-merge` (`@/lib/utils`) | Required by every primitive |
| Reduced-motion for springs | Per-component checks | `Globals.assign({ skipAnimation })` | Snaps every spring; verified |
| Reduced-motion for motion | Per-component checks | `MotionConfig reducedMotion` fed from the hook | One source |
| Image/format tooling, smooth scroll, icons | — | Not this phase | Phase 3/4 |
| OKLCH and `color-mix` math | New implementation | Port `contrast-check.mjs` lines 28-152 (already validated by its `--selftest`) into `scripts/lib/color.mjs` | Reproduced all 38 Phase 1 ratios exactly |
| Bundle visualizer / size packages | Extra deps | 20-line gzip script on `dist/index.html` | Verified |
| Lint boundaries | Custom AST scripts | oxlint `no-restricted-imports` + `overrides` | Verified, catches dynamic `import()` too |

**Key insight:** every gate in this phase is a small deterministic script over files already on disk; the risk is in the configuration details (override semantics, Tailwind source detection, base-path URLs), not in missing libraries.

## Common Pitfalls

### Pitfall 1: `npm ci` fails on Linux because the lockfile came from macOS
**What goes wrong:** lockfiles generated on one OS sometimes omit other platforms' optional native packages (Rolldown, Tailwind oxide, lightningcss, oxlint all use them).
**Status:** probe lockfile generated by npm 11.19.1 on macOS arm64 contains the `linux-x64-gnu` entries for `@rolldown/binding`, `@tailwindcss/oxide`, `lightningcss` and `@oxlint/binding` [VERIFIED: grep counts of 1 each]. The first CI run is the real proof; if it reports a missing optional dependency, run `npm install --os=linux --cpu=x64` once and recommit the lockfile.
**Warning signs:** `npm ci` error naming `@rolldown/binding-linux-x64-gnu`.

### Pitfall 2: First push of workflow files before Pages is set to Actions
**What goes wrong:** `deploy.yml` runs on push to `main`; `actions/configure-pages` fails if the repo's Pages site does not exist (the default `GITHUB_TOKEN` cannot enable it). Right now Pages returns 404.
**How to avoid:** the user-run checkpoint (Settings, Pages, Source = GitHub Actions) comes BEFORE pushing the Phase 2 code. Scriptable equivalent, documented [CITED: docs.github.com/en/rest/pages/pages `build_type` = `workflow`]: `gh api -X POST repos/aa-phan/aa-phan-portfolio-v2/pages -f build_type=workflow`.

### Pitfall 3: Git cannot push workflow files with a token lacking `workflow` scope
**Status:** `gh auth status` shows scopes `gist, project, read:org, repo, workflow` [VERIFIED], but `git config credential.helper` is `osxkeychain`, so `git push` may use a different stored credential than the `gh` token. If the push is rejected mentioning "workflow scope", run `gh auth setup-git` and retry.

### Pitfall 4: Root `.gitignore` lacks `node_modules` and `dist`
**What goes wrong:** the existing `.gitignore` is exactly `.DS_Store` and `references/` [VERIFIED: file content]. The first `git add -A` after scaffolding would stage `node_modules/`.
**How to avoid:** the very first scaffold task merges the create-vite template's ignores (`node_modules`, `dist`, `dist-ssr`, `*.local`, logs, editor dirs) plus `test-results/`, `playwright-report/`, and keeps the two existing lines. Do not run `npm create vite` in the repo root; scaffold elsewhere and copy files (it targets an empty dir) or hand-write them.

### Pitfall 5: Tailwind scans the whole repo
See Key Finding 5. Use `@import 'tailwindcss' source(none);` + `@source '../../index.html';` + `@source '../../src';` (paths relative to `src/styles/index.css`). If a future file outside these paths holds classes, add it explicitly.

### Pitfall 6: Playwright base path
`vite preview` serves under the base. Use `baseURL: 'http://localhost:4173/aa-phan-portfolio-v2/'` (trailing slash) and `page.goto('./')`; `goto('/')` would hit the server root. In CI the `webServer` command must run after a build that used the same `VITE_BASE`. [VERIFIED in probe, 6/6 passing.]

### Pitfall 7: Prettier rewrites numbers and the inline script
Prettier normalizes CSS numbers (`0.1190` becomes `0.119`); the contrast parser accepts either. It also reformats `index.html`, including the inline script; the Vitest theme-script test extracts the script from `index.html` at test time, so it keeps testing whatever ships. Put `package-lock.json`, `dist`, `test-results`, `playwright-report` and the vendored folder in `.prettierignore`.

### Pitfall 8: oxlint exits 0 on warnings
`react/only-export-components` is a warning in the scaffold. Use `oxlint --deny-warnings` in the `lint` script if warnings should fail CI. Config-level `ignorePatterns` also defeats `--no-ignore`, so use an ignore FILE (`.oxlintignore` with `--ignore-path`) not `ignorePatterns`, otherwise the boundary negative test cannot lint its fixture [VERIFIED: with `ignorePatterns`, "No files found to lint"; with `--ignore-path .oxlintignore` the normal run skips the fixtures and `--no-ignore <fixture>` lints them].

### Pitfall 9: Font CLS and unused font files
`@fontsource-variable/inter/wght.css` emits 7 woff2 subset files into `dist/` (about 218 kB on disk) but the browser fetches only the latin subset (48.25 kB) for English copy. There is no latin-only CSS entry in the package. Harmless; preload is deferred (OD-08). The Playwright test asserts no cross-origin requests.

### Pitfall 10: `lts/*` drifts
`actions/setup-node` with `lts/*` follows whatever Node LTS is current when CI runs. Vite 8 needs `^20.19 || >=22.12` and Vitest 5 needs `^22.12 || ^24 || >=26`; any current LTS satisfies both. Set `engines.node` in package.json to `^22.12.0 || ^24.0.0 || >=26.0.0` (intersection). Keeps with D-03/runbook (`lts/*`).

### Pitfall 11: Placeholder resume and the real resume
`references/Aaron_Phan_Resume.pdf` contains the phone number and must never be copied to `public/`. Ship a generated placeholder (below) and let Phase 3 (CNT-04) replace it. `check:no-phone` scans `dist/` for the phone pattern as a belt-and-braces guard.

## Code Examples

All blocks below were run in the probe unless marked otherwise.

### `vite.config.ts` [VERIFIED]
```ts
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // includes process.env (CI sets VITE_BASE)
  return {
    base: env.VITE_BASE || '/',
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  }
})
```
`tsconfig.app.json` additionally gets `"paths": { "@/*": ["./src/*"] }` (no `baseUrl`) next to `"types": ["vite/client"]` [VERIFIED: `tsc -b` passes].

### `index.html` essentials [VERIFIED]
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <link rel="icon" type="image/svg+xml" href="%BASE_URL%favicon.svg" />
  <title>Aaron Phan</title>
  <script>
    (function () {
      var t;
      try { t = localStorage.getItem('theme'); } catch (e) {}
      if (t !== 'light' && t !== 'dark') {
        try { t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch (e) { t = 'light'; }
      }
      document.documentElement.setAttribute('data-theme', t);
    })();
  </script>
</head>
<body class="bg-background text-text font-sans">
  <div id="root"><!-- static hero shell + seven anchored sections; same classes as Hero.tsx --></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```
The Resume CTA is `<a href="%BASE_URL%resume.pdf">`; Copy email is `mailto:aaron.phan240@gmail.com` (G-07 in the content inventory: "Default accepted: aaron.phan240@gmail.com confirmed public (D-11)"); Contact is `href="#contact"`. CTA order (HERO-03): "Download resume, Copy email, Contact". Section anchor ids (IA registry): `hero`, `experience`, `projects`, `about`, `skills`, `education`, `contact`; page order: Hero, Experience, Projects, About, Skills, Education, Contact; plus `main` as the `<main id="main">` target.

### `src/styles/tokens.css` [VERIFIED: parsed by the contrast script, 38/38 PASS, ratios identical to the Phase 1 matrix]
Role values are verbatim from `01-DESIGN-TOKENS.md` lines 70-79 (`light --text oklch(0.1190 0.0436 285.36)` ... `dark --accent oklch(0.7288 0.1457 283.95)`) and derived formulas verbatim from lines 118-135.
```css
:root,
[data-theme='light'] {
  color-scheme: light;
  --text: oklch(0.1190 0.0436 285.36);
  --background: oklch(0.9889 0.0039 286.33);
  --primary: oklch(0.5113 0.2298 277.28);
  --secondary: oklch(0.9070 0.0475 288.03);
  --accent: oklch(0.5143 0.2729 272.97);

  --surface: color-mix(in oklch, var(--secondary) 30%, var(--background));
  --muted: color-mix(in oklch, var(--text) 70%, var(--background));
  --border: color-mix(in oklch, var(--text) 14%, var(--background));
  --border-strong: color-mix(in oklch, var(--text) 55%, var(--background));
  --link: color-mix(in oklch, var(--primary) 80%, var(--text));
  --on-primary: color-mix(in oklch, var(--background) 100%, var(--text));
  --on-accent: color-mix(in oklch, var(--background) 100%, var(--text));
  --primary-hover: color-mix(in oklch, var(--primary) 85%, var(--text));
  --focus-ring: color-mix(in oklch, var(--text) 100%, var(--background));
}
[data-theme='dark'] {
  color-scheme: dark;
  --text: oklch(0.9889 0.0039 286.33);
  --background: oklch(0.1190 0.0436 285.36);
  --primary: oklch(0.6383 0.1988 281.11);
  --secondary: oklch(0.2561 0.0973 279.44);
  --accent: oklch(0.7288 0.1457 283.95);

  --surface: color-mix(in oklch, var(--secondary) 60%, var(--background));
  --muted: color-mix(in oklch, var(--text) 72%, var(--background));
  --border: color-mix(in oklch, var(--text) 16%, var(--background));
  --border-strong: color-mix(in oklch, var(--text) 55%, var(--background));
  --link: color-mix(in oklch, var(--accent) 100%, var(--background));
  --on-primary: color-mix(in oklch, var(--background) 100%, var(--text));
  --on-accent: color-mix(in oklch, var(--background) 100%, var(--text));
  --primary-hover: color-mix(in oklch, var(--primary) 94%, var(--background));
  --focus-ring: color-mix(in oklch, var(--text) 100%, var(--background));
}
```
Add the elevation (`--shadow-*`), `--z-*`, `--dur-*`, `--ease-out` tokens from the Phase 1 doc and motion spec in the same file below these blocks, outside the two role/derived blocks so the parser's `--name: value;` scan is unaffected (the parser ignores values that are neither `oklch(` nor `color-mix(`, but it must only be asked to resolve color tokens; make the parser skip unknown non-color values rather than throw).

### `src/styles/index.css` [VERIFIED: build output has `.bg-primary{background-color:var(--primary)}`, `.bg-surface`, `.hover\:bg-primary-hover` under `@media (hover:hover)`, `.rounded-pill`; `bg-white`/`text-red-500` emit nothing]
```css
@import 'tailwindcss' source(none);
@source '../../index.html';
@source '../../src';
@import './tokens.css';
@import './base.css';
@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));
@theme inline {
  --color-*: initial;
  --color-text: var(--text);
  --color-background: var(--background);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-accent: var(--accent);
  --color-surface: var(--surface);
  --color-muted: var(--muted);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-link: var(--link);
  --color-on-primary: var(--on-primary);
  --color-on-accent: var(--on-accent);
  --color-primary-hover: var(--primary-hover);
  --color-focus-ring: var(--focus-ring);
  --font-sans: 'Inter Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --text-5xl: clamp(2.986rem, 2.085rem + 3.844vw, 5.16rem);
  --text-5xl--line-height: 1.05;
  --radius-pill: 9999px;
  /* plus the remaining --text-*, --radius-*, --shadow-* ladder from the Phase 1 doc */
}
```
(`@import` after `@source` built correctly in the probe. If the planner prefers strict CSS ordering, put both `@import`s first.) The `@custom-variant dark` line is kept per architecture even though components use no `dark:` variants.

### `src/styles/base.css` [CSS guard design; reduced-motion layer L1, not exercised in the probe]
```css
html { -webkit-text-size-adjust: 100%; }
:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### `.oxlintrc.json` [VERIFIED: negative fixtures fail with exit 1; allowed fixture passes; deep imports flagged; barrel import `@/anim` allowed]
```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc", "import"],
  "categories": { "correctness": "error" },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }],
    "no-restricted-imports": ["error", {
      "paths": [
        { "name": "motion/react", "message": "animation libs only in src/anim and motion-primitives" },
        { "name": "@react-spring/web", "message": "animation libs only in src/anim" },
        { "name": "framer-motion", "message": "use motion/react inside src/anim" },
        { "name": "motion", "message": "use motion/react inside src/anim" },
        { "name": "react-spring", "message": "use @react-spring/web inside src/anim" }
      ],
      "patterns": [
        { "group": ["motion/*", "@react-spring/*", "framer-motion/*"], "message": "animation libs only in src/anim and motion-primitives" },
        { "group": ["@/anim/*", "**/anim/*", "**/motion-primitives", "**/motion-primitives/*", "@/components/motion-primitives/*"], "message": "import animation via the @/anim barrel only" },
        { "group": ["**/content", "**/content/*", "@/content", "@/content/*"], "message": "content data only in src/app/Page.tsx" }
      ]
    }]
  },
  "overrides": [
    { "files": ["**/anim/**", "**/motion-primitives/**"], "rules": { "no-restricted-imports": "off" } }
  ]
}
```
Still to add (not probed): an override for `src/app/Page.tsx` that restores the animation restrictions but omits the `content` pattern (copy the global object, delete the content group) so Page.tsx may import content in Phase 3. `.oxlintignore`: `tests/fixtures/`, `src/components/motion-primitives/`, `dist/`. Scripts: `"lint": "oxlint --deny-warnings --ignore-path .oxlintignore"`.

Negative test (Vitest, `tests/unit/boundaries.test.ts`, design verified manually with the same commands): `spawnSync('npx', ['oxlint','--no-ignore','tests/fixtures/sections/Violation.tsx'])` must exit non-zero and mention `no-restricted-imports`; `tests/fixtures/anim/Ok.tsx` must exit 0. Fixture `Violation.tsx` is `import { motion } from 'motion/react'` placed under a `sections/` directory name; the `**/anim/**` override glob makes the path-only fixtures work outside `src/`.

### `scripts/check-js-budget.mjs` [VERIFIED: exit 0 at 86,242 B; exit 1 with `JS_BUDGET_BYTES=80000`]
```js
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
const BUDGET = Number(process.env.JS_BUDGET_BYTES ?? 150_000)
const html = fs.readFileSync('dist/index.html', 'utf8')
const base = process.env.VITE_BASE || '/'
const hrefs = new Set()
for (const m of html.matchAll(/<script\b[^>]*\btype="module"[^>]*\bsrc="([^"]+)"/g)) hrefs.add(m[1])
for (const m of html.matchAll(/<link\b[^>]*\brel="modulepreload"[^>]*\bhref="([^"]+)"/g)) hrefs.add(m[1])
if (hrefs.size === 0) { console.error('no initial JS found in dist/index.html'); process.exit(2) }
let total = 0
for (const href of hrefs) {
  const rel = href.startsWith(base) ? href.slice(base.length) : href.replace(/^\//, '')
  const bytes = zlib.gzipSync(fs.readFileSync(path.join('dist', rel)), { level: 9 }).length
  total += bytes
  console.log(`${String(bytes).padStart(8)} B gz  ${rel}`)
}
console.log(`initial JS: ${total} B gzipped (${(total / 1000).toFixed(1)} kB) of ${BUDGET} B budget`)
process.exit(total > BUDGET ? 1 : 0)
```

### `scripts/check-contrast.mjs` + `scripts/lib/color.mjs` [VERIFIED: 38 checks PASS, ratios identical to Phase 1]
- `scripts/lib/color.mjs`: lines 28-152 of `contrast-check.mjs` (`srgbToLinear` ... `fmtOklchInGamut`) with `export` added to `makeColor`, `contrast`, `mixColors`, `parseOklch`, `mod360` and a top-level `const ACHROMATIC = 0.0001;` defined before use.
- `scripts/contrast-pairs.json`: the 19 pairs `[{ "fg": "--text", "bg": "--background", "category": "text" }, ...]` from the "Contrast pairs" fence in `01-DESIGN-TOKENS.md` lines 273-291, thresholds `text 4.5, large 3, ui 3, focus 3`.
- Parser core (tokens.css to resolved colors, then pair check, unrounded comparison, `!inGamut` is a failure):
```js
const css = fs.readFileSync('src/styles/tokens.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const themes = { light: {}, dark: {} }
for (const [, sel, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const theme = /data-theme=['"]dark['"]/.test(sel) ? 'dark' : 'light'
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) themes[theme][name] = value.trim()
}
// resolve: oklch(...) via parseOklch; color-mix(in oklch, var(--a) P%, var(--b)) via mixColors(get(a), get(b), P)
```
Extend it to (a) assert the 10 role values equal the Phase 1 swatch hexes (`#050315 #fbfbfe #5046e5 #dedcff #433bff` light, `#fbfbfe #050315 #7b75ff #1c1950 #9d99ff` dark, from the Candidate A swatch table) so DSN-01 "Phase 1 palette" is a test, and (b) write `docs/contrast-matrix.md` with `--write` and fail in CI when the committed file differs from regenerated output (so the "committed matrix" cannot go stale). `docs/` is public and must be self-contained (ADR-0001): do not link to `.planning/`.
- **Pairs the toggle adds that Phase 1 did not list** (all PASS in both themes, measured): `--primary on --surface` ui (light 5.65, dark 5.09), `--primary on --secondary` ui (4.71, 4.47), `--accent on --secondary` ui (4.77, 6.47), `--link on --secondary` text (6.48, 6.47), `--muted on --secondary` text (7.60, 7.08), `--border-strong on --secondary` ui (4.36, 4.03), `--primary-hover on --background` ui (7.74, 5.01). Add the ones the toggle and hero actually paint to `contrast-pairs.json`.

### `scripts/check-path-case.mjs` [VERIFIED: passes clean; fails with `src/Bad.ts: '@/lib/Utils' differs in case from the file on disk` on a wrong-case import]
Two checks: (1) `git ls-files --cached --others --exclude-standard` lowercased duplicates; (2) for every `.ts/.tsx/.css/.html/.mjs` file, extract specifiers with `/(?:from\s+|import\s*\(\s*|import\s+|@import\s+|url\(\s*)['"]?([^'")\s]+)['"]?/g`, resolve `@/` to `src/` and `./`/`../` relative to the file, try extensions `['', .ts, .tsx, .js, .jsx, .mjs, .css, .json, /index.ts, /index.tsx, /index.js]`, and compare each path segment against `fs.readdirSync` for exact case; report when the file exists case-insensitively but not exactly. It is most valuable locally on macOS; on Linux CI the typecheck and build already fail on a case mismatch, so the script's CI job is a readable early error. Also add `forceConsistentCasingInFileNames` explicitly in `tsconfig.app.json` for clarity (it is the default in TS 5+, **[ASSUMED]** not re-checked for 6.0).

### `scripts/check-colors.mjs` (design; regexes reasoned, not run)
Fail when `src/**/*.{ts,tsx,css}` outside `src/styles/tokens.css` and the vendored folder contain `#[0-9a-fA-F]{3,8}\b`, `rgb(`, `hsl(`, `oklch(`, or Tailwind default palette utilities `(bg|text|border|ring|fill|stroke|from|to|via|outline|decoration|shadow|accent|caret|divide)-(white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(-\d+)?\b`. The anchors `#hero #contact #about #education #experience #projects #skills #main` do not match the hex regex (each contains a non-hex letter within its first three characters or fails the `\b`); `index.html` is excluded from the scan (its theme-color hex, if added, is fine).

### Placeholder resume (no phone number) [VERIFIED: 594-byte PDF, `pdftotext` prints "Resume coming soon."]
Generate once with a ~20-line Node script that emits a minimal one-page PDF (Catalog, Pages, Page, content stream `BT /F1 18 Tf 72 720 Td (Resume coming soon.) Tj ET`, Helvetica font, xref table) and commit `public/resume.pdf`. Phase 3 replaces it with the stripped real resume (CNT-04).

### Playwright config and smoke spec [VERIFIED: 6/6 pass against the built probe with `VITE_BASE=/aa-phan-portfolio-v2/`]
```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test'
const BASE = process.env.VITE_BASE ?? '/'
export default defineConfig({
  testDir: 'tests/e2e',
  webServer: { command: 'npm run preview -- --port 4173 --strictPort',
               url: `http://localhost:4173${BASE}`, reuseExistingServer: !process.env.CI },
  use: { baseURL: `http://localhost:4173${BASE}` },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
})
```
Key assertions (all verified): with `test.use({ javaScriptEnabled: false })` the h1, role text, resume link `href` matching `/resume\.pdf$/` and the Contact link are visible. No-flash: new context with `colorScheme: scheme`, `page.route('**/assets/*.js', r => r.abort())` so React never runs, then `document.documentElement.dataset.theme === scheme` and the computed body background is the matching token (`oklch(0.9889 0.0039 286.33)` light, `oklch(0.119 0.0436 285.36)` dark; Chromium reports computed colors in `oklch()`). Stored choice: `addInitScript(() => localStorage.setItem('theme','light'))` with dark system gives `light`. Reduced motion: `reducedMotion: 'reduce'` shows the role text, `main p span` count is 0 (no per-word spans), and clicking the toggle leaves the thumb at `matrix(1, 0, 0, 1, 20, 0)` immediately; control run with `no-preference` shows `matrix(1, 0, 0, 1, 2.16026, 0)` immediately after the click (mid-spring). Add: record `page.on('request')` hosts and assert all share the origin, and `[...document.fonts].map(f => f.family)` unique count <= 2 (DSN-04).

### Workflows [structure CITED: vite.dev/guide/static-deploy.html; SHAs VERIFIED via `gh api .../git/ref/tags/<tag>` on 2026-10-09; YAML not executed]
Pinned SHAs: checkout v7.0.1 `3d3c42e5aac5ba805825da76410c181273ba90b1`; setup-node v7.1.0 `949feb2413d6458794dcd2491c4babbbce0c15c1`; configure-pages v6.0.0 `45bfe0192ca1faeb007ade9deae92b16b8254a0d`; upload-pages-artifact v5.0.0 `fc324d3547104276b827a68afc52ff2a11cc49c9`; deploy-pages v5.0.1 `368f82528645a54fb793d4d04e342629a3f51346`.
```yaml
# .github/workflows/ci.yml
name: CI
on: { push: {}, pull_request: {} }
concurrency: { group: "ci-${{ github.ref }}", cancel-in-progress: true }
permissions: { contents: read }
env: { VITE_BASE: /aa-phan-portfolio-v2/ }
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with: { node-version: lts/*, cache: npm }
      - run: npm ci
      - run: npm run verify
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```
```yaml
# .github/workflows/deploy.yml
name: Deploy static content to Pages
on: { push: { branches: [main] }, workflow_dispatch: {} }
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
env: { VITE_BASE: /aa-phan-portfolio-v2/ }   # cutover edits this to /
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with: { node-version: lts/*, cache: npm }
      - run: npm ci
      - run: npm run verify          # includes the build, budget, contrast, case, no-phone gates
      - uses: actions/configure-pages@45bfe0192ca1faeb007ade9deae92b16b8254a0d # v6.0.0
      - uses: actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9 # v5.0.0
        with: { path: ./dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
    steps:
      - id: deployment
        uses: actions/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346 # v5.0.1
      - run: curl -fsS --retry 6 --retry-delay 5 --retry-all-errors "${{ steps.deployment.outputs.page_url }}" | grep -q "Aaron Phan"
```
`package.json` scripts: `typecheck: tsc -b`, `lint`, `format:check: prettier --check .`, `test: vitest run`, `build: tsc -b && vite build`, `check:case`, `check:colors`, `check:contrast`, `check:budget`, `check:no-phone`, `test:e2e: npm run build && playwright test`, and `verify` chaining typecheck, lint, format:check, test, check:case, check:colors, check:contrast, build, check:budget, check:no-phone. Both workflows call `verify`, so deploy cannot ship a build that fails the gates even though the two workflows are separate (runbook shape preserved).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ESLint + boundaries plugin | oxlint `no-restricted-imports` + `overrides` | oxlint 1.x (verified 1.87.0) | One fast linter; scaffold default |
| `tailwind.config.js` | CSS-first `@theme inline`, `@source`, `source(none)` | Tailwind v4 | Verified config above |
| `next-themes`-style provider | Inline head script + `data-theme` | n/a | No flash, no dependency |
| Floating `latest` for motion/TypeScript | Exact-minor pins (`~14.0.0`, `~6.0.3`) | motion 14.1.0 and TS 7.0.2 both exist today | Do not float |

**Deprecated/outdated:** `react-spring` umbrella package and v11 beta (CLAUDE.md); `lucide-react` brand icons (none; ADR-0005 inline SVG); runbook text calling the lint a "boundaries plugin" and the workflows "not yet written" (update in this phase).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `forceConsistentCasingInFileNames` is default-on in TypeScript 6.0; setting it explicitly is harmless either way | Code Examples (path-case) | None; explicit setting covers it |
| A2 | `renderToStaticMarkup`-free Testing Library parity test works with the `React.lazy` fallback on the first synchronous render | Pattern 1 | Parity test needs a different harness (for example mock the lazy import) |
| A3 | `check:colors` regexes produce no false positives on the codebase | Code Examples | Tune regexes; low impact |
| A4 | `npm ci` succeeds on the Linux runner with the macOS-generated lockfile | Pitfall 1 | One lockfile regeneration with `--os=linux --cpu=x64` |
| A5 | The CI Playwright job on `ubuntu-latest` with `playwright install --with-deps chromium` works unchanged | Workflows | Add or adjust apt deps |
| A6 | `lts/*` resolves to a Node version satisfying Vite 8 and Vitest 5 on the day CI runs | Pitfall 10 | Pin `node-version: 24` |
| A7 | Browser-computed `color-mix(in oklch)` values equal the script's math to within WCAG-relevant precision (Chromium returned `oklch(0.119 0.0436 285.36)` for the dark background, matching the token) | DSN-02 | Add a Playwright computed-color cross-check for the derived tokens |

## Open Questions

1. **Public repo contains `.planning/` and `.claude/`.**
   - What we know: remote `main` has `.claude`, `.planning`, `docs`, `.gitignore`; REQUIREMENTS "Out of Scope" and ADR-0001 say the public repo contains only the site and docs; D-02 chose public. History was scrubbed of the phone number; the guard prints nothing.
   - What's unclear: whether the user accepts planning files being browsable, or wants them moved out.
   - Recommendation: surface to the user before the first deploy push. Options: accept and update REQUIREMENTS/ADR-0001 wording, or `git rm -r --cached .planning .claude` + `.gitignore` entries and keep them local (note `commit_docs: true` in `.planning/config.json` then needs to be `false`). Not a blocker for building the code.
2. **Is the role line's short re-reveal acceptable?** (Pattern 3.) Static text shows first, then fades per word in about 0.35 s after the lazy chunk arrives. Alternative with no blink: `per="line"` fade only, or a variant whose hidden state keeps opacity above 0. Recommend shipping as specified and judging it in the staging review.
3. **JS-off dark users get the light theme.** Adding an `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { ... } }` fallback duplicates the 14 dark values. Recommend not doing it (single block per theme is the Phase 1 principle).
4. **`deploy.yml` re-runs `verify`.** Costs about a minute per deploy for a guaranteed gate; the alternative is `needs:` a reusable CI. Recommend the re-run.
5. **Should `index.html` be in `.prettierignore`?** Prettier reformats the inline script and shell; the tests tolerate it. Recommend formatting it (consistency) unless it fights `%BASE_URL%`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build, tests | yes | v26.9.0 (meets Vite 8 and Vitest 5 engines) | — |
| npm | install | yes | 11.19.1 | — |
| git | repo | yes | 2.39.5; `core.ignorecase=true` (macOS) | — |
| gh CLI | repo/Pages checks | yes | 2.100.0, logged in as `aa-phan`, scopes include `repo`, `workflow` | — |
| GitHub remote | deploy | yes | repo exists, public, `main` pushed; Pages NOT enabled | user checkpoint (below) |
| Playwright Chromium 156 (rev 1248) | e2e | installed this session via `playwright install chromium --only-shell` into `~/Library/Caches/ms-playwright` | headless shell | CI installs its own |
| pdftotext | optional PDF text check | yes (`/opt/homebrew/bin/pdftotext`) | — | not required |

**Missing dependencies with no fallback (user checkpoint):** GitHub Pages source set to "GitHub Actions" on `aa-phan/aa-phan-portfolio-v2`, before the first push of the workflow files.
**Missing dependencies with fallback:** none.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 5.0.3 (jsdom 30, Testing Library 16) for unit; @playwright/test 1.64.0 (Chromium) for smoke |
| Config file | `vitest.config.ts`, `playwright.config.ts` (both Wave 0) |
| Quick run command | `npx vitest run` (about 1 s in the probe) |
| Full suite command | `npm run verify && npm run test:e2e` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FND-01 | Build emits assets under the project base; deploy succeeds | build + CI | `VITE_BASE=/aa-phan-portfolio-v2/ npm run build && grep -q '/aa-phan-portfolio-v2/assets/' dist/index.html`; post-deploy `curl` step | Wave 0 |
| FND-02 | CI runs typecheck, lint, build, case check on Linux | CI | `gh run list --workflow ci.yml --limit 1 --json conclusion` equals success | Wave 0 |
| FND-03 | Initial JS <= 150,000 B gz; gate fails when exceeded | script + negative | `npm run check:budget` (exit 0); `JS_BUDGET_BYTES=1000 npm run check:budget` (exit 1) | Wave 0 |
| FND-04 | Violating import fails lint, allowed import passes | unit (spawn) | `npx vitest run tests/unit/boundaries.test.ts` | Wave 0 |
| DSN-01 | `tokens.css` roles equal the Phase 1 palette A hexes | unit | `npx vitest run tests/unit/tokens.test.ts` | Wave 0 |
| DSN-02 | Every pair passes AA in both themes; committed matrix is current | script | `npm run check:contrast` | Wave 0 |
| DSN-03 | System default, stored override, blocked storage, no flash | unit + e2e | `npx vitest run tests/unit/theme-script.test.ts`; `npx playwright test -g "theme"` | Wave 0 |
| DSN-04 | Same-origin only, at most 2 font families, one Fontsource dependency | e2e + unit | `npx playwright test -g "fonts"` | Wave 0 |
| MOT-01 | Hook reacts live; spring snaps; role static; CSS guard present in built CSS | unit + e2e | `npx vitest run tests/unit/motion-preference.test.tsx`; `npx playwright test -g "reduced motion"`; `grep -q 'prefers-reduced-motion' dist/assets/*.css` | Wave 0 |
| NAV-01 | Hero in static HTML with JS off; shell and React hero stay in parity | e2e + unit | `npx playwright test -g "JS disabled"`; `npx vitest run tests/unit/hero-parity.test.tsx` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run` plus the single relevant script (`npm run check:contrast`, `check:budget`, etc.).
- **Per wave merge:** `npm run verify`.
- **Phase gate:** `npm run verify && npm run test:e2e` green locally and CI green on `main`, then the staging smoke test from the runbook, before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `vitest.config.ts`, `playwright.config.ts`, `tests/unit/*`, `tests/e2e/smoke.spec.ts`, `tests/fixtures/{sections,anim}/*.tsx`
- [ ] `scripts/{check-contrast,check-js-budget,check-path-case,check-colors,check-no-phone}.mjs`, `scripts/lib/color.mjs`, `scripts/contrast-pairs.json`
- [ ] `.oxlintrc.json`, `.oxlintignore`, `prettier.config.mjs`, `.prettierignore`
- [ ] Framework install: see Installation; `npx playwright install chromium` locally
- Manual-only (justified): Pages source setting and first deploy; staging smoke test per runbook; judging the role-line blink and toggle feel on a real phone (Phase 6/QA).

## Security Domain

`security_enforcement` is enabled (ASVS level 1). This is a zero-backend static site; most categories do not apply.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No accounts or login |
| V3 Session Management | no | No sessions; only a `theme` localStorage value |
| V4 Access Control | no | Public static content |
| V5 Input Validation | minimal | The only stored input is `theme`, validated to `'light' \| 'dark'` by the inline script (junk values ignored; verified by unit test); no user text is rendered |
| V6 Cryptography | no | None; HTTPS provided by GitHub Pages |
| V14 Configuration / supply chain | yes | Actions pinned by commit SHA; least-privilege `permissions` (`contents: read`, `pages: write`, `id-token: write` only on deploy); committed lockfile + `npm ci`; no secrets; one human checkpoint on dependency list; `npm audit` review |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Personal data disclosure (phone number in PDF, meta, JS, repo history) | Information Disclosure | Placeholder PDF only; `check:no-phone` over `dist/`; OD-01 history guard before any push; never copy `references/` |
| Third-party tampering via CI actions | Tampering | SHA-pinned actions, version in comment |
| Typosquatted/new dependency | Tampering | Package legitimacy checkpoint; lockfile review; exact pins for motion and TypeScript |
| Third-party font/CDN tracking | Information Disclosure | Self-hosted Fontsource; Playwright same-origin assertion |
| Repo exposes private planning notes | Information Disclosure | Open Question 1; history already scrubbed of the phone number |
| localStorage unavailable/blocked (Safari private mode, policies) | Denial of Service (UX) | All storage reads/writes in try/catch; fallback to system theme (unit-tested) |
| `mailto:` address scraping | Information Disclosure | Accepted: email confirmed public (G-07) |

GitHub Pages cannot set response headers, so a real CSP is not available; a `<meta http-equiv>` CSP is possible but would have to allow the inline theme script (hash). Not in scope for Phase 2; note for Phase 6.

## Sources

### Primary (HIGH confidence)
- Probe app built and tested in the scratchpad this session (Vite 8.3.4, React 19.3.0, motion 14.0.0, @react-spring/web 10.1.2, Tailwind 4.3.3, TS 6.0.3, oxlint 1.87.0, Vitest 5.0.3, Playwright 1.64.0): builds, bundle sizes, lint fixtures, contrast script, budget script, case script, Playwright and Vitest runs.
- npm registry via `npm view` (versions, engines, peers, publish dates) and `gsd-tools query package-legitimacy check`, 2026-10-09.
- `gh` API on `aa-phan/aa-phan-portfolio-v2` (repo state, contents, Pages 404, token scopes) and on actions repos (release tags and commit SHAs), 2026-10-09.
- Repo files read this session: `02-CONTEXT.md`, `REQUIREMENTS.md`, `STATE.md`, `docs/architecture.md`, `docs/deploy-runbook.md`, `docs/adr/README.md`, ADR-0001/0003/0004, `01-DESIGN-TOKENS.md`, `contrast-check.mjs`, `01-MOTION-SPEC.md`, `01-IA-WIREFRAMES.md` (registry, hero frame), `01-CONTENT-INVENTORY.md` (HERO-01..03, G-04, G-07), `.claude/CLAUDE.md`, `.gitignore`, `.planning/config.json`, `.planning/research/PITFALLS.md` (Pitfalls 9-12).
- https://motion-primitives.com/c/text-effect.json (registry JSON, source read in full).

### Secondary (MEDIUM confidence)
- https://vite.dev/guide/static-deploy.html (workflow shape, action major versions, `lts/*`, pin-by-SHA note).
- https://docs.github.com/en/rest/pages/pages (`POST /repos/{owner}/{repo}/pages`, `build_type` = `legacy` or `workflow`, admin permission).

### Tertiary (LOW confidence)
- None relied on without verification.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH, versions confirmed against the registry and exercised together in one install and build.
- Architecture: HIGH, mechanisms prototyped end to end; the static-shell parity test and `check:colors` are designed but not run (A2, A3).
- Pitfalls: HIGH for the verified ones (Tailwind source scanning, oxlint override semantics, base-path URLs, ignore behavior); MEDIUM for CI-only items (A4, A5) that only the first Linux run can confirm.

**Research date:** 2026-10-09
**Valid until:** 2026-10-16 for version pins (motion and Vite are releasing multiple times a week); 30 days for the structural findings.
