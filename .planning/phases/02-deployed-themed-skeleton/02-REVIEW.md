---
phase: 02-deployed-themed-skeleton
reviewed: 2026-10-26T00:00:00Z
depth: standard
files_reviewed: 26
files_reviewed_list:
  - .github/workflows/deploy.yml
  - .prettierignore
  - docs/deploy-runbook.md
  - index.html
  - playwright.config.ts
  - scripts/check-colors.mjs
  - scripts/check-contrast.mjs
  - scripts/check-no-phone.mjs
  - scripts/lib/tokens.mjs
  - src/anim/declarative/TextReveal.tsx
  - src/components/ui/ThemeToggle.tsx
  - src/layout/Container.tsx
  - src/layout/Section.tsx
  - src/lib/theme.ts
  - src/lib/useTheme.ts
  - src/styles/base.css
  - tests/e2e/motion.spec.ts
  - tests/e2e/theme.spec.ts
  - tests/unit/gates.test.ts
  - tests/unit/layout.test.tsx
  - tests/unit/theme-script.test.ts
  - tests/unit/theme.test.ts
  - tests/unit/tokens.test.ts
  - tsconfig.json
  - tsconfig.scripts.json
  - tsconfig.test.json
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 2: Code Review Report (re-review of fixes)

**Reviewed:** 2026-10-26
**Depth:** standard
**Files Reviewed:** 26
**Status:** issues_found

## Summary

Re-reviewed the diff since `4517011` against the 13 findings in `02-REVIEW-iter1.md`, plus the later commits `0ceafe1` (matchMedia guard), `6eb90c5` (deploy split into e2e, build, deploy jobs) and `87ab3d5` (runbook). I also ran `typecheck`, `check:colors`, `check:contrast`, `build`, `check:no-phone`, `check:budget`, the unit suite (123 pass), oxlint and `prettier --check`. All pass. I probed the phone gate with synthetic inputs built at runtime, and the output was stripped of digits.

**Prior findings: all 12 applied fixes hold, IN-01 is skipped by owner decision (Phase 3, NAV-03).**

| Prior | Status | Note |
|-------|--------|------|
| WR-01 phone gate | Partly resolved | Space, nbsp and PDF Flate text are now covered, but new holes remain (WR-02, WR-03 below). |
| WR-02 tagline flash | Resolved | `reveal-pending` hides from first paint. Residual cases in IN-01. |
| WR-03 deploy gating and permissions | Resolved | e2e gates build, least-privilege permissions, `cancel-in-progress: false`. See IN-02. |
| WR-04 typecheck coverage | Resolved | `tsc -b` now checks `tests/` and `scripts/`. |
| WR-05 thumb animation test | Resolved | Frame sampler asserts an intermediate value. |
| WR-06 raw-color gate | Resolved | Directional, prefixed, arbitrary and named forms, plus `index.html`. |
| IN-02 theme follows OS and tabs | Resolved, with a regression (WR-04 below). |
| IN-03, IN-04, IN-05, IN-06, IN-07 | Resolved | Verified in code and tests. |
| IN-01 "Copy email" | Skipped (deferred) | Not a regression. |

New problems introduced by the fixes are the four warnings below. No critical issues. No phone digits were printed during this review.

## Warnings

### WR-01: Runbook false-positive list is stale, so its own tree guard stops the push

**File:** `docs/deploy-runbook.md:18-26`
**Issue:** The runbook says the tree guard may print only two known hits, and "any other hit stops the push". One of the two is named as `.planning/phases/02-deployed-themed-skeleton/02-REVIEW.md`. Commit `15797c6` renamed that file to `02-REVIEW-iter1.md`. I ran the documented `git grep -lE ... HEAD`. It prints `01-07-PLAN.md` and `02-REVIEW-iter1.md`, so the real hit is not on the allow list. An operator following the runbook literally is told to stop. The opposite failure is worse: someone who re-lists the allowed path as whatever matches `02-REVIEW*` gets in the habit of ignoring hits there. Also, this re-review's own output file will replace `02-REVIEW.md`, so the named path is now a different document.
**Fix:** Name the real path (`02-REVIEW-iter1.md`), and either keep that file out of the tree or add a path filter to the guard so the check is mechanical, for example:
```sh
git grep -lE '[0-9]{3}[-. )]+[0-9]{3}[-. ][0-9]{4}' HEAD -- . \
  ':!.planning/phases/01-decisions-and-documentation/01-07-PLAN.md' \
  ':!.planning/phases/02-deployed-themed-skeleton/02-REVIEW-iter1.md'
```

### WR-02: Phone gate still misses typographic separators and a number written as a JS string

**File:** `scripts/check-no-phone.mjs:42-57`
**Issue:** I probed the gate with synthetic three-group and ten-digit numbers in `dist/a.js` and `dist/b.html`:
- Flagged: spaces, parentheses, `+1`, ` - ` runs, and a contiguous ten-digit run in HTML.
- Not flagged (exit 0, "no-phone: OK"): groups joined by an en dash (U+2013), a non-breaking hyphen (U+2011), a slash, or a narrow no-break space (U+202F). A contiguous ten-digit number or `+1` plus ten digits in the JS bundle is not flagged either, because the ten-digit rule is limited to `.html` and `.txt`.

Phase 3 puts contact copy into React components, so the content ends up in the JS bundle. A contiguous number in a string literal is therefore the most likely leak and is the case the gate skips. Typographic dashes are what you get when copy is pasted from a resume or a word processor. This is the gate for a hard privacy rule, and it reports OK on these inputs.
**Fix:** Widen `SEP` to the Unicode dashes and spaces, in the bytes as read (the file is read as latin1, so match the UTF-8 sequences `\xe2\x80[\x90-\x95\xaf]`). For JS, add a quoted-literal rule that does not fire on bare numeric constants:
```js
{ label: 'quoted ten-digit', re: /(?<=["'`])\+?1?\d{10}(?=["'`])/g },
```
Add a gate test for each form, building the probe at runtime from digit groups as the existing tests do.

### WR-03: PDF content-stream scan applies the separated-number shape to raw graphics operands and false-positives

**File:** `scripts/check-no-phone.mjs:148-152`
**Issue:** For each inflated stream the script scans the raw decoded content with all shapes, then scans the extracted text. The raw pass runs the `separated number` regex over drawing operators, where `.` is a valid separator. I built a Flate stream containing one path-move operator whose x operand has three decimals and whose y operand is a four-digit integer, plus a short `(Hello) Tj` text run. The gate exits 1 with "separated number" at offset 8. That is a coordinate pair, not text. The committed `public/resume.pdf` is a 594-byte stand-in with no streams, so this has not shown up yet. When the real resume is swapped in, a path or table coordinate with three decimals followed by a four-digit integer can fail `verify` and block deploy. The message gives only a stream index and offset, so triage means decoding the PDF by hand. A gate that cries wolf gets bypassed.
**Fix:** Drop the raw-content scan of decoded streams and keep only the `tel:` and URI checks on it (URI actions are not drawn text), with the number shapes applied to the `pdfShownText` output only:
```js
scan(`${rel} (stream ${i + 1})`, 'stream.tel', content)   // tel: shapes only
scan(`${rel} (stream ${i + 1} text)`, TEXT_NAME, pdfShownText(content))
```
Add a test with a graphics-only stream that must pass.

### WR-04: An OS scheme change overrides an explicit in-memory choice when storage is blocked

**File:** `src/lib/theme.ts:69-72` (with `applyTheme`, `:15-22`)
**Issue:** `onSystemChange` follows the OS whenever `storedTheme() === null`. When `localStorage` throws (private mode, policy), `applyTheme` sets the attribute, the write fails, and `storedTheme()` stays null even though the visitor made an explicit choice. If the OS scheme then flips (for example automatic sunset switching), `syncAttribute(systemTheme())` silently reverts the visitor's choice and the toggle flips back with no interaction. The e2e "blocked storage" test covers the toggle but not a later OS change, so this is untested. It is the same set of visitors the blocked-storage handling was written for.
**Fix:** Record an explicit choice in memory, and consult it as well as storage:
```ts
let chosenThisSession = false
export function applyTheme(theme: Theme): void {
  chosenThisSession = true
  /* ...existing body... */
}
const onSystemChange = () => {
  if (!chosenThisSession && storedTheme() === null) syncAttribute(systemTheme())
}
```
Add a unit test that blocks storage, calls `applyTheme('dark')`, flips the media query, and expects `dark` to stay.

## Info

### IN-01: Tagline is invisible for up to 3 s when the main bundle never runs, and no test covers it

**File:** `src/styles/base.css:36-49`, `index.html:32`
**Issue:** The static-shell paragraph now carries `reveal-pending`, so with `scripting: enabled` and motion allowed it is `opacity: 0` until React replaces it or the 3 s timer fires. If the entry script is blocked or fails (content blocker, network error, a runtime exception before mount), the visitor gets an empty gap where the shell used to be readable immediately. Chunk loads slower than 3 s also bring back the visible, hidden, revealed flash. The test "chunk fails to load" aborts only the lazy chunk, and the theme "no flash" test aborts all JS but never looks at the tagline. Playwright's `toBeVisible()` also counts `opacity: 0` as visible, so the visibility assertions would pass even if the line were hidden. This is a deliberate trade-off, but it is untested.
**Fix:** Add an e2e that aborts all `assets/*.js`, waits 3.5 s, and asserts `getComputedStyle(p).opacity === '1'`. Consider shortening the safety-net delay (1.5 s) or making the fallback delay a named custom property.

### IN-02: Deploy workflow runs the slow e2e job before the cheap gates

**File:** `.github/workflows/deploy.yml:24-52`
**Issue:** `build` needs `e2e`, so a push that fails typecheck, lint or the phone gate still pays for `npm ci`, a Chromium download and a full browser run before `verify` reports. `e2e` builds `dist` itself (`test:e2e` runs `npm run build`), and `build` builds again, so the suite is run against a different build from the one that is uploaded (same source and lockfile, so equivalent in practice). The new `pages: read` scope for `configure-pages` and the `curl` smoke step cannot be exercised locally, so the first push to `main` is their real test.
**Fix:** Either run `verify` in the same job before the browser steps and upload from there, or add `needs: verify` ordering (a `verify` job, then `e2e`, then `deploy`). If the first run fails with a 403 in `configure-pages`, raise `pages` to `write` on the build job.

### IN-03: Runbook guard claims to match the script but uses a narrower separator set

**File:** `docs/deploy-runbook.md:18-20`
**Issue:** The text says the guard's "separator set matches `scripts/check-no-phone.mjs`". The guard allows a single separator character between the second and third groups (`[-. ]`), while the script allows any run, non-breaking spaces and entities. A number with two spaces or a nbsp before the last group passes the guard. The decision line is also dated 2026-10-27, after the 2026-10-26 fix report it follows.
**Fix:** Use `[-. ]+` for the second gap and reword to "similar to"; correct the date.

---

_Reviewed: 2026-10-26_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
