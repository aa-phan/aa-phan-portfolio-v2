# ADR-0003: GitHub Pages source, staging, cutover and rollback

Status: Accepted

Date: 2026-10-09

## Context

The current iPod site is served from the `aa-phan.github.io` repository by the legacy "Deploy from a branch" Pages source. The live setting was read from the GitHub API on 2026-10-09:

```
gh api repos/aa-phan/aa-phan.github.io/pages --jq '{build_type, source, html_url}'
{"build_type":"legacy","html_url":"https://aa-phan.github.io/","source":{"branch":"main","path":"/"}}
```

So the live site is published from branch `main`, path `/`, with `build_type` `legacy`. A Vite build cannot be served that way: the new site needs the "GitHub Actions" source, which changes how the live URL is published.

This development repository is not yet on GitHub. The OD-01 gate on pushing it is resolved (see the [ADR log](README.md)).

## Decision

1. The new site is built by GitHub Actions and first deployed as a staging project site of this repository. `VITE_BASE` is set to `/` plus this repository's name plus `/`, so the staging URL is `https://aa-phan.github.io/aa-phan-portfolio-v2/` and CI catches broken sub-path assets before launch.
2. The cutover is an additive commit on top of the existing `aa-phan.github.io` history. First the iPod site is tagged (`v1-ipod`) and that tag and a matching branch are pushed, so the old site stays recoverable. Then the iPod files are removed and the new site source is added in a normal commit, merged through a pull request.
3. The Pages source of `aa-phan.github.io` is switched from the legacy branch source to GitHub Actions in the same sitting as the merge, and the deploy workflow is then triggered with `workflow_dispatch` so the new site goes live immediately.
4. Force-pushing `aa-phan.github.io` is forbidden, for the cutover and for the rollback.
5. Private planning files and the private reference folder are not copied into `aa-phan.github.io`. Only the source the site needs, the workflow and `docs/` are.

The step-by-step procedure, the workflow settings and the smoke test are in the [deploy runbook](../deploy-runbook.md).

## Consequences

- The live site and its history stay recoverable at every point: the old site is a tag, the cutover is one revertible commit, and nothing is rewritten.
- There may be a short window, while the Pages source is switched, in which the live URL returns a 404. This is possible but unverified (open decision OD-05); the switch and the workflow trigger are done back to back to keep it short.
- Staging on the project URL proves the Actions pipeline, base-path handling and asset paths before the user-site URL is touched.
- Staging requires pushing this repository to GitHub, which OD-01 no longer blocks.

## Rollback

If the new site is broken or the switch goes wrong:

1. In the `aa-phan.github.io` repository settings, set the Pages source back to "Deploy from a branch", branch `main`, folder `/`.
2. Revert the cutover commit with `git revert`, or restore the iPod files from the `v1-ipod` tag with a normal commit.
3. Never force-push.

## Alternatives considered

- Replace the repository history with the new site (force-push). Rejected: it destroys the old site's history and the rollback path.
- Deploy the new site from a built-output branch instead of Actions. Rejected: it keeps build artifacts in git history and loses the CI gates.
- Keep the iPod site where it is and serve the new site only from the project URL. Rejected: the new site is meant to replace the iPod site at the user-site URL.
- Rehearse the source switch on a throwaway repository first. Not required; tracked as OD-05 so the owner can choose to accept the unverified downtime with the written rollback.

## Revisit when

After the cutover, once the source-switch downtime has been observed (OD-05), or if GitHub changes how Pages sources are switched.
