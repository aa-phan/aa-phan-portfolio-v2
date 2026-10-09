# Phase 2: Deployed Themed Skeleton - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning

<domain>
## Phase Boundary

A Vite + React + TypeScript + Tailwind v4 app live on the staging project URL (https://aa-phan.github.io/aa-phan-portfolio-v2/) with CI, a 150 kB gzipped JS budget, light/dark tokens from the chosen Phase 1 palette, and one motion-preference source. The visible product is a themed hero with bare anchored section stubs. Navigation, real section content, resume and copy-email behavior belong to Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Repo and first deploy
- **D-01:** Phase 2 includes creating the GitHub repo `aa-phan-portfolio-v2`, pushing `main`, setting Pages source to GitHub Actions and deploying staging. Follow `docs/deploy-runbook.md` "First staging deploy". Repo creation and the Pages setting are user-run checkpoint steps. Run the OD-01 phone-number history guard search before any push and stop if it prints anything.
- **D-02:** Repo visibility is public.
- **D-03:** Workflows follow the runbook: ci.yml on push/PR, deploy.yml on push to `main` plus `workflow_dispatch`, actions pinned by commit SHA with the version in a comment. `VITE_BASE` is env-driven (`/aa-phan-portfolio-v2/` for staging).

### Skeleton hero
- **D-04:** Ship the real hero (name as h1, role line "Software engineer building cloud-native backends in Go.", three CTAs in the HERO-03 order from the content inventory) plus empty, labelled, anchored section stubs for the seven registry anchors so CTAs have targets. No nav in this phase.
- **D-05:** CTAs are real links: Resume links to the PDF (placeholder file if the real one is not yet copied in; never a file containing the phone number), Copy email is a `mailto:` link for now, Contact jumps to `#contact`. Phase 3 upgrades copy-email and adds the toast. CTA tap targets at least 44 px.
- **D-06:** Hero name, role and CTAs are in the static HTML and visible with JavaScript disabled (NAV-01).

### Theme toggle
- **D-07:** Two-state light/dark toggle. First visit follows `prefers-color-scheme`; once the user toggles, the choice is stored in localStorage and wins. Inline head script sets `data-theme` before first paint (no flash). All storage access wrapped in try/catch.
- **D-08:** The toggle sits fixed in the top-right corner in Phase 2; Phase 3 moves it into the sticky nav and pill menu. Thumb animation is react-spring (IX-10) and snaps with reduced motion.

### Reduced-motion proof
- **D-09:** Vendor motion-primitives `TextEffect` (into `src/components/motion-primitives/`) and render it on the hero role line (IX-01). It must never delay name, role or CTAs. With reduce-motion the role line is static text. The theme toggle thumb (react-spring) also reads the same preference source, so both libraries are proven to honor `useMotionPreference`.

### CI gates and tests
- **D-10:** Required CI steps: typecheck, lint (with import-boundary rules for FND-04), build, path-case check, 150 kB gz JS budget.
- **D-11:** Additional CI gates chosen: contrast check run against the real token files (DSN-02), Prettier check with `prettier-plugin-tailwindcss`, and tests.
- **D-12:** Tests are Vitest unit tests (motion preference hook, theme logic) plus a small Playwright smoke run against the built output: hero present with JS disabled, no theme flash, reduced-motion shows all content. Full Playwright/axe suites are Phase 6. Lighthouse CI is not added in Phase 2.

### Locked by Phase 1 (carry forward, do not re-decide)
- **D-13:** Palette A (tuned seed indigo), Inter variable only via `@fontsource-variable/inter` (`wght.css`), one font family. Tokens per `01-DESIGN-TOKENS.md` "Chosen system" (5 role tokens plus derived tokens, `@theme inline` mapping, no `dark:` variants in components).
- **D-14:** Folder structure, layering and import rules per `docs/architecture.md`; TypeScript 6.0.x (ADR-0004); stack versions per `.claude/CLAUDE.md`.

### Claude's Discretion
- Scaffold details (create-vite template adjustments), exact lint tool config for the boundary rules, JS budget script implementation, path-case check implementation, placeholder resume handling, stub section markup, Vitest/Playwright config.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project planning
- `.planning/PROJECT.md` — Constraints, key decisions, out of scope
- `.planning/REQUIREMENTS.md` — FND-01..04, DSN-01..04, MOT-01, NAV-01
- `.planning/ROADMAP.md` §Phase 2 — Goal and five success criteria
- `.planning/STATE.md` — Current position and concerns
- `.claude/CLAUDE.md` — Stack versions, what-not-to-use list, Tailwind v4 and font notes

### Phase 1 outputs
- `docs/architecture.md` — Layers, import rules, folder structure, theme/motion design
- `docs/deploy-runbook.md` — Workflows, staging deploy steps, OD-01 guard, known risks
- `docs/adr/README.md` — ADR log and open decisions (OD-07..OD-09 relevant)
- `docs/adr/0003-github-pages-source-and-cutover.md` — Pages source and staging
- `docs/adr/0004-typescript-6.md` — TS 6.0.x
- `docs/adr/0005-inline-svg-brand-icons.md` — Inline SVG icons
- `.planning/phases/01-decisions-and-documentation/01-DESIGN-TOKENS.md` — Chosen palette, token tables, contrast matrix
- `.planning/phases/01-decisions-and-documentation/contrast-check.mjs` — Contrast checker
- `.planning/phases/01-decisions-and-documentation/01-MOTION-SPEC.md` — Motion preference source, ownership matrix, IX-01, IX-02, IX-10
- `.planning/phases/01-decisions-and-documentation/01-IA-WIREFRAMES.md` — Hero frames, anchor registry
- `.planning/phases/01-decisions-and-documentation/01-CONTENT-INVENTORY.md` — HERO-01..03, gap G-04
- `.planning/phases/01-decisions-and-documentation/01-DESIGN-BRIEF.md` — 10-second test

### Research
- `.planning/research/STACK.md`, `ARCHITECTURE.md`, `PITFALLS.md` — Versions, bundle costs, risks

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `contrast-check.mjs`: reuse in CI against the real token files.

### Established Patterns
- None in code yet (greenfield). Patterns are defined in `docs/architecture.md`.

### Integration Points
- New app goes at the repo root alongside `docs/` and `.planning/`; `references/` stays untracked/ignored.

</code_context>

<specifics>
## Specific Ideas

- Hero role line: "Software engineer building cloud-native backends in Go." (accepted default G-04).
- Staging URL: https://aa-phan.github.io/aa-phan-portfolio-v2/

</specifics>

<deferred>
## Deferred Ideas

- Lighthouse CI thresholds, full Playwright/axe/VoiceOver suites: Phase 6.
- Three-state system/light/dark toggle, visible reduce-motion toggle (OD-09): later.
- Token showcase page: not now.
- Nav, copy-email toast, real content: Phase 3.

</deferred>

---

*Phase: 2-Deployed Themed Skeleton*
*Context gathered: 2026-10-09*
