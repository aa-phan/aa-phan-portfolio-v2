---
phase: 02-deployed-themed-skeleton
plan: 03
subsystem: infra
tags: [github-actions, ci, github-pages, supply-chain, sha-pinning]
requires:
  - phase: 02-deployed-themed-skeleton
    provides: Prettier config, test:e2e script and Playwright CI webServer (plan 02-01)
provides:
  - .github/workflows/ci.yml - Linux CI on push and pull_request - npm ci, npm run verify, Chromium install, Playwright smoke
  - .github/workflows/deploy.yml - Pages deploy on push to main and workflow_dispatch - verify re-run, upload ./dist, deploy-pages, post-deploy curl for the name
  - All seven action references pinned to full commit SHAs with the tag in a comment, each re-resolved through the GitHub API
affects: [02-04, 02-06, 02-08, 02-09]
status: complete
commits: 2
plan_head_before: 360053da1c1f5207c0a330551c3c833b13f60fb8
plan_head_after: af877fe
actuals:
  tokens: 2500
  tasks: 2
  commits: 2
tech-stack:
  added: []
  patterns: [SHA-pinned actions with version comment, env-driven VITE_BASE, least-privilege workflow permissions, verify chain called by script name]
key-files:
  created: [.github/workflows/ci.yml, .github/workflows/deploy.yml]
  modified: []
key-decisions:
  - "deploy.yml re-runs npm run verify before publishing rather than depending on a reusable CI workflow (Research Open Question 4)"
  - "Both workflows call the verify script by name so the chain can grow in plans 02-04, 02-06 and 02-08 without workflow edits"
requirements-completed: [FND-02, FND-01]
---

# Phase 2 Plan 03: CI and Pages Deploy Workflows Summary

Two SHA-pinned GitHub Actions workflows: ci.yml runs the shared verify chain plus the Playwright smoke suite on Linux, and deploy.yml re-runs verify, publishes ./dist to Pages with minimal permissions and curls the live URL for the name. Nothing was pushed and no workflow has run.

## Task 1: Tracer, ci.yml (commit 778d40c)

- Triggers push and pull_request (never the privileged target variant), concurrency group `ci-${{ github.ref }}` with cancel-in-progress, `permissions: contents: read`, `VITE_BASE: /aa-phan-portfolio-v2/`.
- One `verify` job on ubuntu-latest: checkout, setup-node (`lts/*`, npm cache), `npm ci`, `npm run verify`, `npx playwright install --with-deps chromium`, `npm run test:e2e`. No performance-audit step (D-12).
- Tracer feedback gate: `<verify>` is automated-only, so it was re-run end to end (Prettier parse, pin regex, API tag resolution, trigger and step greps) and passed. Tracer verified end-to-end - expanding. No checkpoint.

## Task 2: deploy.yml (commit af877fe)

- Triggers push to main and workflow_dispatch; permissions contents read, pages write, id-token write; concurrency group `pages`; `VITE_BASE` with a comment that the cutover sets it to `/`.
- `build` job: checkout, setup-node, `npm ci`, `npm run verify` (re-runs every gate), configure-pages, upload-pages-artifact `path: ./dist`.
- `deploy` job: needs build, environment `github-pages` with `page_url`, step `deployment` using deploy-pages, then `curl -fsS --retry 6 --retry-delay 5 --retry-all-errors` piped to `grep -q "Aaron Phan"`.

## Pins (all confirmed against tags with `gh api repos/actions/NAME/commits/TAG`)

| Action | Tag | SHA |
|--------|-----|-----|
| actions/checkout | v7.0.1 | 3d3c42e5aac5ba805825da76410c181273ba90b1 |
| actions/setup-node | v7.1.0 | 949feb2413d6458794dcd2491c4babbbce0c15c1 |
| actions/configure-pages | v6.0.0 | 45bfe0192ca1faeb007ade9deae92b16b8254a0d |
| actions/upload-pages-artifact | v5.0.0 | fc324d3547104276b827a68afc52ff2a11cc49c9 |
| actions/deploy-pages | v5.0.1 | 368f82528645a54fb793d4d04e342629a3f51346 |

All five matched the RESEARCH list (verified 2026-10-09); no differences.

## Plan-level verification

| Check | Result |
|-------|--------|
| Prettier --check .github/workflows | pass (both files parse and are formatted) |
| Every uses line is a 40-char SHA with a vX.Y.Z comment | pass |
| Every pin re-resolved through gh api | pass, no mismatch |
| ci.yml: pull_request, test:e2e, one verify, one VITE_BASE; no pull_request_target, no lighthouse | pass |
| deploy.yml: 5 actions, workflow_dispatch, pages write, id-token write, path ./dist, environment, retry-all-errors; no lighthouse | pass |
| origin/main unchanged (7ca940b), nothing pushed | pass |

Not run: the workflows themselves. They first execute in plan 02-09 after the push; `npm run verify` does not exist yet (plan 02-04 creates it).

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None. Mitigations T-02-05 (SHA pins checked against the API), T-02-06 (permissions as specified) and T-02-07 (no privileged target trigger) are applied; T-02-32 honoured (only .github/workflows was formatted or checked).

## Next

Ready for the remaining wave 2 and wave 3 plans (02-04 creates the verify script both workflows call).
