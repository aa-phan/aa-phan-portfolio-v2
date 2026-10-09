# Deploy runbook

Status: Draft

How the site is built, deployed to a staging project URL, cut over to the user-site URL and rolled back. The reasoning is in [ADR-0003](adr/0003-github-pages-source-and-cutover.md); the build-side design is in [architecture.md](architecture.md). Draft because the workflows do not exist yet: the scaffold milestone writes them and then corrects this document wherever reality differs.

## Environments

| Environment | URL | VITE_BASE |
|-------------|-----|-----------|
| Staging (project site of this repo) | https://aa-phan.github.io/aa-phan-portfolio-v2/ | /aa-phan-portfolio-v2/ |
| Production (user site) | https://aa-phan.github.io/ | / |

Assets are module-imported, so no absolute asset paths exist. Anything under `public/` that JavaScript references goes through `import.meta.env.BASE_URL`.

## Prerequisites

1. OD-01 resolved (2026-10-09): the owner's personal contact details were rewritten out of this repo's entire history. Before any push, re-run a pattern search for phone numbers over history (`git log --all -G'[0-9]{3}[-. )]+[0-9]{3}[-.][0-9]{4}' -E --oneline` should print nothing) as a guard.
2. Node 22.12 or newer locally, `lts/*` in CI.
3. A committed lockfile (`npm ci` fails without one).
4. The Pages source set to GitHub Actions on the deploying repository.
5. `gh` authenticated, for the checks below.

## Workflows

Both workflows are written in the scaffold milestone. Pin every action by commit SHA at scaffold time and keep the version in a comment.

**ci.yml**, on `push` and `pull_request`:

1. `npm ci`
2. Typecheck
3. Lint (includes the import-boundary rules)
4. Build with the project-path `VITE_BASE`
5. Path-case check on the Linux runner
6. Initial JavaScript budget: the build fails if initial JS exceeds 150 kB gzipped

**deploy.yml**, on `push` to `main` and on `workflow_dispatch`, following the Vite static-deploy guide:

- Permissions: `contents: read`, `pages: write`, `id-token: write`.
- Concurrency group `pages`.
- Build job: `actions/checkout` v7, `actions/setup-node` v7, `actions/configure-pages` v6, then the build with `VITE_BASE` set for the target, then `actions/upload-pages-artifact` v5 with path `./dist`.
- Deploy job: `actions/deploy-pages` v5, in environment `github-pages`.

## First staging deploy

1. Stop unless the OD-01 guard search in Prerequisites prints nothing. If it prints anything, do nothing below.
2. Create the GitHub repository named `aa-phan-portfolio-v2` with the visibility the owner chooses.
3. Push `main`.
4. In the repository settings, set Pages, Source, to GitHub Actions.
5. Run the deploy workflow with `workflow_dispatch` and watch it finish.
6. Open https://aa-phan.github.io/aa-phan-portfolio-v2/ and confirm the page loads and every asset resolves under `/aa-phan-portfolio-v2/` (browser network panel shows no 404 and no request to the bare root).
7. Run the [smoke test](#smoke-test).

## Cutover checklist

Implements the cutover decisions in ADR-0003. Do it in one sitting. The live site is the iPod site until the last steps.

1. Confirm staging passes the smoke test and the owner has approved it.
2. Clone `aa-phan/aa-phan.github.io` fresh into an empty directory.
3. Tag the current site and push the tag: `git tag v1-ipod` then `git push origin v1-ipod`.
4. Push a matching branch from the tagged commit: `git push origin v1-ipod:refs/heads/v1-ipod`.
5. Create a working branch, for example `cutover`.
6. Remove the iPod files with `git rm`.
7. Copy in the new site source and its workflow files. Do not copy private planning files or the private reference folder.
8. Commit, push the working branch and open a pull request into `main`.
9. Check that CI passes on the pull request, then merge it. The history stays additive.
10. In the same sitting, set Pages, Source, to GitHub Actions on `aa-phan.github.io`.
11. Run the deploy workflow with `workflow_dispatch` and watch the run to completion.
12. Run the [smoke test](#smoke-test) against https://aa-phan.github.io/. If anything fails, go to [Rollback](#rollback).

## Smoke test

Against the URL being tested:

- The URL loads and the hero is visible.
- Every asset returns 200 (no 404s in the network panel).
- The theme toggle switches between light and dark and the choice survives a reload.
- The resume download works.
- Copy email works and gives visible confirmation.
- No errors in the console.
- A mobile viewport check: layout holds at phone width, the project rail scrolls by touch, and tap targets are reachable.

## Rollback

If the new site is broken after the cutover:

1. In the `aa-phan.github.io` settings, set Pages, Source, back to "Deploy from a branch", branch `main`, folder `/`.
2. Run `git revert` on the cutover merge commit (use `-m 1` for a merge commit), push it through a pull request or directly to `main`, and wait for the legacy build to publish.
3. Or restore the old site from the tag with a normal commit: check out the files from `v1-ipod` (`git checkout v1-ipod -- .`), commit and push.
4. Never force-push `aa-phan.github.io`, for the rollback or for anything else.
5. Re-run the smoke test against https://aa-phan.github.io/ to confirm the iPod site is back.

## Known risks

- The Pages source switch may cause a short 404 window. This is unverified (OD-05). Switch and trigger the workflow back to back, or rehearse on a throwaway repository first.
- Linux runners are case-sensitive and the owner's macOS filesystem is not, so an import that differs only in case works locally and fails in CI. The path-case check exists for this.
- A stale CDN cache can serve the old site for a few minutes after a deploy. Hard-refresh or add a query string before concluding a deploy failed.
- A missing lockfile makes `npm ci` fail in both workflows.
