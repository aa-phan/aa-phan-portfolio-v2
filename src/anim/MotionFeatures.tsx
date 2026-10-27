import { useEffect, useState, type ReactNode } from 'react'
import { LazyMotion, type FeatureBundle } from 'motion/react'
import { markFeaturesLoaded } from '@/anim/featuresStatus'
import { useMotionPreference } from '@/anim/useMotionPreference'

const never = () => new Promise<FeatureBundle>(() => {})

function loadFeatures(): Promise<FeatureBundle> {
  return import('./features').then((mod) => {
    markFeaturesLoaded()
    return mod.default
  }, never)
}

/** Warm the chunk once after first paint so the first toast animates without a wait. */
function warm(): void {
  void import('./features').catch(() => {
    // Offline or stale chunk: components simply stay static.
  })
}

/**
 * The one LazyMotion boundary. It leaves LazyMotion's enforcement flag off, because the
 * vendored text-effect primitive renders full `motion` components.
 *
 * A failed load (offline, stale deploy) returns a promise that never settles, so `m` components
 * stay static and no unhandled rejection is raised. Visitors who prefer reduced motion never
 * download the bundle either: nothing would animate for them, so the loader never settles and
 * the idle warm-up is skipped.
 */
export function MotionFeatures({ children }: { children: ReactNode }) {
  const { reduced } = useMotionPreference()
  // Chosen once at mount: LazyMotion calls its loader a single time, when it mounts.
  const [loader] = useState(() => (reduced ? never : loadFeatures))

  useEffect(() => {
    if (reduced) return
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(warm)
      return () => window.cancelIdleCallback(handle)
    }
    const timer = setTimeout(warm, 1500)
    return () => clearTimeout(timer)
  }, [reduced])

  return <LazyMotion features={loader}>{children}</LazyMotion>
}
