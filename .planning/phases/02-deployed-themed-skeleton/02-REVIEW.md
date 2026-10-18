---
phase: 02-deployed-themed-skeleton
reviewed: 2026-10-18T00:00:00Z
depth: standard
files_reviewed: 49
files_reviewed_list:
  - .github/workflows/ci.yml
  - .github/workflows/deploy.yml
  - .gitignore
  - .oxlintrc.json
  - index.html
  - package.json
  - playwright.config.ts
  - vite.config.ts
  - vitest.config.ts
  - tsconfig.app.json
  - scripts/check-colors.mjs
  - scripts/check-contrast.mjs
  - scripts/check-js-budget.mjs
  - scripts/check-no-phone.mjs
  - scripts/check-path-case.mjs
  - scripts/lib/color.mjs
  - scripts/lib/tokens.mjs
  - src/anim/MotionPreferenceProvider.tsx
  - src/anim/declarative/TextReveal.tsx
  - src/anim/index.ts
  - src/anim/physics/ThemeThumb.tsx
  - src/anim/tokens.ts
  - src/anim/useMotionPreference.ts
  - src/app/App.tsx
  - src/app/Page.tsx
  - src/app/Providers.tsx
  - src/components/motion-primitives/text-effect.tsx
  - src/components/ui/ThemeToggle.tsx
  - src/layout/Container.tsx
  - src/layout/Section.tsx
  - src/lib/theme.ts
  - src/lib/utils.ts
  - src/main.tsx
  - src/sections/Hero/Hero.tsx
  - src/sections/Stubs/SectionStubs.tsx
  - src/styles/base.css
  - src/styles/index.css
  - src/styles/tokens.css
  - tests/e2e/motion.spec.ts
  - tests/e2e/smoke.spec.ts
  - tests/e2e/theme.spec.ts
  - tests/setup.ts
  - tests/unit/boundaries.test.ts
  - tests/unit/gates.test.ts
  - tests/unit/hero-parity.test.tsx
  - tests/unit/motion-preference.test.tsx
  - tests/unit/theme-script.test.ts
  - tests/unit/theme.test.ts
  - tests/unit/tokens.test.ts
findings:
  critical: 0
  warning: 6
  info: 7
  total: 13
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-10-18
**Depth:** standard
**Files Reviewed:** 49
**Status:** issues_found

## Summary

Reviewed the Phase 2 skeleton: CI/deploy workflows, the build gates in `scripts/`, the theme and motion-preference plumbing, the static shell and React hero, and the unit and e2e suites. `text-effect.tsx` is vendored by design (ADR-0007), so only its integration through `TextReveal` was assessed.

The runtime code is small and mostly sound. The theme init script, `applyTheme` and `readTheme` handle blocked storage correctly. `useMotionPreference` is a clean `useSyncExternalStore`. The OKLCH and color-mix math matches the CSS spec for the cases used.

No critical issues. The main concerns are:

- The phone-number privacy gate has a real detection hole.
- The hero tagline flashes visible, then hidden, then revealed on every non-reduced load.
- Deploy is not gated on the e2e suite.
- `tsc -b` leaves `tests/` and `scripts/` unchecked.
- One e2e test cannot fail on the behavior it names.
- The raw-color gate misses several Tailwind color utilities.

No phone digits were printed during this review. The `public/resume.pdf` text layer was checked with `pdftotext` and matched no phone shape or `tel:`.

## Warnings

### WR-01: check-no-phone misses space-separated numbers and cannot see inside the PDF

**File:** `scripts/check-no-phone.mjs:34-37` (and `:23`)
**Issue:** This gate protects a hard privacy rule (never publish the phone number), but it has two holes.

1. The "separated number" shape requires the second separator to be `-` or `.` (`[-.]`). Verified: `999 999 9999`, `(999) 999 9999` and `+9 999 999 9999` are not matched, and only `999-999-9999` and `999.999.9999` are. The standalone ten-digit rule needs contiguous digits and applies to markup and text only. A number written with spaces in HTML or JS therefore passes. Spaced numbers are a very common way to write one, and `gates.test.ts` never exercises that form.
2. `.pdf` is in `SCANNED`, but the file is read as latin1 and PDF text lives in Flate-compressed streams. The scan cannot see the one public file most likely to contain a number, so the gate gives false assurance there. Currently clean, per `pdftotext`.

**Fix:**
```js
// allow any separator run between all three groups, and an optional +country prefix
{ label: 'separated number', re: /(?<!\d)(?:\+?\d{1,2}[-. ]+)?\(?\d{3}\)?[-. ]+\d{3}[-. ]+\d{4}(?!\d)/g },
```
Add a gates test for the space-separated form, built via `phoneShape` so no literal is committed. For the PDF, either extract text at check time (`pdftotext`, or a small decompression step) or drop `pdf` from `SCANNED` and document that the resume is reviewed manually.

### WR-02: Hero tagline flashes visible, hidden, then revealed on every non-reduced load

**File:** `src/anim/declarative/TextReveal.tsx:36-54` (integration with `src/components/motion-primitives/text-effect.tsx:270-273`)
**Issue:** The static shell and the `Suspense` fallback render the tagline fully visible. When the lazy chunk resolves, `TextEffect` mounts with `initial='hidden'`. The container and every word then go to opacity 0 and animate back in. The visitor sees the text (it is likely the LCP element), it disappears, then it is revealed word by word. This conflicts with the stated goal that fallbacks and the shell match, and it makes the load look glitchy. The `animations === 0` e2e assertions only cover `h1` and the links, so nothing catches it. On slow networks the gap between visible and hidden grows with chunk load time.
**Fix:** Hide the fallback until the effect is ready, or let the effect start from the visible state. For example, render the Suspense fallback as an invisible placeholder (`className={cn(className, 'invisible')}`) while keeping the static shell visible only for no-JS. Alternatively, preload the chunk (`import()` on idle or in `main.tsx`) so the swap lands before first paint. Add an e2e assertion that the `#hero p` opacity never drops from 1 to 0 after first paint, or that it is hidden consistently from first paint.

### WR-03: Deploy is not gated on e2e, and the Pages workflow is over-permissive and cancellable

**File:** `.github/workflows/deploy.yml:8-15, 36-45`
**Issue:**
- Deploy runs `npm run verify` but not `test:e2e`. The e2e suite runs only in `ci.yml`, as a separate workflow on the same push. A push to `main` with failing e2e (JS-disabled shell, theme flash, reduced motion) still publishes.
- `pages: write` and `id-token: write` are granted workflow-wide, so the `build` job, which runs `npm ci` with third-party install scripts, receives an OIDC token and Pages write. Only the `deploy` job needs them.
- `cancel-in-progress: true` on the `pages` group lets a newer push cancel a deployment in flight. GitHub's Pages guidance is `false`, so the in-flight deploy finishes and only the pending one is replaced.

**Fix:**
```yaml
permissions:
  contents: read
jobs:
  build: { ... }          # inherits contents: read only
  deploy:
    permissions: { pages: write, id-token: write }
concurrency:
  group: pages
  cancel-in-progress: false
```
Either add the Playwright steps to the `build` job (copy from `ci.yml`), or trigger deploy from `workflow_run` on a successful CI run on `main`.

### WR-04: `npm run typecheck` does not cover tests, scripts or Playwright's TS surface

**File:** `tsconfig.app.json:27` (`"include": ["src"]`) and `tsconfig.node.json` (`"include": ["*.config.ts"]`)
**Issue:** `tsc -b` checks `src/` and the root `*.config.ts` files only. `tests/**/*.ts(x)` (about 1,300 lines of unit and e2e code, including non-null assertions and casts) and `scripts/**` are never type-checked. A type error in `tests/setup.ts` or a Playwright API misuse passes `verify` and surfaces only at runtime. Vitest and Playwright strip types without checking them.
**Fix:** Add a `tsconfig.test.json` (include `tests`, `types: ["node", "vite/client"]`, `jsx: react-jsx`, with the `@/*` paths) and reference it from `tsconfig.json`. Optionally add `// @ts-check` or `allowJs` plus `checkJs` for `scripts/*.mjs`.

### WR-05: "theme thumb animates" e2e cannot fail when the animation is missing

**File:** `tests/e2e/motion.spec.ts:49-67`
**Issue:** The test clicks the toggle and reads the transform synchronously in the same `evaluate`, before the spring has produced a frame. The value read is almost certainly still the start matrix, so `expect(first).not.toBe(END_MATRIX)` passes whether or not an animation exists. The following poll only checks that the thumb eventually reaches `END_MATRIX`, which an instant snap also satisfies. If `skipAnimation` were stuck on (the exact regression the provider is meant to prevent), this test would stay green and only the reduced-motion test would mean anything.
**Fix:** Sample across frames and assert a strictly intermediate value.
```ts
const seen = await page.evaluate(() => new Promise<number[]>((resolve) => {
  const thumb = document.querySelector<HTMLElement>('[data-part="theme-thumb"]')!
  document.querySelector<HTMLButtonElement>('button[aria-pressed]')!.click()
  const xs: number[] = []
  const tick = () => {
    xs.push(new DOMMatrix(getComputedStyle(thumb).transform).m41)
    xs.length < 40 ? requestAnimationFrame(tick) : resolve(xs)
  }
  requestAnimationFrame(tick)
}))
expect(seen.some((x) => x > 0.5 && x < 19.5)).toBe(true)
```

### WR-06: check-colors misses directional and prefixed palette utilities that compile to nothing

**File:** `scripts/check-colors.mjs:25-38`
**Issue:** The script's own header says the gate exists because `--color-*: initial` makes default palette utilities silently compile to nothing. The `PREFIXES` list and the `prefix-color` shape miss the following, verified with the same regex:
- `border-t-red-500` and `border-x-blue-500`
- `divide-y-red-500`
- `ring-offset-white`
- `placeholder-gray-400`
- `inset-ring-red-500`

Arbitrary named colors (`bg-[red]`, `style={{ color: 'red' }}`) are also not caught. A component using one of these gets no color and passes the gate. `index.html` (which feeds `@source`) is not scanned either.
**Fix:** Match the color-name tail with a more general prefix: `(?:[a-z]+(?:-[a-z]+)*-)?(?:${COLORS})-\d{2,3}` anchored to utility prefixes (`border(?:-[trblxyse])?`, `ring(?:-offset)?`, `inset-ring`, `divide`, `placeholder`, and the others). Add `index.html` to the scanned files. Alternatively, build once and fail if any scanned class name is not emitted in the output CSS.

## Info

### IN-01: "Copy email" is a mailto link that does not copy

**File:** `src/sections/Hero/Hero.tsx:22-27` and `index.html:43-48`
**Issue:** The visible label promises a clipboard copy, but the element is a plain `mailto:` anchor that opens a mail client (or nothing, on machines without one). The e2e tests pin both the label and the href. This is acceptable as a no-JS fallback, but the label and behavior disagree once JS is available.
**Fix:** Either relabel ("Email me"), or progressively enhance in React: keep the `mailto:` href and add an `onClick` that copies via `navigator.clipboard` and announces "Copied" in a live region.

### IN-02: Theme never follows the OS or other tabs after load

**File:** `src/components/ui/ThemeToggle.tsx:6` and `src/lib/theme.ts:6-8`
**Issue:** `ThemeToggle` reads the theme once from `html[data-theme]` into local state. If no explicit choice is stored, a change to the OS scheme while the page is open is ignored. A `storage` event from another tab also leaves this tab's attribute and the `aria-pressed` state stale. This is low impact for a portfolio.
**Fix:** If wanted, subscribe with `useSyncExternalStore` to a `MutationObserver` on `data-theme`, a `storage` listener, and (when nothing is stored) the `prefers-color-scheme` query.

### IN-03: `category in THRESHOLDS` accepts prototype keys

**File:** `scripts/check-contrast.mjs:81`
**Issue:** `p.category in THRESHOLDS` is true for `"constructor"`, `"toString"` and similar, so a mistyped or hostile pair passes validation and then crashes at `min.toFixed(1)` instead of producing the intended `UsageError`.
**Fix:** `if (!Object.hasOwn(THRESHOLDS, p.category))`.

### IN-04: Token parser is fragile around nesting and the last declaration

**File:** `scripts/lib/tokens.mjs:29-31, 43`
**Issue:**
- `BLOCK = /([^{}]+)\{([^{}]*)\}/g` cannot parse nested rules. If tokens are ever wrapped in `@media (prefers-color-scheme: dark) { :root { ... } }` or `@layer`, the inner `:root` block is matched as a top-level block. It is classified as light and silently overwrites the light tokens with dark values, so the contrast gate would audit the wrong palette.
- `DECLARATION` requires a trailing `;`, so a final declaration without one is ignored. That surfaces only as a "missing token" error for the 14 color tokens.

**Fix:** Fail loudly on `@media`, `@layer` or `@supports` in `tokens.css` (throw a `TokenError` when the stripped text contains `@`), or switch to a real CSS parser. Make the trailing `;` optional (`(?:;|$)`).

### IN-05: `curl | grep -q` under `pipefail` is a latent flake

**File:** `.github/workflows/deploy.yml:45`
**Issue:** GitHub's default `bash -eo pipefail` makes the step fail if `grep -q` exits on first match while `curl` is still writing (curl exit 23). It works today because the page is tiny. A larger page or a slow pipe makes it intermittent, and the git history already shows a fix-forward for CI flakiness.
**Fix:** `body=$(curl -fsS --retry 6 --retry-delay 5 --retry-all-errors "$URL"); grep -q "Aaron Phan" <<<"$body"`, passing the URL through `env:` rather than interpolating the expression into the script.

### IN-06: Hand-rolled class joining, and the theme key hardcoded in two places

**File:** `src/layout/Container.tsx:5`, `src/layout/Section.tsx:19`; `index.html:13` vs `src/lib/theme.ts:3`
**Issue:**
- `Container` and `Section` join class names with `.filter(Boolean).join(' ')` although `cn()` (clsx plus tailwind-merge) exists in `src/lib/utils.ts`. The hand-rolled version does not resolve conflicting utilities, so a caller passing `py-8` to `Section` yields both `py-16` and `py-8`, and the winner depends on CSS order.
- The storage key `'theme'` and the valid values are duplicated in the inline script and `theme.ts`. The e2e tests catch drift, but the unit test does not tie the two together.

**Fix:** Use `cn('scroll-mt-6 py-16', className)`. Add a unit assertion that the inline script contains `THEME_STORAGE_KEY`.

### IN-07: Live-URL e2e mode breaks without a trailing slash

**File:** `playwright.config.ts:3-10`
**Issue:** Tests navigate with `page.goto('./')`. A `baseURL` such as `https://user.github.io/aa-phan-portfolio-v2` (no trailing slash), supplied via `E2E_BASE_URL`, resolves `./` to the origin root and tests the wrong page. The local path always ends in `/` because `VITE_BASE` does.
**Fix:** Normalize it: `const live = process.env.E2E_BASE_URL?.replace(/\/?$/, '/')`.

---

_Reviewed: 2026-10-18_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
