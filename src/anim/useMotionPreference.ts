import { useSyncExternalStore } from 'react'

const hasMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'
const query = () => window.matchMedia('(prefers-reduced-motion: reduce)')

function subscribe(onChange: () => void): () => void {
  if (!hasMatchMedia()) return () => {}
  const mql = query()
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

const getSnapshot = (): boolean => (hasMatchMedia() ? query().matches : false)
const getServerSnapshot = (): boolean => false

/**
 * The single JS source of the visitor's reduced-motion preference. Feeds motion's MotionConfig,
 * react-spring's skipAnimation flag and any decorative wrapper. The CSS guard in base.css is
 * the only other consumer, and it reads the same media query natively.
 */
export function useMotionPreference(): { reduced: boolean } {
  return { reduced: useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) }
}
