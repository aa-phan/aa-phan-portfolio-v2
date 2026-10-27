---
phase: 03-content-complete-site
plan: "04"
subsystem: content
tags: [content-model, typed-modules, vitest, inventory-parity, nfc, hero]

requires:
  - phase: 03-content-complete-site
    provides: poster ladder on the hero (03-03) and the final inventory with owner answers (03-02)
provides:
  - src/content/schema.ts with every content type (no phone field anywhere in the model)
  - Typed profile and contacts modules (as const satisfies) and siteContent in src/content/index.ts
  - Page.tsx as the only importer of @/content, passing profile and email into Hero
  - Inventory parser plus parity tests (NFC-exact) and generic content rules over siteContent
affects: [03-05 copy handler and toast, 03-06 hero restyle, every later content plan (experience, projects, skills, education extend siteContent and these two test files)]

status: complete
commits: 2
plan_head_before: 8b190dca4ec2821351d0b7ea4cc017ecf96247b4
plan_head_after: 5141c5ea150b9741bdce6de2063f7fcfdfc2cfb7

actuals:
  tokens: 11000
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Content modules are `as const satisfies <Type>` so a missing field fails typecheck while literals stay narrow"
    - "Sections receive content as props from Page.tsx; Hero declares a structural props type because lint forbids importing @/content outside Page.tsx"
    - "Inventory parity: parse 01-CONTENT-INVENTORY.md at test time, compare exact after NFC only, with a comparator self-check for U+2013 and U+2019 swaps"
    - "Phone probe regex is built from digit-group quantifiers inside the test so no phone-shaped literal is committed"

key-files:
  created:
    - src/content/schema.ts
    - src/content/profile.ts
    - src/content/contacts.ts
    - src/content/index.ts
    - tests/unit/content.test.ts
    - tests/unit/content-inventory.test.ts
  modified:
    - src/app/Page.tsx
    - src/sections/Hero/Hero.tsx
    - .planning/phases/01-decisions-and-documentation/01-CONTENT-INVENTORY.md

key-decisions:
  - "Hero takes `{ profile: { name, tagline }, email }` with a local structural type, because the lint rule limits @/content (including type imports) to Page.tsx"
  - "Profile omits the quote field: the inventory records ABT-03 as none (owner line pending), and the parity test asserts quote is undefined while the inventory says none"
  - "ABT-01 uses U+2019 in I'm; the edit is recorded in the inventory with before and after (rule 3)"

patterns-established:
  - "Later content plans add arrays to siteContent and extend the same two test files; the content rules walk the tree generically (phone shape, tel scheme, unique ids, image alt)"

requirements-completed: []
requirements-partial: [CNT-01]

duration: ~7 min
completed: 2026-10-27
---

# Phase 3 Plan 04: Typed content slice and inventory parity Summary

**Typed profile and contact modules feed the hero's name, tagline and Copy email href through Page.tsx (the only content importer), with an NFC-exact inventory parity test and generic content rules that fail on phone shapes, tel links, non-https external links, duplicate ids and missing alt text.**

## Performance

- **Duration:** ~7 min
- **Completed:** 2026-10-27
- **Tasks:** 2 (1 tracer, 1 auto/tdd)
- **Files:** 6 created, 3 modified

## Accomplishments

- Tracer: schema, profile, contacts and `siteContent` exist; Hero renders from them and the static shell still matches (hero-parity, boundaries, smoke e2e all pass). Tracer verified end-to-end, then expanded.
- Parity tests: HERO-01, HERO-02, ABT-01, ABT-02, ABT-03 (none) and CON-01 to CON-04 equal the module values exactly; the write-up figure rule from 03-02 is permanent for PRJ-01 to PRJ-03; the comparator self-check proves a hyphen for U+2013 or an ASCII apostrophe for U+2019 is detected.
- Content rules walk `siteContent` generically so experience, projects, skills and education are covered as later plans add them.
- Full `VITE_BASE=/aa-phan-portfolio-v2/ npm run verify` exits 0 (JS budget 96.5 kB of 150 kB, no-phone OK).

## Task Commits

1. **Task 1 (tracer): typed profile and contact modules feed the hero through Page** - `3f33763` (feat)
2. **Task 2: content rules and inventory parity tests** - `5141c5e` (test)

## Deviations from Plan

None - plan executed exactly as written. (Hero's props type is local rather than imported from the schema; this follows the lint boundary the plan itself cites, and the Page-to-Hero contract is unchanged.)

## Requirements

CNT-01 is declared by this plan but only the hero slice (profile and contacts) is delivered; the experience, projects, skills and education sections still render from stubs. It is left unmarked for the later content plans and phase-level acceptance. NAV-04 and CNT-04 untouched, as instructed.

## Known Stubs

None introduced. `SectionStubs` (pre-existing) still renders the non-hero sections and is replaced by later plans.

## Threat Flags

None. T-03-08 mitigated: no phone field in the schema, content.test.ts scans every string, and `check:no-phone` passes on dist.

## Self-Check: PASSED

- Files exist: schema.ts, profile.ts, contacts.ts, index.ts, content.test.ts, content-inventory.test.ts.
- Commits 3f33763 and 5141c5e are ancestors of HEAD.
- Acceptance criteria: only Page.tsx imports `@/content` in src; `satisfies Profile` and `satisfies readonly ContactLink` present; shell mailto link present; test greps for `01-CONTENT-INVENTORY.md` and `normalize('NFC')` pass; ABT-01 records the apostrophe edit.
- Plan verification: unit tests (21 new passing), smoke e2e 6/6, `npm run verify` exit 0.
