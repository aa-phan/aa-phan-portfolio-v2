# Phase 3: Content-Complete Site - Research

**Researched:** 2026-10-19
**Domain:** Static React/Vite/Tailwind v4 portfolio: typed content modules, image pipeline, accessible navigation (scroll-spy, morphing pill, skip link), clipboard toast, native `<dialog>`, palette/type swap, privacy gates
**Confidence:** HIGH on repo-grounded and probe-measured findings, MEDIUM on cross-browser details marked `[ASSUMED]`

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Art direction adopted from DESIGN.md (supersedes Phase 2 D-13)
- **D-01:** Adopt the "day job, night set" concept. Light theme is Aaron Phan by day, dark theme is PHVNTM by night. Phase 3 ships the static forms: the corner wordmark reads PHAN in light and PHVNTM in dark, the footer finale wordmark (fit to width), and a designed 404 page ("Dead air.", the A stuck edge-on). Both themes show identical content in identical order; the night persona never hides or replaces engineering content. The h1 stays "Aaron Phan" in both themes. Wordmark glyphs are `aria-hidden`; the home link is `aria-label="Aaron Phan, home"`; the footer keeps a real text line "Aaron Phan. DJs as PHVNTM." The animated A-to-V flip (new IX-18, motion, rotateX) is Phase 4.
- **D-02:** Switch to palette D (DESIGN.md §5): the ten role lines change (`--text`, `--background`, `--secondary` in both themes; `--primary` and `--accent` unchanged). Add palette D to `01-DESIGN-TOKENS.md` as a candidate, set `Chosen palette: D`, regenerate `docs/contrast-matrix.md`, update `src/styles/tokens.css` and the palette unit test. Verified offline: `RESULT: PASS palettes=4 checks=152`. The CI contrast gate must pass on the shipped file. One scoped inverted band (`.band-invert`, swaps `--text`/`--background`) on Projects only. — **Reversibility:** reversible — a ten-line token edit (D-06 of Phase 1).
- **D-03:** Replace Inter with Archivo Variable (`@fontsource-variable/archivo` 5.3.0, `wdth.css`: weight 100 to 900, width 62% to 125%, latin woff2 about 90 kB). One family; remove `@fontsource-variable/inter`. Type ladder per DESIGN.md §5 (`--t-mega` through `--t-xs`), replacing the 1.2 modular ladder at the top end. Night widens only the wordmarks (`font-stretch` 125%); headings do not change width on toggle. Record the font change and the +42 kB font weight in the tokens doc.
- **D-04:** Poster hero: "Aaron / Phan" at `--t-mega` (wght 800, tracking -0.045em, optical negative indent), role line, Resume and Copy email CTAs, and two corner facts: "Graduating December 2026, UT Austin ECE" and "Last role: Capital One, summer 2026". Amend the HERO block in the content inventory and the hero frames in the IA doc. Name, role and CTAs stay in static HTML, visible with JS off (NAV-01), and are never delayed by IX-01.
- **D-05:** CSS hover treatments ship in Phase 3, one per role (DESIGN.md §5 table): primary CTAs flood with ink from the bottom via `clip-path` with a 2 px label lift; nav labels flip on X (duplicate label `aria-hidden`); experience rows draw their rule to full width and widen the company name (`font-stretch` 100% to 112%); utility links change color and underline only. Hover styles only under `(hover: hover)` per Tailwind v4. Focus-visible gets the equivalent state plus the ring. Springs (press-squish IX-02, lift IX-03) stay in Phase 4.
- **D-06:** Radius rule: things you hold are near-square (4 px: sleeves, dialog panel, photo); things you press are pills (buttons, chips, pill nav, toggle). Replaces the sm/md/lg card radii.

### Section layouts
- **D-07:** Experience is an index list: full-width rows on two hang lines (company col 1, title col 7, dates right-aligned in tabular figures), 20 px logos inline. Bullets live in native `<details>`/`<summary>` so they open without JS and with the keyboard. Phase 5 layers the SEC-01 motion and count-up on top.
- **D-08:** Projects is the crate in static form: seven typographic sleeves in a CSS scroll-snap row (IX-04 is CSS, so it ships now) on the inverted band, with an index ("3 / 7"). Selecting a sleeve opens an unanimated native `<dialog>` with the project details that satisfies ADR-0006 (focus trap, Escape, focus return, prev/next, close). Phase 4 adds the lift, neighbor lean, record pull and the morph (IX-03, IX-05, IX-06).
- **D-09:** Sleeve covers are typographic only: title set large and cropped by the sleeve edge, stack listed small like a tracklist, dates as the label. Each sleeve's ground is a derived token shade per context (personal, employer, hackathon, course); no new raw colors (the raw-color gate applies). No fake screenshots.
- **D-10:** Skills is a statement: four sentences at `--t-l` (Languages, Frameworks, Developer Tools, Libraries) across columns 1 to 10. The slider is dropped: amend SEC-02 in `REQUIREMENTS.md`/`ROADMAP.md` (Phase 5) and IX-13 in the motion spec; do not vendor `InfiniteSlider`. — **Reversibility:** reversible — changes a later-phase requirement only.
- **D-11:** Education is a facts layout led by "December 2026" at `--t-xl` in tabular figures with "Graduating", the degree, track and GPA beside it, and the high school entry below. Amend SEC-03 and make IX-14 optional.
- **D-12:** About is an asymmetric pair: the DJ photo (cols 1 to 5) and the bio (cols 7 to 11). It introduces the night side in plain words. Contact is the footer finale: the email itself is the copy button at `--t-l`, links to GitHub, LinkedIn, Instagram and Resume, then the fit-to-width wordmark.

### Content
- **D-13:** Project links (G-01): the owner supplies public repo URLs per project. Projects without one show no link. **Owner input checkpoint** before the content modules are finalized.
- **D-14:** The three featured projects (RecipeCart, A.T.L.A.S, Suspect Genie) get a three-line problem / approach / outcome write-up drafted by Claude from resume facts only (no new figures), recorded as before/after edits in the content inventory (rule 3), and shipped only after owner approval (**checkpoint**). The other four projects use their bullets verbatim.
- **D-15:** The About quote is replaced by one line in the owner's own words about the night side. **Owner input checkpoint.** Until supplied, the section renders without a quote (never the old quote, never invented copy).
- **D-16:** Resume PDF (CNT-04): the owner exports a phone-free PDF from the source document; it replaces the stand-in `public/resume.pdf`. The existing phone-number gate must scan the PDF's text layer. **Owner input checkpoint.** Never publish the source PDF in `references/`.

### Navigation
- **D-17:** The pill morph (IX-07) and the sliding scroll-spy indicator (IX-08) are animated in Phase 3 with motion, through the anim barrel, with instant state changes under reduced motion.
- **D-18:** Desktop nav (768 px and up): PHAN/PHVNTM wordmark top left, all six section links, the theme toggle and the Resume button. Always visible (no hide on scroll), solid ground fill, `scroll-margin-top` equal to the nav height on every section.
- **D-19:** Phones: a non-fixed top bar above the hero carries the wordmark and the theme toggle, so the signature switch is visible on first paint; the pill menu also carries the toggle and Resume (per the IA). The collapsed pill keeps Experience, Projects and Menu.
- **D-20:** The theme toggle moves out of its fixed Phase 2 position (Phase 2 D-08). Its react-spring thumb (IX-10) is unchanged; the night-only 33⅓ rpm groove (DESIGN.md idle state) is Phase 4.

### Carried forward (do not re-decide)
- **D-21:** Content inventory rules: resume wins, verbatim copy with recorded edits, date policy D-10, no phone number anywhere (D-11). Section order and anchors per the IA doc. 10-second test per the design brief.
- **D-22:** Stack, layering and import boundaries per `docs/architecture.md`; the motion/react-spring ownership matrix; the 150 kB gz JS budget and all Phase 2 CI gates stay green.

### Claude's Discretion
Content module shapes and file layout under the architecture doc, exact derived shades for sleeve contexts, the copy-email toast wording and timing, image pipeline details (vite-imagetools settings, which logos and photos ship), the 404 page markup and how GitHub Pages serves it, the wording of the doc amendments.

### Deferred Ideas (OUT OF SCOPE)
- Animated wordmark flip IX-18, crate physics and record pull, overlay morph, night-only toggle groove: Phase 4.
- Experience expand motion and metric count-up (SEC-01 motion): Phase 5.
- OG image with the split wordmark, favicon refresh, Lighthouse/axe/VoiceOver gates: Phase 6.
- A `/jury` score of the Phase 3 build (first build worth scoring): after Phase 3 execution.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CNT-01 | All six sections render from typed content modules | Content model in `docs/architecture.md` (schema.ts + one module per section, `satisfies`), Page-only content import enforced by `.oxlintrc.json`; Pattern 1, Validation map |
| CNT-02 | 5 experience entries, 7 projects, education with GPA, public email, DJ Instagram | `01-CONTENT-INVENTORY.md` is a complete oracle (EXP-01..05, PRJ-01..07, EDU-01..02, CON-01..05); inventory-parity unit test recommended |
| CNT-04 | Resume PDF download, phone number nowhere incl. PDF | Source PDF has the number in its text layer (probe); `check-no-phone` cannot see inside compressed PDF streams (Phase 2 review WR-01); pdfjs-dist text-layer gate (probe-verified) |
| CNT-05 | Only used images, AVIF/WebP, EXIF stripped | vite-imagetools 12.0.1 strips EXIF by default (probe-verified); new `check:images` gate for "only used" and "no EXIF" |
| NAV-02 | Sticky desktop nav with scroll-spy, mobile morphing pill, skip link | IO band scroll-spy, motion `m` + async `domMax` (probe-measured +15.8 kB initial), `layoutRoot` on the fixed pill, skip link with `tabindex=-1` main |
| NAV-03 | Copy email with confirmation toast | Clipboard helper with `execCommand` and mailto fallbacks, persistent live region, Playwright clipboard permissions |
| NAV-04 | 10-second phone acceptance test | Automated first-viewport/step-budget proxy on a Chromium mobile project + a human timed run on a real phone (end-of-phase checkpoint) |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

Source: `/Users/aphan/aa-phan-portfolio-v2/.claude/CLAUDE.md` (read this session) and the user's global `~/.claude/CLAUDE.md`.

- Stack is fixed: Vite + React + TypeScript + Tailwind v4, motion (import `motion/react` only) and `@react-spring/web` (never the `react-spring` umbrella). Hosting is GitHub Pages, static output only.
- Mobile must be excellent: touch interactions and phone performance. `prefers-reduced-motion` respected. Good Lighthouse scores.
- Both libraries never animate the same element or property. `@use-gesture/react` is not added by default. No `shadcn init`, no `tailwind.config.js`, no hard-coded absolute asset paths.
- Tailwind v4 `hover:` stays under `@media (hover: hover)`; do not restore v3 behavior with `@custom-variant hover`.
- Process: detailed documentation before coding; research and surface findings for tooling decisions. GSD workflow enforcement: file edits happen through a GSD command (plan then `/gsd-execute-phase`), not ad hoc.
- Memory rule (`MEMORY.md`): never publish a phone number; the resume PDF is the source of truth for content.
- No emojis. Visible copy: sentence case, no em dashes, no uppercase eyebrow labels (CONTEXT `<specifics>`).
- No project skills directory exists (`.claude/skills`, `.agents/skills` absent).

## Summary

Phase 3 is mostly assembly on a solid Phase 2 skeleton, plus three pieces of genuinely new engineering: a privacy-grade PDF text-layer gate, an image pipeline with a "only what ships" gate, and an accessible two-form navigation (desktop scroll-spy bar, mobile morphing pill) that must stay inside the 150 kB initial-JS budget. The content is not a research problem: `01-CONTENT-INVENTORY.md` already holds every verbatim string, date, link and ruling for the 5 experience entries, 7 projects, 2 education entries, bio, skills and contacts, so the content modules are a transcription task checked by tests against that oracle.

Four findings change how the plan should be shaped. (1) The `.band-invert` Projects band cannot be a simple `--text`/`--background` swap: derived tokens such as `--muted`, `--link` and `--surface` are declared on the theme element and inherit as already-resolved colors, so they do not follow the swap (verified in Chromium). The band must redeclare the derived block, and the contrast gate's token parser classifies any selector containing `data-theme` dark as the dark theme, so a band selector would silently overwrite the audited palette unless the parser and pairs file are extended first. (2) Motion's layout animations (pill morph, shared indicator) cost +40.4 kB gz if imported as `motion.*`, but only +15.8 kB initial (plus a 27.9 kB async chunk) with `LazyMotion` and an async `domMax`; that keeps the initial bundle near 103 kB before section code (probe builds). (3) The Phase 2 phone gate (`check-no-phone`) reads the PDF as latin1, so it cannot see the number in a compressed stream; the source resume's text layer does contain a phone-shaped string (probe), and the stand-in `public/resume.pdf` is 594 bytes. A pdfjs-based extractor flags the source and exposes annotations and metadata. (4) Several existing tests pin palette A values, Inter and the old hero (`tokens.test.ts` hex and ratio tables, `smoke.spec.ts` and `theme.spec.ts` background strings, the font-family assertion, the `Contact` link, the whole-`main` parity test); each must be updated in the same plan that changes the thing it pins.

**Primary recommendation:** Build in this order: (a) infra and tokens (Archivo, palette D, band-aware contrast gate, updated token/e2e pins), (b) content modules + image pipeline + PDF/image gates, (c) layout shell (shared theme store, nav, skip link, toast), (d) sections, (e) 404, doc amendments and the mobile acceptance suite; gate the content finalization on the four owner checkpoints (D-13 to D-16) and run the real-phone 10-second test as the end-of-phase human check.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Section content (copy, dates, links) | Build-time data (`src/content/*.ts`) | Browser (renders via props) | Typed modules; only `Page.tsx` imports them (lint-enforced) |
| Static hero shell (JS off) | CDN / Static (`index.html`) | Browser (React replaces it) | NAV-01: name, role, CTAs visible with no JS; parity test keeps shell and React identical |
| Image optimization (AVIF/WebP, EXIF strip) | Build (vite-imagetools via sharp) | CDN / Static (hashed assets) | Done once at build; nothing resized at runtime |
| Resume PDF | CDN / Static (`public/resume.pdf`) | Build gate (text-layer scan) | Served as-is; privacy enforced by a CI gate, not at runtime |
| Theme state + wordmark swap | Browser (`html[data-theme]`) | CSS | Wordmark swap is pure CSS on `data-theme`; shared external store keeps every toggle in sync |
| Scroll-spy | Browser (IntersectionObserver hook) | CSS (`scroll-margin-top`) | Needs viewport geometry; no server involvement |
| Pill/indicator morph | Browser (motion layout animation via `src/anim`) | CSS (static layout) | Layout animation is motion's job per the ownership matrix; static state works without it |
| Copy email + toast | Browser (Clipboard API, live region) | none | Needs a user gesture and a secure context (HTTPS on Pages, localhost in tests) |
| Project dialog (a11y) | Browser (native `<dialog>.showModal()`) | CSS (`::backdrop`, scroll lock) | Native top layer gives focus trap, inert background, Escape (ADR-0006 fallback path) |
| 404 page | CDN / Static (`404.html` at artifact root) | Build (second Vite HTML entry) | GitHub Pages serves `404.html` for unknown paths |
| Privacy/quality gates | CI (`npm run verify`) | Unit tests | Gates are Node scripts over `dist/` and `src/` |

## Standard Stack

### Core (already installed; do not change)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite | ^8.3.4 | Build | `package.json` (read this session) |
| react / react-dom | ^19.3.0 | UI | `package.json` |
| tailwindcss + @tailwindcss/vite | ^4.3.3 | Styling, CSS-first | `package.json` |
| motion | ~14.0.0 | Layout/presence animation (pill, indicator, toast) | Ownership matrix; import only via `@/anim` |
| @react-spring/web | ~10.1.2 | Theme thumb only in this phase | IX-10 unchanged |
| vitest / @playwright/test | ^5.0.3 / ~1.64.0 | Unit / e2e | Existing infra |

### New in this phase
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| @fontsource-variable/archivo | ^5.3.0 (5.3.0 verified) | Archivo Variable, `wdth.css` | D-03. Probe: `wdth.css` declares `font-family: 'Archivo Variable'`, `font-weight: 100 900`, `font-stretch: 62% 125%`, latin file 90,104 B |
| vite-imagetools | ^12.0.1 (12.0.1 verified) | Resize + AVIF/WebP + srcset, EXIF stripped | Architecture doc stack row; probe-verified on Vite 8.3.4 |
| pdfjs-dist (devDependency) | ~6.3.289 | PDF text layer, annotations and metadata extraction inside `check-no-phone` | Only way found to see compressed PDF text in Node; probe extracted text from the source PDF. See Package Legitimacy Audit (SUS, checkpoint) |

### Remove
`@fontsource-variable/inter` (D-03). Update `src/main.tsx`, the `--font-sans`/`--font-display` stacks in `src/styles/index.css` and the Inter assertions in `tests/e2e/smoke.spec.ts`.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| pdfjs-dist | `pdftotext` (poppler) shell-out | Zero npm risk, but absent from the runner image list I could check (see A5) and from some dev machines; would need an `apt-get install poppler-utils` step in both workflows |
| pdfjs-dist | `unpdf` | Thin wrapper over pdfjs, published 2026-10-19 (too-new), no benefit |
| inline SVG for ~5 UI glyphs | `lucide-react` | ADR-0005 says UI glyphs come from lucide-react, but it is not installed, is flagged SUS (too-new, daily releases) and adds a gate; see Open Question 3 |
| `motion.*` imports | `m` + `LazyMotion` async `domMax` | `motion.*` adds +40.4 kB gz to initial JS (probe); `LazyMotion` async adds +15.8 kB initial and a 27.9 kB async chunk |

**Installation:**
```bash
npm install @fontsource-variable/archivo@^5.3.0
npm uninstall @fontsource-variable/inter
npm install -D vite-imagetools@^12.0.1 pdfjs-dist@~6.3.289
```

**Version verification** (this session, `npm view` / `gsd package-legitimacy`):
- `vite-imagetools` 12.0.1, published 2026-08-28, peer `vite >=8.0.0`, 190,883 downloads/week.
- `@fontsource-variable/archivo` 5.3.0, published 2026-07-19, 325,087/week.
- `pdfjs-dist` 6.3.289 published 2026-08-29 (newest is 6.4.299 from 2026-10-03; pin the older one). `engines.node` is `>=22.13.0 || >=24`, narrower than the repo's `^22.12.0`, so `npm ci` on Node 22.12 only warns. It declares optional `@napi-rs/canvas`, which the text path does not use.
- `sharp` 0.35.5 arrives transitively through `imagetools-core` 12.0.0. No install script in `npm view sharp scripts.install`.

## Package Legitimacy Audit

Ran `gsd-tools query package-legitimacy check --ecosystem npm ...` this session.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| vite-imagetools | npm | published 2026-08-28 (long-lived project) | 190,883/wk | github.com/JonasKruckenberg/imagetools | OK | Approved. Already named in `docs/architecture.md` |
| @fontsource-variable/archivo | npm | published 2026-07-19 | 325,087/wk | github.com/fontsource/font-files | OK | Approved. Same family as the installed Inter package |
| pdfjs-dist | npm | latest 2026-10-03 (pin 6.3.289, 2026-08-29) | 20,450,168/wk | github.com/mozilla/pdf.js | SUS (`too-new`, applies to the latest tag; the project is Mozilla's PDF.js) | Flagged. `[WARNING: flagged as suspicious — verify before using.]` Planner must add a `checkpoint:human-verify` before install; no postinstall script (`postinstall: null`) |
| lucide-react | npm | latest 2026-10-17 | 67,096,172/wk | github.com/lucide-icons/lucide | SUS (`too-new`) | Not recommended for this phase (use inline SVG, Open Question 3). If chosen, checkpoint before install |
| unpdf | npm | latest 2026-10-19 | 4,148,070/wk | github.com/unjs/unpdf | SUS (`too-new`) | Not recommended; pdfjs-dist is the direct dependency |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** pdfjs-dist (recommended, needs checkpoint), lucide-react and unpdf (not recommended)

## Architecture Patterns

### System Architecture Diagram

```
 owner inputs (D-13 repo URLs, D-14 write-up approval, D-15 quote line, D-16 phone-free PDF)
        |
        v
 src/content/*.ts  (typed, satisfies schema; transcribed from 01-CONTENT-INVENTORY.md)
        |  images.ts imports  ../assets/images/*.jpg|png ?w=..&format=avif;webp&as=picture
        |                                  (vite-imagetools: resize, convert, strip EXIF)
        v
 src/app/Page.tsx  (ONLY importer of content)  --props-->  <SiteHeader> <main#main tabindex=-1> <Footer>
        |                                                     |            |                 |
        |                                                     |            |                 +-- Contact finale + fit-to-width wordmark
        |                                                     |            +-- Hero, Experience, Projects(crate+dialog), About, Skills, Education
        |                                                     +-- SkipLink (first focusable) -> #main
        |                                                     +-- Desktop nav (>=768) | Phone top bar + fixed pill (<768)
        |                                                          |                          |
        |                                         useActiveSection (IntersectionObserver band) |
        |                                                          v                          v
        |                                       indicator (m.span layoutId)         pill/panel (m.nav layout, layoutRoot)
        |                                                          \_____ both through @/anim barrel _____/
        |
 click "Copy email" (Hero CTA, Contact email button)
        |--> copyText(): navigator.clipboard.writeText -> execCommand fallback -> mailto fallback
        |--> ToastProvider: persistent role=status live region (text) + animated visual toast (aria-hidden), 4 s

 theme toggle(s) --> applyTheme() --> html[data-theme] --(MutationObserver store)--> every toggle + CSS wordmark swap

 BUILD: vite build (index.html + 404.html entries) -> dist/
 GATES (npm run verify): typecheck, lint, format, vitest, path-case, raw-color, contrast (band-aware),
        build, JS budget (150 kB), no-phone (+PDF text layer), check:images (new)
 PLAYWRIGHT: desktop project (existing + new), mobile project (Pixel 7, touch) for NAV-04
```

### Recommended Project Structure

Follows `docs/architecture.md`; new or changed items marked.

```
src/
├── app/            App.tsx (Providers + Page only), Page.tsx (renders header, main, footer), Providers.tsx (+ToastProvider)
├── content/        schema.ts, profile.ts, experience.ts, projects.ts, skills.ts, education.ts, contacts.ts, images.ts, index.ts
├── sections/       Hero/, Experience/, Projects/ (Crate, Sleeve, ProjectDialog), About/, Skills/, Education/, Contact/
├── layout/         Container, Section, SiteHeader (desktop bar + phone top bar), PillNav, SkipLink, Footer, Wordmark
├── components/ui/  Button/CtaLink, ThemeToggle (now store-backed), Toast, icons/ (GitHub, LinkedIn, Instagram, + UI glyphs)
├── anim/           index.ts barrel (+ MotionFeatures, PillMorph, NavIndicator, ToastPresence)
├── hooks/          useActiveSection, useTheme, useMediaQuery (only if needed)
├── lib/            theme.ts (+ store), copy.ts (copyText), utils.ts
├── assets/images/  about-dj.jpg, logos (capitalone.png, spectrum.png, symbotic.png): ONLY these four
└── styles/         tokens.css (palette D + band), index.css (Archivo + ladder), base.css
404.html            second Vite HTML entry (pure HTML+CSS, theme init script, no React)
scripts/            check-images.mjs (new), check-no-phone.mjs (+PDF), lib/tokens.mjs (+band), contrast-pairs.json (+band, sleeves)
tests/e2e/mobile/   10-second acceptance and pill-nav specs (mobile project only)
```

### Pattern 1: Content modules as the single source, tested against the inventory
**What:** One module per section, typed by `schema.ts`, ordering in the data. A unit test parses `01-CONTENT-INVENTORY.md` (EXP-01..05, PRJ-01..07 headings; "Bullets:" numbered lines) and asserts the modules match, so the verbatim rule is enforced by CI rather than review. Where D-14 write-ups replace or add text, the inventory records the before/after (rule 3) and the test compares against the recorded value.
**When to use:** Every content module.
**Verified values from the inventory** (Read this session, `01-CONTENT-INVENTORY.md`):
- Email: `aaron.phan240@gmail.com` (CON-01, line 372). GitHub `https://github.com/aa-phan` (CON-02). LinkedIn `https://www.linkedin.com/in/aa-phan/` (CON-03). Instagram `https://www.instagram.com/phvntm_` (CON-04).
- Date policy D-10: single `Month YYYY`; range `Month YYYY – Month YYYY` with U+2013 and spaces, e.g. `May 2025 – August 2025`.
- EDU-01: `GPA: 3.2`, `Track: Data Science (legacy site)`, dates `August 2022 – December 2026`. EDU-02: `Glenda Dawson High School`, `GPA: 3.911`, dates `May 2022`.
- Featured projects: PRJ-01 RecipeCart, PRJ-02 A.T.L.A.S, PRJ-03 Suspect Genie (`Featured: yes`); PRJ-04..07 `Featured: no`.
- ABT-04 alt text (verbatim): `Aaron Phan DJing at his UT Austin graduation`.
- Hero role line (HERO-02 Chosen): `Software engineer building cloud-native backends in Go.`
- Skills groups SKL-01..04 as listed in the inventory (alphabetical, official casing).
- No phone field in the model; no `tel:` anywhere (CON-06).
**Example:**
```typescript
// Source: docs/architecture.md "Content model" (satisfies against the schema)
import type { ExperienceEntry } from '@/content/schema'
export const experience = [
  {
    id: 'capital-one',
    role: 'Software Engineer Intern',
    org: 'Capital One',
    location: 'Plano, TX',
    dates: { start: '2026-06', end: '2026-08', label: 'June 2026 – August 2026' },
    bullets: [/* verbatim from EXP-01 */],
  },
] as const satisfies readonly ExperienceEntry[]
```

### Pattern 2: Scroll-spy with an IntersectionObserver band
**What:** Observe the seven section elements with a thin active band; the active id is the last intersecting section in DOM order; when nothing intersects keep the previous id; at the bottom of the page force the last section (the Contact section may never enter the band). While a nav click smooth-scrolls, lock the active id to the target until scrolling settles, otherwise the indicator sweeps through every intermediate link.
**When to use:** `useActiveSection` in `src/hooks/`, consumed by the desktop nav and the pill.
**Example:**
```typescript
// Pure picker is unit-testable without IntersectionObserver (jsdom has none; tests/setup.ts only stubs matchMedia)
export function pickActive(order: string[], intersecting: Set<string>, prev: string | null, atBottom: boolean) {
  if (atBottom) return order[order.length - 1]
  for (let i = order.length - 1; i >= 0; i--) if (intersecting.has(order[i])) return order[i]
  return prev
}
// rootMargin: top offset = nav height, bottom -60% => a band near the upper-middle of the viewport
// new IntersectionObserver(cb, { rootMargin: 'calc(-1 * var(--nav-h)) 0px -60% 0px' })  // compute px at runtime; CSS vars are not allowed in rootMargin
```
Note: `rootMargin` takes px/% only, not `calc()` or CSS variables; read `--nav-h` with `getComputedStyle` once and build the string.

### Pattern 3: Motion through the barrel, features loaded lazily
**What:** Add `MotionFeatures` (a `LazyMotion` whose `features` is an async import of `domMax`) to `Providers`, and build `PillMorph`, `NavIndicator` and `ToastPresence` from `m.*` and `AnimatePresence` inside `src/anim/declarative/`. Pages render a static, fully functional pill/indicator first; animation upgrades when the chunk lands. Do not set `strict` on `LazyMotion` because the vendored `TextEffect` uses `motion.*` (docs: strict "will throw an error if a `motion` component renders within a `LazyMotion` component").
**Measured** (probe builds in the scratchpad, gz bytes, level 9): React + MotionConfig + `useSpring` = 84,545; plus `motion.nav layout` + `AnimatePresence` + `layoutId` = 124,970 (+40,425); same with `m` + `LazyMotion features={domMax}` sync = 125,071 (no saving); `m` + `LazyMotion` with async `domMax` = 100,321 initial plus a 27,946 async chunk (+15,776 initial). Current app initial is 86,954 B (02-07 summary), so the nav motion should land near 103 kB before section code.
**Layout-animation rules** [CITED: motion.dev/docs/react-layout-animations]: put `borderRadius`/`boxShadow` in `style` so scale correction works; add `layout` (or `layout="position"` for text) to direct children to avoid distortion; wrap sibling groups in `LayoutGroup`; add `layoutRoot` to the `position: fixed` pill so page scroll offset is accounted for.
**Example:**
```tsx
// src/anim/MotionFeatures.tsx  (inside src/anim, so imports are allowed)
import type { ReactNode } from 'react'
import { LazyMotion } from 'motion/react'
const loadFeatures = () => import('./features').then((m) => m.default) // features.ts: export { domMax as default } from 'motion/react'
export function MotionFeatures({ children }: { children: ReactNode }) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>
}
```
Preload the chunk on idle after first paint so the first Menu tap animates; if it has not loaded, the panel simply appears (graceful).

### Pattern 4: Palette D with a band-aware token pipeline
**What:** Edit the ten role lines in `src/styles/tokens.css` from the `palette D` block in `DESIGN.md` §5 (values listed there, quoted below), add candidate D plus `Chosen palette: D` to `01-DESIGN-TOKENS.md`, regenerate the matrix with `node scripts/check-contrast.mjs --write`.
**Palette D role lines** (verbatim from `DESIGN.md` lines 91-100):
```
light --text oklch(0.1491 0.0128 292.39)
light --background oklch(0.9696 0.0030 290.00)
light --primary oklch(0.5113 0.2298 277.28)
light --secondary oklch(0.9355 0.0066 286.27)
light --accent oklch(0.5143 0.2729 272.97)
dark --text oklch(0.9696 0.0030 290.00)
dark --background oklch(0.1491 0.0128 292.39)
dark --primary oklch(0.6383 0.1988 281.11)
dark --secondary oklch(0.2274 0.0173 290.04)
dark --accent oklch(0.7288 0.1457 283.95)
```
(`--primary` and `--accent` equal the current `tokens.css` values, so only text/background/secondary change.)
**The band:** `.band-invert` must be implemented by giving the band the opposite theme's full token block, not by swapping two variables, because derived tokens do not follow a swap (Pitfall 1). Recommended CSS shape: `[data-theme='light'] .band-invert { <dark block, all 14 colors> }` and `[data-theme='dark'] .band-invert { <light block> }`. Every band pair is then already inside the audited palette. The gate must still see it: extend `parseTokensCss` (Pitfall 2) to return `lightBand` and `darkBand` maps and add `scripts/contrast-pairs.json` rows tagged for the band so a future edit cannot drift.
**Sleeve grounds (D-09):** define four derived tokens (`--sleeve-personal`, `--sleeve-employer`, `--sleeve-hackathon`, `--sleeve-course`) as `color-mix(in oklch, var(--X) P%, var(--background))` of existing roles, add them to `COLOR_TOKENS` in `scripts/lib/tokens.mjs`, and add `--text`/`--muted` on each sleeve token to the pairs file in both themes and both bands. Adding to `COLOR_TOKENS` requires updating `tests/unit/tokens.test.ts` (it asserts the exact 14-key list).

### Pattern 5: Shared theme store and CSS-only wordmark
**What:** `ThemeToggle` today keeps `useState(readTheme)`; three toggles will exist (phone top bar, pill panel, desktop bar) and would drift. Add `useTheme` with `useSyncExternalStore` over a `MutationObserver` on `html[data-theme]` (also fixes Phase 2 review IN-02). The wordmark renders both strings in `aria-hidden` spans and switches by `[data-theme]` in CSS, so there is no JS state and no flash. The repo pattern is "no `dark:` variants in components", so put the show/hide rule in `src/styles/` (a small `.wordmark-day`/`.wordmark-night` pair) rather than `dark:hidden`.

### Pattern 6: Native `<dialog>` for the project overlay
**What:** Sleeves are `<button>`s inside `<li>`s of a `scroll-snap-type: x mandatory` list. A single `<dialog aria-labelledby>` rendered by the Projects section; opening sets index state and calls `showModal()` in an effect; `close` event clears state. Prev/next wrap (07 / 07 → 01 / 07, per the IA). Save `document.activeElement` before opening and restore on close even though modern browsers restore focus (ADR-0006: focus return and scroll lock are handled explicitly). Backdrop click: close when `event.target === dialog`. Scroll lock: `html:has(dialog[open]) { overflow: hidden }`. No animation (D-08); Phase 4 adds the morph to the inner panel, not the `<dialog>` box (ADR-0006).
**Result to record:** this closes OD-06 via the ADR-0006 fallback path (native dialog chosen without running the MorphingDialog spike); write a short ADR (suggest 0009) and update the OD-06 row.

### Pattern 7: Copy email as a progressively enhanced link
**What:** Keep the Phase 2 element (`<a href="mailto:...">` with the label "Copy email") so the static shell and React render identically (parity test) and JS-off still works; in React add `onClick` that always `preventDefault()`s, calls `copyText()`, shows the toast on success, and on total failure sets `window.location.href = 'mailto:...'` and toasts "Opening your mail app". Phase 2 review IN-01 flagged exactly this label/behavior gap.
In Contact, the email string itself is the button (D-12). Give it an accessible name that states the action and value ("Copy email address aaron.phan240@gmail.com") and render it as a `<button>`; the shell has no Contact content, so parity does not constrain it.
```typescript
// src/lib/copy.ts
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true }
  } catch { /* fall through */ }
  const ta = document.createElement('textarea')
  ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'
  document.body.appendChild(ta); ta.select()
  try { return document.execCommand('copy') } catch { return false } finally { ta.remove() }
}
```

### Pattern 8: Image pipeline
**What:** Put only `about-dj.jpg` and the three logo PNGs in `src/assets/images/`. Import with directives; `as=picture` returns `{ sources: { avif: 'url 400w, url 539w', webp: '...' }, img: { src, w, h } }` (probe output). The source photo is 539 px wide, so `w=400;800` yields 400w and 539w only (no upscaling): request `w=400;539` to be explicit. Logos render at 20 px (D-07): request `w=40;60` (2x/3x) as WebP/AVIF. Map the result into the schema's `ImageAsset` in `content/images.ts` (alt text stays in content, never in the import).
**EXIF:** verified: the source JPEG contains an `Exif` marker; all AVIF/WebP outputs contain zero `Exif`/`EXIF` markers with default settings (probe). Do not enable any metadata-keeping directive.
**Tests/Vitest:** content modules import `?as=picture` URLs, and `tests/unit/hero-parity.test.tsx` imports `Page`, which imports content, so `vitest.config.ts` must also register `imagetools()` (or alias a stub) or every Page-importing test fails to resolve. Add `/// <reference types="vite-imagetools/client" />`-style typing (or a local `*.jpg?*` module declaration) for `tsc -b`.
**Gate:** new `scripts/check-images.mjs` over `dist/` and `src/assets/images/` (see Validation Architecture).

### Anti-Patterns to Avoid
- **Importing `motion.*` (full) in the pill/indicator:** +40 kB gz initial; use `m` + async `domMax`.
- **Relying on a `--text`/`--background` swap for the band:** derived tokens will be wrong (Pitfall 1).
- **Comparing the entire `main` in the parity test once sections have real content:** the shell would need every section's markup. Scope parity to `section#hero` plus the section id/heading skeleton (Pitfall 4).
- **Two toggles with independent `useState`:** drift and ambiguous `getByRole('button', { name: 'Dark theme' })` (Pitfall 6).
- **`position: fixed` pill without `layoutRoot`, or without bottom padding on the last section/footer:** the pill covers content and the layout animation mismeasures after scroll.
- **Putting `Copy email` focus handling only in a toast:** announcement belongs in a live region present in the DOM before the message changes (IX-09).
- **Adding the source PDF or `references/` to `public/`:** never (D-16, ADR-0008, REQUIREMENTS Out of Scope).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image resize/convert/EXIF strip | A sharp script or manual `cwebp` outputs committed to git | vite-imagetools directives | Hashed, cacheable, srcset generated, EXIF stripped by default (probe) |
| Modal focus trap, inert background, Escape | A custom trap | Native `<dialog>.showModal()` | Top layer handles all three; ADR-0006 rejects a custom trap |
| PDF text extraction for the phone gate | Regex over raw PDF bytes or ad hoc Flate decoding | pdfjs-dist `getTextContent`, `getAnnotations`, `getMetadata` | Text is split across kerning arrays and compressed object streams (the source uses `/ObjStm`); regex over bytes gives false assurance (Phase 2 review WR-01) |
| Layout/shared-element animation | CSS FLIP by hand | motion `layout` / `layoutId` | The ownership matrix assigns it to motion; handles scale correction |
| Section/expand disclosure | A JS accordion | Native `<details>/<summary>` | D-07; works without JS and by keyboard; Phase 5 layers motion |
| Skip-link target focus | Custom focus manager | `href="#main"` plus `<main id="main" tabindex="-1">` | Native fragment navigation moves focus to a focusable target |
| Clipboard | A library | `navigator.clipboard.writeText` + `execCommand` fallback | Four lines (Pattern 7) |
| Brand icons | `react-icons`/`simple-icons` | Three inline SVG components | ADR-0005 |
| Font stretch at night | JS or a second font | `font-stretch` with Archivo's `wdth` axis, Tailwind `font-stretch-expanded` / `font-stretch-[112%]` | Axis is in the font (`font-stretch: 62% 125%`); Tailwind v4 utilities exist [CITED: tailwindcss.com/docs/font-stretch] |

**Key insight:** Nearly everything hard in this phase is already a platform feature (`dialog`, `details`, scroll-snap, IntersectionObserver, `font-stretch`, `clip-path`). The custom engineering is in the gates (PDF text, images, band contrast) that stop a regression from reaching a public site.

## Runtime State Inventory

Not a rename/refactor/migration phase (it adds sections and swaps the font/palette in place). Two stateful items are worth stating:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Browsers hold `localStorage['theme']` (`'light'`/`'dark'`) from Phase 2; the key and values do not change | None (verified in `src/lib/theme.ts`: `THEME_STORAGE_KEY = 'theme'`) |
| Live service config | GitHub Pages source is "GitHub Actions" (set in Phase 2); `404.html` is new content in the same artifact | Verify the 404 on staging after deploy (A2) |
| OS-registered state | None | None |
| Secrets/env vars | `VITE_BASE=/aa-phan-portfolio-v2/` in both workflows | None; the 404 page and all assets must stay base-aware |
| Build artifacts | `node_modules` holds `@fontsource-variable/inter` until uninstalled; `dist/` is stale after the font swap | `npm uninstall`, rebuild |

## Common Pitfalls

### Pitfall 1: Derived tokens do not follow a variable swap
**What goes wrong:** `.band-invert { --text: <near-white>; --background: <ink> }` leaves `--muted`, `--surface`, `--border`, `--link`, `--primary-hover`, `--focus-ring` at the page theme's values, so text inside the band is wrong and unaudited.
**Why it happens:** `color-mix(... var(--text) ...)` is resolved at the element where the custom property is declared (`html`), and the resolved color is what descendants inherit. Verified in Chromium this session: with `:root{--muted:color-mix(in oklch,var(--text) 70%,var(--background))}` and a child `.band{--text:white;--background:black}`, `getComputedStyle(...).color` of `var(--muted)` is identical inside and outside the band (`oklch(0.299998 0.0000149396 none)` both).
**How to avoid:** Give the band the opposite theme's full block (Pattern 4), or redeclare the derived block inside `.band-invert`.
**Warning signs:** low-contrast muted text or wrong link color in Projects only.

### Pitfall 2: The contrast parser misfiles compound selectors
**What goes wrong:** `parseTokensCss` sends any block whose selector matches `data-theme\s*=\s*['"]?dark` to the dark map and everything else to light, with later declarations winning. A `[data-theme='dark'] .band-invert {...}` block overwrites the dark theme's audited values; a `.band-invert {...}` block overwrites light. The gate then audits the wrong colors and still prints PASS.
**How to avoid:** Before adding the band to `tokens.css`, extend `scripts/lib/tokens.mjs` to recognize `.band-invert` selectors into separate maps, add pairs to `scripts/contrast-pairs.json`, extend `check-contrast.mjs` THEMES, and add negative tests in `tests/unit/tokens.test.ts` (as the file already does for tampering). Also heed Phase 2 review IN-04: the block regex cannot parse nested rules, so keep `tokens.css` flat (no `@media`/`@layer` wrappers) or make the parser throw on `@`.
**Warning signs:** `RESULT: PASS` after adding the band with no new check rows.

### Pitfall 3: Existing tests pin Phase 2 values
**What goes wrong:** After the palette/font/hero change, CI fails on assertions that are correct for Phase 2.
**Specific pins found** (all Read this session):
- `tests/unit/tokens.test.ts`: the `HEX` table (palette A hex per token), the 38-row `RATIOS` table, the title `palette A in src/styles/tokens.css`, and `--primary: oklch(0.5113 0.2298` tamper string (primary is unchanged, so that one survives).
- `tests/e2e/smoke.spec.ts`: body background `'oklch(0.9889 0.0039 286.33)'`; `await expect(links).toHaveText(['Download resume', 'Copy email', 'Contact'])` (twice); `toHaveCount(3)` for hero links; `unique` contains `'Inter Variable'` and `h1Family` matches `/^Inter Variable/`; `await expect(resume).toHaveAttribute('download', '')`; `await expect(page.locator('nav')).toHaveCount(0)` under JS off (still true if nav is React-only); `section#hero`/`h2` skeleton assertions.
- `tests/e2e/theme.spec.ts`: `LIGHT_BG = 'oklch(0.9889 0.0039 286.33)'`, `DARK_BG = 'oklch(0.119 0.0436 285.36)'`.
- `tests/e2e/motion.spec.ts`: `document.querySelector('button[aria-pressed]')` takes the first match (wrong once more than one toggle exists) and `getByRole('button', { name: 'Dark theme' })` (strict-mode failure if two toggles are visible).
- `tests/unit/hero-parity.test.tsx`: compares whole `main#main`.
**How to avoid:** Update each pin in the plan that changes its subject; scope toggle locators (`page.locator('header').getByRole(...)` or `.first()` on a named region).

### Pitfall 4: Static-shell parity cannot cover real sections
**What goes wrong:** The parity test canonicalizes the whole shell `main` against `Page`. With real section content, the shell would have to duplicate Experience, Projects and the rest.
**How to avoid:** Keep the shell = full hero + the existing six empty `section` stubs with `h2`. Narrow the parity test to `section#hero` (full canonical equality) plus equality of the section id/heading skeleton. The hero shell must be rewritten in lockstep with `Hero.tsx` (poster layout, corner facts, new CTAs, Tailwind classes sorted by the same Prettier plugin) or the test fails. JS-off visitors see hero + headings only; richer JS-off content is Phase 6 LCH-01 (`noscript`).

### Pitfall 5: The PDF gate has no eyes today
**What goes wrong:** `check-no-phone` lists `pdf` in `SCANNED` but reads latin1 bytes; PDF text is in Flate streams. The real resume would pass the gate even with the number in it. The probe confirmed: `references/Aaron_Phan_Resume.pdf` (LaTeX + hyperref, pdfTeX 1.40.26, `/ObjStm` present, 1 page) has a phone-shaped string in its extracted text, and its link annotations are `mailto` and `https` only (no `tel:`); `grep -c "tel:"` on raw bytes returns 0 regardless.
**How to avoid:** Extend the gate with a pdfjs-based pass (Code Examples). It must (a) extract text from every page, (b) list annotation URLs and fail on any `tel:`, (c) read `getMetadata().info` and `metadata`, (d) run the same phone regexes with the WR-01 fix (any separator run, optional `+country`), (e) assert the text layer contains the name and a minimum character count so a blank or stand-in file fails ("resume must be a real resume"). Print offsets/page numbers only, never the match. Build test fixtures at runtime (the existing `phoneShape` helper) so no committed file holds a phone-shaped literal, and generate a small phone-bearing fixture PDF in the test rather than committing one.
Also fix WR-01 item 1 (separators) in the same change; the current regex requires `[-.]` between the last two groups.

### Pitfall 6: Several toggles, several states
See Pattern 5. Symptoms: `aria-pressed` out of sync between the top bar and the pill panel; Playwright strict-mode errors.

### Pitfall 7: Scroll-spy edge cases
- Contact (and the footer) may never intersect the active band: force the last item at page bottom.
- Smooth-scroll from a nav click passes through intermediate sections: lock the target until `scrollend` (with a timeout fallback of about 700 ms because Safari support for `scrollend` is `[ASSUMED]` uncertain).
- Deep links (`/#projects`): the static shell is short, React then renders tall sections, so the browser's initial hash jump lands in the wrong place. After first mount, if `location.hash` is set, call `element.scrollIntoView()` once.
- `scroll-margin-top` must be one token (`--nav-h`) on every section at 768 px and up; on phones use `0`/safe area since the top bar is not fixed.
- `rootMargin` cannot use `calc()` or CSS variables; compute pixels at runtime.

### Pitfall 8: Skip link and landmarks
`href="#main"` scrolls but does not always move focus unless the target is focusable: give `<main id="main" tabIndex={-1}>` (and mirror the `tabindex` attribute in the shell, because the parity test compares attributes). The skip link must be the first focusable element in the React tree (the shell has no nav, so JS-off needs none). Hide it visually until `:focus`, with `z-index: var(--z-skip-link)`. Landmarks per IA: header (skip link + nav), nav, main, footer. Use `display: none` (not just `opacity`) for the inactive nav form so only one `navigation` exists in the accessibility tree at a time; label the pill nav distinctly.

### Pitfall 9: Fixed pill on iPhone
Use `padding-bottom: env(safe-area-inset-bottom)` and set `viewport-fit=cover` in the viewport meta (it is currently `width=device-width, initial-scale=1.0`). Reserve bottom padding on the page equal to the collapsed pill height plus safe area so the footer finale and the toast are not covered. The toast stacks above the pill (`--z-toast: 80` vs `--z-pill-nav: 50`). Native `<dialog>` is in the top layer and covers the pill.

### Pitfall 10: Archivo specifics
- `wdth.css` ships several `unicode-range` subsets. The latin range (verbatim from `wdth.css`) is `U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD`. It covers the en dash (U+2013), bullet and `·`. The Spectrum bullet contains `≤` (U+2264), which is in no declared range, so it will render in a fallback face (`[ASSUMED]`; harmless but visible under a font-family audit). The e2e font test limits declared families to 2; this stays true.
- Only latin (90,104 B) is fetched for English text; Vite emits the other subsets to `dist/` harmlessly.
- Fit-to-width wordmark: `container-type: inline-size` with `cqi` font sizes needs constants calibrated per glyph count and width (PHAN at wdth 100 vs PHVNTM at wdth 125). Calibrate, then guard with a Playwright test that measures `scrollWidth <= clientWidth` and `>= 90%` of the container at 375, 768, 1280 in both themes. Beware the swap font fallback: set `font-display: swap` (already declared) but measure after `document.fonts.ready`.
- Tailwind type tokens: `@theme` supports `--text-*--line-height`, `--text-*--letter-spacing` and `--text-*--font-weight` [CITED: tailwindcss.com/docs/font-size]. Map the `--t-*` ladder to `--text-mega`, `--text-xl` (redefined), `--text-l`, `--text-m`, `--text-body`, `--text-s`, `--text-xs` (redefined) and delete the old modular entries; redefining `text-xl`/`text-xs` silently changes any leftover usage, so grep `text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)` after the swap. `src/layout/Section.tsx` currently uses `text-3xl font-semibold`.

### Pitfall 11: The 404 page
- Add `404.html` as a second Vite HTML entry (`build.rollupOptions.input`), pure HTML + CSS importing the shared stylesheet, with the same inline theme-init script. Add it to the Tailwind `@source` list (`src/styles/index.css` lists only `index.html` and `src`).
- `check-js-budget` reads `dist/index.html` only, so it is unaffected.
- `vite preview` falls back to `index.html` for unknown paths, so e2e must request `404.html` directly; the real not-found status can only be confirmed on the deployed site (A2).
- Asset URLs come out base-prefixed (`/aa-phan-portfolio-v2/assets/...`), which is required because a 404 can be served from any depth.

### Pitfall 12: Hover treatments must be gated and focus-equivalent
`(hover: hover)` for pointer; `:focus-visible` for keyboard (D-05). The company-name `font-stretch` animation relayouts; keep it on one element and let `base.css` reduced-motion guard collapse the transition. The CTA flood label color on the ink flood is `--background` on `--text`, an already-audited pair (symmetric ratio); add an explicit row so the intent is traceable. `--primary-hover` becomes unused for CTAs; leave the token.

### Pitfall 13: Role-line flash (Phase 2 review WR-02)
The hero is restyled this phase. The static shell and Suspense fallback show the line, then `TextEffect` mounts hidden and reveals it, producing visible, hidden, visible. D-04 says name, role and CTAs are never delayed by IX-01. Fix in the same change: render the role line plain by default and either skip the effect or make the fallback match the effect's starting state. Add an e2e assertion that `#hero p` opacity never drops after first paint.

### Pitfall 14: Playwright projects must not double-run existing specs
Adding a mobile project globally would rerun every desktop spec on it. Use `testMatch: /mobile\/.*\.spec\.ts/` on the mobile project and `testIgnore: /mobile\//` on the existing chromium project. Use `devices['Pixel 7']` (Chromium-based, touch + mobile viewport); `devices['iPhone 13']` defaults to WebKit, which CI does not install (`npx playwright install --with-deps chromium`).

## Code Examples

### PDF text-layer pass (probe-verified approach)
```javascript
// scripts/check-no-phone.mjs addition. Source: pdfjs-dist 6.3.289 legacy build, run in Node 26.9 this session.
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
const data = new Uint8Array(fs.readFileSync(file))
const doc = await getDocument({ data, useSystemFonts: false, isEvalSupported: false }).promise
const meta = await doc.getMetadata()          // meta.info (Info dict), meta.metadata (XMP or null)
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i)
  const text = (await page.getTextContent()).items.map((x) => x.str).join(' ')
  const urls = (await page.getAnnotations()).filter((a) => a.url).map((a) => a.url)
  // run SHAPES over `text` and over JSON.stringify(meta.info); fail on any url starting with 'tel:'
}
```
Probe result on the source resume: 1 page, 3,686 characters, phone-shaped match in text = true, annotation schemes `mailto`, `https`, `https`. The probe printed no digits.

### Playwright: mobile project and clipboard
```typescript
// playwright.config.ts (additions)
import { defineConfig, devices } from '@playwright/test'
projects: [
  { name: 'chromium', use: { browserName: 'chromium' }, testIgnore: /mobile\// },
  { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile\/.*\.spec\.ts/ },
]
// in a spec
await context.grantPermissions(['clipboard-read', 'clipboard-write'])
await page.getByRole('link', { name: 'Copy email' }).click()
expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('aaron.phan240@gmail.com')
await expect(page.getByRole('status')).toContainText(/copied/i)
```

### Skip link
```tsx
// src/layout/SkipLink.tsx
export function SkipLink() {
  return (
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-(--z-skip-link) ...">
      Skip to main content
    </a>
  )
}
// Page: <main id="main" tabIndex={-1}>  (mirror tabindex="-1" in index.html)
```

### Image registry
```typescript
// src/content/images.ts
import dj from '@/assets/images/about-dj.jpg?w=400;539&format=avif;webp&as=picture'
import capitalone from '@/assets/images/capitalone.png?w=40;60&format=avif;webp&as=picture'
// as=picture => { sources: { avif: 'url 400w, url 539w', webp: '...' }, img: { src, w, h } }  (probe output)
export const aboutPhoto = { ...dj, alt: 'Aaron Phan DJing at his UT Austin graduation' }
```

### Band-aware parser sketch
```javascript
// scripts/lib/tokens.mjs: classify by selector, band first
const isBand = /\.band-invert\b/.test(selector)
const isDark = /data-theme\s*=\s*['"]?dark['"]?/.test(selector)
const target = isBand ? (isDark ? bandOnDark : bandOnLight) : isDark ? dark : light
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `motion.*` everywhere | `m` + `LazyMotion` with async feature import | motion docs | Keeps layout-animation code off the critical path (probe: -24.6 kB initial vs full) |
| Custom focus trap / modal libs | Native `<dialog>.showModal()` | broad support | Satisfies ADR-0006 with no dependency |
| `hover:` always on | Tailwind v4 `hover:` only under `(hover: hover)` | Tailwind v4 | Matches D-05 without extra work |
| Tailwind v3 config for type | `@theme` `--text-*` with `--line-height`, `--letter-spacing`, `--font-weight` modifiers | Tailwind v4 | One place for the ladder |
| JS carousels | CSS scroll-snap | long-standing | IX-04 is CSS only |

**Deprecated/outdated:** `lucide-react` as a mandatory dependency (never installed here; ADR-0005 wording lags the codebase); the `Contact` text link in the hero (D-04 drops it; Contact is reached through Copy email and the nav).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Safari's `scrollend` support is uncertain, so a timeout fallback is needed for the scroll-spy lock | Pitfall 7 | Indicator flicker on iOS until fixed; fallback is cheap |
| A2 | GitHub Pages serves a root `404.html` for unknown paths on a project site (`/aa-phan-portfolio-v2/...`); the GitHub doc fetched this session does not distinguish project from user sites | Pitfall 11 | 404 page not shown on staging; verify with `curl -i` on a non-existent path after the first deploy |
| A3 | `≤` (U+2264) is outside Archivo's declared unicode ranges and falls back to a system face | Pitfall 10 | Cosmetic only |
| A4 | `npm ci` on Linux CI resolves pdfjs-dist (optional `@napi-rs/canvas`) and sharp platform binaries from a macOS-generated lockfile | Standard Stack | CI install failure; Phase 2 hit a similar risk class (02-RESEARCH Pitfall 1); first push will show it |
| A5 | The ubuntu-latest image has no `pdftotext` (the Ubuntu 24.04 software list fetched this session mentions no poppler, but that list may omit apt packages) | Alternatives | Only matters if the poppler fallback is chosen |
| A6 | `html:has(dialog[open]) { overflow: hidden }` locks scroll on iOS Safari for a modal dialog | Pattern 6 | Background scrolls behind the dialog on iPhone; real-device check in Phase 6 QA-02 |
| A7 | Modern WebKit restores focus to the previously focused element on `dialog.close()` | Pattern 6 | Mitigated by explicit restore in code |
| A8 | `cqi` constants for the fit-to-width wordmark can be calibrated to land between 90% and 100% of the container at 375, 768, 1280 in both themes | Pitfall 10 | If not, fall back to a small JS fit or SVG `textLength`; test will catch it |
| A9 | The 10-second test passes on a real phone with Copy email counting as "contact" (the hero no longer has a Contact link) | Validation | If the owner wants a literal Contact link, add it back in the hero; it is one anchor |
| A10 | `font-stretch` transitions on one hovered company name are acceptable for jank (relayout per frame for 220 ms on one element) | Pitfall 12 | Visible hitch on slow phones; touch has no hover so impact is desktop only |

## Open Questions

1. **Who generates the phone-free PDF, and from what?**
   - What we know: the source is LaTeX/hyperref (pdfTeX 1.40.26) with the phone in the header text; annotations have no `tel:`; the stand-in is a 594-byte generated file. D-16 makes the owner export it.
   - What's unclear: whether the owner still has the `.tex`. Editing the header and recompiling gives a clean vector text layer; "print to PDF" or redaction overlays may leave the number in the text layer, which the new gate will (correctly) reject.
   - Recommendation: checkpoint instruction to the owner: remove the number from the source, recompile, drop the file in `public/resume.pdf`; the gate decides.
2. **Repo URLs for the seven projects (D-13).** Not in any file read. Projects without a URL show no link; the schema's `links` is optional. Block final content only for the URL fields.
3. **UI glyphs: inline SVG or lucide-react?** ADR-0005 says lucide for UI glyphs, but lucide-react is not installed and flagged SUS. Recommendation: inline SVG components for the five or so glyphs needed (copy, check, download, menu, close, chevron), and add a one-line addendum to ADR-0005. Planner may choose lucide-react with a human-verify checkpoint instead.
4. **Hero `Contact` link.** D-04 lists Resume and Copy email only; the 10-second table maps Contact to "Hero Contact CTA or Copy email". Confirm Copy email satisfies it (A9) or keep a small text link.
5. **UI-SPEC.** The phase is flagged "UI hint: yes"; `DESIGN.md` plus `03-CONTEXT.md` act as the visual contract. If `/gsd-ui-phase` runs before planning its UI-SPEC should be treated as additive to `DESIGN.md`, not a replacement.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build, tests, gates | ✓ | v26.9.0 (repo engines allow it) | CI uses `lts/*` |
| npm registry access | installing the 3 new packages | ✓ | `npm view` succeeded | none needed |
| Chromium via Playwright | e2e, probes | ✓ | probe launched it this session | CI installs it |
| `pdftotext`/`pdfinfo` (poppler) | manual PDF inspection only | ✓ local (`/opt/homebrew/bin`) | n/a | pdfjs-dist is the gated path |
| `cwebp`, `sips` | none required (imagetools uses sharp) | ✓ | n/a | n/a |
| `exiftool` | optional manual EXIF check | ✗ | n/a | `check:images` byte scan |
| Legacy site assets `../aa-phan.github.io/images/{about-dj.jpg,logos/*.png}` | image pipeline | ✓ | 539x800 JPEG (has Exif marker), PNGs 124x113, 32x32, 96x96 | none; copy only these four |
| `references/Aaron_Phan_Resume.pdf` | owner's export source | ✓ (gitignored) | 1 page | owner export (D-16) |
| Real iPhone/Android | NAV-04 timed test | not testable here | n/a | human checkpoint at phase end |

**Missing dependencies with no fallback:** the owner-supplied items (repo URLs, write-up approval, quote line, phone-free PDF) block finalization of content, not infrastructure work.

## Validation Architecture

Nyquist validation is enabled (`workflow.nyquist_validation: true` in `.planning/config.json`).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 5.0.3 (jsdom 30, Testing Library 16) unit; @playwright/test ~1.64.0 (Chromium) e2e |
| Config file | `vitest.config.ts` (add `imagetools()`), `playwright.config.ts` (add `mobile` project) |
| Quick run command | `npx vitest run` |
| Full suite command | `npm run verify && npm run test:e2e` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CNT-01 | Six sections render from typed modules; ids unique; related ids resolve; every image has alt; external links https; dates parse descending | unit | `npx vitest run tests/unit/content.test.ts` | ❌ Wave 0 |
| CNT-01 | Each section renders its heading, `aria-labelledby`, and items from props | unit | `npx vitest run tests/unit/sections.test.tsx` | ❌ Wave 0 |
| CNT-01 | Page imports no content outside `Page.tsx` | lint | `npm run lint` (boundary rules exist) | ✅ |
| CNT-02 | 5 experience, 7 projects (3 featured), 2 education with GPA 3.2, email, Instagram href; modules equal the inventory | unit | `npx vitest run tests/unit/content-inventory.test.ts` | ❌ Wave 0 |
| CNT-02 | With JS on: 5 experience rows, 7 sleeves, GPA text, Instagram link visible | e2e | `npx playwright test tests/e2e/content.spec.ts` | ❌ Wave 0 |
| CNT-04 | Gate fails on a PDF whose text layer, annotations (`tel:`) or metadata carry a phone-shaped string; passes a clean PDF; fails a blank/stand-in file | unit | `npx vitest run tests/unit/gates.test.ts -t "pdf"` | ❌ Wave 0 (extends file) |
| CNT-04 | Shipped `dist/resume.pdf` is clean and a real resume | script | `npm run check:no-phone` | ✅ extend |
| CNT-04 | Resume link downloads a `%PDF-` file with `application/pdf`; click triggers a download | e2e | `npx playwright test -g "resume"` | ⚠ partial in `smoke.spec.ts` |
| CNT-05 | Only AVIF/WebP rasters in `dist/`; zero `Exif` markers; every image in `dist/` is referenced; `src/assets/images/` holds no unreferenced file | script + unit | `npm run check:images`; `npx vitest run tests/unit/gates.test.ts -t "images"` | ❌ Wave 0 |
| NAV-02 | Desktop (1280): nav visible, `aria-current` follows scrolled section, last section at page bottom, click lock holds | e2e | `npx playwright test tests/e2e/nav.spec.ts` | ❌ Wave 0 |
| NAV-02 | `pickActive` logic | unit | `npx vitest run tests/unit/active-section.test.ts` | ❌ Wave 0 |
| NAV-02 | Skip link is first Tab stop, visible on focus, Enter moves focus to `#main` | e2e | `npx playwright test -g "skip link"` | ❌ Wave 0 |
| NAV-02 | Mobile (Pixel 7): pill fixed within viewport, Menu toggles `aria-expanded`, Escape closes and returns focus, Experience/Projects segments scroll to sections, nav not covering hero CTAs | e2e mobile | `npx playwright test --project=mobile` | ❌ Wave 0 |
| NAV-02 | Reduced motion: panel and indicator change state with no running animations | e2e | `npx playwright test -g "reduced motion"` | ⚠ extend `motion.spec.ts` |
| NAV-03 | Click copies the email (clipboard read-back), shows status text, toast leaves after about 4 s; failure path opens mailto | e2e + unit | `npx playwright test -g "copy email"`; `npx vitest run tests/unit/copy.test.ts` | ❌ Wave 0 |
| NAV-04 | At 375x667 first viewport contains h1, role, Resume, Copy email, pill Experience/Projects; none covered (`elementFromPoint`); each of the six items reachable in at most one action | e2e mobile | `npx playwright test tests/e2e/mobile/ten-second.spec.ts` | ❌ Wave 0 |
| NAV-04 | Timed run on a real phone, motion on, all six found in 10 s or less | manual | `human_verify_mode: end-of-phase` checkpoint | manual-only (device) |
| D-02/03 | Palette D tokens; band passes contrast; matrix current; Archivo is the one family | unit + script + e2e | `npm run check:contrast`; `npx vitest run tests/unit/tokens.test.ts`; `npx playwright test -g "fonts"` | ✅ update |
| D-01 | Wordmark reads PHAN in light and PHVNTM in dark; home link label; footer text line | e2e | `npx playwright test -g "wordmark"` | ❌ Wave 0 |
| D-08 | Dialog: opens, Escape closes, focus returns to the sleeve, prev/next wraps, background inert | e2e | `npx playwright test -g "project dialog"` | ❌ Wave 0 |
| D-01 | 404 page renders "Dead air." in both themes with no JS | e2e | `npx playwright test -g "404"` | ❌ Wave 0 |
| FND-03 | Initial JS stays at or under 150 kB gz | script | `npm run check:budget` | ✅ |

### Sampling Rate
- **Per task commit:** `npx vitest run` plus the single relevant script (`check:contrast`, `check:images`, `check:no-phone`, `check:budget`).
- **Per wave merge:** `npm run verify`.
- **Phase gate:** `npm run verify && npm run test:e2e` green locally and in CI, then the real-phone 10-second test, before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `tests/unit/content.test.ts`, `content-inventory.test.ts`, `sections.test.tsx`, `active-section.test.ts`, `copy.test.ts`
- [ ] `tests/e2e/content.spec.ts`, `nav.spec.ts`, `tests/e2e/mobile/ten-second.spec.ts`, `tests/e2e/mobile/pill.spec.ts`
- [ ] `scripts/check-images.mjs` and the `check:images` entry in `package.json` `verify` (place it after `build`, before or next to `check:no-phone`)
- [ ] PDF fixtures built at runtime in `tests/unit/gates.test.ts` (no committed phone-shaped literal)
- [ ] `vitest.config.ts`: register `imagetools()`; `tsconfig` types for `*?as=picture` imports
- [ ] `playwright.config.ts`: `mobile` project, `testIgnore`/`testMatch` split
- [ ] Update pinned values in `tokens.test.ts`, `smoke.spec.ts`, `theme.spec.ts`, `motion.spec.ts`, `hero-parity.test.tsx` (Pitfall 3)

## Security Domain

`security_enforcement` is on (ASVS level 1, block on high).

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | no accounts or login |
| V3 Session Management | no | none |
| V4 Access Control | no | static public site |
| V5 Input Validation | limited | no user input; content is typed static data; no `dangerouslySetInnerHTML` |
| V6 Cryptography | no | none |
| V8 Data Protection / privacy | **yes** | phone number never shipped: gate over `dist/` including the PDF text layer, annotations and metadata; EXIF stripped; `references/` never public |
| V12 Files and Resources | yes | only listed images and the resume ship; `check:images` enforces |
| V14 Config / supply chain | yes | package legitimacy gate; pinned versions; dev-only `pdfjs-dist` |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Personal data in a served file (phone in PDF text, EXIF GPS in a photo) | Information Disclosure | pdfjs text/annotation/metadata scan; byte scan for EXIF; both in `npm run verify` and so in both workflows |
| Tabnabbing via `target="_blank"` | Spoofing / Tampering | `rel="noopener noreferrer"` on external links; content test requires https |
| Clipboard misuse | Tampering | write only a constant (the public email) on explicit user gesture; never read the clipboard in site code |
| Malicious or slopsquatted dependency | Tampering | legitimacy check done; `pdfjs-dist` behind a human-verify checkpoint; lockfile committed; no postinstall scripts on the new packages |
| Stand-in or source resume shipped by mistake | Information Disclosure | gate requires a real resume text layer and rejects phone-shaped strings; `references/` is gitignored |
| Metadata leak in PDF (`Producer`, `Creator`, dates) | Information Disclosure | low risk (LaTeX banner only, observed key names: Creator, Producer, dates); gate prints keys, owner reviews |

## Sources

### Primary (HIGH confidence)
- Repo files read this session: `03-CONTEXT.md`, `REQUIREMENTS.md`, `STATE.md`, `docs/architecture.md`, `DESIGN.md`, `package.json`, `vite.config.ts`, `index.html`, `src/**` (app, anim, layout, sections, styles, lib, components), `scripts/check-*.mjs`, `scripts/lib/tokens.mjs`, `.oxlintrc.json`, `playwright.config.ts`, `vitest.config.ts`, `tests/**`, `.github/workflows/*.yml`, `01-CONTENT-INVENTORY.md`, `01-IA-WIREFRAMES.md` (nav, contact, rail sections), `01-MOTION-SPEC.md` (tokens, reduced motion, IX-04/07/08/09), `01-DESIGN-TOKENS.md` (format), ADR-0005, ADR-0006, ADR index, Phase 2 `02-09-SUMMARY.md`, `02-REVIEW.md`, `02-VALIDATION.md`.
- Probe builds (scratchpad): motion bundle costs (84,545 / 124,970 / 125,071 / 100,321 + 27,946), vite-imagetools EXIF and `as=picture` shape, `@fontsource-variable/archivo@5.3.0` tarball (`wdth.css`, file sizes), `pdfjs-dist@6.3.289` extraction on the source PDF, Chromium custom-property inheritance test.
- npm registry via `npm view` and `gsd-tools query package-legitimacy check` (versions, dates, downloads, engines).
- [CITED: motion.dev/docs/react-lazy-motion] strict behavior, async `features`.
- [CITED: motion.dev/docs/react-layout-animations] distortion, `style` radius rule, `layoutRoot`, `layoutScroll`, `LayoutGroup`.
- [CITED: tailwindcss.com/docs/font-stretch], [CITED: tailwindcss.com/docs/font-size] (type modifiers).

### Secondary (MEDIUM confidence)
- [CITED: docs.github.com custom 404 page] file name and location only; project-site behavior not stated (A2).
- actions/runner-images Ubuntu 24.04 README (no poppler listed; list may omit apt packages, A5).

### Tertiary (LOW confidence)
- Safari `scrollend`, iOS dialog scroll lock, WebKit dialog focus restoration (training knowledge; A1, A6, A7).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH. New packages verified against the registry and exercised in probes; three of five checked packages flagged `too-new` by the legitimacy tool and handled.
- Architecture: HIGH for repo-grounded structure and measured bundle numbers; MEDIUM for fit-to-width calibration and iOS behaviors.
- Pitfalls: HIGH for 1, 2, 3, 4, 5 (probe- or code-verified), MEDIUM for the platform-behavior items (7 to 11).

**Research date:** 2026-10-19
**Valid until:** 2026-11-18 (motion and lucide ship frequently; re-run `npm view` for pinned ranges at install time)
