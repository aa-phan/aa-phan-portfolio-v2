# ADR-0009: Native dialog for project details

Status: Accepted

Date: 2026-10-27

## Context

[ADR-0006](0006-project-overlay-dialog-accessibility.md) required a code spike of the vendored `MorphingDialog` against a seven-point accessibility checklist (focus trap, Escape, scroll lock, inert background, focus return, dialog role and label, keyboard reachable previous, next and close) and named the native `dialog` element as the fallback. It left the outcome as open decision OD-06.

The content phase needs project details to open and close reliably before the morph animation is built. The spike has not been run.

## Decision

Project details open in a native `dialog` element with `showModal()`. This is the fallback path ADR-0006 already describes, chosen without running the `MorphingDialog` spike.

- The top layer provides the focus trap, the inert background and Escape through the `cancel` event, with no extra code.
- Focus return and the scroll lock are explicit code: focus moves to the close button on open and back to the element that opened the dialog on close, and the page scroll is locked with `html:has(dialog[open])`.
- The next phase's morph animates an inner panel rendered inside the dialog, never the dialog box itself, so the native behavior stays intact.
- Open decision OD-06 is resolved by this record.

## Consequences

- The seven-point checklist is met by the platform plus two small pieces of our own code, with no new dependency.
- `MorphingDialog` is not used for project details. It stays vendored and unused until a feature needs it.
- Backdrop blur and the morph apply to elements inside the dialog, because the dialog's own box is not what animates.
- The dialog is modal. A non-modal overlay would need a different element and its own focus handling.

## Alternatives considered

- Run the `MorphingDialog` spike first. Deferred: it would delay the content, and the native dialog is the outcome ADR-0006 expected on any failed point.
- Radix Dialog. Rejected: it solves the checklist but adds a dependency for one overlay.
- A custom focus trap. Rejected: the native `dialog` already provides one.

## Revisit when

The morph animation needs a non-modal overlay, or a later spike shows `MorphingDialog` passes every point and removes code.
