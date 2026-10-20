# DESIGN.md: raising the design bar

Status: Adopted for Phase 3 on 2026-10-19 (concept, palette D, Archivo, poster hero, CSS hovers, section layouts, skills statement, education facts). See `.planning/phases/03-content-complete-site/03-CONTEXT.md` D-01 to D-12 for exactly what is in scope; items marked Phase 4 here stay in Phase 4.

This is an art-direction pass made with the `/awwwards` method (concept, art direction, a genericness test) against the accepted Phase 1 docs and the Phase 2 skeleton. It does not replace those docs. Every proposal below names the doc and requirement it would amend and the phase that would build it, so accepted items can go through the normal GSD flow (`/gsd-discuss-phase 3` or a `/gsd-quick` doc amendment).

What stays fixed: the stack, the motion/react-spring ownership matrix, the 539 rail and 445 pill nav references, the 10-second test, every launch gate, the content rules (resume wins, no phone number), and the anti-goals (no loader, no WebGL, no custom cursor, no scroll-jacking). The method's default stack (GSAP and its own engine) is not adopted.

## 1. Where the current plan lands

A self-estimate from the documents and the skeleton code, not a jury run on screenshots. Run `/jury` on the Phase 3 build for a real score.

| Criterion | Weight | Estimate | Why |
|---|---|---|---|
| Design | 40% | 6.5 | Indigo on near-white with a lavender tint and Inter only. `01-DESIGN-TOKENS.md` itself calls palette A "the most common portfolio look" and the least Warm and Playful of the three. The hero name tops out at 5.16rem: a heading, not an image. |
| Usability | 30% | 8 | The strongest part of the plan: the 10-second test, the pill nav, keyboard and reduced-motion layers, budgets enforced in CI. |
| Creativity | 20% | 6 | The rail comes from a reference (539), not from Aaron. Nothing on the page could only belong to him. |
| Content | 10% | 6.5 | Real, specific bullets, but no project imagery (G-02), no project links (G-01), and resume lines rather than a story. |
| Weighted | | **6.85** | Around Honorable Mention. Usability carries it; Design and Creativity hold it back. |

The gap is not craft or engineering. It is the absence of a point of view: the site does not yet say anything that is only true of Aaron.

## 2. Brief

- Subject: Aaron Phan, ECE student at UT Austin graduating December 2026, software engineer (Capital One, Spectrum, Symbotic), and a DJ who performs as PHVNTM.
- Audience: recruiters and hiring managers, and the design-engineering community, served equally.
- Job: get hired. Second job: be remembered.
- Assets: the resume, 5 roles, 7 projects with no imagery, the DJ photo (`about-dj.jpg`, 539 x 800), three employer logos at favicon size.
- Constraints: everything in Phase 1 and the launch gates.

## 3. Concepts

| | A. Day job, night set (name) | B. The crate (his other craft) | C. The event stream (his engineering material) |
|---|---|---|---|
| Idea | Aaron Phan by day, PHVNTM by night. The light and dark themes are the two identities, and switching them flips the A in PHAN upside down into the V of PHVNTM | Projects are records in a crate. You dig through them, lift one out, and pull the record from its sleeve | The page is a stream of events: each section is a topic, and the nav shows your offset like a Kafka consumer |
| Anchor | His own bio line ("a software engineer by day, and aspiring artist by night") and the pseudonym PHVNTM, which is PHAN with the A turned over into a V, plus TM | He DJs; crate-digging is literally lift, lean, pull out, which is what the 539 rail already does | The Capital One pipeline (Kafka, SQS, Lambda, 100K+ events daily) |
| Signature | The theme switch: the A flips over (rotateX) into a V, and NTM slides in | Hovering a sleeve pulls the record partway out; opening one pulls it free into the overlay | Scroll-spy as a consumer offset counter |
| Screenshot | The footer wordmark caught mid-flip, the A edge-on | A sleeve half-pulled, its neighbors leaning away | The nav offset ticking past a section boundary |
| Originality / Fit / Feasibility / Portability (lower is better) | 5 / 4 / 5 / 1 | 4 / 3 / 4 / 3 | 3 / 4 / 4 / 4 |

**Pick A for the structure and take B for the signature rail.** A cannot be moved to anyone else: it depends on one name and one pseudonym that share four letters. It also gives a reason for something the project already committed to building (two designed themes, DSN-03), which the art direction otherwise has to justify. B gives the 539 rail a physical metaphor from Aaron's own world in place of the garment hanger that the brief already ruled out, and it solves the missing project imagery honestly (section 6). C is portable to any backend engineer, so it is dropped.

Guardrail: the night persona never hides or replaces engineering content. Both themes show identical content in identical order. Night mode changes the wordmark, the display width of two elements, one idle detail, and nothing a recruiter needs.

## 4. Concept card

```
Idea:        Aaron Phan by day, PHVNTM by night: one person, two shifts, one switch.
Metaphor:    a DJ's crate and a day job's desk. Day is still and precise; night has a tempo.
Signature:   the theme switch flips the A of PHAN into the V of PHVNTM (new IX-18), and the
             project rail behaves like a crate of records (IX-03, IX-05 restyled).
Emotion:     first 3 s: "clear, quick, a little cheeky". The name is huge and readable, and
             the corner wordmark hints that there is a second side.
Motion verb: lift, flip, set down. Things are picked up on the gentle spring, flipped over on
             their X axis, and set down on the snappy spring. Nothing slides in from nowhere.
Screenshot:  the footer: PHVNTM set edge to edge, with the V still turning.
```

How the concept reaches every part of the site:

| Place | Day | Night |
|---|---|---|
| Corner wordmark (nav, top left) | PHAN | PHVNTM, after the flip |
| Theme toggle thumb (IX-10) | A still disc | The same disc with a groove mark turning at 33⅓ rpm (the idle state) |
| Projects | Sleeves in a crate | Same |
| Footer finale | PHAN, fit to width | PHVNTM, fit to width, wider (`font-stretch` 125%) |
| 404 | "Dead air." with the A stuck edge-on, halfway through the flip | Same, with the V |
| OG image | The two wordmarks split on a diagonal | n/a |

Accessibility of the wordmark: the visible glyphs are `aria-hidden`; the link carries `aria-label="Aaron Phan, home"` in both themes. The footer wordmark is decorative (`aria-hidden`), and the footer keeps a real text line: "Aaron Phan. DJs as PHVNTM." The h1 stays "Aaron Phan" in both themes and never flips.

## 5. Art direction

### Palette D: same indigo, rarer

Keep palette A's indigo (the owner's pick) but stop using it as an ambient wash. Grounds and surfaces become hue-matched neutrals, so indigo appears only where it means something: the primary CTA, links, the active nav mark and focus. Indigo used sparingly reads as a decision; indigo plus lavender everywhere reads as a template.

At night the indigo becomes the UV of a club's black light: the same hue, lifted (already true of palette A's dark set).

This is a ten-role-line edit (D-06). Only `--background`, `--secondary` and both `--text` values change; primary and accent are untouched.

| Role | Day (light) | Night (dark) | Change from A |
|---|---|---|---|
| `--text` (ink) | `#0b0a10` | `#f5f5f7` | Was a blue-black and blue-white; now near-neutral |
| `--background` (ground) | `#f5f5f7` | `#0b0a10` | Was `#fbfbfe` / `#050315` (deep indigo-black) |
| `--primary` | `#5046e5` | `#7b75ff` | Unchanged |
| `--secondary` (line, tint) | `#e9e9ee` | `#1c1b24` | Was lavender `#dedcff` / indigo `#1c1950` |
| `--accent` | `#433bff` | `#9d99ff` | Unchanged |

```palette D
light --text oklch(0.1491 0.0128 292.39)
light --background oklch(0.9696 0.0030 290.00)
light --primary oklch(0.5113 0.2298 277.28)
light --secondary oklch(0.9355 0.0066 286.27)
light --accent oklch(0.5143 0.2729 272.97)
dark --text oklch(0.9696 0.0030 290.00)
dark --background oklch(0.1491 0.0128 292.39)
dark --primary oklch(0.6383 0.1988 281.11)
dark --secondary oklch(0.2274 0.0173 290.04)
dark --accent oklch(0.7288 0.1457 283.95)
```

Verified: `node contrast-check.mjs` on a copy of `01-DESIGN-TOKENS.md` with this block added gives `RESULT: PASS palettes=4 checks=152`. All 19 pairs pass in both themes with the shared derived block unchanged. The tightest pairs are `--focus-ring` on `--primary` (3.14 day, 3.31 night; min 3.0) and `--on-primary` on `--primary-hover` at night (4.86; min 4.5).

A hue-matched ground matters: the first attempt (`#f5f5f3`, hue 106) pushed the derived `--surface` toward green and `--muted` toward pink through the `color-mix` hue arc. Ground and ink now share hue about 290.

One inverted band: the Projects section swaps `--text` and `--background` in a scoped class (`.band-invert`), so the crate sits on ink by day and on near-white by night: "the crate under the work lights". This is the one tone-reference band (355). The other sections stay on the ground and are separated by space, not by tints.

### Type: Archivo, one family, two personalities

Replace Inter with Archivo Variable (`@fontsource-variable/archivo` 5.3.0, `wdth.css`). One latin file covers weight 100 to 900 and width 62% to 125% (90 kB woff2, against Inter's 48 kB: +42 kB of font, no JS). It stays inside DSN-04's limit of two families with room to spare.

Why Archivo: the concept is one person with two modes, and Archivo is one family with two voices. At 100% width it is a sturdy, legible grotesk for the day job. At 125% width and weight 800 it turns into a wide poster face for the night. Inter is the most common portfolio face (an "AI default" in the method's list) and has no width axis.

| Token | Size | Leading | Tracking | Setting |
|---|---|---|---|---|
| `--t-mega` | `clamp(3.75rem, 0.9rem + 12.2vw, 12rem)` | 0.86 | -0.045em | wght 800, wdth 100. Hero h1 only |
| `--t-wordmark` | fit to width with `container-type: inline-size` and `cqi` units | 0.8 | -0.03em | wght 800, wdth 100 by day, 125 by night. Footer only |
| `--t-xl` | `clamp(2.5rem, 1.4rem + 4.8vw, 5.5rem)` | 0.95 | -0.03em | wght 750. Section headings |
| `--t-l` | `clamp(1.5rem, 1.2rem + 1.4vw, 2.5rem)` | 1.15 | -0.015em | wght 500. Statement paragraphs, sleeve titles |
| `--t-m` | `clamp(1.2rem, 1.1rem + 0.4vw, 1.45rem)` | 1.35 | -0.005em | wght 600. Row titles, card titles |
| `--t-body` | `clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)` | 1.55 | 0 | wght 400. Measure at most 62ch |
| `--t-s` | 0.875rem | 1.45 | 0.005em | wght 500. Nav, dates, captions |
| `--t-xs` | 0.8125rem | 1.4 | 0.01em | wght 500. Stack chips only |

- Display type is negative-tracked and optically aligned: the hero h1 gets `margin-inline-start: -0.055em` so the stem of the A lines up with the body text's left edge.
- Dates, the GPA and the graduation year use `font-variant-numeric: tabular-nums`.
- No uppercase eyebrow labels above headings. Sentence case throughout; the wordmarks are the only all-caps text.
- The 1.2 modular ladder in `01-DESIGN-TOKENS.md` is too gentle for a poster hero; this ladder keeps body sizes the same and opens up the top.

### Grid and rhythm

- Desktop: 12 columns, gutter `clamp(1rem, 2vw, 2rem)`, outer margin equal to the gutter. Two hang lines: column 1 (names, headings) and column 7 (body copy, details). Every text block starts on one of them.
- Phone (390): 4 columns, 16 px margins. Hang everything from column 1; column 3 is the secondary line for dates and meta.
- Section spacing uses three moods, assigned on purpose: tight (`6rem`) between Experience and Projects, airy (`10rem`) before About, and full viewport for the footer finale.

### Shape

One rule: **things you hold are near-square; things you press are pills.** Sleeves, the overlay panel and the photo get `4px`. Buttons, chips, the pill nav and the toggle stay `9999px`. This replaces the sm/md/lg radius set with two values, and the difference itself tells people what a thing is.

### Motion language

- Uses the existing tokens unchanged: `gentle` (170, 26) to lift, `snappy` (500, 32) to set down, `ease-out` cubic-bezier(0.22, 1, 0.36, 1) for durations.
- Flip: `rotateX` 0 to 180deg over `slow` (420 ms) with `perspective: 600px`. The glyph swaps at 90deg, when it is edge-on and invisible. Owner: motion (new IX-18). Under reduced motion the glyphs swap instantly.
- One treatment per role (fixes the color-swap-only hovers in the skeleton; the jury penalizes those):

| Role | Treatment | Touch and keyboard |
|---|---|---|
| Primary CTA (Resume, Copy email) | Ink floods up from the bottom edge (`clip-path` inset, CSS) and the label lifts 2 px; press-squish on press (IX-02) | Press-squish only; focus ring |
| Nav links | The label flips over on X (a duplicate label, `aria-hidden`, turns in from below), 220 ms | Focus: the same flip plus the ring |
| Project sleeve | Lift with neighbors leaning away (IX-03), plus the record's edge sliding 18% out of the top of the sleeve | Tap opens; focus does the lift (IX-06) |
| Experience row | The company name widens from `font-stretch` 100% to 112% (the night voice showing through) and the row's rule draws to full width | Expand on tap or Enter (IX-11) |
| Utility (social, inline links) | Color plus underline thickness only | Underline at rest in body text |

- Idle state: **night only**, the groove mark on the toggle thumb turns at 33⅓ rpm (one turn every 1.8 s), CSS, paused when the tab is hidden, off under reduced motion. **Day is still on purpose**: the day job is calm and precise, so hovers and the signature carry the life. This is the written decision the method asks for, not an oversight.
- Continuity: the sleeve grows into the overlay (motion `layoutId`, IX-05); the theme switch is the flip; the overlay's prev and next slide the record across the way a sleeve moves in the crate. No loader (brief anti-goal).

## 6. Composition plan

Each section uses a different layout family. Wireframes at 1280 and 390.

**Hero: poster, name as image (four-corner frame)**

```
1280
+------------------------------------------------------------------------------------+
| PHAN                         Experience Projects About Skills Contact   (o) Resume  |
|                                                                                    |
| Aaron                                                                              |
| Phan                                                    (t-mega, 2 lines, col 1-9) |
|                                                                                    |
| Software engineer building cloud-native             [ Download resume ]            |
| backends in Go.                     (col 1-6)       [ Copy email ]   (col 9-12)    |
|                                                                                    |
| Graduating December 2026, UT Austin ECE        Last role: Capital One, summer 2026 |
+------------------------------------------------------------------------------------+
390
+----------------------------+
| PHAN               (o)     |
|                            |
| Aaron                      |
| Phan        (fills width)  |
|                            |
| Software engineer building |
| cloud-native backends in Go|
|                            |
| [ Download resume       ]  |
| [ Copy email            ]  |
| Graduating December 2026   |
|   ( Experience | Projects | Menu )   pill nav (445) |
+----------------------------+
```

The two bottom corners carry real recruiter facts (graduation date, latest role), not decoration. The graduation date answers the first question a recruiter has about a student and is not on the first screen today.

**Experience: index list**

```
| Capital One           Software Engineer Intern          June 2026 – August 2026  + |
|------------------------------------------------------------------------------------|
| Spectrum              Network Engineer Intern            May 2025 – August 2025  + |
```

Full-width rows on the two hang lines: company (col 1), title (col 7), dates right-aligned in tabular figures. They expand in place (IX-11). Logos are 20 px, inline before the company name, which suits their favicon-grade sources (G-12) better than larger cards. At 390 px, company and dates share line one and the title drops to line two.

**Projects: the crate (signature, inverted band)**

```
         +--------+
  +----+ |  /  \  |  <- record edge out of the sleeve on lift
  |    | +--------+ +----+ +----+
  |RECI| |SUSPECT | |MEDI| |FULL|   sleeves: near-square, 4 px corners,
  |PE  | |GENIE   | |ADAS| |STAC|   typographic covers
  +----+ +--------+ +----+ +----+
  3 / 7                                   native scroll-snap on touch (IX-04)
```

The sleeves are **typographic covers**, which honestly solve G-02 (no project images exist). The project title is set big at `--t-l`, cropped by the sleeve edge; the stack is listed small like a tracklist on the back; the dates sit where a label would go. Each sleeve's ground is a deterministic shade from its context (personal, employer, hackathon, course), so the crate reads as a sorted collection rather than seven identical cards. No fake screenshots. Real screenshots replace the covers later where they exist.

**About: asymmetric pair**

The DJ photo on columns 1 to 5 (4 px corners, the only photograph on the page), and the bio on columns 7 to 11, starting a third of the way down the photo. This is where the night side is introduced in plain words, so the wordmark's second name makes sense to anyone who scrolls this far.

**Skills: statement**

A proposal that changes SEC-02 and IX-13 (owner decision). Instead of a moving slider strip, set the skills as four short sentences at `--t-l` across columns 1 to 10: "Languages: Go, Python, Java, C/C++…". A marquee is a common trope, it fights the 10-second test (skills scroll away before you read them), and it needs a static fallback anyway. The statement is the static fallback, promoted. It also removes `InfiniteSlider` from the bundle.

**Education: facts**

```
| December 2026                         The University of Texas at Austin |
| (t-xl, tabular)                       B.S. Electrical & Computer Eng.   |
| Graduating                            Data Science track · GPA 3.2      |
```

Lead with the date, the fact recruiters filter on. Keep the GPA at body size. The flip card (IX-14) becomes optional: the facts layout needs no hidden face.

**Contact: footer as finale**

```
| Copy aaron.phan240@gmail.com            GitHub   LinkedIn   Instagram   Resume |
|                                                                                |
| P H A N                                       (fit to width, wordmark)         |
| Aaron Phan. DJs as PHVNTM.                                       Austin, TX    |
```

The email itself is the button, set at `--t-l`, with the IX-09 toast. The wordmark is the last frame of the page, and the one people screenshot at night.

## 7. Genericness test

"If a generic model got a similar prompt, would it land here?"

| Part | Generic answer | What changed |
|---|---|---|
| Palette | Indigo plus lavender on near-white (palette A as it stands) | Neutral grounds; indigo kept only as the signal |
| Type | Inter, bold, -0.02em | Archivo with a width axis that carries the concept; a poster-size hero |
| Hero | Name, tagline, two buttons, left-aligned at 5rem | The name as image, real facts in the corners, a second identity in the wordmark |
| Projects | Seven rounded cards with gradient placeholders | Sleeves in a crate with typographic covers and a record that slides out |
| Skills | An infinite marquee of logos | Four sentences, read in one glance |
| Dark mode | An inverted palette | A second persona with its own wordmark, width and tempo |

## 8. Proposed changes, ranked by score gained

| # | Change | Raises | Amends | Phase |
|---|---|---|---|---|
| 1 | Concept: PHAN/PHVNTM wordmark, flip on theme switch (new IX-18), footer finale, 404 "Dead air." | Creativity +2, Design +0.5 | Design brief (personality, references), motion spec (IX-18), IA (footer, 404) | 3 (static wordmarks, footer, 404), 4 (flip) |
| 2 | Archivo replaces Inter; new top-heavy scale; poster hero | Design +1 | `01-DESIGN-TOKENS.md` typography, DSN-04 package | 3 |
| 3 | Palette D (neutral grounds, indigo as signal); one inverted Projects band | Design +0.5 | Tokens candidate D plus "Chosen palette: D", `src/styles/tokens.css` ten role lines | 3 |
| 4 | Crate rail with typographic sleeves | Creativity +0.5, Content +0.5 | IA rail states, IX-03 and IX-05 notes, G-02 ruling | 4 |
| 5 | One hover treatment per role (table in section 5) | Design and Usability +0.5 | Motion spec IX-02 and IX-17 (Magnetic on CTAs becomes optional) | 3 (CSS), 4 (springs) |
| 6 | Hero corner facts: graduation date, latest role | Usability, Content | Content inventory HERO block, IA hero frames | 3 |
| 7 | Skills as statement instead of slider | Usability, WPO | SEC-02, IX-13 | 3 (or 5) |
| 8 | Education as facts, led by the graduation date | Content | SEC-03, IX-14 | 3 (or 5) |
| 9 | Project links (G-01) to GitHub where the repos are public | Content +0.5 | Content inventory | 3 |

If all of it lands, a realistic target is Design 8, Usability 8, Creativity 8, Content 7, a weighted **7.9**.

## 9. Content notes

- The role line ("Software engineer building cloud-native backends in Go.") is good: specific and true. Keep it.
- The About quote ("The best time to start was yesterday…") is a widely shared proverb and costs Content points. Rule 3 of the content inventory keeps copy verbatim, so cutting it is the owner's call; the recommendation is to replace it with one line in Aaron's own words about the night side.
- Project bullets are resume lines. For the overlay, a three-line problem, approach and outcome for the three featured projects (RecipeCart, A.T.L.A.S, Suspect Genie) would raise Content more than anything else at this point, using only figures that already appear on the resume.
- The phone number rule is unaffected. The wordmark, OG image and 404 contain no contact data beyond the public email.

## 10. Open questions for the owner

1. Is the PHVNTM persona welcome on the professional site? The concept depends on it. If not, the fallback is concept B (the crate) on its own, which scores lower on Creativity (portability 3).
2. Palette D or palette A as is?
3. Archivo in place of Inter?
4. Skills: statement, or keep the slider (SEC-02)?
