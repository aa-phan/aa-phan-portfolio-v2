# ADR-0007: Vendored motion-primitives

Status: Accepted

Date: 2026-10-18

## Context

The hero role line uses the motion-primitives `TextEffect` for a short word-by-word reveal. The library ships source, not a package: components are served as registry JSON, its CLI writes into a `components/` folder at the repository root (outside `src/`), and its npm package is stale. The component depends on `motion` and on a `cn()` helper, and nothing else.

## Decision

- `TextEffect` was copied byte for byte from <https://motion-primitives.com/c/text-effect.json> on 2026-10-18 into `src/components/motion-primitives/text-effect.tsx`. The registry entry declared `motion` as its only dependency and no registry dependencies, and one file. No local patches were made.
- SHA-256 of the file as shipped: `4b93c0ea6b9d747d69b7a244d5279f790a11a784e73713f3fe17a636abf53484`. The file imports only `react`, `motion/react` and `@/lib/utils`, and uses no network, storage or dynamic code.
- The folder is excluded from lint and from Prettier, so the hash stays valid. Upstream code trips two oxlint correctness rules (unsafe optional chaining); excluding the folder is preferred to patching upstream logic.
- Only the animation layer (`src/anim`) imports it, through a lazy boundary (`React.lazy`), so the `motion` component runtime is a separate chunk. Lint enforces that sections never import it.
- Reduced-motion visitors get a plain paragraph and never download the chunk. A failed chunk load (offline, stale deploy) leaves the same static paragraph, through an error boundary.
- Settings: per word, `slide` preset, `speedReveal` 3, `speedSegment` 2. The role line splits into 13 segments (7 words and the whitespace between), giving about 0.35 s in total, inside the 420 ms entrance budget.

Measured gzipped sizes (level 9) at adoption:

| Build | Initial JS | Effect chunk |
|-------|-----------|--------------|
| Lazy (shipped) | 86,954 B | 49,991 B, requested only after first paint and never under reduced motion |
| Eager import (measured in the research probe) | about 134.5 kB | none |

## Consequences

- Upstream fixes are pulled by hand: fetch the registry JSON again, review the diff, and record the new hash here or in a superseding ADR.
- The initial bundle stays about 47 kB gzipped smaller than an eager import would make it.
- The static role line is in the first paint, then re-reveals for about 0.35 s when the chunk arrives. This is inherent to a reveal effect on text already present in the HTML; whether it reads as intentional on a phone is a taste call settled at review.
- The 7-word line has 7 stagger steps, more than the 6-item guideline, while staying inside the total time envelope (the whole stagger is about 0.2 s).

## Alternatives considered

- The motion-primitives CLI. Rejected: it writes to a repository-root folder and its package is stale.
- An eager import. Rejected: about 50 kB gzipped more initial JavaScript for a decorative effect.
- A hand-written word reveal. Rejected: the vendored component already handles the screen-reader copy and hides the per-word fragments from assistive technology.

## Revisit when

The hero text effect gets its section-treatment polish, `motion` changes major version, or LazyMotion is adopted (open decision OD-03, which can use the bundle numbers recorded above).
