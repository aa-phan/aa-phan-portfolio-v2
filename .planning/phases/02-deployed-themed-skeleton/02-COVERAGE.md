# Phase 02 API coverage

The shipped site is static (Vite build served by GitHub Pages) and makes no runtime network calls to any third-party service. There is no backend, no fetch, and no SDK in the bundle.

GitHub is used only as deploy and CI tooling, never by the site itself. Those touchpoints are recorded below as opt-outs so the decision is explicit.

| capability | decision | reason |
|---|---|---|
| GitHub Pages API (set Pages source to GitHub Actions) | OPT-OUT | One-time owner setup step run with `gh api` during plan 02-09; not part of the site or its build. |
| GitHub REST API (resolve action tags to commit SHAs) | OPT-OUT | Used once while writing the workflows in plan 02-03 to pin actions; not called at build or run time. |
| GitHub Actions deploy-pages / upload-pages-artifact | OPT-OUT | CI/CD infrastructure in `.github/workflows/deploy.yml`, not a site feature integrating an API. |

Revisit when a later phase adds a runtime integration (for example a contact form service or analytics).
