# Design Tokens (DOC-04)

Status: Draft

Phase 1 plan 01-01 created this file with candidate A and the Contact Me slice of the contrast matrix. Plan 01-04 adds candidates B and C, the full pair list for every section, the type pairing per candidate, and the user's palette choice.

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

Derived tokens used by the Contact slice: `--surface` (card and toast fill), `--link` (inline link text), `--on-primary` (label on a filled primary button) and `--focus-ring` (keyboard focus indicator).

## Candidate A — Tuned seed indigo

Continuity with the realtimecolors seed (050315 / fbfbfe / 2f27ce / dedcff / 433bff). Light uses the seed with one tune: `--primary` moves from `2f27ce` to `281fb4`. Reason: a focus ring must hold 3:1 against both the page background and a filled primary button next to it. With the seed `2f27ce` no single ring color can do both (the ring would need a luminance of at least 0.295 and at most 0.289). The slightly deeper `281fb4` opens a band, and `--focus-ring` sits in it. Dark roles are authored for dark, not inverted: the text and background swap ends, primary and accent lift to the 5.66:1 and 8.19:1 class on `050315`, and secondary becomes a dark indigo tint.

Type pairing (D-05): Inter variable for display and body, the seed pairing from realtimecolors. Alternatives for the other candidates are added by plan 01-04.

```palette A
light --text oklch(0.1190 0.0436 285.36)
light --background oklch(0.9889 0.0039 286.33)
light --primary oklch(0.3845 0.2173 272.08)
light --secondary oklch(0.9070 0.0475 288.03)
light --accent oklch(0.5143 0.2729 272.97)
dark --text oklch(0.9889 0.0039 286.33)
dark --background oklch(0.1190 0.0436 285.36)
dark --primary oklch(0.6383 0.1988 281.11)
dark --secondary oklch(0.2561 0.0973 279.44)
dark --accent oklch(0.7288 0.1457 283.95)
```

Derived tokens. `--link` blends the primary toward the text color in light (a deeper indigo). In dark it is the lifted accent: blending the dark primary toward the near-white text leaves the sRGB gamut at high lightness, and the checker reports that as OUT-OF-GAMUT, so the dark formula uses the accent as-is (8.19:1). `--on-primary` is the page background color in both themes (light label on the deep light primary, dark label on the lifted dark primary). `--focus-ring` is a mid-tone mix of primary and background in light, and the text color in dark.

```derived
light --surface mix(--secondary 30%, --background)
dark --surface mix(--secondary 60%, --background)
light --link mix(--primary 80%, --text)
dark --link mix(--accent 100%, --background)
light --on-primary mix(--background 100%, --text)
dark --on-primary mix(--background 100%, --text)
light --focus-ring mix(--primary 56%, --background)
dark --focus-ring mix(--text 100%, --background)
```

## Contrast matrix

### Contact Me slice (#contact)

Six pairs cover everything the Contact section paints: body copy, links, the copy-email button label, the toast, and the focus indicator on the page and next to the filled button. Plan 01-04 extends this block with the pairs for every other section; keep it as one block.

```pairs
--text on --background text #contact body copy
--link on --background text #contact links
--on-primary on --primary text #contact copy-email button label
--text on --surface text #contact toast message
--focus-ring on --background focus #contact focus indicator
--focus-ring on --primary focus #contact ring adjacent to filled button
```

Result at tracer time: candidate A passes 12 of 12 rows (2 themes x 6 pairs). Run the checker for the live numbers; they are not copied here so they cannot go stale.
