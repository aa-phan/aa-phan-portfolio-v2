# Design Tokens (DOC-04)

Status: Draft

Phase 1 plan 01-01 created this file with candidate A and the Contact Me slice of the contrast matrix. Plan 01-04 adds candidates B and C, the full 19-pair list for every section, the type pairing per candidate, and (once the user picks) the chosen system.

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
