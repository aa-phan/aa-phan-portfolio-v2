# Phase 2: Deployed Themed Skeleton - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-09
**Phase:** 2-Deployed Themed Skeleton
**Areas discussed:** Repo and first deploy, Skeleton hero, Theme toggle, Reduced-motion proof, CI gates

---

## Repo and first deploy
Options: create repo/push/deploy staging (chosen) vs workflows only. Visibility: public (chosen) vs private.

## Skeleton hero
Scope: hero plus bare section stubs (chosen) vs hero only vs hero plus token showcase. CTAs: real links without toast (chosen) vs inert buttons.

## Theme toggle
Two-state following system (chosen) vs three-state. Placement: fixed top-right (chosen) vs inline in hero.

## Reduced-motion proof
TextEffect on hero role line (chosen) vs throwaway demo vs both. Tests: Vitest plus small Playwright smoke (chosen) vs Vitest only.

## CI gates
Chosen: contrast check, unit and e2e tests, Prettier with tailwind class sorting. Not chosen: Lighthouse CI.

## Claude's Discretion
Scaffold details, lint/budget/path-case implementation, placeholder resume handling, test config.

## Deferred Ideas
Lighthouse CI, three-state toggle, token showcase page.
