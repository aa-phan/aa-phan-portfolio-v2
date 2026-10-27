import { useSyncExternalStore, type ReactNode } from 'react'
// `m` comes from the m-only entry so the pill does not pull the full `motion` proxy into the
// initial chunk (see ToastPresence).
import * as m from 'motion/react-m'
import { featuresLoaded, subscribeFeatures } from '@/anim/featuresStatus'
import { durations, easeOut, springs } from '@/anim/tokens'
import { useMotionPreference } from '@/anim/useMotionPreference'

type PillMorphProps = {
  /** False is the collapsed pill, true is the expanded panel. */
  open: boolean
  /**
   * Classes for the fixed layout root that holds the morphing box. Give it the collapsed height
   * and bottom-align the box, so the root never resizes and the box grows upward out of it.
   */
  rootClassName?: string
  /** Classes for the morphing box itself (ground, border, shadow, width, height). */
  className?: string
  /** Classes for the content wrapper, which differ between the row and the panel. */
  contentClassName?: string
  'aria-label'?: string
  children: ReactNode
}

/** Fully round when collapsed, the panel radius when open (matches --radius-panel). */
const RADIUS = { collapsed: 9999, expanded: 28 } as const

/**
 * The pill that grows into its menu panel in place (IX-07, D-17). The box is a layout animation
 * with the gentle spring. It sits inside a fixed, full-width layout root rather than being the
 * root itself: motion makes a `layoutRoot` element's own box change instant, so the root must be
 * a different element from the one that morphs. The root ignores pointer events, so the empty
 * strip beside the pill never blocks a tap. The radius lives in `style` so motion can correct it while the box scales, and the content
 * wrapper is `layout="position"` so labels move but never stretch. Content swaps with an
 * opacity fade only, so the box never holds both the row and the panel at once.
 *
 * Until the feature chunk has loaded, after it failed to, and under reduced motion (it is never
 * fetched) every `m` element is a plain element: the state change is instant.
 */
export function PillMorph({
  open,
  rootClassName,
  className,
  contentClassName,
  'aria-label': ariaLabel,
  children,
}: PillMorphProps) {
  const { reduced } = useMotionPreference()
  const ready = useSyncExternalStore(subscribeFeatures, featuresLoaded, () => false)
  const fade = { duration: reduced ? 0 : durations.fast / 1000, ease: easeOut }
  return (
    <m.div layout layoutRoot className={rootClassName}>
      <m.nav
        layout
        aria-label={ariaLabel}
        className={className}
        style={{ borderRadius: open ? RADIUS.expanded : RADIUS.collapsed }}
        transition={reduced ? { duration: 0 } : springs.gentle.motion}
      >
        <m.div
          key={open ? 'panel' : 'row'}
          layout="position"
          className={contentClassName}
          initial={ready && open ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={fade}
        >
          {children}
        </m.div>
      </m.nav>
    </m.div>
  )
}
