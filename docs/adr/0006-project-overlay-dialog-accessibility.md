# ADR-0006: Project overlay dialog accessibility

Status: Accepted

Date: 2026-10-09

## Context

Opening a project from the rail shows an overlay that morphs out of the rail item. As a modal dialog it must:

1. Trap keyboard focus inside the overlay while it is open.
2. Close on Escape.
3. Lock background scroll.
4. Make the background inert, so assistive technology and tab order cannot reach it.
5. Return focus to the rail item that opened it.
6. Expose `role="dialog"` with `aria-modal="true"` and a label taken from the project title.
7. Keep previous, next and close reachable and usable by keyboard.

The vendored `MorphingDialog` component from motion-primitives gives the morph animation. Its behavior on the seven points above has not been verified.

The motion spec splits responsibility the same way: motion animates the overlay, and the dialog primitive owns focus, Escape, inert background and scroll lock.

## Decision

Motion owns the overlay animation: `AnimatePresence` plus a shared `layoutId` morph from the rail item's inner card to the overlay panel, with a crossfade for previous and next. The dialog primitive owns everything on the checklist above: focus trap, Escape, inert background, scroll lock and focus return. The two concerns stay separate.

A code spike checks `MorphingDialog` against the seven-point checklist before the rail ships. The spike itself is deferred to the interaction build (Phase 2 or 4) and is not run as part of the documentation work.

- If every point passes, `MorphingDialog` is used as vendored.
- If any point fails, the overlay uses a native `dialog` element opened with `showModal()`. Top-layer rendering makes the rest of the page inert and the `cancel` event handles Escape. Focus return and scroll lock are handled explicitly in our code. Motion animates only the inner panel; the `layoutId` morph targets that inner panel rendered inside the `dialog` element, not the `dialog` element itself.
- Radix Dialog is considered only if both of the above fail, because it adds a dependency.

## Consequences

- Overlay animation and overlay accessibility are separate concerns, so either primitive works with the same motion spec and the same reduced-motion fallback (instant open and close, no morph).
- The native fallback costs a little explicit code (focus return, scroll lock) and no new dependency.
- With the native fallback, the backdrop blur and the morph are applied to elements inside the `dialog`, because the `dialog` element's own box is not what animates.
- The rail cannot ship until the spike result is recorded.

## Alternatives considered

- Adopt `MorphingDialog` without checking it. Rejected: an unverified focus trap and Escape path is an accessibility failure on the site's main interaction.
- Always use the native `dialog` element. Not chosen as the default only because `MorphingDialog` may already pass and would then be less code; it stays the fallback.
- Radix Dialog. Held back: it solves the checklist but adds a dependency for one overlay.
- Build a custom focus trap. Rejected: the native `dialog` element already provides one.

## Revisit when

The spike result is recorded (open decision OD-06), or if the overlay design changes so it is no longer modal.
