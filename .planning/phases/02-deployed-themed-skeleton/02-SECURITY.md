---
phase: "02"
slug: "deployed-themed-skeleton"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-10-27"
---

# Phase 02 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| npm registry → repo | Packages and their install scripts enter the build | Third-party code (supply chain) |
| Repo → public GitHub remote | Every push publishes code, planning notes and history | Owner contact details (phone must never cross) |
| CI runner → GitHub Pages | The build job uploads `dist`, the deploy job publishes it | Built site; Pages write and OIDC tokens |
| Browser storage → page | The theme key is read back into the page before paint | One untrusted string (`theme`) |
| motion-primitives registry → `src/` | Vendored `TextEffect` source copied in | Third-party code (pinned by sha256) |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-02-SC | Tampering | npm installs | high | mitigate | Owner-approved legitimacy gate (02-01), `~` pins on motion and typescript, committed lockfile, only fsevents has an install script | closed |
| T-02-01 | Information disclosure | `public/resume.pdf` | high | mitigate | Stand-in PDF built from scratch; `check:no-phone` scans `.pdf` | closed |
| T-02-02 | Information disclosure | Font and asset requests | medium | mitigate | Fontsource self-hosting; same-origin fonts e2e test | closed |
| T-02-03 | Information disclosure | mailto CTA exposes email | low | accept | Email confirmed public (Phase 1 content inventory G-07) | closed |
| T-02-04 | Tampering | Static shell drifting from React hero | low | accept | Visual drift only; hero parity unit test | closed |
| T-02-05 | Tampering | `uses:` lines in workflows | high | mitigate | Every action pinned to a full SHA, re-resolved against its tag | closed |
| T-02-06 | Elevation of privilege | Workflow token permissions | medium | mitigate | ci `contents: read`; deploy grants Pages write and OIDC to the deploy job only | closed |
| T-02-07 | Elevation of privilege | Pull request workflows | low | mitigate | `pull_request` only, no secrets | closed |
| T-02-08 | Tampering | Animation boundary bypass by dynamic import | medium | mitigate | Fixture dynamic import must be flagged by the boundary test | closed |
| T-02-09 | Repudiation | Gates weakened via ignore files | low | mitigate | Ignore files exempt only fixtures, generated output, vendored code and prose docs | closed |
| T-02-10 | Tampering | Inline theme script reads storage | low | mitigate | Allowlist `light`/`dark`; junk-value unit test | closed |
| T-02-11 | Denial of service | Storage or matchMedia blocked | low | mitigate | Every storage and matchMedia call in try/catch (subscribe path fixed in 0ceafe1); throwing-storage e2e test | closed |
| T-02-12 | Information disclosure | Browser storage contents | low | mitigate | Only the `theme` key is written, only from `src/lib/theme.ts` | closed |
| T-02-13 | Elevation of privilege | Inline script vs future CSP | low | accept | Pages cannot set headers; meta CSP deferred to hardening | closed |
| T-02-14 | Information disclosure | `dist` (HTML, JS, PDF) | high | mitigate | `check:no-phone` (spaced groups and Flate PDF text since f0dde8d) runs in verify before upload | closed |
| T-02-15 | Information disclosure | Phone gate output in CI logs | medium | mitigate | Prints file and offset only; tests assert no digits | closed |
| T-02-16 | Information disclosure | Test fixtures in public repo | high | mitigate | Probes built at runtime from digit groups; OD-01 guards | closed |
| T-02-17 | Denial of service | Bundle growth | medium | mitigate | 150 kB gzip budget, boundary proven both ways (95.7 kB now) | closed |
| T-02-18 | Tampering | A gate silently passing | medium | mitigate | Negative test or forced-failure run per gate | closed |
| T-02-19 | Tampering | Vendored `text-effect.tsx` | medium | mitigate | sha256 recorded in ADR-0007 and matched; imports reviewed; lint limits importers | closed |
| T-02-20 | Denial of service | Failed TextEffect chunk | low | mitigate | Error boundary, chunk-abort e2e test, 3 s CSS fallback | closed |
| T-02-21 | Spoofing | Screen readers reading word fragments | low | mitigate | Fallbacks render one plain paragraph; full sentence asserted | closed |
| T-02-22 | Information disclosure | `docs/contrast-matrix.md` | low | mitigate | Negative grep for private paths, IDs and phone shapes | closed |
| T-02-23 | Tampering | Contrast gate weakened | low | mitigate | Phase 1 thresholds, 38-ratio test, tampered-token test | closed |
| T-02-24 | Repudiation | Matrix diverging from tokens | low | mitigate | Stale matrix fails verify | closed |
| T-02-25 | Information disclosure | Push of history to public remote | high | mitigate | History and tree guards before every push (runbook; pattern widened in 87ab3d5) | closed |
| T-02-26 | Information disclosure | Planning notes in public repo | high | mitigate | Owner keep-tracked decision recorded as a reversal in ADR-0008 | closed |
| T-02-27 | Tampering | Deploying a build that fails a gate | medium | mitigate | Deploy build job runs verify before upload, after a passing e2e job | closed |
| T-02-28 | Tampering | Remote history rewritten | medium | mitigate | Fast-forward pushes only, no force anywhere | closed |
| T-02-29 | Elevation of privilege | Pages deploy token | low | mitigate | Pages write and OIDC on the deploy job only | closed |
| T-02-30 | Information disclosure | Phone digits in CI logs | medium | mitigate | Gate and guards print names and offsets only | closed |
| T-02-31 | Tampering | Same-wave formatting overlap (02-02) | low | mitigate | Plan formatted only its own paths; repo-wide format check clean | closed |
| T-02-32 | Tampering | Same-wave formatting overlap (02-03) | low | mitigate | Plan formatted only workflow files; repo-wide format check clean | closed |
| T-02-33 | Tampering | CI chain differs from local verify | low | mitigate | Both workflows call `npm run verify` exactly once | closed |
| T-02-34 | Information disclosure | Planning metadata files | low | mitigate | Committed alone in 8a557e2 under keep-tracked; `milestone.lock` ignored | closed |
| T-02-35 | Tampering | Browser and apt download in deploy workflow | medium | mitigate | `playwright install --with-deps` moved to a separate e2e job with no Pages permissions and no artifact upload (6eb90c5) | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-02-01 | T-02-03 | The email address is confirmed public (Phase 1 content inventory, ruling G-07) | Owner (plan 02-01) | 2026-10-18 |
| AR-02-02 | T-02-04 | Shell and React hero drift is visual only and caught by the parity unit test | Owner (plan 02-01) | 2026-10-18 |
| AR-02-03 | T-02-13 | GitHub Pages cannot set response headers; a meta CSP needs the inline script hash and waits for the hardening phase | Owner (plan 02-05) | 2026-10-18 |
| AR-02-04 | T-02-25 | Two known false positives for the phone guard (commit 4517011: all-nines example in 02-REVIEW.md; commit b56e593: viewport widths in 01-07-PLAN.md) are allowed; any other hit still stops a push. Recorded in the deploy runbook | Owner | 2026-10-27 |

*Accepted risks do not resurface in future audit runs.*

**Residual note (not a threat):** the phone gate cannot read PDF text in uncompressed streams or CID/custom-encoded fonts. The real resume gets a manual check before it replaces the stand-in (runbook, Workflows).

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-10-27 | 35 | 34 | 1 (T-02-11, low, non-blocking) | gsd-security-auditor at 906274c |
| 2026-10-27 | 36 | 36 | 0 | orchestrator: T-02-11 fixed (0ceafe1), unregistered e2e download registered as T-02-35 and fixed (6eb90c5) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-10-27
