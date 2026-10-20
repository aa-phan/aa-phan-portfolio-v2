# Phase 3: Content-Complete Site - Pattern Map

**Mapped:** 2026-10-20
**Files analyzed:** 40 (new or modified)
**Analogs found:** 31 / 40 (all analog paths verified git-tracked via `git ls-files`)

The repo is a small Phase 2 skeleton (about 23 tracked files under `src/`), so most new files copy from a handful of analogs. Many new files have only a partial analog (the codebase has no content modules, nav, dialog, toast or image code yet); for those, use RESEARCH.md patterns (referenced by number).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `src/content/schema.ts`, `profile.ts`, `experience.ts`, `projects.ts`, `skills.ts`, `education.ts`, `contacts.ts`, `images.ts`, `index.ts` | content module | transform (build-time data) | none in src; `docs/architecture.md` "Content model"; RESEARCH Pattern 1 | no analog |
| `src/app/Page.tsx` (modify) | page composition | request-response | `src/app/Page.tsx` (itself) | exact |
| `src/app/Providers.tsx` (modify: +ToastProvider, +MotionFeatures) | provider | event-driven | `src/app/Providers.tsx` | exact |
| `src/sections/Hero/Hero.tsx` (modify to poster) | component | request-response | `src/sections/Hero/Hero.tsx` | exact |
| `src/sections/Experience/Experience.tsx` | component | CRUD (read) | `src/layout/Section.tsx` + `Hero.tsx` | role-match |
| `src/sections/Projects/{Projects,Crate,Sleeve,ProjectDialog}.tsx` | component | event-driven (dialog) | `Section.tsx`; dialog: RESEARCH Pattern 6 + ADR-0006 | partial |
| `src/sections/About/About.tsx`, `Skills/Skills.tsx`, `Education/Education.tsx`, `Contact/Contact.tsx` | component | request-response | `src/sections/Stubs/SectionStubs.tsx`, `Section.tsx` | role-match |
| `src/sections/Stubs/SectionStubs.tsx` (delete) | component | n/a | n/a | n/a |
| `src/layout/Section.tsx` (modify: ladder, scroll-mt) | layout | n/a | itself | exact |
| `src/layout/SiteHeader.tsx`, `PillNav.tsx`, `SkipLink.tsx`, `Footer.tsx`, `Wordmark.tsx` | layout component | event-driven | `Container.tsx`, `Section.tsx`; motion part: `TextReveal.tsx` | partial |
| `src/components/ui/ThemeToggle.tsx` (modify: store-backed) | component | event-driven | itself + `src/lib/theme.ts` | exact |
| `src/components/ui/{CtaLink,Toast}.tsx`, `icons/*.tsx` | component | event-driven | `ThemeToggle.tsx` (button conventions), Hero CTA anchors | partial |
| `src/hooks/useActiveSection.ts`, `useTheme.ts` | hook | event-driven | `src/anim/useMotionPreference.ts` | role-match |
| `src/lib/copy.ts` | utility | request-response | `src/lib/theme.ts` (try/catch fallback style) | role-match |
| `src/lib/theme.ts` (modify: store) | utility | event-driven | itself | exact |
| `src/anim/{MotionFeatures,features}.tsx`, `declarative/{PillMorph,NavIndicator,ToastPresence}.tsx`, `index.ts` (modify) | anim wrapper | event-driven | `src/anim/declarative/TextReveal.tsx`, `src/anim/index.ts` | exact |
| `src/styles/tokens.css`, `index.css`, `base.css` (modify) | config | n/a | themselves | exact |
| `src/main.tsx`, `index.html`, `404.html` | entry | n/a | `src/main.tsx`, `index.html` | exact / role |
| `vite.config.ts`, `vitest.config.ts` (+imagetools, 404 entry) | config | build | `vite.config.ts` | exact |
| `scripts/check-no-phone.mjs` (+PDF), `check-images.mjs`, `lib/tokens.mjs` (+band), `contrast-pairs.json` | gate script | batch | `scripts/check-no-phone.mjs`, `check-js-budget.mjs` | exact |
| `tests/unit/*.test.ts(x)` (content parity, pickActive, gates, tokens updates) | test | batch | `tests/unit/gates.test.ts`, `hero-parity.test.tsx` | exact |
| `tests/e2e/*.spec.ts`, `tests/e2e/mobile/*.spec.ts`, `playwright.config.ts` | test | request-response | `tests/e2e/motion.spec.ts`, `theme.spec.ts` | exact |
| `docs/adr/0009-*.md`, doc amendments | docs | n/a | `docs/adr/0006-project-overlay-dialog-accessibility.md` | exact |

## Pattern Assignments

### `src/content/*.ts` (content module, transform)

No in-repo analog. Rules to enforce:
- Only `src/app/Page.tsx` may import `@/content` (`.oxlintrc.json` lines 39-42, `no-restricted-imports` pattern; override for Page at line 78-). Sections receive content as props. Check the Page override still allows `@/content` after edits.
- `src/anim/**` must not import content (`.oxlintrc.json` lines 47-72).
- Use RESEARCH Pattern 1 (`as const satisfies readonly ExperienceEntry[]`), verbatim from `01-CONTENT-INVENTORY.md`. Alt text lives in content, never in the image import.
- `tests/fixtures/app/Page.tsx` is the lint fixture proving Page may import content; keep it in sync if the rule changes.

### `src/app/Page.tsx` (composition)

**Analog:** `src/app/Page.tsx` lines 1-11 (current):
```tsx
import { Hero } from '@/sections/Hero/Hero'
import { SectionStubs } from '@/sections/Stubs/SectionStubs'

export function Page() {
  return (
    <main id="main">
      <Hero />
      <SectionStubs />
    </main>
  )
}
```
Change: import content here only, render `SkipLink`, `SiteHeader`, `<main id="main" tabIndex={-1}>`, real sections, `Footer`. Mirror `tabindex` in `index.html` shell (parity test compares attributes; RESEARCH Pitfall 8). Keep section ids `hero, experience, projects, about, skills, education, contact`.

### `src/app/Providers.tsx`

**Analog:** itself lines 1-6 (single provider wrapping children via `@/anim` barrel). Add `MotionFeatures` (from `@/anim`) and `ToastProvider` the same way: named import from the barrel, nested wrappers, no direct `motion/react` import.

### `src/sections/Hero/Hero.tsx` (poster)

**Analog:** itself. Conventions to keep (lines 1-37):
```tsx
import { TextReveal } from '@/anim'
import { Container } from '@/layout/Container'
...
<section id="hero" aria-labelledby="hero-heading" className="pt-24 pb-16">
  <Container>
    <h1 id="hero-heading" className="...">Aaron Phan</h1>
    <TextReveal className="mt-4 max-w-2xl text-lg text-muted md:text-xl">...</TextReveal>
    <a href={`${import.meta.env.BASE_URL}resume.pdf`} download className="inline-flex min-h-11 items-center justify-center rounded-pill ...">
    <a href="mailto:aaron.phan240@gmail.com" ...>Copy email</a>   // Pattern 7: onClick preventDefault + copyText
```
Notes: `min-h-11` touch targets; `rounded-pill` for press targets (D-06); tokens only (no raw colors, no `dark:`). Resume href uses `import.meta.env.BASE_URL`. Hero shell in `index.html` and `Hero.tsx` must be changed in lockstep (parity test, Pitfall 4/13). RESEARCH Pitfall 13: render role line plain, do not hide-then-reveal; `TextReveal` currently Suspense-falls back to the identical `<p>`.

### `src/sections/{Experience,Projects,About,Skills,Education,Contact}` (components)

**Analog:** `src/layout/Section.tsx` lines 4-28 (shell with `id`, `aria-labelledby={`${id}-heading`}`, Container, `h2`):
```tsx
<section id={id} aria-labelledby={`${id}-heading`} className={['scroll-mt-6 py-16', className].filter(Boolean).join(' ')}>
  <Container>
    <h2 id={`${id}-heading`} className="text-3xl font-semibold">{title}</h2>
    {children}
  </Container>
</section>
```
Modify: `scroll-mt-6` becomes `md:scroll-mt-[var(--nav-h)]` (D-18); `text-3xl font-semibold` moves to the new `--t-*` ladder (Pitfall 10). Every real section wraps in `Section` and takes data as props from Page. Class composition idiom: `[a, className].filter(Boolean).join(' ')` (also `Container.tsx` line 5); `cn()` exists in `src/lib/utils.ts` but this layout code uses the filter idiom. Experience uses native `<details>/<summary>`. Projects: RESEARCH Pattern 6 for `<dialog>` and ADR-0006 rules. Projects band: `.band-invert` per RESEARCH Pattern 4.

### `src/layout/SiteHeader.tsx`, `PillNav.tsx`, `SkipLink.tsx`, `Footer.tsx`, `Wordmark.tsx`

**Analog:** `src/layout/Container.tsx` lines 3-9 for layout component shape; `src/components/ui/ThemeToggle.tsx` for button conventions. No existing nav; use RESEARCH Patterns 2, 3, 5 and Pitfalls 7-9. Notes: wordmark renders both spans `aria-hidden`, swapped in CSS on `[data-theme]` (not `dark:`; but the repo does define `@custom-variant dark` in `src/styles/index.css` line 7, so a dark: variant is technically available, the research recommends plain CSS in `src/styles/`). Only one nav visible in the a11y tree (`display: none` for the inactive form).

### `src/components/ui/ThemeToggle.tsx` (store-backed)

**Analog:** itself lines 1-31:
```tsx
import { ThemeThumb } from '@/anim'
import { applyTheme, readTheme, type Theme } from '@/lib/theme'
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readTheme)
  ...
  <button type="button" aria-pressed={dark} aria-label="Dark theme" onClick={toggle}
    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill px-1">
    <span aria-hidden="true" className="relative inline-flex h-7 w-12 ... border-border-strong bg-surface p-px">
      <ThemeThumb on={dark} className="size-6 rounded-pill bg-primary" />
```
Replace `useState(readTheme)` with `useTheme()` (`useSyncExternalStore` over a MutationObserver on `html[data-theme]`) so three toggles stay synced. Keep `aria-label="Dark theme"` and `aria-pressed`; e2e locators must be scoped (Pitfall 3/6). Thumb is react-spring and unchanged (IX-10).

### `src/hooks/useActiveSection.ts`, `useTheme.ts`

**Analog:** `src/anim/useMotionPreference.ts` (hook + context style; file not excerpted, read before writing) and `src/lib/theme.ts` lines 6-8 (`readTheme` is the snapshot function for `useSyncExternalStore`). `pickActive` pure function per RESEARCH Pattern 2 to keep it testable (jsdom lacks IntersectionObserver; `tests/setup.ts` stubs only matchMedia).

### `src/lib/copy.ts`

**Analog:** `src/lib/theme.ts` lines 14-21 for failure-tolerant style:
```ts
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  try { localStorage.setItem(THEME_STORAGE_KEY, theme) } catch {
    // Storage blocked (private mode, policy): the in-memory choice still applies.
  }
}
```
Same shape: attempt, swallow with an explaining comment, fall through. Body per RESEARCH Pattern 7.

### `src/anim/**` additions (MotionFeatures, PillMorph, NavIndicator, ToastPresence)

**Analog:** `src/anim/index.ts` (barrel) and `src/anim/declarative/TextReveal.tsx`.

Barrel pattern (`index.ts` lines 1-5): one line per export, absolute `@/anim/...` paths:
```ts
export { TextReveal } from '@/anim/declarative/TextReveal'
export { springs, durations, easeOut } from '@/anim/tokens'
```
Add: `export { MotionFeatures } from '@/anim/MotionFeatures'` etc. Consumers import only from `@/anim` (lint pattern `.oxlintrc.json` lines 29-38).

Core pattern (`TextReveal.tsx` lines 6-8, 18-28, 36-55): lazy chunk for motion, `ChunkBoundary` error boundary falling back to static markup, `useMotionPreference().reduced` returns the plain element:
```tsx
const TextEffect = lazy(() => import('@/components/motion-primitives/text-effect').then((m) => ({ default: m.TextEffect })))
export function TextReveal({ children, className }: TextRevealProps) {
  const { reduced } = useMotionPreference()
  const plain = <p className={className}>{children}</p>
  if (reduced) return plain
  return (<ChunkBoundary fallback={plain}><Suspense fallback={plain}>...</Suspense></ChunkBoundary>)
}
```
Copy: static-first render, same markup in loading/failed/reduced states, reduced-motion check via `useMotionPreference`. Spring values come from `@/anim/tokens` (`springs.snappy.motion`, `durations`), never inline numbers. Do not set `strict` on `LazyMotion` (the vendored `text-effect.tsx` uses `motion.*`). Do not let motion and react-spring animate the same element (ThemeThumb is react-spring-only: `src/anim/physics/ThemeThumb.tsx` lines 14-23).

### `src/styles/tokens.css`, `index.css`, `base.css`

**Analog:** themselves. `index.css` lines 9-62 show the `@theme inline` mapping (`--color-*: initial;` then `--color-x: var(--x)`) and font/ladder declarations to rewrite (lines 26-50: replace Inter with `'Archivo Variable'`, `--text-*` ladder, delete unused modular steps; line 54-56 radius tokens replaced per D-06). Add `@source '../../404.html';` next to lines 4-5. `base.css` lines 6-26 give the focus ring (`outline: 2px solid var(--focus-ring)`) and reduced-motion guard that hover transitions rely on. Keep `tokens.css` flat (no `@media`/`@layer` wrappers; contrast parser limitation, RESEARCH Pitfall 2). Never add raw colors in components (`scripts/check-colors.mjs` gate).

### `src/main.tsx`

**Analog:** itself line 1: change `import '@fontsource-variable/inter/wght.css'` to `import '@fontsource-variable/archivo/wdth.css'`.

### `vite.config.ts` / `vitest.config.ts`

**Analog:** `vite.config.ts` lines 6-13 (`defineConfig(({ mode }) => ...)`, `base: env.VITE_BASE || '/'`, `plugins: [react(), tailwindcss()]`, `resolve.alias '@'`). Add `imagetools()` to plugins and `build.rollupOptions.input` with `index.html` and `404.html`. Register `imagetools()` in `vitest.config.ts` too, or `Page`-importing tests fail to resolve (RESEARCH Pattern 8).

### `scripts/check-no-phone.mjs` (PDF text pass), `scripts/check-images.mjs`

**Analog:** `scripts/check-no-phone.mjs`:
- Header comment contract and exit codes (lines 1-9: "Exit: 0 printing ... OK, 1 on a hit, 2 when dist is missing").
- `--root` flag handling (lines 13-16), dist-missing guard (18-21).
- Hits print only file and offset, never matched text (lines 58, 64):
```js
for (const match of text.matchAll(shape.re)) hits.push(`${path.relative(ROOT, file)} at offset ${match.index} (${shape.label})`)
if (hits.length > 0) { for (const line of hits) console.error(`no-phone: ${line}`); process.exit(1) }
console.log('no-phone: OK')
```
Add the pdfjs pass (RESEARCH "PDF text-layer pass") as an async branch for `.pdf`; the file uses top-level sync code, so convert to top-level `await` (ESM `.mjs` supports it). `check-images.mjs` copies the same skeleton: `ROOT/--root`, guard exit 2, `check-images: OK`. Register new `check:images` in `package.json` scripts (line 19 `verify` chain, lines 20-24 script names) and in `.github/workflows/ci.yml`.

### `scripts/lib/tokens.mjs`, `contrast-pairs.json`, `check-contrast.mjs`

**Analog:** themselves (not excerpted here; read `scripts/lib/tokens.mjs` before editing). Must extend `parseTokensCss` for `.band-invert` before editing `tokens.css` (RESEARCH Pitfall 2) and update `COLOR_TOKENS` + `tests/unit/tokens.test.ts` together.

### Tests

**Unit gates analog:** `tests/unit/gates.test.ts` lines 1-45: temp-dir fixture helpers (`makeRoot`, `write`), `runGate(script, args)` via `spawnSync(process.execPath, ...)`, `afterEach` cleanup, and the runtime-assembled `phoneShape(area, exchange, line, sep)` so no committed file holds a phone-shaped literal. Reuse for PDF/image gate tests; generate a phone-bearing PDF fixture at runtime rather than committing one.

**Lint boundary analog:** `tests/unit/boundaries.test.ts` lines 1-30 (`lintFixture` runs oxlint on files in `tests/fixtures/**`). Any new import rule gets a fixture plus case.

**Parity analog:** `tests/unit/hero-parity.test.tsx` (canonical node compare; `%BASE_URL%` substitution; classes sorted). Narrow it to `section#hero` plus section id/heading skeleton (Pitfall 4).

**E2E analog:** `tests/e2e/motion.spec.ts` lines 1-25 (`browser.newContext({ colorScheme, reducedMotion })`, `page.goto('./')` base-relative, role-based locators). Update pins listed in RESEARCH Pitfall 3 (`smoke.spec.ts` bg/Inter/links, `theme.spec.ts` `LIGHT_BG`/`DARK_BG`, `motion.spec.ts` first-`button[aria-pressed]` locator). Mobile project config per RESEARCH "Playwright: mobile project" with `testMatch`/`testIgnore` (Pitfall 14).

### `docs/adr/0009-*.md`

**Analog:** `docs/adr/0006-project-overlay-dialog-accessibility.md` (read for format; index in `docs/adr/README.md`). Records OD-06 closure via the native-dialog fallback.

## Shared Patterns

### Import boundaries
**Source:** `.oxlintrc.json` lines 8-45, overrides 47-100
**Apply to:** every new file
- `motion/react`, `@react-spring/web` only inside `src/anim` (and `motion/react` in `src/components/motion-primitives`).
- Everything else imports animation through `@/anim` only.
- `@/content` only from `src/app/Page.tsx`.
- `src/anim` must not import sections, layout or content.

### Static-first, reduced-motion-safe animation
**Source:** `src/anim/declarative/TextReveal.tsx` lines 36-55, `src/anim/tokens.ts`
**Apply to:** PillMorph, NavIndicator, ToastPresence, MotionFeatures. Render a working static state first; animation upgrades when the chunk lands; `useMotionPreference().reduced` yields instant states (D-17); failed chunk loads fall back via error boundary.

### Tokens-only styling
**Source:** `src/styles/index.css` lines 9-24 and `Hero.tsx` classes (`bg-primary`, `text-muted`, `border-border-strong`, `rounded-pill`)
**Apply to:** all components. No raw colors (`check:colors` gate), no hard-coded absolute asset paths (use `import.meta.env.BASE_URL`), `min-h-11` touch targets, hover only via Tailwind `hover:` (under `(hover: hover)`), plus `:focus-visible` equivalent.

### Failure-tolerant browser APIs
**Source:** `src/lib/theme.ts` lines 14-21
**Apply to:** `copy.ts`, theme store, scroll-spy: try, swallow with comment, degrade.

### Gate script contract
**Source:** `scripts/check-no-phone.mjs` lines 1-21, 63-67
**Apply to:** `check-images.mjs`, PDF extension: `--root`, exit 0/1/2, print locations not content.

### Verify chain
**Source:** `package.json` line 19 (`verify`), lines 20-24
**Apply to:** add `check:images`; keep JS budget at 150 kB gz (`check:budget`); update `tokens.test.ts` and e2e pins in the same plan that changes their subject.

## No Analog Found

| File | Role | Data Flow | Reason / use instead |
|---|---|---|---|
| `src/content/*` | content | transform | No content layer yet; RESEARCH Pattern 1 and `docs/architecture.md` |
| `src/sections/Projects/ProjectDialog.tsx`, `Crate.tsx` | component | event-driven | No dialog or scroll-snap code; RESEARCH Pattern 6, ADR-0006 |
| `src/hooks/useActiveSection.ts` | hook | event-driven | No IntersectionObserver code; RESEARCH Pattern 2 |
| `src/components/ui/Toast.tsx` | component | event-driven | No live-region code; RESEARCH Pattern 7 and IX-09 in `01-MOTION-SPEC.md` |
| `src/components/ui/icons/*` | component | n/a | No icons; ADR-0005 inline SVG |
| `src/layout/PillNav.tsx` | layout | event-driven | No fixed/morph nav; RESEARCH Pattern 3, Pitfall 9 |
| `404.html` | static entry | n/a | Only `index.html` exists; RESEARCH Pitfall 11 |
| `src/assets/images/*`, imagetools typing | asset | file-I/O | No image pipeline; RESEARCH Pattern 8 |
| `tests/e2e/mobile/*` | test | request-response | No mobile project; RESEARCH Playwright snippet |

## Metadata

**Analog search scope:** `src/**`, `scripts/**`, `tests/**`, `.oxlintrc.json`, `vite.config.ts`, `package.json`, `docs/adr`
**Files scanned:** about 45 tracked files (all `src/` files read in full)
**Pattern extraction date:** 2026-10-20
**Note:** RESEARCH.md lines 472-655 (Validation Architecture, open questions) were not re-read by the mapper; the planner should consult them for the check-images and mobile suite definitions.
