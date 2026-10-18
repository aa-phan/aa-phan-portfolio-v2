---
phase: 02-deployed-themed-skeleton
plan: 09
subsystem: deploy
tags: [github-pages, github-actions, ci, adr, runbook, od-01-guard, playwright]
requires:
  - phase: 02-deployed-themed-skeleton
    provides: ci.yml and deploy.yml (02-03), the verify chain and gates (02-04, 02-06, 02-08), the themed hero and motion (02-05, 02-07)
provides:
  - the Phase 2 skeleton live at https://aa-phan.github.io/aa-phan-portfolio-v2/ through a normal (never forced) push of main
  - ci.yml and deploy.yml both green on ubuntu-latest for the pushed commits 76a5239 (first push) and 3342834 (current main tip, after one fix-forward of a flaky e2e test)
  - docs/adr/0008-planning-area-visibility.md (Accepted), reversing the ADR-0001 planning-area rule for this repository
  - docs/deploy-runbook.md rewritten to the real workflows, with the staging record, a Local verification section and the cross-platform lockfile risk
  - the planning workflow config and state snapshot tracked and published
affects: [phase-03, cutover]
status: complete
commits: 4
plan_head_before: 52f22bdacbcac246409dbd4250d86f4da26b88c4
plan_head_after: 33428343c9a081735cdcdc8ce50b3aeb20db9ee6
actuals:
  tokens: 9000
  tasks: 3
  commits: 4
tech-stack:
  added: []
  patterns: [guards run on every public ref and tree immediately before a push, fast-forward-only promotion of the phase branch to main, one-way public push gated by an owner decision recorded as an ADR]
key-files:
  created:
    - docs/adr/0008-planning-area-visibility.md
    - .planning/state.json
  modified:
    - docs/adr/README.md
    - docs/adr/0001-documentation-location-and-public-private-split.md
    - docs/deploy-runbook.md
    - .planning/REQUIREMENTS.md
    - .planning/PROJECT.md
    - .planning/config.json
    - .gitignore
key-decisions:
  - "Owner chose keep-tracked: the planning area and assistant instruction file stay tracked and public in this development repo; recorded as a reversal of ADR-0001 in ADR-0008, with every ADR-0001 rule that still holds restated"
  - "ADR-0001 is Superseded by 0008 (Status line and log row only); REQUIREMENTS Out of Scope row and PROJECT key-decision row now cite ADR-0008"
  - "Owner chose ff-main: local main was fast-forwarded to the phase branch with git merge --ff-only and pushed normally"
requirements-completed: [FND-01, FND-02, FND-03]
coverage:
  - id: D1
    description: "A normal push of main ran ci.yml and deploy.yml on ubuntu-latest for 76a5239 and both concluded success (npm ci, verify chain, Playwright install, e2e; build, configure-pages, upload, deploy, curl check)"
    requirement: FND-02
    verification:
      - kind: command
        ref: "gh run list --commit 76a5239 -> CI success (run 39104898609), Deploy success (run 39104898622); commit 3342834 -> CI success (run 39108357544), Deploy success (run 39108357514)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The staging URL returns 200 with the name and every asset URL under /aa-phan-portfolio-v2/assets/ (3 assets, each 200); the full Playwright suite passes against the live URL"
    requirement: FND-01
    verification:
      - kind: command
        ref: "E2E_BASE_URL=https://aa-phan.github.io/aa-phan-portfolio-v2/ npx playwright test -> 17 passed (run against both the 76a5239 and the 3342834 deployments)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The 150 kB initial-JS budget is enforced in both workflows because both run npm run verify; the pushed build measured 86954 B gzipped"
    requirement: FND-03
    verification:
      - kind: command
        ref: "npm run check:budget -> initial JS: 86954 B gzipped of 150000 B budget (local, and inside the green CI and deploy runs)"
        status: pass
    human_judgment: false
  - id: D4
    description: "OD-01 guards printed nothing before the decision, immediately before the push, and on the public refs after it; keep-tracked documentation and metadata checks pass"
    requirement: FND-01
    verification:
      - kind: command
        ref: "history over all refs, history over remote refs, tracked tree, origin/main tree: 0, 0, 0, 0 before and after the push; docs verify printed DOCS-VERIFY-OK"
        status: pass
    human_judgment: false
  - id: D5
    description: "Real-device smoke test (hero, theme toggle surviving reload, resume stand-in PDF, mail app hand-off, phone-width layout, role-line reveal feel, no console errors or 404s on desktop)"
    requirement: FND-01
    verification: []
    human_judgment: true
    rationale: "Plan Task 3 human-check: phone feel, mail app hand-off and console inspection are not covered by headless Chromium. Owner runs the runbook smoke test."
duration: "~35 min (continuation from the Task 1 and Task 2 checkpoints)"
completed: 2026-10-18
---

# Phase 2 Plan 09: Staging deploy Summary

**The Phase 2 skeleton is live at https://aa-phan.github.io/aa-phan-portfolio-v2/ via a guarded normal push of main; CI and deploy are green on Linux and the full Playwright suite (17 tests) passes against the live URL.**

## Performance

- **Duration:** ~35 min for this continuation (the plan's two checkpoints were resolved by the owner before it)
- **Completed:** 2026-10-18
- **Tasks:** 3 (Task 1 decision, Task 2 Pages source, Task 3 tracer)
- **Files modified:** 9

## Accomplishments

- Task 1 decision recorded: `keep-tracked`. It reverses the recorded decision (REQUIREMENTS.md Out of Scope row, PROJECT.md key decision, ADR-0001 planning-area rule); Task 3 step 1 documented the reversal as ADR-0008.
- Task 1 remote guards (run earlier, before the options were presented, counts only): refs listed by `git ls-remote --heads --tags origin` missing locally: 0; commits on those refs matching the phone pattern: 0; files in the origin/main tree matching: 0.
- Task 2 (Pages source) was done by the orchestrator at the owner's instruction and verified here, not redone: `gh api repos/aa-phan/aa-phan-portfolio-v2/pages --jq .build_type` prints `workflow`; visibility prints `public`.
- Planning metadata disposition (keep-tracked): `.planning/config.json` and `.planning/state.json` were committed alone in 8a557e2 before the guards ran. config.json keys added: `workflow.use_worktrees` and `workflow._auto_chain_active`. state.json top-level keys: `contract`, `flavor`, `milestone`, `phases`, `next`, `updated_at`.
- ADR-0008 (Accepted, 2026-10-18) states the reversal in plain words, restates every ADR-0001 rule that still holds, and lists the two untrack options as alternatives. ADR-0001's Status line and its log row read `Superseded by 0008`; the 0008 row was added.
- Runbook rewritten: real ci.yml and deploy.yml steps with SHA-pinned versions, the staging record (repository already existed and was public, owner set the Pages source, first deploy ran from the push), a Local verification section, and the Linux lockfile risk.
- Pre-push OD-01 guards immediately before the push (counts): history over all local and fetched refs 0; history over the remote refs 0; tracked tree 0; origin/main tree 0. Re-run on the public refs after the push: history 0, tree 0.
- Pushed `main` from 7ca940b to 76a5239 with a normal `git push origin main` after `git merge --ff-only` of the phase branch (7ca940b was a direct ancestor, so no non-ff merge and no force). No rejection, so no `gh auth setup-git` was needed.
- First pushed SHA: `76a5239c1588421cffbc1e46dacd4bf229a2770f`. The metadata push `7014714` then failed CI on one flaky test (below); the fix-forward `3342834` is the current main tip and is green.
  - CI: https://github.com/aa-phan/aa-phan-portfolio-v2/actions/runs/39104898609 -> success
  - Deploy static content to Pages: https://github.com/aa-phan/aa-phan-portfolio-v2/actions/runs/39104898622 -> success
- Live check: status 200, name present, all three asset URLs under `/aa-phan-portfolio-v2/assets/` return 200, no root-absolute asset URLs. `E2E_BASE_URL=https://aa-phan.github.io/aa-phan-portfolio-v2/ npx playwright test`: 17 passed, 0 failed.

## Task Commits

1. **Task 1 and Task 2:** checkpoints resolved by the owner and the orchestrator; no code.
2. **Task 3 step 1, metadata:** `8a557e2` chore(planning): track workflow config and state snapshot (ADR-0008)
3. **Task 3 steps 1 and 2, docs:** `76a5239` docs(02-09): ADR-0008 reverses planning-area rule, runbook matches real workflows
4. **Plan metadata:** `7014714` docs(02-09): complete staging deploy plan (SUMMARY, STATE, ROADMAP, REQUIREMENTS)
5. **CI fix-forward:** `3342834` fix(02-09): reduced-motion thumb test waits for the first changed frame
6. A final docs commit records this fix-forward in the SUMMARY (the `commits:` count above is measured up to `3342834`).

## Deviations from Plan

### Owner-overrulable decisions

**1. [Rule 2 - Missing critical functionality] `.planning/milestone.lock` git-ignored, not published**
- **Found during:** Task 3 step 1
- **Issue:** The plan names only config.json and state.json; an untracked machine lock file `.planning/milestone.lock` was also present and the owner did not say what to do with it. Left alone it would sit untracked, and a broad add could publish it.
- **Fix:** Added `.planning/milestone.lock` to `.gitignore` with a comment, because it is a machine lock with no documentation value. Not published. The owner can overrule by removing the entry and committing the file.
- **Files modified:** `.gitignore`
- **Commit:** 76a5239

**2. Branch handling executed as `ff-main`, one extra push to follow**
- The plan pushes `main` from the working branch; the owner chose to fast-forward local `main` to `gsd/phase-02-deployed-themed-skeleton`. Done with `git checkout main && git merge --ff-only`, then a normal push. Executor commits are made on the phase branch (the pre-commit protection forbids committing on `main`), so the plan-metadata commit that follows this SUMMARY is promoted the same way (fast-forward, normal push). That final push is docs-only and re-runs both workflows.

**3. [Rule 1 - Bug] Flaky reduced-motion e2e test failed CI on the Linux runner**
- **Found during:** Task 3 step 6 (the second push, `7014714`; the first push `76a5239` passed)
- **Issue:** `tests/e2e/motion.spec.ts` "reduced motion: theme thumb snaps to its target" (from plan 02-07) read the thumb transform exactly two animation frames after the click. On the slower, cold Linux runner the React commit had not landed yet, so it read the start value (`matrix(1, 0, 0, 1, 0, 0)` instead of `matrix(1, 0, 0, 1, 20, 0)`). CI run 39105035973 failed on it; the deploy run for the same commit succeeded.
- **Fix:** the test now resolves on the first frame whose transform differs from the start (up to 120 frames). A snapped thumb must jump straight to its target; a spring would show an in-between value first, so the test still discriminates. A CI-environment timing fix, pushed normally (no force, no history rewrite).
- **Files modified:** `tests/e2e/motion.spec.ts`
- **Verification:** 20 consecutive local repeats pass, full suite 17 passed, lint, typecheck and format check clean; CI run 39108357544 and Deploy run 39108357514 green on `3342834`; live suite 17 passed against the new deployment.
- **Commit:** `3342834`

**Total deviations:** 2 auto-fixed (1 Rule 2, 1 Rule 1), 1 process note. **Impact:** none on scope; the Linux lockfile risk did not occur.

## Authentication Gates

None. The Pages source setting was an owner-side step completed by the orchestrator before this continuation.

## Known Stubs

None added by this plan. `public/resume.pdf` is the intentional "Resume coming soon." stand-in from plan 02-02, resolved by a later content phase.

## Issues Encountered

- Local Playwright runs became very slow (a 16 minute run with 2 spurious failures) while leftover preview and Playwright processes from interrupted runs were alive and the machine load average was above 15. After killing them the full suite passed in about 5 s. Not a code problem.
- First push attempt did not run: my guard script compared padded `wc -l` output as a string, so the all-zero test failed and nothing was pushed (the guards themselves had printed 0). Re-ran with trimmed counts and pushed.
- The CI run annotates that `ubuntu-latest` migrates to Ubuntu 26 on 2026-10-19. Worth watching on the next run; no action taken.
- A supplementary bare 10-digit scan of the tracked tree hit 4 files; all were checked with digits masked and are OKLab matrix coefficients, PDF byte offsets and a note that records the same false positive. No phone number.

## Next Phase Readiness

- Phase 2 is complete pending the owner's real-device smoke test (D5, human-check) and the phase verification step.
- The owner should run the runbook smoke test on a phone against the staging URL.

## Threat Flags

None. No new network endpoints, auth paths or schema changes; the push scope was the one the owner decided in Task 1.

## Self-Check: PASSED

FOUND: docs/adr/0008-planning-area-visibility.md, .planning/state.json, docs/deploy-runbook.md. FOUND commits 8a557e2 and 76a5239 (76a5239 is on origin/main).
