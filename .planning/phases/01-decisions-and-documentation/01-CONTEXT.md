# Phase 1: Decisions and Documentation - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Produce the time-boxed documentation set that gates all code: design brief (DOC-01), content inventory (DOC-02), IA and wireframes at 375/768/1280 (DOC-03), design tokens with palette exploration and contrast matrix (DOC-04), motion spec (DOC-05), and architecture doc, ADR log and deploy runbook (DOC-06), plus content reconciliation against the resume (CNT-03). No application code is written in this phase.

</domain>

<decisions>
## Implementation Decisions

### Doc location and format
- **D-01:** Split location. Brief, content inventory, IA/wireframes, tokens and motion spec live in the phase dir `.planning/phases/01-decisions-and-documentation/`. Architecture doc, ADRs and deploy runbook live in a top-level `docs/` folder so they can survive into the public repo as real project docs.
- **D-02:** Wireframes are ASCII/markdown inside the docs at 375, 768 and 1280 px. No HTML sketches and no `/gsd-sketch` in this phase. The rail, overlay and pill nav are shown in ASCII in both a hover (desktop) form and a swipe/tap (touch) form.
- **D-03:** `.planning/` and `references/` stay out of the public site repo (prior decision). Anything in `docs/` that is meant to go public must contain no phone number and no private planning chatter.

### Palette and type exploration
- **D-04:** Claude proposes 3 candidate palettes (one is a tuned version of the seed 050315/fbfbfe/2f27ce/dedcff/433bff), each as light and dark OKLCH token sets with per-role contrast results. The user picks one. Seed indigo fails dark-mode contrast (2.23:1), so per-theme tokens are mandatory.
- **D-05:** Type is explored alongside palette: each candidate carries a type pairing (a display face plus Inter body is allowed), judged together with color. Max 2 self-hosted families (DSN-04).
- **D-06:** Exactly 5 role tokens plus derived tints, so swapping palettes later is a single-block edit. Contrast matrix covers text, UI and focus pairs in both themes, WCAG 2.2 AA.

### Content gaps and reconciliation
- **D-07:** The content inventory marks every gap as supplied, deferred or dropped. Gaps: project links and screenshots, featured projects, hero tagline, UT Austin and OdderTech logos. Claude proposes a default for each, the user rules, and unresolved gaps are explicitly deferred to Phase 3.
- **D-08:** The user supplied an updated `references/Aaron_Phan_Resume.pdf` (modified 2026-10-09 03:07) that removes the Symbotic 76% vs Suspect Genie overlap. The new resume is the source of truth. The earlier metric-conflict resolution is no longer needed, but the inventory must record that it was resolved by the resume revision.
- **D-09:** The new resume adds a Capital One Software Engineer Intern role (Plano TX, June 2026 – August 2026), Spectrum Network Engineer Intern (May 2025 – August 2025) and Symbotic System Engineer Intern (January 2025 – May 2025). With v1's ITS Student Consultant (not on the resume, kept from v1) that is 4+ roles; the inventory must recount against v1 and reconcile the earlier "5 experience entries" claim.
- **D-10:** Date format is normalized to one style across the site. The resume mixes "Aug. 2022" with full month names, so the inventory picks one format (full month names as on the resume body) and applies it everywhere. Resume projects shown: RecipeCart (July 2026), A.T.L.A.S (May 2025 – August 2025), Suspect Genie (January 2025 – May 2025); v1-only projects are kept (MediaDash, Full-Stack Library Simulator, FPGA-Based Stopwatch, Smart Mirror). Resume skills list (Languages, Frameworks, Developer Tools, Libraries) is the source for the Skills section.
- **D-11:** Phone number (redacted, on the resume) must never appear in any doc intended for the public site or in the web resume. Public email, GPA and the DJ Instagram link remain OK. Confirm which email to publish: the resume shows aaron.phan240@gmail.com, v1 may differ.

### Skeleton gate and ADRs
- **D-12:** Skip the Walking Skeleton gate for Phase 1 (docs-only). Phase 2 is the real skeleton. Record the skip as an ADR.
- **D-13:** Settle these as ADRs in Phase 1: (a) current Pages source setting and cutover/rollback plan (check the live setting on aa-phan.github.io), (b) TypeScript 6.0.x, (c) inline SVG brand icons, (d) MorphingDialog accessibility approach. For (d) the ADR records the plan and the native `<dialog>` fallback; the actual focus-trap/Escape/scroll-lock/focus-return spike runs in Phase 2 or 4, not here.

### Claude's Discretion
- Doc internal structure, ADR numbering and template, which contrast tooling is used on paper, and the exact normalized date string.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project planning
- `.planning/PROJECT.md` — Key decisions, constraints, out of scope
- `.planning/REQUIREMENTS.md` — DOC-01..06 and CNT-03 acceptance, phase mapping
- `.planning/ROADMAP.md` §Phase 1 — Goal and five success criteria
- `.planning/STATE.md` — Blockers/concerns for Phase 1 (content gaps, open ADRs)

### Research
- `.planning/research/STACK.md` — Versions, bundle costs, motion vs react-spring ownership, realtimecolors usage
- `.planning/research/ARCHITECTURE.md` — Layering and import rules to document
- `.planning/research/FEATURES.md` — Feature scope and treatments
- `.planning/research/PITFALLS.md` — Risks to carry into docs
- `.planning/research/REFERENCES.md` — Notes on references 355, 445, 539
- `.planning/research/SUMMARY.md` — Research summary

### Source material
- `references/Aaron_Phan_Resume.pdf` — Source of truth for content (updated 2026-10-09; contains phone number that must be stripped)
- `references/539.mp4` — Handled project rail (signature interaction)
- `references/445.mp4` — Morphing pill nav (mobile)
- `references/355.mp4` — Tone reference
- `../aa-phan.github.io/index.html` — v1 content, copy, images (external repo)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None in this repo: no application code yet (greenfield). v1 content and images live in `../aa-phan.github.io`.

### Established Patterns
- None established. Docs-first process; ADRs written as decisions land.

### Integration Points
- Phase 1 outputs feed Phase 2 (tokens, architecture, import-layer rules, deploy runbook) and Phase 3 (content inventory, IA).

</code_context>

<specifics>
## Specific Ideas

- Signature interaction: object you handle, reference 539 (hover/lift, neighbors shift, click opens focused detail); mobile is swipe rail plus tap.
- Mobile nav: morphing pill, reference 445. Tone: reference 355.
- Palette candidates should include a tuned seed indigo for continuity.

</specifics>

<deferred>
## Deferred Ideas

- Running the MorphingDialog a11y code spike: Phase 2/4.
- Unresolved content gaps after the user rules: carried to Phase 3.
- Throwaway HTML sketches of the rail/overlay/nav: not now; revisit if ASCII proves insufficient.

</deferred>

---

*Phase: 1-Decisions and Documentation*
*Context gathered: 2026-10-09*
