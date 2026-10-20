# Phase 3: Content-Complete Site - Context

**Gathered:** 2026-10-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Every section (Hero, Experience, Projects, About Me, Skills, Education, Contact Me) renders real content from typed content modules, with the resume download, copy-email with a toast, the desktop sticky nav with scroll-spy, the mobile morphing pill nav, a skip link, and optimized images, so a recruiter on a phone passes the 10-second test (CNT-01, CNT-02, CNT-04, CNT-05, NAV-02, NAV-03, NAV-04).

This phase also adopts the art direction in `DESIGN.md` (owner decision 2026-10-19): the PHAN/PHVNTM day/night concept in static form, palette D, Archivo, the poster hero and the CSS hover treatments. The crate physics, the record pull, the overlay morph and the animated wordmark flip (IX-18) stay in Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Art direction adopted from DESIGN.md (supersedes Phase 2 D-13)
- **D-01:** Adopt the "day job, night set" concept. Light theme is Aaron Phan by day, dark theme is PHVNTM by night. Phase 3 ships the static forms: the corner wordmark reads PHAN in light and PHVNTM in dark, the footer finale wordmark (fit to width), and a designed 404 page ("Dead air.", the A stuck edge-on). Both themes show identical content in identical order; the night persona never hides or replaces engineering content. The h1 stays "Aaron Phan" in both themes. Wordmark glyphs are `aria-hidden`; the home link is `aria-label="Aaron Phan, home"`; the footer keeps a real text line "Aaron Phan. DJs as PHVNTM." The animated A-to-V flip (new IX-18, motion, rotateX) is Phase 4.
- **D-02:** Switch to palette D (DESIGN.md §5): the ten role lines change (`--text`, `--background`, `--secondary` in both themes; `--primary` and `--accent` unchanged). Add palette D to `01-DESIGN-TOKENS.md` as a candidate, set `Chosen palette: D`, regenerate `docs/contrast-matrix.md`, update `src/styles/tokens.css` and the palette unit test. Verified offline: `RESULT: PASS palettes=4 checks=152`. The CI contrast gate must pass on the shipped file. One scoped inverted band (`.band-invert`, swaps `--text`/`--background`) on Projects only. — **Reversibility:** reversible — a ten-line token edit (D-06 of Phase 1).
- **D-03:** Replace Inter with Archivo Variable (`@fontsource-variable/archivo` 5.3.0, `wdth.css`: weight 100 to 900, width 62% to 125%, latin woff2 about 90 kB). One family; remove `@fontsource-variable/inter`. Type ladder per DESIGN.md §5 (`--t-mega` through `--t-xs`), replacing the 1.2 modular ladder at the top end. Night widens only the wordmarks (`font-stretch` 125%); headings do not change width on toggle. Record the font change and the +42 kB font weight in the tokens doc.
- **D-04:** Poster hero: "Aaron / Phan" at `--t-mega` (wght 800, tracking -0.045em, optical negative indent), role line, Resume and Copy email CTAs, and two corner facts: "Graduating December 2026, UT Austin ECE" and "Last role: Capital One, summer 2026". Amend the HERO block in the content inventory and the hero frames in the IA doc. Name, role and CTAs stay in static HTML, visible with JS off (NAV-01), and are never delayed by IX-01.
- **D-05:** CSS hover treatments ship in Phase 3, one per role (DESIGN.md §5 table): primary CTAs flood with ink from the bottom via `clip-path` with a 2 px label lift; nav labels flip on X (duplicate label `aria-hidden`); experience rows draw their rule to full width and widen the company name (`font-stretch` 100% to 112%); utility links change color and underline only. Hover styles only under `(hover: hover)` per Tailwind v4. Focus-visible gets the equivalent state plus the ring. Springs (press-squish IX-02, lift IX-03) stay in Phase 4.
- **D-06:** Radius rule: things you hold are near-square (4 px: sleeves, dialog panel, photo); things you press are pills (buttons, chips, pill nav, toggle). Replaces the sm/md/lg card radii.

### Section layouts
- **D-07:** Experience is an index list: full-width rows on two hang lines (company col 1, title col 7, dates right-aligned in tabular figures), 20 px logos inline. Bullets live in native `<details>`/`<summary>` so they open without JS and with the keyboard. Phase 5 layers the SEC-01 motion and count-up on top.
- **D-08:** Projects is the crate in static form: seven typographic sleeves in a CSS scroll-snap row (IX-04 is CSS, so it ships now) on the inverted band, with an index ("3 / 7"). Selecting a sleeve opens an unanimated native `<dialog>` with the project details that satisfies ADR-0006 (focus trap, Escape, focus return, prev/next, close). Phase 4 adds the lift, neighbor lean, record pull and the morph (IX-03, IX-05, IX-06).
- **D-09:** Sleeve covers are typographic only: title set large and cropped by the sleeve edge, stack listed small like a tracklist, dates as the label. Each sleeve's ground is a derived token shade per context (personal, employer, hackathon, course); no new raw colors (the raw-color gate applies). No fake screenshots.
- **D-10:** Skills is a statement: four sentences at `--t-l` (Languages, Frameworks, Developer Tools, Libraries) across columns 1 to 10. The slider is dropped: amend SEC-02 in `REQUIREMENTS.md`/`ROADMAP.md` (Phase 5) and IX-13 in the motion spec; do not vendor `InfiniteSlider`. — **Reversibility:** reversible — changes a later-phase requirement only.
- **D-11:** Education is a facts layout led by "December 2026" at `--t-xl` in tabular figures with "Graduating", the degree, track and GPA beside it, and the high school entry below. Amend SEC-03 and make IX-14 optional.
- **D-12:** About is an asymmetric pair: the DJ photo (cols 1 to 5) and the bio (cols 7 to 11). It introduces the night side in plain words. Contact is the footer finale: the email itself is the copy button at `--t-l`, links to GitHub, LinkedIn, Instagram and Resume, then the fit-to-width wordmark.

### Content
- **D-13:** Project links (G-01): the owner supplies public repo URLs per project. Projects without one show no link. **Owner input checkpoint** before the content modules are finalized.
- **D-14:** The three featured projects (RecipeCart, A.T.L.A.S, Suspect Genie) get a three-line problem / approach / outcome write-up drafted by Claude from resume facts only (no new figures), recorded as before/after edits in the content inventory (rule 3), and shipped only after owner approval (**checkpoint**). The other four projects use their bullets verbatim.
- **D-15:** The About quote is replaced by one line in the owner's own words about the night side. **Owner input checkpoint.** Until supplied, the section renders without a quote (never the old quote, never invented copy).
- **D-16:** Resume PDF (CNT-04): the owner exports a phone-free PDF from the source document; it replaces the stand-in `public/resume.pdf`. The existing phone-number gate must scan the PDF's text layer. **Owner input checkpoint.** Never publish the source PDF in `references/`.

### Navigation
- **D-17:** The pill morph (IX-07) and the sliding scroll-spy indicator (IX-08) are animated in Phase 3 with motion, through the anim barrel, with instant state changes under reduced motion.
- **D-18:** Desktop nav (768 px and up): PHAN/PHVNTM wordmark top left, all six section links, the theme toggle and the Resume button. Always visible (no hide on scroll), solid ground fill, `scroll-margin-top` equal to the nav height on every section.
- **D-19:** Phones: a non-fixed top bar above the hero carries the wordmark and the theme toggle, so the signature switch is visible on first paint; the pill menu also carries the toggle and Resume (per the IA). The collapsed pill keeps Experience, Projects and Menu.
- **D-20:** The theme toggle moves out of its fixed Phase 2 position (Phase 2 D-08). Its react-spring thumb (IX-10) is unchanged; the night-only 33⅓ rpm groove (DESIGN.md idle state) is Phase 4.

### Carried forward (do not re-decide)
- **D-21:** Content inventory rules: resume wins, verbatim copy with recorded edits, date policy D-10, no phone number anywhere (D-11). Section order and anchors per the IA doc. 10-second test per the design brief.
- **D-22:** Stack, layering and import boundaries per `docs/architecture.md`; the motion/react-spring ownership matrix; the 150 kB gz JS budget and all Phase 2 CI gates stay green.

### Claude's Discretion
- Content module shapes and file layout under the architecture doc, exact derived shades for sleeve contexts, the copy-email toast wording and timing, image pipeline details (vite-imagetools settings, which logos and photos ship), the 404 page markup and how GitHub Pages serves it, the wording of the doc amendments.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Art direction (adopted this phase)
- `DESIGN.md` — concept card, palette D block, Archivo ladder, grid, radius rule, hover table, composition wireframes per section. Adopted items are listed in D-01 to D-12; items marked Phase 4 there stay in Phase 4.

### Phase 1 docs (amend where decisions above say so)
- `.planning/phases/01-decisions-and-documentation/01-DESIGN-BRIEF.md` — personality, anti-goals, 10-second test
- `.planning/phases/01-decisions-and-documentation/01-CONTENT-INVENTORY.md` — every content item, gap register, reconciliation log
- `.planning/phases/01-decisions-and-documentation/01-IA-WIREFRAMES.md` — section order, nav model, pill and scroll-spy states, recruiter fast path
- `.planning/phases/01-decisions-and-documentation/01-DESIGN-TOKENS.md` — token format, derived block, pairs, checker usage
- `.planning/phases/01-decisions-and-documentation/contrast-check.mjs` — the contrast checker
- `.planning/phases/01-decisions-and-documentation/01-MOTION-SPEC.md` — IX-04, IX-07, IX-08, IX-09, IX-10, ownership matrix, reduced-motion layers

### Project docs
- `docs/architecture.md` — layers, import rules, content model, assets, quality gates
- `docs/adr/0005-inline-svg-brand-icons.md` — brand icons for the contact links
- `docs/adr/0006-project-overlay-dialog-accessibility.md` — dialog accessibility rules for D-08
- `docs/adr/0007-vendored-motion-primitives.md` — vendoring rules
- `docs/contrast-matrix.md` — regenerated for palette D
- `.planning/REQUIREMENTS.md` — CNT-01/02/04/05, NAV-02/03/04; SEC-02 and SEC-03 amended per D-10, D-11
- `.planning/phases/02-deployed-themed-skeleton/02-CONTEXT.md` — Phase 2 decisions (D-13 superseded by D-02/D-03 here)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/anim/index.ts` barrel: `ThemeThumb`, `MotionPreferenceProvider`, `useMotionPreference`, `TextReveal`, `springs`/`durations`/`easeOut`. Pill morph and scroll-spy get new wrappers here.
- `src/components/ui/ThemeToggle.tsx`: move into the nav and pill menu; it drives the wordmark state.
- `src/layout/Container.tsx`, `src/layout/Section.tsx`: section shells with ids and labels.
- `src/sections/Hero/Hero.tsx`: real hero to restyle into the poster layout.
- `src/lib/theme.ts`: theme state and storage; the wordmark reads the same `data-theme`.

### Established Patterns
- Tokens are CSS variables in `src/styles/tokens.css` mapped via `@theme inline`; no `dark:` variants and no raw colors in components (CI gate).
- Animation imports only inside `src/anim/` and `src/components/motion-primitives/` (lint boundary).
- `npm run verify` chain: typecheck, lint, Prettier, Vitest, build, JS budget, path-case, raw-color, phone-number, contrast.

### Integration Points
- `src/app/Page.tsx`: replace `SectionStubs` with the real sections.
- `src/main.tsx`: swap the Inter import for Archivo `wdth.css`.
- `index.html`: static hero shell and head script; title, meta description.
- `public/resume.pdf`: replaced by the owner's phone-free export.
- Legacy images in `../aa-phan.github.io/images/` (about-dj.jpg, employer logos) feed the image pipeline (CNT-05).

</code_context>

<specifics>
## Specific Ideas

- The screenshot frame is the footer wordmark (PHAN by day, PHVNTM by night).
- Corner facts carry recruiter information, not decoration.
- No uppercase eyebrow labels above headings; sentence case; no em dashes in visible copy.
- Display tracking negative and set per size; dates, GPA and graduation year in tabular figures.
- Day is still at rest on purpose; the only idle motion (night, Phase 4) is the toggle groove.

</specifics>

<deferred>
## Deferred Ideas

- Animated wordmark flip IX-18, crate physics and record pull, overlay morph, night-only toggle groove: Phase 4.
- Experience expand motion and metric count-up (SEC-01 motion): Phase 5.
- OG image with the split wordmark, favicon refresh, Lighthouse/axe/VoiceOver gates: Phase 6.
- A `/jury` score of the Phase 3 build (first build worth scoring): after Phase 3 execution.

</deferred>

---

*Phase: 03-content-complete-site*
*Context gathered: 2026-10-19*
