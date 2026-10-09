# ADR-0005: Inline SVG brand icons

Status: Accepted

Date: 2026-10-09

## Context

The contact section needs GitHub, LinkedIn and Instagram marks. `lucide-react` 1.x, which the vendored motion-primitives components already depend on, ships no brand icons. The site also needs ordinary UI glyphs (mail, download, copy, close, chevrons, sun, moon), which lucide does provide.

## Decision

- GitHub, LinkedIn and Instagram marks are inline SVG React components under `src/components/ui/icons/`, one small file each. Path data is taken from Simple Icons (CC0).
- Each brand icon is `aria-hidden="true"` and sits next to a visible text label, so the link has an accessible name and the icon is decorative.
- UI glyphs come from `lucide-react`.
- No `simple-icons` or `react-icons` dependency is added.

## Consequences

- Zero added dependencies and no bundle cost beyond three small SVGs.
- The project owns three small files, and a changed brand mark means editing them by hand.
- Each brand's own logo-usage guidelines still apply, even though the path data is CC0.
- Colors come from the design tokens (`currentColor`), so the icons follow the light and dark themes.

## Alternatives considered

- `simple-icons` 16.x. Rejected: a large catalog for three marks.
- `react-icons/si` 5.7. Rejected: an extra dependency for three marks, and tree-shaking has to be verified.
- Lucide brand icons. Not available in 1.x.

## Revisit when

More than about six brand marks are needed, at which point a package becomes cheaper than owning the files.
