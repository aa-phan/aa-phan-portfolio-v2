---
phase: 03-content-complete-site
plan: "11"
subsystem: ui
tags: [images, vite-imagetools, avif, webp, exif, gate, experience, logos]

requires:
  - phase: 03-content-complete-site
    provides: Experience index list with 24 px slots (03-10), ImageAsset schema (03-02), gates.test.ts helpers and the check-no-phone gate contract
provides:
  - vite-imagetools ~12.0.1 in the Vite and Vitest configs, with a module declaration for as=picture imports
  - src/content/images.ts, capitalOneLogo, spectrumLogo, symboticLogo as decorative 20 px ImageAssets
  - Experience rows render the logo as picture (AVIF and WebP sources) inside the 24 px slot
  - scripts/check-images.mjs and check:images chained at the end of verify
affects: [03-14 About photo under the same gate, 03-19 CI first run (sharp platform binary from the macOS lockfile)]

status: complete
commits: 2
plan_head_before: 3685d155c478a80f745a816fec6c88185320aecd
plan_head_after: 848e20331e9ad944f3a65ba8a44acd8d0cc013ed

actuals:
  tokens: 5400
  tasks: 2
  commits: 2

tech-stack:
  added: [vite-imagetools ~12.0.1 (devDependency, sharp transitive)]
  patterns:
    - "Image registry: imagetools imports with w, format and as=picture live only in src/content/images.ts; alt text is set there, never in the import string"
    - "Single-width sources fold the last format into the img fallback: Spectrum's 32 px source ships an AVIF source plus a WebP img, so every shipped file is still AVIF or WebP"
    - "Gate contract (--root, exit 0/1/2, print file and rule only) reused for check-images"

key-files:
  created:
    - src/types/imagetools.d.ts
    - src/assets/images/capitalone.png
    - src/assets/images/spectrum.png
    - src/assets/images/symbotic.png
    - src/content/images.ts
    - scripts/check-images.mjs
  modified:
    - package.json
    - package-lock.json
    - vite.config.ts
    - vitest.config.ts
    - tsconfig.test.json
    - src/content/experience.ts
    - src/sections/Experience/Experience.tsx
    - tests/e2e/content.spec.ts
    - tests/unit/content.test.ts
    - tests/unit/sections.test.tsx
    - tests/unit/gates.test.ts
    - docs/architecture.md

key-decisions:
  - "The source PNGs stay in src/assets/images (not shipped); only hashed AVIF and WebP reach dist"
  - "Image URL fields (logo and photo src and sources) are excluded from the content phone-shape walk because they are bundler output; check-no-phone still scans the built site"

patterns-established:
  - "check-images treats every raster in dist as shippable only if AVIF or WebP, metadata-free and referenced by name from a built html, js or css file"

requirements-completed: [CNT-05]

coverage:
  - id: D1
    description: "Capital One, Spectrum and Symbotic show a 20 px decorative logo in the 24 px slot from AVIF/WebP sources"
    requirement: CNT-05
    verification:
      - kind: e2e
        ref: "tests/e2e/content.spec.ts#experience logos the three logos load as AVIF and the monogram rows have no image"
        status: pass
      - kind: unit
        ref: "tests/unit/sections.test.tsx#shows the monogram chip and no img for an entry without a logo, and a decorative logo for the rest"
        status: pass
    human_judgment: false
  - id: D2
    description: "A logo that fails to load leaves the slot at 24 px and company names aligned on one x"
    requirement: CNT-05
    verification:
      - kind: e2e
        ref: "tests/e2e/content.spec.ts#experience logos with image requests aborted the slots stay 24 px and the names stay aligned"
        status: pass
    human_judgment: false
  - id: D3
    description: "Image gate rejects non-AVIF/WebP rasters, Exif/XMP metadata, unreferenced built images, unimported source images and public rasters; runs in verify"
    requirement: CNT-05
    verification:
      - kind: unit
        ref: "tests/unit/gates.test.ts#check-images (10 cases)"
        status: pass
      - kind: other
        ref: "VITE_BASE=/aa-phan-portfolio-v2/ npm run verify"
        status: pass
    human_judgment: false
  - id: D4
    description: "Three logos and two monogram chips align company names without crowding dates (desktop and phone screenshots)"
    verification: []
    human_judgment: true
    rationale: "Visual alignment and balance of 20 px logos against monogram chips is a backstop judgment; automated checks cover slot size and x alignment only"

duration: 12min
completed: 2026-10-27
---

# Phase 3 Plan 11: Image pipeline and gate Summary

**Employer logos flow from the legacy site through vite-imagetools into the Experience rows as AVIF and WebP, and a new check-images gate in the verify chain rejects any unoptimized, metadata-carrying or unused image.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-10-27T18:44:00Z
- **Completed:** 2026-10-27T18:56:00Z
- **Tasks:** 2
- **Files modified:** 18

## Accomplishments

- Three logos (Capital One, Spectrum, Symbotic) render at 20 px in the 24 px slot via picture with AVIF and WebP sources; alt is empty because the company name is adjacent text. dist holds 5 avif and 5 webp files and no png.
- With image requests aborted, all five slots still measure 24 px and the company names share one left x.
- check-images gate: format (AVIF or WebP only in dist), Exif/EXIF/XMP markers, built images unreferenced by any html/js/css, source images not imported by any src module, rasters under public. Prints file and rule only. Exits 0, 1, 2 per the check-no-phone contract.
- Initial JS 117.8 kB gz (was 117.4 kB), well inside the 150 kB budget. Full e2e: 97 passed.

## Task Commits

1. **Task 1: Tracer, logos through imagetools into Experience** - `389d3b2` (feat)
2. **Task 2: Image gate in the verify chain** - `848e203` (feat; tests written first and confirmed failing, committed together with the script)

**Plan metadata:** committed with this SUMMARY (docs).

## Files Created/Modified

- `src/content/images.ts` - imagetools imports mapped to decorative 20 px ImageAssets
- `src/types/imagetools.d.ts` - module declaration for imports ending in as=picture
- `src/assets/images/{capitalone,spectrum,symbotic}.png` - byte copies from the legacy site
- `src/sections/Experience/Experience.tsx` - picture with AVIF/WebP sources and lazy img in the slot
- `scripts/check-images.mjs` - the image gate; `package.json` chains `check:images` at the end of verify
- `tests/e2e/content.spec.ts`, `tests/unit/sections.test.tsx`, `tests/unit/gates.test.ts` - logo and gate coverage
- `docs/architecture.md` - Image check row in the quality gates table

## Decisions Made

- Image URLs from the bundler are skipped in the content phone-shape walk (see key-decisions); alt text and authored strings stay in scope.
- Spectrum has one width (32 px source, no upscaling), so imagetools emits an AVIF source and uses WebP as the img fallback; unit test expects 3 AVIF and 2 WebP sources accordingly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] tsc -b could not resolve as=picture imports from the test project**
- **Found during:** Task 1
- **Issue:** tsconfig.test.json includes only tests, so images.ts (pulled in through the content imports) failed TS2307 even though the app project passed.
- **Fix:** Added `src/types` to tsconfig.test.json include.
- **Files modified:** tsconfig.test.json
- **Committed in:** 389d3b2

**2. [Rule 1 - Bug] Content phone-shape test flagged hashed image URLs**
- **Found during:** Task 1
- **Issue:** `tests/unit/content.test.ts` walked logo src/sources strings; imagetools hash and descriptor text matched the phone probe.
- **Fix:** Excluded `.logo.*` and `.photo.*` URL fields from the walk (alt text still checked); dist is covered by check-no-phone.
- **Files modified:** tests/unit/content.test.ts
- **Committed in:** 389d3b2

**3. [Rule 1 - Bug] Existing sections test asserted zero images**
- **Found during:** Task 1
- **Issue:** The 03-10 test expected no img in the whole section; logos now exist by design.
- **Fix:** Updated to assert 3 decorative 20 px logos and the AVIF/WebP source counts.
- **Files modified:** tests/unit/sections.test.tsx
- **Committed in:** 389d3b2

**4. [Rule 2 - Missing] Docs gate table**
- **Fix:** Added the Image check row to docs/architecture.md and updated the verify row count. Committed in 848e203.

**5. [Process] TDD commits combined** - the RED run was confirmed (10 failing) but tests and script were committed together in one commit rather than as separate test and feat commits.

---

**Total deviations:** 4 auto-fixed (2 bug, 1 blocking, 1 missing critical) plus 1 process note
**Impact on plan:** All necessary for a green verify chain; no scope creep.

## Issues Encountered

None. `npm install` printed an fsevents install-script advisory (pre-existing, macOS optional dependency); sharp has no install script.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None.

## Threat Flags

None. T-03-15, T-03-16 and T-03-SC are mitigated as planned: no metadata markers in any shipped image, only the three named files copied, vite-imagetools pinned with `~` and lockfile committed (Research A4, the Linux sharp binary, is confirmed by the first CI run in plan 03-19).

## Next Phase Readiness

- Plan 03-14 can add the About photo under the same gate (import via images.ts; check-images will fail an unimported or metadata-carrying source).
- Backstop for the verifier: desktop and phone screenshots of the Experience list (3 logos + 2 chips) were not captured by this plan.

## Self-Check: PASSED

- Files exist: src/content/images.ts, src/types/imagetools.d.ts, scripts/check-images.mjs, the three PNGs
- Commits 389d3b2 and 848e203 are ancestors of HEAD
- `VITE_BASE=/aa-phan-portfolio-v2/ npm run verify` exits 0 (check-images: OK); content.spec.ts 12 passed; full Playwright 97 passed

---
*Phase: 03-content-complete-site*
*Completed: 2026-10-27*
