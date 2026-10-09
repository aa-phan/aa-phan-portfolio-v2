# Design Tokens (DOC-04)

Status: Accepted

Chosen palette: A

Phase 1 plan 01-01 created this file with candidate A and the Contact Me slice of the contrast matrix. Plan 01-04 added candidates B and C, the full 19-pair list for every section, the type pairing per candidate, and, after the user picked candidate A (tuned seed indigo, Inter only), the chosen system below.

Owner decisions this file records: D-04 (three candidates, per-theme tokens, the user picks one), D-05 (type explored with color), D-06 (exactly 5 role tokens plus derived tints). WCAG 2.2 AA is the bar.

## Format

Tokens live in fenced blocks so a script can recompute every contrast ratio from the OKLCH values instead of trusting the author. There are three block types, identified by the fence info string:

- `palette X` (X is one capital letter) holds one palette. Each line is a theme, a token name and an OKLCH color, for example `light --text oklch(L C H)`, where L is lightness from 0 to 1, C is chroma and H is hue in degrees. THEME is `light` or `dark`. Every palette must define exactly the five role tokens for both themes (10 lines). A palette block may also carry derived-override lines (a `mix()` formula) when one palette needs a different derived formula than the shared one.
- `derived` holds tints computed from the roles. Each line is a theme, a token name and `mix(--a P%, --b)`, which matches CSS `color-mix(in oklch, var(--a) P%, var(--b))`: lightness and chroma blend linearly, hue goes along the shorter arc, and an achromatic color takes the other color's hue. A derived token may never be given a literal color. That is what makes a palette swap a single-block edit (D-06): only the five role lines change, and every derived token follows.
- `pairs` holds the contrast matrix. Each line is `FG on BG CATEGORY USED-BY`, where CATEGORY is `text` (needs 4.5:1), `large` (3:1), `ui` (3:1) or `focus` (3:1), and USED-BY names the section anchor and the element. Every pair is evaluated for every palette in both themes.

A final line `Chosen palette: X` (written once the user picks) names the palette that ships. It is written as plain text on its own line, outside any fence.

Verify with `node contrast-check.mjs 01-DESIGN-TOKENS.md` from this directory. The last line is `RESULT: PASS palettes=N checks=M` and the exit code is 0 only when every pair passes. Add `--require-chosen` once the choice is made. `--convert VALUE` turns a hex into OKLCH (rounded to stay inside the sRGB gamut) or an OKLCH into a hex, and is how role values and realtimecolors links are authored. `--selftest` proves the checker against independently computed ratios.

Ratios are compared unrounded against the threshold (4.499 fails 4.5) and printed to two decimals. A color outside the sRGB gamut fails its rows as OUT-OF-GAMUT, because the browser would remap it and the ratio would no longer be the one that was checked.

## Role tokens

The five roles follow the realtimecolors order. Per-theme values are mandatory (D-04): the seed indigo `2f27ce` measures 2.23:1 on the dark background `050315`, which fails text, UI and focus use.

| Order | Token | Job |
|-------|-------|-----|
| 1 | `--text` | Body and heading text, and the on-color for filled dark surfaces |
| 2 | `--background` | Page background |
| 3 | `--primary` | Filled buttons, the main brand fill |
| 4 | `--secondary` | Tint family for cards and soft fills (decorative, never text or a border on its own: `dedcff` on the light background is 1.29:1) |
| 5 | `--accent` | Highlights and large display color |

Derived tokens (D-06), all `mix()` of roles, defined once for every candidate in the shared `derived` block:

| Token | Job |
|-------|-----|
| `--surface` | Card, toast and overlay panel fill |
| `--muted` | Dates, captions and secondary copy |
| `--border` | Decorative hairlines (no contrast requirement) |
| `--border-strong` | Control boundaries (3:1) |
| `--link` | Inline link text |
| `--on-primary` | Label on a filled primary button |
| `--on-accent` | Label on an accent chip or active pill |
| `--primary-hover` | Hovered or pressed filled button |
| `--focus-ring` | Keyboard focus indicator |

## Candidate A — Tuned seed indigo

Chosen.

Continuity with the realtimecolors seed (050315 / fbfbfe / 2f27ce / dedcff / 433bff). Dark roles are authored for dark, not inverted: the text and background swap ends, primary and accent lift to the 5.66:1 and 8.19:1 class on `050315`, and secondary becomes a dark indigo tint. One tune from the seed in light: `--primary` moves from `2f27ce` to `5046e5` (plan 01-01 had first tuned it to `281fb4`; the full 19-pair set forces a second move). Reason: a focus ring must hold 3:1 against the page, a card, the secondary tint and a filled primary button. With `281fb4` no ring color does all four: a mid-tone ring clears the button but gives 2.50:1 on the secondary tint, and a near-black ring gives 1.89:1 on the button. A primary lighter than the seed's (relative luminance about 0.11 to 0.18) opens the band: a near-black ring then reads on the button (3.2:1 or better) and on every light surface, while the white label on the button still holds 4.5:1. Cost: primary `5046e5` and accent `433bff` are now close in light, so color alone never separates them (Pitfall 5); state uses shape and weight too.

Type pairing: Inter variable for display and body, one family: `@fontsource-variable/inter` 5.3.0. This is the seed pairing from realtimecolors and the safest for mobile weight (one latin subset, 48 kB).

Swatches (hex of the OKLCH roles below, for reference):

| Role | Light | Dark |
|------|-------|------|
| --text | #050315 | #fbfbfe |
| --background | #fbfbfe | #050315 |
| --primary | #5046e5 | #7b75ff |
| --secondary | #dedcff | #1c1950 |
| --accent | #433bff | #9d99ff |

```palette A
light --text oklch(0.1190 0.0436 285.36)
light --background oklch(0.9889 0.0039 286.33)
light --primary oklch(0.5113 0.2298 277.28)
light --secondary oklch(0.9070 0.0475 288.03)
light --accent oklch(0.5143 0.2729 272.97)
dark --text oklch(0.9889 0.0039 286.33)
dark --background oklch(0.1190 0.0436 285.36)
dark --primary oklch(0.6383 0.1988 281.11)
dark --secondary oklch(0.2561 0.0973 279.44)
dark --accent oklch(0.7288 0.1457 283.95)
```

Preview:

- Light: https://www.realtimecolors.com/?colors=050315-fbfbfe-5046e5-dedcff-433bff&fonts=Inter-Inter
- Dark: https://www.realtimecolors.com/?colors=fbfbfe-050315-7b75ff-1c1950-9d99ff&fonts=Inter-Inter

Rationale: Personality: Crafted, Confident, Fast and Inclusive lead. A single family, a cool indigo on near-white and a near-black ink read as precise and quick; the focus ring and contrast are the most conservative of the three. It is the least Warm and least Playful of the set: the warmth and play would have to come from motion and shape alone, and indigo on near-white is the most common portfolio look. Pick A if continuity with the linked seed matters more than a distinct identity.

Contrast results:

| Pair | Category | Light | Dark |
|------|----------|-------|------|
| --text on --background | text | 19.73 | 19.73 |
| --text on --surface | text | 18.36 | 17.75 |
| --text on --secondary | text | 15.32 | 15.59 |
| --muted on --background | text | 9.79 | 8.96 |
| --muted on --surface | text | 9.11 | 8.06 |
| --link on --background | text | 8.35 | 8.19 |
| --link on --surface | text | 7.77 | 7.36 |
| --on-primary on --primary | text | 6.07 | 5.66 |
| --on-primary on --primary-hover | text | 7.74 | 5.01 |
| --on-accent on --accent | text | 6.15 | 8.19 |
| --border-strong on --background | ui | 5.61 | 5.10 |
| --border-strong on --surface | ui | 5.22 | 4.58 |
| --primary on --background | ui | 6.07 | 5.66 |
| --accent on --background | ui | 6.15 | 8.19 |
| --accent on --surface | ui | 5.72 | 7.36 |
| --focus-ring on --background | focus | 19.73 | 19.73 |
| --focus-ring on --surface | focus | 18.36 | 17.75 |
| --focus-ring on --primary | focus | 3.25 | 3.49 |
| --focus-ring on --secondary | focus | 15.32 | 15.59 |

## Shared derived tokens

Nine derived tokens, defined once and shared by A, B and C. Each is a `mix()` of roles (D-06), so a palette swap edits only the ten role lines. `--link` in dark is the lifted accent for candidate A (blending the dark primary toward near-white leaves the sRGB gamut and the checker reports OUT-OF-GAMUT); B and C override it inside their palette blocks. `--on-primary` and `--on-accent` are the page background in both themes (a light label on the deep light fills, a dark label on the lifted dark fills). `--primary-hover` is the primary pulled slightly toward the text color in light and toward the background in dark (mixing a lifted dark primary toward near-white leaves the gamut), so the button always reads as pressed in. `--focus-ring` is the text color in both themes: it is the only color that holds 3:1 against the page, a card, the secondary tint and a filled primary at once, once the light primary sits in the band described under candidate A.

```derived
light --surface mix(--secondary 30%, --background)
dark --surface mix(--secondary 60%, --background)
light --muted mix(--text 70%, --background)
dark --muted mix(--text 72%, --background)
light --border mix(--text 14%, --background)
dark --border mix(--text 16%, --background)
light --border-strong mix(--text 55%, --background)
dark --border-strong mix(--text 55%, --background)
light --link mix(--primary 80%, --text)
dark --link mix(--accent 100%, --background)
light --on-primary mix(--background 100%, --text)
dark --on-primary mix(--background 100%, --text)
light --on-accent mix(--background 100%, --text)
dark --on-accent mix(--background 100%, --text)
light --primary-hover mix(--primary 85%, --text)
dark --primary-hover mix(--primary 94%, --background)
light --focus-ring mix(--text 100%, --background)
dark --focus-ring mix(--text 100%, --background)
```

## Candidate B — Clay and cream

Not chosen.

Warm clay on cream. Light: a cream page (`fff7ef`), deep warm-brown ink, a terracotta primary and a peach secondary, with a raspberry accent for highlights. Dark is authored separately: a warm near-black brown page, a lifted clay primary and a soft rose accent. The light primary hue (about 42) sits roughly 125 degrees from A's indigo.

Type pairing: Display Fraunces (`@fontsource-variable/fraunces` 5.3.0) with body Inter (`@fontsource-variable/inter` 5.3.0). Two families. Fraunces is a soft, high-contrast variable serif with optical size and wonk axes; its rounded terminals give large headings a friendly, hand-made feel against the plain Inter body.

Swatches (hex of the OKLCH roles below, for reference):

| Role | Light | Dark |
|------|-------|------|
| --text | #2a140c | #fff3e8 |
| --background | #fff7ef | #1c0f0a |
| --primary | #b04a1d | #d56e47 |
| --secondary | #ffd8bd | #3b1e14 |
| --accent | #b8174f | #ff9fb3 |

```palette B
light --text oklch(0.2207 0.0392 40.57)
light --background oklch(0.9802 0.0136 67.67)
light --primary oklch(0.5367 0.1446 41.67)
light --secondary oklch(0.9084 0.0565 56.61)
light --accent oklch(0.5093 0.1919 8.74)
dark --text oklch(0.9706 0.0195 65.15)
dark --background oklch(0.1851 0.0244 41.81)
dark --primary oklch(0.6500 0.1400 41)
dark --secondary oklch(0.2721 0.0488 39.68)
dark --accent oklch(0.8048 0.1161 6.50)
dark --link mix(--primary 75%, --text)
```

Derived overrides: dark `--link` follows the lifted primary (`mix(--primary 75%, --text)`) instead of the accent, so links stay in the clay family in both themes. Everything else uses the shared derived block.

Preview:

- Light: https://www.realtimecolors.com/?colors=2a140c-fff7ef-b04a1d-ffd8bd-b8174f&fonts=Fraunces-Inter
- Dark: https://www.realtimecolors.com/?colors=fff3e8-1c0f0a-d56e47-3b1e14-ff9fb3&fonts=Fraunces-Inter

Rationale: Personality: Warm, Playful and Tactile lead. Cream and peach bands echo the tone reference (355: soft, large type, alternating bands), clay reads as a handled, physical material (fits the tactile rail and press-and-squish buttons), and a soft serif at display size carries the Playful voice. Crafted shows in the serif detail; Confident in the high-contrast ink on cream (headline pairs are well above AA). The tradeoff: serif display is the biggest departure from the seed and from typical developer-portfolio sans, and clay/raspberry needs care so the primary and accent stay distinct.

Contrast results:

| Pair | Category | Light | Dark |
|------|----------|-------|------|
| --text on --background | text | 16.45 | 17.14 |
| --text on --surface | text | 15.41 | 15.34 |
| --text on --secondary | text | 13.13 | 13.92 |
| --muted on --background | text | 7.13 | 8.38 |
| --muted on --surface | text | 6.68 | 7.50 |
| --link on --background | text | 6.67 | 7.57 |
| --link on --surface | text | 6.25 | 6.77 |
| --on-primary on --primary | text | 5.15 | 5.48 |
| --on-primary on --primary-hover | text | 6.29 | 4.92 |
| --on-accent on --accent | text | 6.05 | 9.68 |
| --border-strong on --background | ui | 4.38 | 5.04 |
| --border-strong on --surface | ui | 4.10 | 4.51 |
| --primary on --background | ui | 5.15 | 5.48 |
| --accent on --background | ui | 6.05 | 9.68 |
| --accent on --surface | ui | 5.67 | 8.66 |
| --focus-ring on --background | focus | 16.45 | 17.14 |
| --focus-ring on --surface | focus | 15.41 | 15.34 |
| --focus-ring on --primary | focus | 3.19 | 3.13 |
| --focus-ring on --secondary | focus | 13.13 | 13.92 |

## Candidate C — Lagoon and amber

Not chosen.

Cool lagoon with amber. Light: a pale mint page (`f3fbf9`), deep teal-black ink, a teal primary and a mint secondary, with a burnt-amber accent. Dark is authored separately: a deep teal-black page, a lifted teal primary and a bright amber accent. The light primary hue (about 186) sits roughly 91 degrees from A's indigo and about 145 degrees from B's clay.

Type pairing: Display Bricolage Grotesque (`@fontsource-variable/bricolage-grotesque` 5.3.0) with body Inter (`@fontsource-variable/inter` 5.3.0). Two families. Bricolage Grotesque is a variable grotesque with quirky, slightly condensed shapes and an optical size axis, characterful at display size and still clean for short headings.

Swatches (hex of the OKLCH roles below, for reference):

| Role | Light | Dark |
|------|-------|------|
| --text | #04211f | #effaf7 |
| --background | #f3fbf9 | #04191a |
| --primary | #0f766e | #0b9e91 |
| --secondary | #c9efe6 | #0c3a3a |
| --accent | #b45309 | #f0b050 |

```palette C
light --text oklch(0.2255 0.0347 188.59)
light --background oklch(0.9815 0.0088 179.61)
light --primary oklch(0.5109 0.0860 186.39)
light --secondary oklch(0.9226 0.0412 179.41)
light --accent oklch(0.5553 0.1455 49.00)
dark --text oklch(0.9761 0.0122 178.03)
dark --background oklch(0.1965 0.0277 199.29)
dark --primary oklch(0.6300 0.1100 184)
dark --secondary oklch(0.3187 0.0478 195.02)
dark --accent oklch(0.7997 0.1339 74.64)
dark --link mix(--primary 75%, --text)
```

Derived overrides: dark `--link` follows the lifted primary (`mix(--primary 75%, --text)`) instead of the accent, so links stay teal in both themes. Everything else uses the shared derived block.

Preview:

- Light: https://www.realtimecolors.com/?colors=04211f-f3fbf9-0f766e-c9efe6-b45309&fonts=Bricolage%20Grotesque-Inter
- Dark: https://www.realtimecolors.com/?colors=effaf7-04191a-0b9e91-0c3a3a-f0b050&fonts=Bricolage%20Grotesque-Inter

Rationale: Personality: Playful, Fast and Confident lead. Teal with an amber accent is lively without being loud, and the contrast between cool fields and a warm accent gives the page a clear second voice for highlights, scroll-spy and active pills. Bricolage Grotesque adds personality in headings while the sans stays modern and quick to read (Crafted, Fast). It is less Warm than B and less continuous with the seed than A. Teal is a common design-engineer choice, so identity depends more on motion and layout than on color.

Contrast results:

| Pair | Category | Light | Dark |
|------|----------|-------|------|
| --text on --background | text | 16.08 | 16.98 |
| --text on --surface | text | 15.29 | 13.98 |
| --text on --secondary | text | 13.66 | 11.71 |
| --muted on --background | text | 6.91 | 8.42 |
| --muted on --surface | text | 6.57 | 6.93 |
| --link on --background | text | 6.66 | 7.48 |
| --link on --surface | text | 6.34 | 6.16 |
| --on-primary on --primary | text | 5.21 | 5.45 |
| --on-primary on --primary-hover | text | 6.30 | 4.89 |
| --on-accent on --accent | text | 4.78 | 9.52 |
| --border-strong on --background | ui | 4.26 | 5.14 |
| --border-strong on --surface | ui | 4.05 | 4.23 |
| --primary on --background | ui | 5.21 | 5.45 |
| --accent on --background | ui | 4.78 | 9.52 |
| --accent on --surface | ui | 4.54 | 7.83 |
| --focus-ring on --background | focus | 16.08 | 16.98 |
| --focus-ring on --surface | focus | 15.29 | 13.98 |
| --focus-ring on --primary | focus | 3.09 | 3.12 |
| --focus-ring on --secondary | focus | 13.66 | 11.71 |

## Contrast pairs

Nineteen pairs cover everything the seven sections paint. Every pair is evaluated for every palette in both themes (3 palettes x 2 themes x 19 pairs = 114 checks). The six Contact pairs from plan 01-01 are included (rows tagged `#contact`); USED-BY names the section anchors.

```pairs
--text on --background text #hero #experience #projects #about #skills #education #contact body copy
--text on --surface text #projects #contact cards, toast, overlay panel
--text on --secondary text #skills #education tinted bands and chips
--muted on --background text #experience #education dates, captions, secondary copy
--muted on --surface text #projects #about card metadata
--link on --background text #about #contact inline links
--link on --surface text #projects #contact links in cards and overlay
--on-primary on --primary text #hero #contact filled button labels
--on-primary on --primary-hover text #hero #contact hovered or pressed button labels
--on-accent on --accent text #skills #projects accent chip and active pill labels
--border-strong on --background ui #contact control boundaries
--border-strong on --surface ui #projects control boundaries on cards
--primary on --background ui #hero #contact filled control against page
--accent on --background ui #experience #projects scroll-spy and active nav indicator
--accent on --surface ui #projects active indicators on cards and pill nav
--focus-ring on --background focus #hero #contact focus ring on page
--focus-ring on --surface focus #projects #contact focus ring on cards
--focus-ring on --primary focus #hero #contact ring adjacent to filled button
--focus-ring on --secondary focus #skills #education ring on tinted bands
```

## Exemptions

- `--border` is decorative (card edges, hairline dividers). It carries no contrast requirement and is never the only cue for a control boundary; controls use `--border-strong` (3:1).
- Disabled controls are exempt under WCAG 1.4.3, but they still get a non-color cue (reduced weight plus a "not available" affordance such as a dashed outline), not color alone.
- `--secondary` is a fill. It is never used as text or as a lone border.

## Chosen system

Candidate A, tuned seed indigo. Five role tokens plus nine derived tokens per theme; values copied from the checker's TOKEN lines for palette A. Light `--primary` is `5046e5` (the retuned value documented in Candidate A, not the earlier `281fb4`). Where Defined as lists two formulas, the first is light and the second is dark; a single formula applies to both themes. Dark `--link` equals the dark `--accent` value because blending the dark primary toward near-white leaves the sRGB gamut.

| Token | Light oklch | Light hex | Dark oklch | Dark hex | Defined as |
|-------|-------------|-----------|------------|----------|------------|
| `--text` | oklch(0.1190 0.0436 285.36) | #050315 | oklch(0.9889 0.0039 286.33) | #fbfbfe | role |
| `--background` | oklch(0.9889 0.0039 286.33) | #fbfbfe | oklch(0.1190 0.0436 285.36) | #050315 | role |
| `--primary` | oklch(0.5113 0.2298 277.28) | #5046e5 | oklch(0.6383 0.1988 281.11) | #7b75ff | role |
| `--secondary` | oklch(0.9070 0.0475 288.03) | #dedcff | oklch(0.2561 0.0973 279.44) | #1c1950 | role |
| `--accent` | oklch(0.5143 0.2729 272.97) | #433bff | oklch(0.7288 0.1457 283.95) | #9d99ff | role |
| `--surface` | oklch(0.9643 0.0170 286.84) | #f2f2ff | oklch(0.2013 0.0758 281.81) | #130e37 | mix(--secondary 30%, --background) light, mix(--secondary 60%, --background) dark |
| `--muted` | oklch(0.3800 0.0317 285.65) | #404053 | oklch(0.7453 0.0150 286.06) | #ababb6 | mix(--text 70%, --background) light, mix(--text 72%, --background) dark |
| `--border` | oklch(0.8671 0.0095 286.19) | #d2d2d9 | oklch(0.2582 0.0372 285.52) | #222135 | mix(--text 14%, --background) light, mix(--text 16%, --background) dark |
| `--border-strong` | oklch(0.5105 0.0257 285.80) | #646475 | oklch(0.5974 0.0218 285.89) | #7e7e8c | mix(--text 55%, --background) |
| `--link` | oklch(0.4328 0.1926 278.90) | #4236b6 | oklch(0.7288 0.1457 283.95) | #9d99ff | mix(--primary 80%, --text) light, mix(--accent 100%, --background) dark |
| `--on-primary` | oklch(0.9889 0.0039 286.33) | #fbfbfe | oklch(0.1190 0.0436 285.36) | #050315 | mix(--background 100%, --text) |
| `--on-accent` | oklch(0.9889 0.0039 286.33) | #fbfbfe | oklch(0.1190 0.0436 285.36) | #050315 | mix(--background 100%, --text) |
| `--primary-hover` | oklch(0.4525 0.2019 278.49) | #453ac1 | oklch(0.6071 0.1895 281.37) | #736def | mix(--primary 85%, --text) light, mix(--primary 94%, --background) dark |
| `--focus-ring` | oklch(0.1190 0.0436 285.36) | #050315 | oklch(0.9889 0.0039 286.33) | #fbfbfe | mix(--text 100%, --background) |

Swapping the palette later means editing only the ten role lines (five light, five dark) and, if a candidate needs it, one derived override line (D-06).

## Contrast matrix

Standard: WCAG 2.2 AA. 1.4.3 text 4.5:1 (large text 3:1); 1.4.11 non-text contrast and focus indicators 3:1. Rows are copied from `contrast-check.mjs --require-chosen` output for palette A: 19 pairs, light then dark, 38 rows, all PASS. Phase 2 re-checks the real token files against this matrix.

| Theme | Foreground | Background | Category | Ratio | Min | Result | Used by |
|-------|------------|------------|----------|-------|-----|--------|---------|
| light | --text | --background | text | 19.73 | 4.5 | PASS | #hero #experience #projects #about #skills #education #contact body copy |
| light | --text | --surface | text | 18.36 | 4.5 | PASS | #projects #contact cards, toast, overlay panel |
| light | --text | --secondary | text | 15.32 | 4.5 | PASS | #skills #education tinted bands and chips |
| light | --muted | --background | text | 9.79 | 4.5 | PASS | #experience #education dates, captions, secondary copy |
| light | --muted | --surface | text | 9.11 | 4.5 | PASS | #projects #about card metadata |
| light | --link | --background | text | 8.35 | 4.5 | PASS | #about #contact inline links |
| light | --link | --surface | text | 7.77 | 4.5 | PASS | #projects #contact links in cards and overlay |
| light | --on-primary | --primary | text | 6.07 | 4.5 | PASS | #hero #contact filled button labels |
| light | --on-primary | --primary-hover | text | 7.74 | 4.5 | PASS | #hero #contact hovered or pressed button labels |
| light | --on-accent | --accent | text | 6.15 | 4.5 | PASS | #skills #projects accent chip and active pill labels |
| light | --border-strong | --background | ui | 5.61 | 3.0 | PASS | #contact control boundaries |
| light | --border-strong | --surface | ui | 5.22 | 3.0 | PASS | #projects control boundaries on cards |
| light | --primary | --background | ui | 6.07 | 3.0 | PASS | #hero #contact filled control against page |
| light | --accent | --background | ui | 6.15 | 3.0 | PASS | #experience #projects scroll-spy and active nav indicator |
| light | --accent | --surface | ui | 5.72 | 3.0 | PASS | #projects active indicators on cards and pill nav |
| light | --focus-ring | --background | focus | 19.73 | 3.0 | PASS | #hero #contact focus ring on page |
| light | --focus-ring | --surface | focus | 18.36 | 3.0 | PASS | #projects #contact focus ring on cards |
| light | --focus-ring | --primary | focus | 3.25 | 3.0 | PASS | #hero #contact ring adjacent to filled button |
| light | --focus-ring | --secondary | focus | 15.32 | 3.0 | PASS | #skills #education ring on tinted bands |
| dark | --text | --background | text | 19.73 | 4.5 | PASS | #hero #experience #projects #about #skills #education #contact body copy |
| dark | --text | --surface | text | 17.75 | 4.5 | PASS | #projects #contact cards, toast, overlay panel |
| dark | --text | --secondary | text | 15.59 | 4.5 | PASS | #skills #education tinted bands and chips |
| dark | --muted | --background | text | 8.96 | 4.5 | PASS | #experience #education dates, captions, secondary copy |
| dark | --muted | --surface | text | 8.06 | 4.5 | PASS | #projects #about card metadata |
| dark | --link | --background | text | 8.19 | 4.5 | PASS | #about #contact inline links |
| dark | --link | --surface | text | 7.36 | 4.5 | PASS | #projects #contact links in cards and overlay |
| dark | --on-primary | --primary | text | 5.66 | 4.5 | PASS | #hero #contact filled button labels |
| dark | --on-primary | --primary-hover | text | 5.01 | 4.5 | PASS | #hero #contact hovered or pressed button labels |
| dark | --on-accent | --accent | text | 8.19 | 4.5 | PASS | #skills #projects accent chip and active pill labels |
| dark | --border-strong | --background | ui | 5.10 | 3.0 | PASS | #contact control boundaries |
| dark | --border-strong | --surface | ui | 4.58 | 3.0 | PASS | #projects control boundaries on cards |
| dark | --primary | --background | ui | 5.66 | 3.0 | PASS | #hero #contact filled control against page |
| dark | --accent | --background | ui | 8.19 | 3.0 | PASS | #experience #projects scroll-spy and active nav indicator |
| dark | --accent | --surface | ui | 7.36 | 3.0 | PASS | #projects active indicators on cards and pill nav |
| dark | --focus-ring | --background | focus | 19.73 | 3.0 | PASS | #hero #contact focus ring on page |
| dark | --focus-ring | --surface | focus | 17.75 | 3.0 | PASS | #projects #contact focus ring on cards |
| dark | --focus-ring | --primary | focus | 3.49 | 3.0 | PASS | #hero #contact ring adjacent to filled button |
| dark | --focus-ring | --secondary | focus | 15.59 | 3.0 | PASS | #skills #education ring on tinted bands |

## Typography

Pairing: one family. Inter variable for display and body: `@fontsource-variable/inter` 5.3.0 (CSS family name `'Inter Variable'`). Candidate A is Inter only (user reply "A"), so there is no display face and no second family (DSN-04 allows at most 2). Personality is carried by weight, size contrast, tight tracking at display sizes, and motion rather than a second typeface. If a display face is wanted later, candidates B and C record the display faces explored (Fraunces, Bricolage Grotesque) with their Fontsource package names, and the swap is one `--font-display` line plus one package.

- Import: `@fontsource-variable/inter/wght.css` in `main.tsx` (declares `font-display: swap`; per-script `unicode-range` so English copy fetches only the 48 kB latin woff2).
- Axis range used: weight 400 to 700 only (400 body, 500 UI labels and nav, 600 headings, 700 display). The `opsz` axis file is not imported.
- Fallback stacks: `--font-sans: 'Inter Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`; `--font-display` is the same stack. Monospace for code or the email address if needed: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` (system, no package).
- Type-scale ratio: 1.200 (minor third, from the realtimecolors presets 1.067 to 1.618), base 1rem. `--text-sm` is a half-step (0.9rem) for dense UI copy; the other steps are powers of 1.2.

Ladder (`--text-xs` through `--text-5xl`). Sizes 3xl to 5xl are fluid: `clamp(min, intercept + slope vw, max)` interpolates linearly from the 375 px viewport (23.4375rem) to the 1280 px viewport (80rem). The rem part of each clamp keeps browser text zoom effective (WCAG 1.4.4).

| Token | Size | Line height | Notes |
|-------|------|-------------|-------|
| `--text-xs` | 0.833rem | 1.5 | Captions, chip labels (never below this) |
| `--text-sm` | 0.9rem | 1.5 | Dates, card metadata, nav labels |
| `--text-base` | 1rem | 1.6 | Body copy |
| `--text-lg` | 1.2rem | 1.5 | Lead paragraphs, summary line |
| `--text-xl` | 1.44rem | 1.4 | Card titles |
| `--text-2xl` | 1.728rem | 1.3 | Section sub-headings |
| `--text-3xl` | clamp(2.074rem, 1.9025rem + 0.732vw, 2.488rem) | 1.2 | Section headings |
| `--text-4xl` | clamp(2.488rem, 2.034rem + 1.936vw, 3.583rem) | 1.1 | Large section titles |
| `--text-5xl` | clamp(2.986rem, 2.085rem + 3.844vw, 5.16rem) | 1.05 | Hero display; tracking -0.02em |

Check points: at 375 px the clamps resolve to 2.074rem, 2.488rem and 2.986rem; at 1280 px to 2.488rem, 3.583rem and 5.16rem. Body copy stays at 1rem on every viewport.

## Spacing, radius, elevation, z-index and breakpoints

- Spacing: Tailwind v4 default base `--spacing: 0.25rem`; all spacing uses the default scale (no custom steps). Minimum touch target 44 by 44 px (`size-11`) for interactive controls.
- Radius: `--radius-sm: 0.5rem`, `--radius-md: 0.875rem`, `--radius-lg: 1.5rem`, `--radius-pill: 9999px`. Cards use md, the project overlay and large bands use lg, chips and the pill nav use pill.
- Elevation (per theme, set on `:root` and `[data-theme=dark]`; shadows are decorative, so they carry no contrast requirement; edges that matter use `--border` or `--border-strong`):

| Token | Light | Dark |
|-------|-------|------|
| `--shadow-sm` | `0 1px 2px color-mix(in oklch, var(--text) 10%, transparent)` | `0 1px 2px oklch(0 0 0 / 0.5)` |
| `--shadow-md` | `0 4px 12px color-mix(in oklch, var(--text) 12%, transparent)` | `0 4px 12px oklch(0 0 0 / 0.55)` |
| `--shadow-lg` | `0 12px 32px color-mix(in oklch, var(--text) 16%, transparent)` | `0 12px 32px oklch(0 0 0 / 0.65)` |

- z-index layers (`--z-*`): base 0, rail-lift 10, sticky-nav 40, pill-nav 50, overlay-backdrop 60, overlay 70, toast 80, skip-link 90. The skip link is the top layer so it is never covered when it takes focus.
- Breakpoints (mobile first, min-width): 375 baseline (design target, no media query), `md` 768 (`48rem`), `lg` 1024 (`64rem`), `xl` 1280 (`80rem`). These match the Tailwind v4 defaults for md, lg and xl, so no override is needed beyond documenting 375 as the smallest supported width.

## Tailwind v4 mapping

- Theme switch: `html` carries a `data-theme` attribute (`light` or `dark`), set by an inline script in `<head>` before first paint. `color-scheme` is set per theme.
- Dark variant: `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`
- Role and derived tokens live as plain CSS variables in `tokens.css`: ten role values per theme (the single edit block) and nine derived tokens written as `color-mix(in oklch, var(--a) P%, var(--b))`, matching the `mix()` formulas in the Chosen system table. Roles are authored in OKLCH.
- `@theme inline` maps `--color-text`, `--color-background`, `--color-primary`, `--color-secondary`, `--color-accent`, `--color-surface`, `--color-muted`, `--color-border`, `--color-border-strong`, `--color-link`, `--color-on-primary`, `--color-on-accent`, `--color-primary-hover` and `--color-focus-ring` each to `var(--NAME)`, so utilities such as `bg-surface` and `text-muted` follow the active theme with no `dark:` variants in components. Font, text-size, radius, shadow and breakpoint tokens are mapped in the same block.
- No raw hex in components: colors come only from the mapped tokens; a grep check enforces this in Phase 2.
- Hover styles rely on Tailwind v4 `hover:` applying only under `(hover: hover)`; do not restore the v3 behavior.

## Motion tokens

Spring, duration and easing tokens are owned by `01-MOTION-SPEC.md`; this file does not define them.
