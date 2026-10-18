# ADR-0008: Planning area visibility in the public development repo

Status: Accepted

Date: 2026-10-18

## Context

[ADR-0001](0001-documentation-location-and-public-private-split.md) kept the working documents (exploration, plans, state snapshots, the assistant instruction file) in a private planning area and named "the development repo is made public" as its revisit trigger. That trigger has fired: this repository is public, it hosts the staging site through GitHub Pages, and its main branch has carried the planning area and the assistant instruction file since 2026-10-09. The earlier rule and the remote therefore already disagreed. No option removes what is already public without rewriting remote history, which is never done here.

The owner was offered three choices before the next push: keep the planning area tracked and public, stop tracking it from this push on, or stop tracking it and also drop it from the unpushed local commits.

## Decision

This ADR reverses, for this development repository only, the ADR-0001 rule that the working documents stay in a private planning area. The planning area and the assistant instruction file stay tracked and public here. The workflow configuration and the state snapshot kept by the planning tool are committed with them, in one dedicated commit before the push. A machine lock file written by the planning tool has no documentation value and is git-ignored.

Every other ADR-0001 rule still holds and is restated here so that this ADR carries everything that still applies:

- The architecture doc, the ADRs and the deploy runbook live in the top-level `docs/` folder and are written to be published with the site.
- The reference folder (the source resume and reference videos) never goes into any public repository, and it stays git-ignored in this repo so a broad `git add` cannot stage it.
- The site repo (`aa-phan.github.io`) receives only the built site at cutover, never the planning area or the reference folder.
- Every file under `docs/` is self-contained: it never links into a private area, never names a private planning path or decision label, and never contains the phone number.
- The phone number is never published anywhere. Before every push the history and tree guards in the deploy runbook must print nothing.

## Consequences

- Plans, summaries, state snapshots and the assistant instruction file are browsable by anyone, for this phase and every future phase. Nothing pushed can be unpublished.
- The planning workflow keeps committing its documents, and they are backed up on GitHub.
- Privacy now rests on the guards rather than on a private area: the phone-number history and tree searches run before each push and print only commit hashes or file names.
- ADR-0001 is superseded by this ADR. Its file is unchanged apart from its Status line.

## Alternatives considered

- Stop tracking the planning area from this push on. Rejected by the owner: the Phase 2 planning commits would still be pushed as history, and the planning documents would lose their remote backup.
- Stop tracking it and also drop it from the unpushed local commits. Rejected by the owner: it rewrites local commit hashes quoted in summaries and has the same loss of backup, for little privacy gain since copies already public stay public.

## Revisit when

The development repository and the site repository merge, the owner wants the planning area private again (which would also need a decision about the already-public history), or the planning area gains content that must not be public.
