---
phase: 03-content-complete-site
plan: "17"
subsystem: security-gates-docs
tags: [pdfjs-dist, phone-gate, resume, adr, docs, requirements]

requires:
  - phase: 03-content-complete-site
    provides: owner approval of pdfjs-dist@6.3.289 (03-01), the owner's phone-free resume export (03-02 requested it; delivered during this plan), the shipped layouts and components the docs now describe (03-05 to 03-16)
provides:
  - check:no-phone reads every PDF in dist with pdfjs-dist (page text joined with and without spaces, link annotations, Info dictionary and XMP) and fails closed on an unreadable PDF
  - A real-resume rule: dist/resume.pdf must contain the owner's name and at least 1500 non-whitespace characters, so the 594-byte stand-in can never ship
  - public/resume.pdf is the owner's phone-free export (one page, 108,884 bytes)
  - resume.spec.ts: all four Resume links download a %PDF- file served as application/pdf
  - ADR-0009 (native dialog, closes OD-06) and ADR-0010 (inline SVG UI glyphs)
  - architecture doc, ADR log and motion spec describing what Phase 3 shipped; CNT-04, SEC-02, SEC-03 and the Phase 5 criteria aligned with D-10, D-11 and D-16
affects: [03-18 axe QA pass, 03-19 staging check, Phase 5 section treatments, Phase 6 hardening]

status: complete
commits: 4
plan_head_before: 37063a65cf83973ab155c45f243a4295a018050c
plan_head_after: e43ab742425dcaa30e8f5de3c3397c8cc4cc201a

actuals:
  tokens: 7700
  tasks: 3
  commits: 4

tech-stack:
  added: ["pdfjs-dist 6.3.289 (exact, devDependency)"]
  patterns:
    - "Gate output names a file, page, metadata key and shape label, never matched characters; PDF metadata key names are listed for the owner to review, values never"
    - "Runtime PDF builder in the gate tests (makePdf) assembles a well-formed one-page PDF with computed xref offsets; no phone-shaped literal is committed"

key-files:
  created:
    - tests/e2e/resume.spec.ts
    - docs/adr/0009-native-dialog-for-project-details.md
    - docs/adr/0010-inline-svg-ui-glyphs.md
  modified:
    - package.json
    - package-lock.json
    - public/resume.pdf
    - scripts/check-no-phone.mjs
    - tests/unit/gates.test.ts
    - docs/architecture.md
    - docs/adr/README.md
    - .planning/phases/01-decisions-and-documentation/01-CONTENT-INVENTORY.md
    - .planning/phases/01-decisions-and-documentation/01-MOTION-SPEC.md
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md

key-decisions:
  - "Real-resume rule counts non-whitespace characters over the page text joined with nothing and looks for the name in that same compact text, so the export's word spacing cannot move a pass to a fail"
  - "ADR-0009 closes OD-06 on the native-dialog fallback without running the MorphingDialog spike; ADR-0010 supersedes only ADR-0005's UI-glyph bullet"
  - "IX-13 is recorded as dropped (owner decision 2026-10-19), IX-14 as optional with build phase '5, only if wanted', IX-18 (Wordmark flip, build phase 4) added"

requirements-completed: []
# CNT-04 stays pending: this plan only aligns its text with D-16; the orchestrator accepts it at phase level. NAV-04 is deliberately not marked here.

duration: not recorded (Task 1 in an earlier run; Tasks 2 and 3 resumed 2026-10-27 after the owner's resume export)
completed: 2026-10-27

coverage:
  - id: C1
    description: "The phone gate sees a phone-shaped string in PDF page text (plain, Flate-compressed, split across two text-show operators), in a tel: link annotation and in the Info dictionary, and prints no digits"
    requirement: CNT-04
    verification:
      - kind: test
        ref: "tests/unit/gates.test.ts#check-no-phone PDF read with pdfjs"
        status: pass
    human_judgment: false
  - id: C2
    description: "A corrupt file named resume.pdf fails the gate and is named; a clean PDF passes and lists metadata key names only"
    requirement: CNT-04
    verification:
      - kind: test
        ref: "tests/unit/gates.test.ts#fails closed on a file that starts like a PDF and is garbage"
        status: pass
      - kind: test
        ref: "tests/unit/gates.test.ts#passes a clean PDF with ordinary text and lists the metadata key names"
        status: pass
    human_judgment: false
  - id: C3
    description: "Separated numbers with spaces, dots, dashes, parentheses or a +1 prefix are flagged in PDF text; a 3-3-3 digit group is not"
    requirement: CNT-04
    verification:
      - kind: test
        ref: "tests/unit/gates.test.ts#flags a number written with %s in PDF text; does not flag a 3-3-3 digit group in PDF text"
        status: pass
    human_judgment: false
  - id: C4
    description: "resume.pdf with the name and exactly 1500 non-whitespace characters passes; 1499 fails; without the name fails; other PDFs are not held to the rule"
    requirement: CNT-04
    verification:
      - kind: test
        ref: "tests/unit/gates.test.ts#accepts a resume.pdf ... exactly 1500; rejects ... 1499; rejects ... without the name; applies the real-resume rule to resume.pdf only"
        status: pass
    human_judgment: false
  - id: C5
    description: "The shipped dist/resume.pdf (owner's export) passes the gate in a project-path build"
    requirement: CNT-04
    verification:
      - kind: command
        ref: "VITE_BASE=/aa-phan-portfolio-v2/ npm run build && npm run check:no-phone -> 'no-phone: OK'"
        status: pass
    human_judgment: false
  - id: C6
    description: "The hero, desktop nav, contact and pill-panel Resume links all carry download, a base-prefixed href ending in resume.pdf, and the request returns 200, application/pdf, a %PDF- body over 594 bytes"
    requirement: CNT-04
    verification:
      - kind: test
        ref: "tests/e2e/resume.spec.ts#resume desktop; resume phone"
        status: pass
    human_judgment: false
  - id: C7
    description: "The ADRs, architecture doc, ADR log, motion spec, CNT-04, SEC-02, SEC-03 and Phase 5 criteria say what was asked, no public doc holds a planning path, decision id, references path or phone shape, and Prettier is clean"
    requirement: CNT-04
    verification:
      - kind: command
        ref: "Task 3 automated verify block (privacy grep, ADR headings, IX-18, CNT-04 and SEC wording, IX-13 dropped, prettier --check)"
        status: pass
    human_judgment: false
  - id: C8
    description: "The exported PDF's visible content, and the metadata key names it carries (Author, Keywords, Subject, Title, Custom and others), contain nothing the owner wants kept off the site beyond the phone number"
    requirement: CNT-04
    verification: []
    human_judgment: true
    rationale: "The gate proves the absence of phone shapes, not that the metadata values or layout are what the owner intends; the owner exported the file himself and the gate prints key names only. A glance at the values in a PDF viewer's document properties is a cheap last check before cutover"
---

# Phase 3 Plan 17: Phone gate inside the PDF, real-resume rule, public docs catch up Summary

**check:no-phone now parses the served resume with pdfjs-dist (page text, link annotations, Info and XMP metadata), fails closed on anything unreadable, and refuses any dist/resume.pdf that is not the owner's real resume; the owner's phone-free export is committed and passes, and ADR-0009/0010, the architecture doc, the motion spec and the requirement text now describe what Phase 3 shipped.**

## Performance

- **Tasks:** 3 of 3 (Task 1 in an earlier run; Tasks 2 and 3 here, after the owner delivered the export)
- **Files:** 3 created, 11 modified (plus the lockfile)

## Accomplishments

- Task 1 (tracer): pdfjs-dist 6.3.289 pinned as a devDependency; the gate loads each PDF with `getDocument`, scans each page's text joined with spaces and with nothing, treats any telephone-scheme link annotation as a hit, scans the Info dictionary entry by entry and the XMP packet, and prints only file, page or metadata key and shape label. A read error is a hit. The byte-level scan of streams is kept as a second opinion.
- Task 2: the owner's phone-free `public/resume.pdf` (one page, 108,884 bytes, replacing the 594-byte stand-in) is committed. `dist/resume.pdf` must now contain the name and at least 1500 non-whitespace characters or the gate prints "is not a real resume (text layer too short or missing the name)". `tests/e2e/resume.spec.ts` checks all four Resume links and the served file. The inventory CON-05 resolution and D-16 rows record the export as done 2026-10-27.
- Task 3: ADR-0009 and ADR-0010 written to the ADR template; ADR log rows added, 0005's row notes its UI-glyph bullet is superseded, OD-06 marked resolved, OD-03 notes the partial LazyMotion use with the measured 124,760 B gz initial JS. Architecture doc updated (PillNav, Wordmark, 404 entry, MotionFeatures, NavIndicator, PillMorph, ToastPresence, useTheme, icons, gates, stack). Motion spec: IX-07/08/09 build phases, IX-18 added, IX-13 dropped, IX-14 optional, vendored-table note. CNT-04 states the owner export and the text-layer gate with the site-wide phone clause kept word for word; SEC-02, SEC-03 and Phase 5 criteria 2 and 3 match the statement and facts layouts.

## Task Commits

1. **Task 1 (tracer) RED: PDF text-layer, link-annotation and metadata cases** - `3dcc2e9` (test)
2. **Task 1 (tracer) GREEN: gate reads the served PDF's text layer, links and metadata (pdfjs-dist 6.3.289)** - `0ffcc8f` (feat)
3. **Task 2: only a real phone-free resume ships and every Resume link serves it** - `e0f9a42` (feat)
4. **Task 3: ADRs, architecture, motion spec, requirement text** - `e43ab74` (docs)

## Verification

- `npx vitest run tests/unit/gates.test.ts`: 130 passed.
- `VITE_BASE=/aa-phan-portfolio-v2/ npm run verify`: exit 0 (305 unit tests; initial JS 124,760 B gz of 150,000; `no-phone: OK`; `check-images: OK`).
- `VITE_BASE=/aa-phan-portfolio-v2/ npm run test:e2e`: 149 passed (chromium and mobile), including the 3 new resume tests.
- Task 3 automated block: privacy grep clean, ADR headings present, all wording checks pass, Prettier clean.
- Acceptance greps (`getTextContent`, `getAnnotations`, `getMetadata`, `isEvalSupported: false`, `not a real resume`, `check:no-phone` in the inventory, `PillNav`, `check-images`): all pass.

## Decisions Made

See key-decisions in the frontmatter.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Test PDFs with long text lost text in pdfjs**
- **Found during:** Task 2 (building a 1500-character resume probe)
- **Issue:** pdfjs drops text drawn past the page edge, so one 1500-character `Tj` string was read as 90 characters and the real-resume boundary tests could not pass.
- **Fix:** `makePdf` now wraps text into lines of 80 characters (`drawLines`), and `realText(extra, count)` builds a name-plus-filler text of an exact non-whitespace length. Existing clean-PDF tests that write dist/resume.pdf use it so they satisfy the new rule.
- **Files modified:** tests/unit/gates.test.ts
- **Commit:** `e0f9a42`

**2. [Interpretation] WR-01 separator shape needed no change in Task 2**
- The separated-number shape already took the optional +country prefix, optional parentheses and separator runs of any form (done in Task 1's pass). Task 2 added tests for it in PDF text (spaces, dots, dashes, parentheses, +1) and the 3-3-3 negative rather than changing the pattern.

**3. [Interpretation] Architecture doc corrections beyond the plan's list**
- The quality-gates table listed the contrast check as a "later gate" at the bottom while `npm run verify` already runs `check:contrast` before the build; the row moved into chain order with its real command, and the sentence now counts eleven gates. `MotionFeatures.tsx` is listed at the anim root where it lives rather than under `declarative/`, and the physics folder names `ThemeThumb`, not the never-built `PressSpring`.

**4. [Interpretation] axe-core listed in the stack table before it is installed**
- The plan asks the stack table to list axe-core (4.13.0, owner-approved in 03-01) as a dev tool of the visual QA pass. It is installed by plan 03-18, so until then the row is ahead of package.json by one plan.

**5. [Interpretation] OD-03 byte count**
- The plan says to take the initial-JS figure from the SUMMARY files (113,348 B in 03-05, 115,889 B in 03-09). The log records the current measured 124,760 B gz instead, which is what `check:budget` prints on the tree this plan ships.

## Known Stubs

None.

## Threat Flags

None. No new endpoints, auth paths or trust boundaries; the plan reduces information-disclosure risk (T-03-23, T-03-24) and uses an exact-pinned dev-only dependency (T-03-25).

## Issues Encountered

- The owner's export carries a `Custom` and a `Keywords` metadata key besides the usual ones. The gate lists key names only; the values pass the phone shapes. See coverage C8 for the human check.
- The stand-in `public/resume.pdf` blocked this plan until the owner exported his resume (checkpoint at Task 2's precondition); the owner replied "resume done" on 2026-10-27 and the orchestrator verified the file read-only before this run resumed.

## Self-Check: PASSED

- Created files present: tests/e2e/resume.spec.ts, docs/adr/0009-native-dialog-for-project-details.md, docs/adr/0010-inline-svg-ui-glyphs.md.
- Commits `3dcc2e9`, `0ffcc8f`, `e0f9a42`, `e43ab74` are ancestors of HEAD; `git rev-list --count` from the recorded base is 4.
