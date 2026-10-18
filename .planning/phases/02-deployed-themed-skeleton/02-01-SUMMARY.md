---
phase: 02-deployed-themed-skeleton
plan: 01
subsystem: infra
tags: [vite, react, typescript, tailwind-v4, prettier, playwright, design-tokens]
requires:
  - phase: 01-decisions-and-documentation
    provides: palette A tokens, typography and elevation ladders, hero content contract, folder layout
provides:
  - Vite 8 + React 19 + TS 6 + Tailwind v4 scaffold at the repo root with env-driven base (VITE_BASE)
  - Static hero shell in index.html identical to the React Hero (visible with JavaScript disabled)
  - tokens.css (palette A, light and dark) mapped by @theme inline; no dark: variants in components
  - Prettier with prettier-plugin-tailwindcss configured from the first source file
  - Playwright smoke spec (JS-disabled and React-mount hero tests) against vite preview under the base
affects: [02-02, 02-03, 02-04, 02-05, 02-06, 02-07, 02-08, 02-09]
status: complete
commits: 1
plan_head_before: 55345688c67c8895ed16f5fe9c9351e60ff1123b
plan_head_after: 5da3376c6f038b4fed25258dfc00c21c1ef7d198
actuals:
  tokens: 4500
  tasks: 2
  commits: 1
tech-stack:
  added: [vite 8.3.4, react 19.3.1, typescript 6.0.3, tailwindcss 4.3.3, motion 14.0.0, "@react-spring/web 10.1.2", prettier 3.9.10, "@playwright/test 1.64.1", vitest 5.0.5, jsdom 30.1.3, oxlint 1.88.0]
  patterns: [static-shell-plus-identical-react-hero, data-theme CSS-variable token contract, base-aware Playwright config]
key-files:
  created: [package.json, package-lock.json, vite.config.ts, tsconfig.json, tsconfig.app.json, tsconfig.node.json, prettier.config.mjs, .prettierignore, playwright.config.ts, index.html, src/main.tsx, src/app/App.tsx, src/app/Page.tsx, src/sections/Hero/Hero.tsx, src/layout/Container.tsx, src/styles/index.css, src/styles/tokens.css, tests/e2e/smoke.spec.ts]
  modified: [.gitignore]
key-decisions:
  - "Task 1 legitimacy gate satisfied by the owner's reply 'approved' with no re-pins or drops; plan ranges used as written"
  - "Hero shell and React Hero share one class contract so plan 02-04's parity test can compare class sets"
  - "Plan commits made on branch gsd/phase-02-deployed-themed-skeleton because main is a protected branch for the commit assertion"
requirements-completed: [FND-01, NAV-01, DSN-01]
---

# Phase 2 Plan 01: Themed Static Hero Tracer Summary

Vite 8 + React 19 + TS 6 + Tailwind v4 scaffold whose production build under `VITE_BASE=/aa-phan-portfolio-v2/` serves a palette-A themed hero (name, role line, three CTAs) that is visible with JavaScript disabled and unchanged after React mounts.

## Task 1: Package legitimacy gate (checkpoint:human-verify, blocking-human)

Satisfied by the owner's reply, recorded verbatim: **"approved"**. No packages were dropped or re-pinned, so the plan's dependency ranges were used as written. No commit (the gate produces no files).

Evidence gathered before approval (lockfile-only resolution outside the repo, `--ignore-scripts`, nothing installed in the repo until approval):

- All 23 direct dependencies have no preinstall, install or postinstall scripts; only the optional transitive `fsevents` has `hasInstallScript`.
- `npm audit`: 0 vulnerabilities.
- Flags raised and known to the owner at approval: react 19.3.1 repository URL moved to github.com/react/react (maintainers unchanged); several packages were published 13-15 Oct 2026; motion 14.0.0 is about 16 days old.

Resolved versions (`npm ls --depth=0` after install):

| Package | Range | Resolved |
|---------|-------|----------|
| react / react-dom | ^19.3.0 | 19.3.1 |
| motion | ~14.0.0 | 14.0.0 |
| @react-spring/web | ~10.1.2 | 10.1.2 |
| clsx / tailwind-merge | ^2.1.1 / ^3.7.0 | 2.1.1 / 3.7.0 |
| @fontsource-variable/inter | ^5.3.0 | 5.3.0 |
| vite / @vitejs/plugin-react | ^8.3.4 / ^6.1.2 | 8.3.4 / 6.1.2 |
| typescript | ~6.0.3 | 6.0.3 |
| tailwindcss / @tailwindcss/vite | ^4.3.3 | 4.3.3 |
| oxlint | ^1.87.0 | 1.88.0 |
| vitest / jsdom | ^5.0.3 / ^30.1.2 | 5.0.5 / 30.1.3 |
| @testing-library/react / dom | ^16.3.3 / ^10 | 16.3.3 / 10.4.2 |
| @playwright/test | ~1.64.0 | 1.64.1 |
| prettier / prettier-plugin-tailwindcss | ^3.9.9 / ^0.8.1 | 3.9.10 / 0.8.1 |
| @types/node / react / react-dom | ^24 / ^19 / ^19 | 24.19.2 / 19.3.0 / 19.3.0 |

Task 2 re-check after the real `npm install` (131 packages, 0 vulnerabilities): the only lockfile entry with `hasInstallScript` is `fsevents@2.3.3` (optional), matching the approved list.

## Task 2: Tracer (commit 5da3376)

- Hand-written scaffold (no create-vite), env-driven `base` via `loadEnv`, `@` alias, tsconfig trio without `baseUrl`, Prettier config with `tailwindStylesheet`, Playwright config with `E2E_BASE_URL` override.
- `tokens.css`: five role tokens plus nine `color-mix` derived tokens per theme, elevation, z-index, duration and easing tokens. `index.css`: `@import 'tailwindcss' source(none)`, `@theme inline` map (14 colors, fonts, text ladder, tracking, radius, shadows).
- Hero shell in `index.html` and `Hero.tsx` share the class contract; the resume href is `%BASE_URL%resume.pdf` in the shell and `import.meta.env.BASE_URL` in TSX.
- Verification (all pass): build with `VITE_BASE=/aa-phan-portfolio-v2/` puts script and resume href under the base; unset base gives `/assets/`; Playwright 2 passed (JS-disabled hero, React mount with zero page errors, body background `oklch(0.9889 0.0039 286.33)`); `tsc -b` clean; `format:check` clean; no `dark:` under `src`; `npm ls` shows motion 14.0.0, typescript 6.0.3, @react-spring/web 10.1.2; acceptance greps all satisfied (13 `oklch(` and 21 `color-mix(in oklch` occurrences in tokens.css).
- Tracer feedback gate: interactive mode, `<verify>` is automated-only, so it was re-run end-to-end and passed; no checkpoint raised.

Note on `src/styles/index.css`: `@import './tokens.css'` is placed directly after the Tailwind import and before the `@source` lines (strict CSS ordering, as RESEARCH allowed); plan 02-02 appends `base.css`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Prettier scanned the harness-generated `.gsd/` folder**
- **Found during:** Task 2 `npm run format:check`
- **Issue:** `.gsd/dispatch-isolation-sentinel.json` (untracked, gitignored by its own `.gsd/.gitignore`) made `prettier --check .` fail.
- **Fix:** Added `.gsd/` to `.prettierignore` (plan list plus `.gsd/` and `references/`, the private reference folder named in the plan).
- **Files modified:** `.prettierignore`
- **Commit:** 5da3376

**2. [Rule 3 - Blocking] Commit assertion refused the protected branch**
- **Found during:** Task 2 commit
- **Issue:** HEAD was `main`, which the pre-commit assertion treats as protected (`git.base-branch --is-protected main` returned true; no `allow_default_branch_commits` override in config).
- **Fix:** Re-homed onto the documented phase branch `gsd/phase-02-deployed-themed-skeleton` (name from `phase_branch_template`) with `git checkout -b`; no ref was rewritten and config was not changed. The orchestrator must decide how to land it (merge/fast-forward into main, or set `git.allow_default_branch_commits`). Later plans should start from this branch.
- **Commit:** 5da3376

### Plan note

The plan's listed `files_modified` includes `package-lock.json`; it was generated by `npm install` and committed. `tsconfig.node.json` includes `*.config.ts`, so `playwright.config.ts` and `vite.config.ts` are both type-checked.

## Auth gates

None.

## Known Stubs

None. The hero links to `resume.pdf` and `#contact`, which do not exist yet by design; plan 02-02 adds the stand-in resume and the contact anchor (documented in the plan, not a stub in this plan's code).

## Threat Flags

None. No new network endpoints, auth paths or trust-boundary surface beyond the plan's threat register (T-02-SC mitigated by the Task 1 gate and the install-script re-check).

## Self-Check: PASSED

- All 18 created files and the modified `.gitignore` exist and are committed in 5da3376 (verified from `git status` after commit).
- Commit 5da3376 is an ancestor of HEAD; ledger-measured `commits: 1` from `plan_head_before`.
