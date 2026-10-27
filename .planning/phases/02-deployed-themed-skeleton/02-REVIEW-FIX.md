---
phase: 02-deployed-themed-skeleton
fixed_at: 2026-10-26T23:30:00Z
review_path: .planning/phases/02-deployed-themed-skeleton/02-REVIEW.md
iteration: 1
findings_in_scope: 13
fixed: 12
skipped: 1
status: partial
---

# Phase 2: Code Review Fix Report

**Fixed at:** 2026-10-26
**Source review:** .planning/phases/02-deployed-themed-skeleton/02-REVIEW.md
**Iteration:** 1

**Summary:**

- Findings in scope: 13 (WR-01 to WR-06, IN-01 to IN-07; fix scope `all`)
- Fixed: 12
- Skipped: 1 (IN-01, deferred by the owner)

**Verification:** run in the main checkout (`workflow.use_worktrees` is `false`, so no worktree was created). After the last fix, `npm run verify` exited 0 and `npm run test:e2e` passed 19 of 19. Initial JS is 95.7 kB gzipped against the 150 kB budget. The unit suite is at 123 tests.

**Separate commit, not a finding:** `611a851 chore(02): ignore DESIGN.md in prettier`. DESIGN.md is a Phase 3 art-direction document, not source. The format check already excludes `docs/`, `references/` and `.planning/`, so DESIGN.md was added to `.prettierignore` rather than reformatted.

## Fixed Issues

### WR-01: check-no-phone misses space-separated numbers and cannot see inside the PDF

**Files modified:** `scripts/check-no-phone.mjs`, `tests/unit/gates.test.ts`
**Commit:** f0dde8d
**Status:** fixed: requires human verification (regex and parser logic)
**Applied fix:**

- The separated-number shape now accepts any run of dash, dot, space, tab, non-breaking space (raw bytes or `&nbsp;` / `&#160;`) between all three groups. It also accepts an optional `+CC` or `1` prefix and a parenthesised area code.
- PDFs are now inspected beyond the raw byte scan. Every stream that inflates with `node:zlib` is scanned as decoded content. The strings drawn by `Tj` and `TJ` operators are extracted and joined (literal and hex strings, octal escapes, large negative kerns read as word gaps), then scanned as text. The ten-digit rule applies to extracted text only, because raw PDF bytes hold ten-digit xref offsets.
- Output still shows only file, stream index and byte offset, never matched characters.
- Tests: 20 new cases, all with probes built at runtime from separate digit groups. They cover space, mixed, multi-space and nbsp separators, parenthesised and prefixed forms, an HTML entity, a JS bundle, wrong group sizes (not flagged), and a PDF with a Flate Tj string, a kerned TJ run, hex strings, octal escapes, a `tel:` URI, a clean PDF, a non-Flate stream, and the xref versus text ten-digit distinction. The new cases were confirmed to fail against the old script (13 failures).
- Known limit, documented in the script header: text set in a font with a custom or CID encoding stores glyph ids, so it is unreadable without the font's ToUnicode map. The resume PDF still needs a manual check for that case. The committed `public/resume.pdf` is a 594-byte placeholder with no streams.

### WR-02: Hero tagline flashes visible, hidden, then revealed on every non-reduced load

**Files modified:** `index.html`, `src/anim/declarative/TextReveal.tsx`, `src/styles/base.css`, `tests/e2e/motion.spec.ts`
**Commit:** 2bca9fc
**Status:** fixed: requires human verification (visual and timing behavior)
**Applied fix:** `text-effect.tsx` is untouched (ADR-0007). The static shell paragraph, the `Suspense` fallback and the reduced-motion paragraph now carry a `reveal-pending` class, so DOM parity with the shell still holds. In `base.css` the class applies `opacity: 0` only under `(prefers-reduced-motion: no-preference) and (scripting: enabled)`. A delayed `animation: 0s 3s forwards` fades the line in if the script or chunk never arrives. The failed-chunk fallback omits the class and shows at once. Result: the line is hidden from first paint and then revealed, never visible then hidden then revealed. Browsers without `scripting` media-query support (older than Chrome 120, Safari 17, Firefox 113) keep the previous behavior. A new e2e test samples the line's opacity every frame from document start. It requires frame 0 to be 0 and the series never to decrease. It was confirmed to fail on the old code. No new color pair is painted, so the contrast pairs and matrix are unchanged.

### WR-03: Deploy is not gated on e2e, and the Pages workflow is over-permissive and cancellable

**Files modified:** `.github/workflows/deploy.yml`
**Commit:** 53e77ae
**Applied fix:** The build job now installs Chromium and runs `npm run test:e2e` after `verify`, before the Pages artifact is uploaded. Workflow-level permissions are `contents: read`. The build job gets `contents: read` and `pages: read`, which is more than the review suggested because `configure-pages` reads the Pages site. The deploy job alone gets `pages: write` and `id-token: write`. `cancel-in-progress` is now `false`. All action SHA pins are unchanged. This workflow cannot run locally, so the first push to `main` is its real test.

### WR-04: `npm run typecheck` does not cover tests, scripts or Playwright's TS surface

**Files modified:** `tsconfig.json`, `tsconfig.test.json` (new), `tsconfig.scripts.json` (new), `scripts/lib/tokens.mjs`, `scripts/check-contrast.mjs`
**Commit:** d8429c2
**Applied fix:** Two new project references. `tsconfig.test.json` checks `tests/` in strict mode with node and vite/client types, the `@/*` paths and `react-jsx`. It excludes `tests/fixtures`, which holds deliberately invalid import fixtures. `tsconfig.scripts.json` checks `scripts/**/*.mjs` with `checkJs`, strict but with `noImplicitAny` off, so no JSDoc blanket was needed. The errors this surfaced were fixed: JSDoc record types on the token maps in `tokens.mjs` (which fixed 12 `{}` indexing errors in `tokens.test.ts`), and `unknown` catch variables in `check-contrast.mjs`. The `verify` chain order is unchanged, and `tsc -b` is now clean. A deliberately wrong type in a test file was confirmed to fail it.

### WR-05: "theme thumb animates" e2e cannot fail when the animation is missing

**Files modified:** `tests/e2e/motion.spec.ts`
**Commit:** 2015ca3
**Applied fix:** The test now clicks the toggle and samples the thumb's x translation on 40 animation frames, then asserts a value strictly between 0.5 and 19.5 was seen. The existing poll for the end matrix is kept. The same sampler was confirmed to see no intermediate value under reduced motion (a snap), so it distinguishes a spring from a snap.

### WR-06: check-colors misses directional and prefixed palette utilities that compile to nothing

**Files modified:** `scripts/check-colors.mjs`, `tests/unit/gates.test.ts`
**Commit:** 1c39b8c
**Applied fix:** The palette rule now allows modifier or direction words between the prefix and the color (`border-t-red-500`, `border-x-blue-500`, `divide-y-red-500`, `ring-offset-white`, `inset-ring-red-500`) and adds the `placeholder`, `inset` and `drop` prefixes. New rules flag arbitrary named colors (`bg-[red]`, `text-[color:tomato]`; the `transparent`, `currentColor` and `var()` forms are allowed) and CSS named colors in color properties (`color: 'red'`, `border: '1px solid tomato'`, `background-color: rebeccapurple`, SVG `fill="teal"`). The root `index.html` is now scanned. Tests cover each flagged form and a passing set of themable keywords and token utilities that share a prefix. The repo itself passes the stricter gate with no source changes.

### IN-02: Theme never follows the OS or other tabs after load

**Files modified:** `src/lib/theme.ts`, `src/lib/useTheme.ts` (new), `src/components/ui/ThemeToggle.tsx`, `tests/unit/theme.test.ts`, `tests/e2e/theme.spec.ts`
**Commit:** 1a40e87
**Status:** fixed: requires human verification (state handling)
**Applied fix:** `subscribeTheme` folds a `storage` event (another tab changing or clearing the choice) and an OS scheme change (only while nothing is stored) into `html[data-theme]`, and a `MutationObserver` on that attribute notifies subscribers. `useTheme` wraps it in `useSyncExternalStore`, and `ThemeToggle` uses it in place of its local state. Five unit tests and one e2e test cover it, including that a stored choice stops the OS from changing the theme.

### IN-03: `category in THRESHOLDS` accepts prototype keys

**Files modified:** `scripts/check-contrast.mjs`, `tests/unit/tokens.test.ts`
**Commit:** 9346373
**Applied fix:** `Object.hasOwn(THRESHOLDS, p.category)`. New tests feed the gate `constructor`, `toString` and an unknown name, and expect exit 2 with the "unknown category" message. The two prototype-key cases failed against the old code.

### IN-04: Token parser is fragile around nesting and the last declaration

**Files modified:** `scripts/lib/tokens.mjs`, `tests/unit/tokens.test.ts`
**Commit:** 8b9dd4a
**Applied fix:** `parseTokensCss` throws a `TokenError` (gate exit 2) when the comment-stripped CSS contains any at-rule (`@media`, `@layer`, `@supports`, and so on). The declaration pattern now accepts a final declaration with no trailing `;`. Tests cover both. The real `tokens.css` has no at-rules, and the contrast gate still reports PASS.

### IN-05: `curl | grep -q` under `pipefail` is a latent flake

**Files modified:** `.github/workflows/deploy.yml`
**Commit:** 29d2a1d
**Applied fix:** The smoke step passes the page URL through `env: PAGE_URL`, captures the body with `curl -fsS --retry 6 --retry-delay 5 --retry-all-errors`, then runs `grep -q "Aaron Phan" <<<"$body"`. This is the step's first real run, on the next deploy.

### IN-06: Hand-rolled class joining, and the theme key hardcoded in two places

**Files modified:** `src/layout/Container.tsx`, `src/layout/Section.tsx`, `tests/unit/layout.test.tsx` (new), `tests/unit/theme-script.test.ts`
**Commit:** f2e0e42
**Applied fix:** `Container` and `Section` use `cn()`, so a caller's `py-8` replaces `py-16`. Two new tests cover that. A theme-script test now asserts that the inline script in `index.html` reads `THEME_STORAGE_KEY`, so the two copies cannot drift.

### IN-07: Live-URL e2e mode breaks without a trailing slash

**Files modified:** `playwright.config.ts`
**Commit:** 94c9fd4
**Applied fix:** `E2E_BASE_URL` is trimmed and given a trailing slash, and an empty value counts as unset. The normalization was checked with and without the slash. There is no unit test, because this is config evaluated at Playwright start.

## Skipped Issues

### IN-01: "Copy email" is a mailto link that does not copy

**File:** `src/sections/Hero/Hero.tsx:22-27` and `index.html:43-48`
**Reason:** Skipped on the owner's instruction. The owner deferred it to Phase 3 (NAV-03), so it was not touched.
**Original issue:** The visible label promises a clipboard copy, but the element is a plain `mailto:` anchor that opens a mail client (or nothing, on machines without one). The label and behavior disagree once JS is available. The e2e tests pin both the label and the href.

---

_Fixed: 2026-10-26_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
