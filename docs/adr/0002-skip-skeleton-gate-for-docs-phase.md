# ADR-0002: Skip the skeleton gate for the documentation phase

Status: Accepted

Date: 2026-10-09

## Context

The delivery workflow normally requires a deployed walking skeleton in the first milestone, so that hosting, build and deploy risks surface early. This project deliberately made its first milestone documentation-only, so that no code is written before the major decisions have written answers. A deployed skeleton in that milestone would contradict the documentation-first rule.

## Decision

The skeleton gate is skipped for the documentation milestone. The first deployable skeleton is the scaffold milestone that follows: a Vite, React, TypeScript and Tailwind app deployed by GitHub Actions to the project URL, with CI, a JavaScript budget, light and dark tokens and one motion-preference source.

The architecture doc (`docs/architecture.md`) and the deploy runbook (`docs/deploy-runbook.md`) are the contract the scaffold implements.

## Consequences

- Documentation cannot validate feel or performance. The scaffold milestone must therefore deploy early, and real-device spikes follow rather than being assumed.
- Hosting and base-path risks stay unproven until the scaffold deploys, which is why the runbook is written as a checklist the scaffold executes.

## Alternatives considered

- Treat the architecture doc as the skeleton contract inside the documentation milestone, and add a minimal deployed page there. Rejected: it would put code in a milestone defined as code-free, and the scaffold milestone does the same job with real CI.

## Revisit when

Never for this milestone. The decision applies to future documentation-only milestones, each of which should state its own skip explicitly.
