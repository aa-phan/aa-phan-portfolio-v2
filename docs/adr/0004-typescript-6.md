# ADR-0004: TypeScript 6.0.x

Status: Accepted

Date: 2026-10-09

## Context

The `create-vite` scaffold pins TypeScript to the 6.0 line. TypeScript 7.0.2, the native compiler, also passed `tsc -b` on the 2026-10-08 probe build of this stack (Vite 8, React 19, motion 14, Tailwind 4), so it is a drop-in candidate. The project also needs the `@/*` import alias that the vendored motion-primitives components use.

## Decision

Use TypeScript `~6.0.3`, the scaffold default, during build-out.

The `@/*` alias is declared in `tsconfig.app.json` under `paths` as `"@/*": ["./src/*"]`, without `baseUrl` (TypeScript 6 and 7 resolve `paths` without it), and mirrored in the Vite `resolve.alias` so the editor, the typechecker and the bundler agree.

## Consequences

- The project stays on the version the scaffold, the Vite plugin and the lint setup are tested against, so there is one less moving part while the site is built.
- The lockfile is committed, so the exact 6.0.x version is reproducible in CI.
- The alias is configured in two places and both must change together.
- Moving to 7.x later should be a version bump plus a clean `tsc -b`, because the probe already compiled.

## Alternatives considered

- TypeScript 7.0.x now. Rejected for build-out: it works on the probe, but it brings no benefit the project needs yet and adds risk to the toolchain while the rest of the stack is also new.
- A looser range such as `^6`. Rejected: `~6.0.3` keeps the minor version fixed until it is changed on purpose.

## Revisit when

After launch (open decision OD-10), or earlier if a dependency requires TypeScript 7.
