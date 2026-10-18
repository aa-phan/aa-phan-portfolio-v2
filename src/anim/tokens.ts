/**
 * Animation tokens: one table drives both libraries (motion spec, "Motion tokens").
 * motion takes stiffness/damping/mass, react-spring takes tension/friction/mass; the
 * numbers are the same. CSS mirrors live in src/styles/tokens.css (--dur-*, --ease-out).
 */
export const springs = {
  snappy: {
    motion: { type: 'spring', stiffness: 500, damping: 32, mass: 1 },
    reactSpring: { tension: 500, friction: 32, mass: 1 },
  },
  gentle: {
    motion: { type: 'spring', stiffness: 170, damping: 26, mass: 1 },
    reactSpring: { tension: 170, friction: 26, mass: 1 },
  },
  bouncy: {
    motion: { type: 'spring', stiffness: 300, damping: 14, mass: 1 },
    reactSpring: { tension: 300, friction: 14, mass: 1 },
  },
} as const

/** Durations in milliseconds. */
export const durations = { fast: 120, base: 220, slow: 420 } as const

/** cubic-bezier(0.22, 1, 0.36, 1) */
export const easeOut = [0.22, 1, 0.36, 1] as const
