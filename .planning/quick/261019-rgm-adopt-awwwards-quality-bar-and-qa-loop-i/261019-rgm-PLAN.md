---
phase: quick-261019-rgm
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/phases/03-content-complete-site/03-CONTEXT.md
  - .planning/phases/03-content-complete-site/03-VALIDATION.md
autonomous: true
requirements: [QUICK-261019-rgm]

estimate:
  tokens: 30000
  raw_tokens: 30000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "A downstream agent reading 03-CONTEXT.md finds six new decisions D-23 to D-28 after D-22, each a single-line bullet ending in a Reversibility note, and D-01 to D-22 are byte-for-byte unchanged"
    - "The canonical refs name quality-bar.md, layout.md, typography.md, art-direction.md, motion.md and quality.md as required reading for /gsd-ui-phase 3 (UI-SPEC) and /gsd-plan-phase 3, with patterns.md marked Phase 4, and state that GSAP, the skill's Lenis setup and references/engine.md are not adopted"
    - "D-24 makes the awwwards QA loop Phase 3 acceptance: production build, shoot.mjs + audit.mjs (desktop, throttled phone, reduced motion), zero audit FAILs, mobile LCP under 2.5 s, CLS under 0.05, no colour-only hover on primary targets, every focus stop visible, zero serious/critical axe violations, a fresh evidence-only critic scoring every area 8 or above, fix list feeding /gsd-plan-phase 3 --gaps"
    - "The four owner-decided conflicts with the awwwards defaults are recorded (single page + dialog, no loader, idle motion in the Phase 4 night groove, Lenis deferred to its existing Phase 4 scope) and the Deferred Ideas list agrees with them"
    - "03-VALIDATION.md carries the QA-loop rows: an automated audit row, a shoot.mjs row with summary.json thresholds, manual rows for the screenshot read-through and the critic, and the Wave 0 prerequisites (.shots/ ignore, axe-core)"
  artifacts:
    - path: ".planning/phases/03-content-complete-site/03-CONTEXT.md"
      provides: "D-23 to D-28, quality-bar canonical refs, amendment note, reconciled Deferred Ideas"
      contains: "D-28"
    - path: ".planning/phases/03-content-complete-site/03-VALIDATION.md"
      provides: "QA-loop verification rows and Wave 0 prerequisites"
      contains: "audit.mjs"
  key_links:
    - from: ".planning/phases/03-content-complete-site/03-CONTEXT.md (D-24)"
      to: ".planning/phases/03-content-complete-site/03-VALIDATION.md (D-24 rows)"
      via: "requirement column keyed D-24"
      pattern: "D-24"
    - from: ".planning/phases/03-content-complete-site/03-CONTEXT.md canonical_refs"
      to: "~/.claude/skills/awwwards/references/quality-bar.md"
      via: "required-reading entry consumed by /gsd-ui-phase 3 and /gsd-plan-phase 3"
      pattern: "quality-bar.md"
---

<objective>
Amend the Phase 3 context so Phase 3 is planned, built and accepted against the awwwards quality bar, without changing the stack. Add decisions D-23 (adopt the quality bar as required reading, translated onto Vite + React + motion + react-spring), D-24 (the awwwards QA loop is Phase 3 acceptance), and D-25 to D-28 (owner-decided conflicts with the awwwards defaults), each with a Reversibility note. Reconcile the Deferred Ideas list and add the QA-loop rows to 03-VALIDATION.md.

Purpose: the owner approved this in conversation. Downstream `/gsd-ui-phase 3` and `/gsd-plan-phase 3` read 03-CONTEXT.md as locked input, so the bar, the acceptance loop and the declined defaults must be written there, with numbering continuing after the highest existing decision (D-22).
Output: amended `.planning/phases/03-content-complete-site/03-CONTEXT.md` and `.planning/phases/03-content-complete-site/03-VALIDATION.md`. Doc-only: no source, config, dependency, ROADMAP, REQUIREMENTS or DESIGN.md change.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/phases/03-content-complete-site/03-CONTEXT.md
@.planning/phases/03-content-complete-site/03-VALIDATION.md
@DESIGN.md

Outside the repo (read in prose, do not copy into the repo): `~/.claude/skills/awwwards/SKILL.md` sections "Stack" and "Phase 4: QA loop (minimum two full passes)", and `~/.claude/skills/awwwards/references/quality-bar.md` section "Critic brief (for a fresh subagent on every QA pass)".

## Planning-time facts (verified 2026-10-19; use them, do not re-research)

- 03-CONTEXT.md decisions run D-01 to D-22. Every decision is ONE line: `- **D-NN:** text`. Decisions with a Reversibility note end with ` — **Reversibility:** <rating> — <rationale>` (see D-02, D-10). Subsections in `<decisions>`: Art direction, Section layouts, Content, Navigation, Carried forward (D-21, D-22), then Claude's Discretion.
- Base commit for diff checks: `43952f4` (HEAD when this plan was written).
- Vite `base` defaults to `/` when `VITE_BASE` is unset (`vite.config.ts`); CI and deploy set `VITE_BASE=/aa-phan-portfolio-v2/`. The skill's `serve.mjs dist --port 4400` serves at the root and answers unknown paths with `dist/404.html` and HTTP 404, so the QA build must use base `/`.
- `audit.mjs <url | build-dir>` serves a build dir internally and exits 1 on any FAIL. FAIL-level checks: missing `lang`, `<title>`, meta description, viewport meta, not exactly one `<h1>`, no `<main>`, img without alt, nameless link or button, clickable div, placeholder text, duplicated heading text, internal link HTTP error, a missing URL not returning 404, a declared `og:image` that does not load. Robots, sitemap, em dashes and thin content are WARN only. So "zero FAILs" does not collide with the Phase 6 OG/launch-asset deferrals.
- `shoot.mjs <url> --crawl --nav` writes `.shots/<page>/` and `.shots/summary.json`. Per-page summary keys: `errors`, `overflow`, `smallTargets`, `hiddenTextReduced`, `movingReduced`, `heroSettledMs`, `mobileLcpMs`, `mobileCls`, `desktopFps`, `mobileFps`, `axeSerious` (counts serious + critical), `axeViolations`, `skipLinkFirst`, `noVisibleFocus`, `invisibleFocus`, `noHoverChange`, `colorOnly`, `idleMotion`. Mobile frames run on a throttled mid-range phone (4x CPU, slow 4G); reduced-motion frames use `reducedMotion: 'reduce'`. Throttling is on unless `--no-throttle`.
- axe-core is NOT in package.json. `shoot.mjs` loads it from the project, else fetches `axe-core@4` unpinned from jsDelivr, else skips the a11y pass (`axeSerious` null). A skipped pass must not count as zero violations.
- Critic areas (quality-bar.md): Design, Usability, Creativity, Content, plus the six developer areas Semantics/SEO, Animations/Transitions, Accessibility, WPO, Responsive Design, Markup/Meta-data. The brief forbids giving the critic DESIGN.md, code, the concept card, earlier scores or notes on intent; a new critic runs on every pass.
- Lenis is already scoped to Phase 4: MOT-05 in REQUIREMENTS.md, IX-16 in 01-MOTION-SPEC.md, ROADMAP Phase 4 criterion 5 (desktop wheel only, touch native, off under reduced motion). Do not edit those files.
- Anti-goals: 01-DESIGN-BRIEF.md "A preloader or intro animation that blocks content."; DESIGN.md line 7 (no loader, no WebGL, no custom cursor, no scroll-jacking; the method's GSAP engine not adopted). DESIGN.md §5 Motion language: idle state is night only (33⅓ rpm groove on the toggle thumb), "Day is still on purpose", recorded as the written still-page decision.
- ADR-0006 (`docs/adr/0006-project-overlay-dialog-accessibility.md`) governs the project dialog (D-08).
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Tracer, wire D-23 and D-24 end to end (decisions, required reading, validation rows)</name>
  <files>.planning/phases/03-content-complete-site/03-CONTEXT.md, .planning/phases/03-content-complete-site/03-VALIDATION.md</files>
  <action>
One path through both documents: the quality-bar decision and the QA-loop acceptance decision, their required-reading entries, and their validation rows.

A. In 03-CONTEXT.md `<decisions>`, insert a new subsection heading `### Quality bar and QA loop (awwwards skill, adopted 2026-10-19)` after the "Carried forward" bullets (after D-22) and before `### Claude's Discretion`. Do not edit, reorder or reword D-01 to D-22.

B. Add D-23 as one bullet line (per the owner's item 1). It must say: adopt the awwwards skill as the Phase 3 quality bar, translated onto the existing stack (Vite, React, TypeScript, Tailwind v4, motion, react-spring; D-22 unchanged); required reading is `~/.claude/skills/awwwards/references/` `quality-bar.md`, `layout.md`, `typography.md`, `art-direction.md`, `motion.md` and `quality.md`, with `patterns.md` as Phase 4 reading (crate physics, sticky stage, static fallbacks); the skill's own stack is not adopted (no GSAP, not the skill's Lenis setup, and `references/engine.md` is not used); recipes in the references are translated into motion, react-spring or CSS under the ownership matrix and the anim barrel boundary; DESIGN.md already applied the method once, and where a reference conflicts with D-01 to D-22 or D-25 to D-28, the decisions win. End with ` — **Reversibility:** reversible — ` plus a rationale stating it is a reading list and quality standard with no code, dependency or stack change.

C. Add D-24 as one bullet line (per the owner's item 2). Required content, in this order:
  1. The awwwards QA loop is part of Phase 3 acceptance.
  2. It runs against a production build, never the dev server: `npm run build` with `VITE_BASE` unset (base `/`), `dist/` served by `~/.claude/skills/awwwards/scripts/serve.mjs dist --port 4400`, then `shoot.mjs http://127.0.0.1:4400/ --crawl --nav` (desktop, throttled mid-range phone, reduced motion, keyboard focus and hover pairs; the home page and the 404) and `audit.mjs` written to `.shots/audit.txt`.
  3. Gating thresholds, worded so these phrases appear: "zero audit FAILs"; "mobile LCP under 2.5 s" and "CLS under 0.05" (the throttled-phone `mobileLcpMs`/`mobileCls`); "no colour-only hover on primary targets" (`colorOnly` primary pairs read by eye, `noHoverChange` empty; D-05 supplies the treatments); "every focus stop visible" (`noVisibleFocus` and `invisibleFocus` zero); "zero serious or critical axe violations" (a skipped axe pass does not count).
  4. The critic: a fresh subagent on every pass, given only the critic brief in `quality-bar.md`, the `.shots/` screenshots and the audit output, never `DESIGN.md`, the code, the plans, the concept card, earlier scores or notes on intent; it scores every area (Design, Usability, Creativity, Content and the six developer areas) at "8 or above" with concrete screenshot evidence; its fix list feeds `/gsd-plan-phase 3 --gaps`; passes repeat until every threshold and score holds.
  5. Other report findings (console errors, overflow, text hidden under reduced motion, FPS, the `quality.md` failure checklist) are fixed in the same gap pass.
  6. Notes: this folds in the earlier deferred `/jury` score of the Phase 3 build; Phase 6 still owns the CI-enforced Lighthouse/axe/VoiceOver gates; `.shots/` is local output and is never committed (the Phase 3 plans add it to `.gitignore`); the a11y pass needs `axe-core` resolvable from the project, which the Phase 3 plans supply as a pinned devDependency through the package-legitimacy gate rather than the script's unpinned CDN fallback; audit WARNs are triaged, and WARNs for items deferred to Phase 6 (OG image, launch assets) are not Phase 3 gaps; critic fix items that would reverse D-25 to D-28 are logged as owner-declined and not planned, and a score under 8 that rests only on such an item goes to the owner.
  End with ` — **Reversibility:** reversible — ` plus a rationale: acceptance criteria in planning docs; it adds gap-closure passes but no code or dependency of its own.

D. In 03-CONTEXT.md `<canonical_refs>`, add a subsection `### Quality bar (awwwards skill, D-23, D-24)` directly after the "Art direction (adopted this phase)" subsection. First line states these are required reading for `/gsd-ui-phase 3` (UI-SPEC) and `/gsd-plan-phase 3` (planner and checker) and for executors building sections, translated onto the existing stack. Then one bullet per file under `~/.claude/skills/awwwards/`: `references/quality-bar.md` (rubric, scoring areas, critic brief; D-24), `references/layout.md`, `references/typography.md`, `references/art-direction.md`, `references/motion.md` (translate recipes onto motion, react-spring or CSS), `references/quality.md` (accessibility, performance budgets, failure checklist; D-24), `references/patterns.md` (Phase 4 reading only), `scripts/serve.mjs`, `scripts/shoot.mjs`, `scripts/audit.mjs` (QA loop tools; D-24). Close with a "Not adopted" bullet: GSAP, the skill's Lenis setup, `references/engine.md`, the framework adapters `references/nextjs.md` and `references/astro.md`, and `references/webgl.md` (no WebGL, brief anti-goal).

E. In 03-VALIDATION.md "Per-Task Verification Map", append two rows before the status legend line, Task ID/Plan/Wave `TBD`, Requirement `D-24`, Threat Ref `—`, Secure Behavior `N/A`, Status `⬜ pending`. Row 1, Test Type `script (audit)`, Automated Command `env -u VITE_BASE npm run build && mkdir -p .shots && node ~/.claude/skills/awwwards/scripts/audit.mjs dist > .shots/audit.txt` (exits 1 on any FAIL), File Exists `✅ skill script`. Row 2, Test Type `script (visual QA)`, Automated Command: serve with `node ~/.claude/skills/awwwards/scripts/serve.mjs dist --port 4400` in the background, then `node ~/.claude/skills/awwwards/scripts/shoot.mjs http://127.0.0.1:4400/ --crawl --nav`; pass when every page in `.shots/summary.json` has `mobileLcpMs` under 2500, `mobileCls` under 0.05, `axeSerious` 0 (null means axe was skipped and fails), `noVisibleFocus` 0, `invisibleFocus` 0, `noHoverChange` 0. File Exists `⚠ needs axe-core (W0)`. Table cells must not contain a bare pipe character.
  </action>
  <verify>
    <automated>F=.planning/phases/03-content-complete-site/03-CONTEXT.md; V=.planning/phases/03-content-complete-site/03-VALIDATION.md; D=$(git diff 43952f4 -- $F) && ! printf '%s\n' "$D" | grep -q -E '^-- \*\*D-(0[1-9]|1[0-9]|2[0-2]):' && test "$(grep -E '^- \*\*D-2[34]:\*\*' $F | sed -E 's/^- \*\*D-(2[34]):.*/\1/' | tr -d '\n')" = 2324 && grep -E '^- \*\*D-23:\*\*' $F | grep -q 'Reversibility' && grep -E '^- \*\*D-23:\*\*' $F | grep -q 'engine.md' && grep -E '^- \*\*D-24:\*\*' $F | grep -q 'Reversibility' && grep -E '^- \*\*D-24:\*\*' $F | grep -q '2.5 s' && grep -E '^- \*\*D-24:\*\*' $F | grep -q '0.05' && grep -E '^- \*\*D-24:\*\*' $F | grep -q '8 or above' && grep -E '^- \*\*D-24:\*\*' $F | grep -q 'axe-core' && grep -E '^- \*\*D-24:\*\*' $F | grep -q -- '--gaps' && grep -E '^- \*\*D-24:\*\*' $F | grep -q 'colour-only hover' && sed -n '/<canonical_refs>/,/<\/canonical_refs>/p' $F | grep -q 'gsd-ui-phase 3' && sed -n '/<canonical_refs>/,/<\/canonical_refs>/p' $F | grep -q 'patterns.md' && grep -E '^\| .*D-24' $V | grep -q 'audit.mjs' && grep -E '^\| .*D-24' $V | grep -q 'shoot.mjs' && echo OK</automated>
  </verify>
  <done>03-CONTEXT.md has the new subsection with D-23 and D-24 (single-line bullets, Reversibility notes, all required phrases), a quality-bar canonical-refs subsection naming the six references, patterns.md for Phase 4, the QA scripts and the not-adopted list; 03-VALIDATION.md has two D-24 rows; D-01 to D-22 show no removed lines against 43952f4. Committed.</done>
</task>

<task type="auto">
  <name>Task 2: Record the owner-decided conflicts (D-25 to D-28), reconcile Deferred Ideas, finish the validation contract</name>
  <files>.planning/phases/03-content-complete-site/03-CONTEXT.md, .planning/phases/03-content-complete-site/03-VALIDATION.md</files>
  <action>
Expand from the tracer: the four declined awwwards defaults (owner's item 3), the consistency edits they require, and the remaining validation rows.

A. In the new 03-CONTEXT.md subsection, after D-24, add four single-line bullets, each ending ` — **Reversibility:** reversible — <rationale>`:
  - D-25: single page plus the project dialog stay (D-08, ADR-0006); no per-project case-study routes, overriding the skill's list-into-case-study default; the QA crawl therefore covers the home page and the 404, and each pass also captures one open project dialog on desktop and on the phone into `.shots/` so the critic sees project detail. Rationale: routes can be added later additively (GitHub Pages would need hash routing or a 404.html copy, per the stack research).
  - D-26: no loader, per the design-brief anti-goal (no preloader or intro that blocks content) and DESIGN.md; the hero name, role and CTAs are static HTML on first paint (D-04, NAV-01); the skill's loader-into-hero continuity is not adopted, and continuity comes from the theme flip and the Phase 4 sleeve morph. Rationale: matches an existing anti-goal; nothing is built to remove.
  - D-27: idle motion is deferred to the Phase 4 night groove (DESIGN.md §5 idle state, 33⅓ rpm groove on the toggle thumb); the Phase 3 build is still at rest on purpose in both themes, which is the written still-page decision the skill accepts, so `idleMotion` false in the Phase 3 QA loop is expected and is not a gap. Rationale: Phase 4 already owns the groove.
  - D-28: Lenis smooth scroll is deferred; Phase 3 ships native scroll and is judged on it; Lenis arrives only as already scoped for Phase 4 (MOT-05, IX-16: desktop wheel only, touch native, off under reduced motion), not as the skill's always-on default; MOT-05, IX-16 and the ROADMAP stay unchanged. Rationale: the Phase 4 scope is untouched.

B. Reconcile `<deferred>` in 03-CONTEXT.md: delete the bullet that schedules a `/jury` score of the Phase 3 build (D-24 folds it into Phase 3 acceptance). Reword the Phase 6 bullet so it reads as the OG image with the split wordmark, favicon refresh, and the CI-enforced Lighthouse/axe/VoiceOver gates in Phase 6, noting that D-24 runs the QA loop by hand as Phase 3 acceptance. Add a bullet: Lenis desktop wheel smoothing (MOT-05, IX-16) in Phase 4, as already scoped (D-28). Leave the other deferred bullets as they are.

C. Header and boundary in 03-CONTEXT.md: under `**Status:** Ready for planning`, add a line starting `**Amended:** 2026-10-19` that names the awwwards quality bar and QA loop (D-23 to D-28), says `03-RESEARCH.md` predates the amendment so a context drift check may flag it and that this is expected, and says `03-VALIDATION.md` carries the QA-loop rows. At the end of the second `<domain>` paragraph, add one sentence that Phase 3 is accepted against the awwwards quality bar through the QA loop (D-23, D-24).

D. 03-VALIDATION.md:
  - Sampling Rate, the "Before `/gsd-verify-work`" bullet: append that the D-24 QA loop on the production build also passes before verification.
  - Wave 0 Requirements: add two checkboxes: `.shots/` added to `.gitignore` (D-24); `axe-core` resolvable from the project as a pinned devDependency approved through the package-legitimacy gate, so the shoot.mjs a11y pass is not skipped (D-24).
  - Manual-Only Verifications: add three rows, Requirement `D-24`: (1) screenshot read-through, every desktop, mobile, reduced-motion, `k-*` focus and `h-*` hover frame plus the open-dialog frames (D-25), because the report flags cases but a human or agent must read the frames; (2) hover pairs on primary targets read by eye (`colorOnly`, `pixels`, `masked`), pass when no primary target only changes text colour; (3) fresh critic score, a new subagent per pass with the `quality-bar.md` critic brief and only `.shots/` plus `.shots/audit.txt`, pass when every area scores 8 or above with screenshot evidence, the fix list feeds `/gsd-plan-phase 3 --gaps`, and items reversing D-25 to D-28 go to the owner.
  - Validation Sign-Off: add a checkbox that the D-24 QA loop thresholds and critic scores hold on the final pass.
  - Do not change the frontmatter (status stays draft, nyquist flags unchanged).

Do not edit ROADMAP.md, REQUIREMENTS.md, DESIGN.md, 03-RESEARCH.md or any source file.
  </action>
  <verify>
    <automated>F=.planning/phases/03-content-complete-site/03-CONTEXT.md; V=.planning/phases/03-content-complete-site/03-VALIDATION.md; D=$(git diff 43952f4 -- $F $V) && N=$(git diff --name-only 43952f4 -- .planning/ROADMAP.md .planning/REQUIREMENTS.md DESIGN.md .planning/phases/03-content-complete-site/03-RESEARCH.md src) && test -z "$N" && ! printf '%s\n' "$D" | grep -q -E '^-- \*\*D-(0[1-9]|1[0-9]|2[0-2]):' && ! printf '%s\n' "$D" | grep '^+' | grep -q '/Users/' && test "$(grep -E '^- \*\*D-2[3-8]:\*\*' $F | sed -E 's/^- \*\*D-(2[3-8]):.*/\1/' | tr -d '\n')" = 232425262728 && grep -E '^- \*\*D-25:\*\*' $F | grep -q 'ADR-0006' && grep -E '^- \*\*D-25:\*\*' $F | grep -q 'Reversibility' && grep -E '^- \*\*D-26:\*\*' $F | grep -q 'Reversibility' && grep -E '^- \*\*D-27:\*\*' $F | grep -q 'idleMotion' && grep -E '^- \*\*D-27:\*\*' $F | grep -q 'Reversibility' && grep -E '^- \*\*D-28:\*\*' $F | grep -q 'MOT-05' && grep -E '^- \*\*D-28:\*\*' $F | grep -q 'Reversibility' && grep -q '^\*\*Amended:\*\* 2026-10-19' $F && ! grep -q 'first build worth scoring' $F && sed -n '/<deferred>/,/<\/deferred>/p' $F | grep -q 'MOT-05' && sed -n '/## Wave 0 Requirements/,/## Manual-Only/p' $V | grep -q 'axe-core' && sed -n '/## Wave 0 Requirements/,/## Manual-Only/p' $V | grep -q '.shots/' && sed -n '/## Manual-Only Verifications/,/## Validation Sign-Off/p' $V | grep -q 'critic' && grep -q '^status: draft' $V && echo OK</automated>
  </verify>
  <done>D-23 to D-28 present in order with Reversibility notes; the Deferred list no longer schedules the /jury run, the Phase 6 bullet names the CI-enforced gates, Lenis is listed under Phase 4; the Amended line and domain sentence exist; 03-VALIDATION.md has the sampling note, two Wave 0 items, three manual rows and a sign-off item with frontmatter unchanged; no out-of-scope file changed; no username-bearing absolute path added. Committed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| planning docs to public repo | `.planning/` is tracked and public (ADR-0008); anything written here is published |
| planning docs to downstream agents | 03-CONTEXT.md is locked input for /gsd-ui-phase 3, /gsd-plan-phase 3 and executors |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-rgm-01 | Information disclosure | 03-CONTEXT.md, 03-VALIDATION.md amendments | low | mitigate | Text adds no phone number, resume data or secrets; skill paths are written as `~/.claude/...`; Task 2 verify fails if any added line contains `/Users/` |
| T-rgm-02 | Tampering | D-24 axe-core sourcing (downstream supply chain) | medium | mitigate | D-24 and the Wave 0 item direct the Phase 3 plans to supply axe-core as a pinned devDependency through the package-legitimacy gate, not the unpinned jsDelivr fallback; this plan installs nothing |
| T-rgm-03 | Information disclosure | `.shots/` QA output | low | mitigate | D-24 records `.shots/` as never committed and Wave 0 adds the `.gitignore` entry in Phase 3 |
| T-rgm-04 | Tampering | locked decisions D-01 to D-22 | medium | mitigate | Both verify commands fail if any D-01 to D-22 line is removed or changed against base commit 43952f4 |
| T-rgm-SC | Tampering | npm/pip/cargo installs | high | accept | No package installs in this plan; the axe-core install belongs to Phase 3 and goes through the package-legitimacy gate there (T-rgm-02) |
</threat_model>

<verification>
- Both task `<automated>` commands print OK from the repo root.
- `grep -n -E '^- \*\*D-2[3-8]:\*\*' .planning/phases/03-content-complete-site/03-CONTEXT.md` lists D-23 to D-28 in ascending line order.
- `git diff --stat 43952f4 -- .planning/phases/03-content-complete-site/` shows only 03-CONTEXT.md and 03-VALIDATION.md.
</verification>

<success_criteria>
- Owner item 1: the six references (plus patterns.md for Phase 4) are canonical required reading for the UI-SPEC and the planner, with the stack translation and the not-adopted list (D-23).
- Owner item 2: the QA loop with every listed threshold and the evidence-only critic is Phase 3 acceptance, its fix list routed to `/gsd-plan-phase 3 --gaps` (D-24), mirrored in 03-VALIDATION.md.
- Owner item 3: single page + dialog, no loader, idle motion in the Phase 4 night groove, Lenis deferred are recorded as owner-decided (D-25 to D-28), and the Deferred list agrees.
- Every new decision carries a Reversibility note; D-01 to D-22 unchanged; doc-only.
</success_criteria>

<output>
Create `.planning/quick/261019-rgm-adopt-awwwards-quality-bar-and-qa-loop-i/261019-rgm-SUMMARY.md` when done
</output>
