import { useSyncExternalStore, type ReactNode } from 'react'
import { AnimatePresence } from 'motion/react'
// `m` comes from the m-only entry: the same name from the motion/react barrel keeps the full
// `motion` proxy and its feature bundle in the initial chunk (about +25 kB gzipped).
import * as m from 'motion/react-m'
import { featuresLoaded, subscribeFeatures } from '@/anim/featuresStatus'
import { useMotionPreference } from '@/anim/useMotionPreference'
import { durations, easeOut } from '@/anim/tokens'

type ToastPresenceProps = {
  show: boolean
  children: ReactNode
  className?: string
}

/**
 * Enter and exit for the visual toast: opacity plus an 8 px rise over the base duration. Under
 * reduced motion the transition lasts 0 s (MotionConfig 'always' stops transforms but not
 * opacity), so the toast appears and leaves at once. The wrapper is hidden from assistive tech;
 * the live region elsewhere carries the announcement. Before the feature chunk has loaded (or
 * when it failed to) the toast renders at its final state with no animation.
 */
export function ToastPresence({ show, children, className }: ToastPresenceProps) {
  const { reduced } = useMotionPreference()
  const ready = useSyncExternalStore(subscribeFeatures, featuresLoaded, () => false)
  const transition = { duration: reduced ? 0 : durations.base / 1000, ease: easeOut }
  return (
    <AnimatePresence>
      {show ? (
        <m.div
          key="toast"
          aria-hidden="true"
          className={className}
          initial={ready ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={transition}
        >
          {children}
        </m.div>
      ) : null}
    </AnimatePresence>
  )
}
