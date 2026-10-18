# ADR-0001: Documentation location and public/private split

Status: Superseded by 0008

Date: 2026-10-09

## Context

The project is documentation-first: major decisions get written answers before any code. Some of those documents are long-lived project documentation that should be published with the site. Others are working notes: exploration, rejected options, and source material such as the owner's full resume, which contains personal contact details that must never be published.

## Decision

- The architecture doc, the ADRs and the deploy runbook live in the top-level `docs/` folder and are written to be published with the site.
- The design brief, content inventory, information architecture and wireframes, design tokens and motion spec are working documents. They stay in the private planning area of this development repo.
- The planning area and the reference folder (the source resume and reference videos) never go into the public site repo.
- The reference folder is git-ignored in this repo, so a broad `git add` cannot stage it.
- Every file under `docs/` is self-contained: it never links into a private area, never names a private planning path or decision label, and never contains the phone number.

## Consequences

- Anything the public needs from a working document must be restated in `docs/`, because `docs/` cannot point at the private area.
- Design detail for each phase stays private, so a reader of the public repo sees the decisions and their rationale but not the exploration behind them.
- The visibility of this development repo itself was tracked as OD-01 in the [ADR log](README.md). It is resolved: personal contact details were rewritten out of the history, so the first push is no longer blocked.

## Alternatives considered

- Keep every document in the private planning area and copy the public ones out later. Rejected: copies drift, and the public docs would not be reviewed where they are written.
- Put every document in `docs/` and publish all of it. Rejected: the working documents carry exploration noise and, in places, personal data.

## Revisit when

The development repo is made public, or when the public site repo is created and the split needs to be applied to a real remote.
