# Design References (user-supplied)

Source files live in `/references/` (355.mp4, 445.mp4, 539.mp4). Notes below come from still frames extracted with ffmpeg, so timing and physics are inferred, not observed. Verify feel with the user.

## 539.mp4 — Batch Merch portfolio (by Cambree Bernkopf, X post 2104999693113766152) — CHOSEN SIGNATURE
- Light grey page, faint dot grid, tiny script logo top-center, About/Contact in corners.
- A metal rail with ~10 hanging garments. The item under the cursor lifts out and enlarges; neighbors shift aside.
- Click opens a focused detail view: rail blurred behind, item centered, prev/next arrows, name and index (e.g. 08/20), Close at top-right, "See availability" pill.
- Bottom newsletter ticker.
- Caveat: hover-driven. Decision: mobile uses swipe on the rail plus tap to open.
- Candidate mapping for this portfolio: Projects (or the whole hero) as the handled object; project detail opens as a morphing in-page overlay.

## 445.mp4 — audiobook app floating nav (phone mockup)
- Bottom pill nav (Home, Search, Profile) expands in place into frosted-glass panels (menu, search, settings), then collapses.
- One element morphing between states; strong mobile pattern.
- Candidate mapping: mobile nav / section switcher via motion layout animations.

## 355.mp4 — Trajectory-style marketing site
- Pastel gradient illustrated hero (paper plane, clouds), cream/navy alternating sections, card carousel, accordion list, oversized cloud-textured wordmark footer.
- Headline and footer letters appear distorted near the cursor (probable cursor-reactive text).
- Not chosen as the signature; usable as tone reference (softness, large type, alternating background bands).

## Takeaways
- One spatial or physical idea per site; state changes morph in place.
- Effects are not spread across every section.
