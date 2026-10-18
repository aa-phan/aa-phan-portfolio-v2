# Architecture Decision Records

One decision per file. An ADR is short, dated and never rewritten after acceptance: a later decision supersedes it instead. The architecture itself is described in [../architecture.md](../architecture.md).

## Template

Each ADR file is named `NNNN-kebab-title.md` and contains:

- A `Status:` line: Proposed, Accepted, or Superseded by NNNN.
- A `Date:` line (YYYY-MM-DD).
- The headings `## Context`, `## Decision`, `## Consequences`, `## Alternatives considered` and `## Revisit when`.

## Log

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| 0001 | [Documentation location and public/private split](0001-documentation-location-and-public-private-split.md) | Superseded by 0008 | 2026-10-09 |
| 0002 | [Skip the skeleton gate for the documentation phase](0002-skip-skeleton-gate-for-docs-phase.md) | Accepted | 2026-10-09 |
| 0003 | [GitHub Pages source, staging, cutover and rollback](0003-github-pages-source-and-cutover.md) | Accepted | 2026-10-09 |
| 0004 | [TypeScript 6.0.x](0004-typescript-6.md) | Accepted | 2026-10-09 |
| 0005 | [Inline SVG brand icons](0005-inline-svg-brand-icons.md) | Accepted | 2026-10-09 |
| 0006 | [Project overlay dialog accessibility](0006-project-overlay-dialog-accessibility.md) | Accepted | 2026-10-09 |
| 0007 | [Vendored motion-primitives](0007-vendored-motion-primitives.md) | Accepted | 2026-10-18 |
| 0008 | [Planning area visibility in the public development repo](0008-planning-area-visibility.md) | Accepted | 2026-10-18 |

## Open decisions

Decisions that are known but not yet made. Each has a point by which it must be settled.

| ID | Decision | Decide by | Notes |
|----|----------|-----------|-------|
| OD-01 | Visibility of this development repo before its first push. Resolved 2026-10-09: the owner's personal contact details were removed from the planning notes and rewritten out of the entire git history, so the repo no longer blocks on this. | Resolved 2026-10-09 | History rewrite verified with a pattern search over every commit and object. The runbook keeps a check as a guard ([deploy-runbook.md](../deploy-runbook.md)). The digits are never written in any public document. |
| OD-02 | Keep or drop react-spring after the signature project rail is measured. | After the signature rail is built and measured | Dropping it saves about 17 kB gzipped; keep it only if it earns the tactile feel. |
| OD-03 | Adopt LazyMotion after the first bundle measurement. | After the first bundle measurement | All-or-nothing: AnimatePresence, layout and drag need the larger feature set, which erodes the saving. |
| OD-04 | Adopt @use-gesture/react only if a react-spring drag needs it. | When a react-spring drag is first needed | Requires a React 19 compatibility check first. Motion already provides drag, tap and hover. |
| OD-05 | GitHub Pages source-switch downtime: rehearse on a throwaway repo, or accept the downtime with the written rollback. | Before the cutover to the user-site URL | Procedure and rollback steps are in ADR-0003 and the [deploy runbook](../deploy-runbook.md). |
| OD-06 | Outcome of the project-overlay dialog accessibility spike (focus trap, Escape, scroll lock, focus return). | During the interaction build, before the overlay ships | See [ADR-0006](0006-project-overlay-dialog-accessibility.md). Native dialog is the fallback. |
| OD-07 | Full prerender of the page. | Late, optional | Default is client rendering plus noscript content and structured data. |
| OD-08 | Font preload. | Only if Lighthouse flags it | Font-display swap is acceptable without it. |
| OD-09 | Optional visible reduce-motion toggle. | After the OS-setting path is verified | Feeds the same single motion preference source. |
| OD-10 | TypeScript 7 adoption. | After launch | Verified to compile the probe cleanly; no reason to adopt it before launch. |
