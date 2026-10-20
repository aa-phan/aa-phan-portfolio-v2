# Phase 3: Content-Complete Site - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-19
**Phase:** 03-content-complete-site
**Areas discussed:** DESIGN.md adoption, Section layouts (static), Content gaps, Navigation build

---

## DESIGN.md adoption

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, adopt it | PHAN/PHVNTM wordmarks, footer, 404 in Phase 3; flip in Phase 4 | ✓ |
| Crate only, no PHVNTM | Keep the records metaphor, drop the night persona | |
| Neither | Phase 1 plan as written | |

| Option | Description | Selected |
|--------|-------------|----------|
| Palette D | Same indigo, neutral grounds; 152 checks pass | ✓ |
| Keep palette A | No token change | |

| Option | Description | Selected |
|--------|-------------|----------|
| Archivo | One family with a width axis; +42 kB font | ✓ |
| Keep Inter | No change | |
| Archivo display + Inter body | Two families | |

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, poster hero | Mega name, corner facts | ✓ |
| Bigger name only | Scale up, no corner facts | |
| Keep current hero | As wireframed | |

| Option | Description | Selected |
|--------|-------------|----------|
| CSS hovers in Phase 3 | CSS owns hover; springs stay in Phase 4 | ✓ |
| All hover work in Phase 4 | Plain color states now | |

**User's choice:** All recommended options.

---

## Section layouts (static)

| Option | Description | Selected |
|--------|-------------|----------|
| Index rows + native `<details>` | No-JS, keyboard-accessible bullets | ✓ |
| Index rows, bullets always open | Long on phones | |
| Cards (Phase 1 wireframes) | Card layout | |

| Option | Description | Selected |
|--------|-------------|----------|
| Sleeve rail + plain `<dialog>` | Scroll-snap rail, unanimated dialog per ADR-0006 | ✓ |
| Sleeve rail + details below | Panel under the rail | |
| Static list now, rail in Phase 4 | Plain list | |

| Option | Description | Selected |
|--------|-------------|----------|
| Statement, drop the slider | Amends SEC-02 and IX-13 | ✓ |
| Statement now, decide later | | |
| Plain list now, slider in Phase 5 | SEC-02 as written | |

| Option | Description | Selected |
|--------|-------------|----------|
| Facts layout | Led by December 2026; amends SEC-03 | ✓ |
| Facts now, flip card in Phase 5 | | |
| Compact card as planned | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Typographic only | Title, tracklist, label; token shades | ✓ |
| Typographic + a generated mark | SVG pattern per project | |
| You decide | | |

---

## Content gaps

| Option | Description | Selected |
|--------|-------------|----------|
| I'll list public repos | Owner supplies URLs | ✓ |
| GitHub profile only | | |
| No links in Phase 3 | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Claude drafts, I approve | Resume facts only, owner sign-off | ✓ |
| Bullets verbatim | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Replace with my own line | Owner writes a night-side line | ✓ |
| Keep it | | |
| Cut it | | |

| Option | Description | Selected |
|--------|-------------|----------|
| I export a phone-free PDF | Most reliable | ✓ |
| Script it from the source PDF | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Collect later | Owner-input checkpoints during plan/execute | ✓ |
| Give them now | | |

---

## Navigation build

| Option | Description | Selected |
|--------|-------------|----------|
| Animate in Phase 3 | Pill morph and scroll-spy with motion | ✓ |
| Static now, animate in Phase 4 | | |

| Option | Description | Selected |
|--------|-------------|----------|
| All six | Matches IA and pill menu | ✓ |
| Four links | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Always visible | Solid fill, scroll-spy readable | ✓ |
| Hide on scroll down | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Hero top bar + pill menu | Toggle visible on first paint | ✓ |
| Pill menu only | | |

---

## Claude's Discretion

- Content module shapes, sleeve context shades, toast wording, image pipeline details, 404 markup, wording of doc amendments.

## Deferred Ideas

- IX-18 flip, crate physics, overlay morph, toggle groove: Phase 4.
- SEC-01 motion and count-up: Phase 5.
- OG image, favicon refresh, launch gates: Phase 6.
- `/jury` score after Phase 3.
