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
| 0001 | [Documentation location and public/private split](0001-documentation-location-and-public-private-split.md) | Accepted | 2026-10-09 |
| 0002 | [Skip the skeleton gate for the documentation phase](0002-skip-skeleton-gate-for-docs-phase.md) | Accepted | 2026-10-09 |

## Open decisions

Decisions that are known but not yet made. Each has a point by which it must be settled.

| ID | Decision | Decide by | Notes |
|----|----------|-----------|-------|
| OD-01 | Visibility of this development repo before its first push. Its history contains private planning notes, one of which records the owner's personal contact details. Keep the repo private, or rewrite history, before making it public. | Before any git push of this repo (blocks first push) | Hard precondition, checked by the deploy runbook. The planning note itself is not edited here, and the digits are never written in any public document. |
| OD-02 | Keep or drop react-spring after the signature project rail is measured. | After the signature rail is built and measured | Dropping it saves about 17 kB gzipped; keep it only if it earns the tactile feel. |
| OD-03 | Adopt LazyMotion after the first bundle measurement. | After the first bundle measurement | All-or-nothing: AnimatePresence, layout and drag need the larger feature set, which erodes the saving. |
| OD-04 | Adopt @use-gesture/react only if a react-spring drag needs it. | When a react-spring drag is first needed | Requires a React 19 compatibility check first. Motion already provides drag, tap and hover. |
| OD-05 | GitHub Pages source-switch downtime: rehearse on a throwaway repo, or accept the downtime with the written rollback. | Before the cutover to the user-site URL | Rollback steps live in the deploy runbook. |
| OD-06 | Outcome of the project-overlay dialog accessibility spike (focus trap, Escape, scroll lock, focus return). | During the interaction build, before the overlay ships | See ADR-0006 once written. Native dialog is the fallback. |
| OD-07 | Full prerender of the page. | Late, optional | Default is client rendering plus noscript content and structured data. |
| OD-08 | Font preload. | Only if Lighthouse flags it | Font-display swap is acceptable without it. |
| OD-09 | Optional visible reduce-motion toggle. | After the OS-setting path is verified | Feeds the same single motion preference source. |
| OD-10 | TypeScript 7 adoption. | After launch | Verified to compile the probe cleanly; no reason to adopt it before launch. |
