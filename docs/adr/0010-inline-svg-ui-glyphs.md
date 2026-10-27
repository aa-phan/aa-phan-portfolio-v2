# ADR-0010: Inline SVG UI glyphs

Status: Accepted

Date: 2026-10-27

## Context

[ADR-0005](0005-inline-svg-brand-icons.md) decided that brand marks are inline SVG components and that ordinary UI glyphs (close, chevrons, download) come from `lucide-react`. That package was never installed. The site needs only a handful of glyphs.

## Decision

UI glyphs are inline SVG components under `src/components/ui/icons/`, written the same way as the brand marks: one small file each, `aria-hidden="true"`, `currentColor` for the fill or stroke, and a visible text label or an accessible name on the control that holds them. The current set is close, previous and next chevrons, and download.

`lucide-react` is not installed. This record supersedes only the UI-glyph bullet of ADR-0005. ADR-0005's brand-icon decision stands.

## Consequences

- No icon dependency and no bundle cost beyond a few small SVGs.
- The project owns each glyph, and a changed glyph means editing its file.
- Glyphs follow the light and dark themes through `currentColor`.
- Components that need a glyph import it from the icons folder, not from a package.

## Alternatives considered

- Install `lucide-react`. Rejected: a large catalog for a handful of shapes, and a dependency to keep current.
- A sprite sheet of symbols. Rejected: more indirection than a few small components.

## Revisit when

The site needs about a dozen UI glyphs, at which point a package or a shared sprite becomes cheaper than owning the files.
