---
phase: 02-deployed-themed-skeleton
fixed_at: 2026-10-26T00:00:00Z
review_path: .planning/phases/02-deployed-themed-skeleton/02-REVIEW.md
iteration: 2
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 2: Code Review Fix Report

**Fixed at:** 2026-10-26
**Source review:** .planning/phases/02-deployed-themed-skeleton/02-REVIEW.md
**Iteration:** 2

**Iteration 1:** fixed WR-01 to WR-06 and IN-02 to IN-07 of `02-REVIEW-iter1.md` and skipped IN-01 (deferred by the owner). See the history of this file for that report.

**Summary:**

- Findings in scope: 7 (WR-01 to WR-04, IN-01 to IN-03; fix scope `all`)
- Fixed: 7 (WR-01 by the orchestrator in `2ef608e`; the other six by this run)
- Skipped: 0

**Verification:** run in the main checkout (`workflow.use_worktrees` is `false`, so no worktree was created). After the last fix, `npm run verify` exited 0 (164 unit tests pass, initial JS 95.7 kB gzipped against the 150 kB budget, `no-phone: OK` on the real `dist`) and `npm run test:e2e` passed 20 of 20. `src/components/motion-primitives/text-effect.tsx` is untouched (no diff since `0175de9`), so its ADR-0007 hash is unchanged. All commits went through the normal hooks.

## Fixed Issues

### WR-01: Runbook false-positive list is stale

**Files modified:** `docs/deploy-runbook.md`
**Commit:** `2ef608e` (applied by the orchestrator before this run; not touched again)
**Applied fix:** The runbook names `02-REVIEW-iter1.md` as the tree hit.

### WR-02: Phone gate misses typographic separators and a number written as a JS string

**Files modified:** `scripts/check-no-phone.mjs`, `tests/unit/gates.test.ts`
**Commit:** `3631b09` (one commit for WR-02 and WR-03, because both rewrite the same scan loop; status: fixed, requires human verification, as this is regex logic)
**Applied fix:**

- The separator set now covers hyphen, dot, slash, space, tab, no-break and soft hyphen, the Unicode spaces U+2000 to U+200A (thin, figure and the rest), hyphens and dashes U+2010 to U+2015 (en and em dash, non-breaking hyphen), narrow no-break space, U+205F, the minus sign and U+3000. Each is generated from one code point list and matched as the character, as its UTF-8 bytes (files are read as latin1), as a `\uXXXX` escape and as an HTML entity (named, decimal and hex). WinAnsi en and em dash bytes are matched for extracted PDF text, and a UTF-16BE hex string with a byte order mark in a PDF is now decoded to real characters.
- New `literal` view: a small tokenizer (comments, regex literals, strings, template literals with their `${}` code skipped) keeps only the string literals of `.js`, `.mjs`, `.cjs`, `.json` and `.webmanifest` files at their byte offsets. A contiguous plausible-NANP run (area code and exchange start 2 to 9, optional 1 or +1 prefix, non-alphanumeric boundaries) inside a string literal is flagged, including mid-sentence. Unquoted numeric constants, hashes, timestamps, comments and regex bodies cannot match. The 32-bit integer limits (a quoted CSS z-index of that size) are excluded.
- Markup (`.html`, `.txt`, extracted PDF text) additionally flags a plausible-NANP 11-digit or +1 run. The existing broad ten-digit rule for markup is unchanged.
- Tests: 11 typographic separators in HTML and in a JS bundle, a `–` escape, 7 contiguous forms in JS (double, single and template quotes, +1, 11-digit, mid-sentence, JSX prop), a literal after a regex that holds a quote, +1 and 11-digit in HTML, and a negative test for unquoted constants, a hex hash, a timestamp, a non-NANP quoted string, a longer run, a regex body and a comment. Probes are built at runtime from separate digit groups and the tests assert no digits appear in the output.

**Proof the probes fail on the old code:** I ran the new test file against the old script first: 37 of the new tests failed (every typographic separator, every contiguous form, the 11-digit forms, the WinAnsi PDF dash, the uncompressed-stream cases and both drawing-operand negatives). After the change all 101 tests in `gates.test.ts` pass. The current `dist` passes (`no-phone: OK`), and so does the real repository's `npm run verify`.

**False-positive sweep:** I also ran the new gate over 1375 JS, MJS, CJS and JSON files copied from `node_modules` (output as file and offset only). The new contiguous-number rule had two hits there, both a CSS z-index string near the 32-bit limit, which led to the exclusion above; it now has none. The remaining hits in that sweep came from the older shapes (a `tel:` string in four libraries and path data in one), unchanged by this work and not in the project's `dist`.

### WR-03: PDF content-stream scan applies the separated-number shape to raw graphics operands

**Files modified:** `scripts/check-no-phone.mjs`, `tests/unit/gates.test.ts`
**Commit:** `3631b09` (status: fixed, requires human verification)
**Applied fix:** Number shapes now apply only to text drawn by `Tj` and `TJ` (and the quote operators), never to decoded or raw stream bytes. Streams that do not inflate are taken as uncompressed content streams and read the same way, so uncompressed text is now covered where before it was only raw-scanned. `tel:` is still checked in decoded streams. Stream bodies are replaced by NULs (same length, so offsets are unchanged) in the raw scan, which keeps document info strings and URI actions in the PDF's own dictionaries covered. Tests: a compressed and an uncompressed content stream with a three-decimal move operand and a four-digit operand must pass; a contiguous number in an uncompressed `Tj` and a number in a `/Subject` string outside any stream must fail.
**Known limit, now stated in the script and the runbook:** strings inside compressed object streams (for example a PDF 1.5 Info dictionary) are no longer read as text, where the old raw pass over decoded streams did read them, at the cost of the false positives above. The resume PDF still gets a manual look. The committed `public/resume.pdf` has no streams.

### WR-04: An OS scheme change overrides an explicit in-memory choice when storage is blocked

**Files modified:** `src/lib/theme.ts`, `tests/unit/theme.test.ts`, `tests/e2e/theme.spec.ts`
**Commit:** `b34a99d` (status: fixed, requires human verification, as this is state logic)
**Applied fix:** A module flag `unsavedChoice` is set when `applyTheme` cannot store the choice, and cleared when a store succeeds or when a `storage` event arrives (those only fire when storage works, and storage is then the record again). `onSystemChange` follows the OS only when `!unsavedChoice && storedTheme() === null`. I narrowed the reviewer's suggestion (flag on every `applyTheme`) to the blocked case, because with working storage `storedTheme()` is already the record and a cleared store in another tab should still hand the page back to the OS.
**Tests:** two unit tests (blocked storage keeps `dark` after the media query flips both ways; the flag is released by a storage event once storage works again), each on a fresh module copy so the flag cannot leak. The blocked-storage e2e test now flips the OS scheme after the toggle and waits for each change event to be delivered (events arrive some time after `emulateMedia` resolves, so the wait counts them with a listener registered after the app's own). The unit test fails on the old `theme.ts`, and the e2e test fails on the old `theme.ts` with `dark` received where `light` is expected.

### IN-01: Tagline is invisible for up to 3 s when the main bundle never runs, and no test covers it

**Files modified:** `tests/e2e/motion.spec.ts`
**Commit:** `4e55301`
**Applied fix:** New e2e test aborts every `assets/*.js` request, asserts the computed opacity of `#hero p` is `0` at DOMContentLoaded, then polls until it is `1` within 6 s (so the CSS safety-net animation is the only thing that can reveal it), and checks the text. It reads computed opacity, not `toBeVisible()`. I confirmed it fails when the CSS delay is stretched to 30 s. No CSS change was needed; I left the 3 s delay as it is rather than shortening it, because a shorter delay would bring back the visible, hidden, revealed flash on slower chunk loads.

### IN-02: Deploy workflow runs the slow e2e job before the cheap gates

**Files modified:** `.github/workflows/deploy.yml`, `docs/deploy-runbook.md`
**Commit:** `35cdb0d`
**Applied fix:** Jobs are now `build` (checkout, setup-node, `npm ci`, `npm run verify`, configure-pages, upload; no browser), then `e2e` (`needs: build`; installs Chromium and runs `npm run test:e2e`), then `deploy` (`needs: [build, e2e]`). A push that fails any cheap gate stops before a browser is downloaded, and nothing is published unless e2e passes. Every SHA pin is unchanged (compared as a set against the previous file), the workflow default is still `contents: read`, `build` still adds `pages: read`, and only `deploy` has `pages: write` and `id-token: write`. The runbook Workflows section matches, and its phone-check note now describes the updated PDF scan. This cannot be run locally, so the first push to `main` is its real test (as the review noted for `configure-pages` and the `curl` step). The e2e job still builds `dist` itself, so the suite does not run against the uploaded artifact byte for byte (same source and lockfile).

### IN-03: Runbook guard claims to match the script but uses a narrower separator set

**Files modified:** `docs/deploy-runbook.md`
**Commit:** `9f1ce4b`
**Applied fix:** The guard is now a byte-level `LC_ALL=C` ERE built from a `SEP` variable that has the same literal-character set as the script (including the typographic dashes and spaces, and slash), with a closing parenthesis allowed between the first two groups. The text now says exactly how it differs: it does not decode HTML entities or `\u` escapes, does not check contiguous runs, and reads source and docs rather than built output. The decision date is corrected to 2026-10-26 (`date +%F`).

I ran the documented guard exactly as written (extracted from the runbook) over all of history (`git log --all`) and `git grep -lE` over `HEAD`, and probed it with six separator forms built at runtime (all hit). The widened pattern, because of the slash separator, adds one family of hits to the two already listed: wireframe viewport widths written as three numbers joined by slashes in `.planning` documents. I confirmed each hit line structurally with the digits masked (all read "wireframes at ... / ... / ..." or "Low-fi layouts at ..."; the groups are in the phone, tablet and desktop width ranges), and listed them in the runbook: commits `c22f07b`, `b2f8b04`, `b56e593`, `991c252`, `d01324e`, `dd50558`, and tree files `.planning/ROADMAP.md`, `.planning/research/ARCHITECTURE.md`, and `01-01-PLAN.md`, `01-01-SUMMARY.md`, `01-CONTEXT.md` in phase 1. The two earlier entries are still the only other hits (`4517011` with `02-REVIEW-iter1.md`, and `b56e593` with `01-07-PLAN.md`). The result is 7 history commits and 7 tree files, all listed. No hit was left unexplained. My own first commit briefly added a hit (a coordinate example in a script comment); I reworded the comment and amended that unpushed commit before the guard run above, so history is clean of it.

**Owner confirmation needed:** the runbook labels the whole list "owner decision, 2026-10-26", but the viewport-width family is an addition made in this run. The owner should confirm it.

## Skipped Issues

None.

---

_Fixed: 2026-10-26_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 2_
