// `m` comes from the m-only entry so the nav does not pull the full `motion` proxy into the
// initial chunk (see ToastPresence).
import * as m from 'motion/react-m'
import { springs } from '@/anim/tokens'
import { cn } from '@/lib/utils'

type NavIndicatorProps = {
  className?: string
}

/**
 * The scroll-spy bar (IX-08, D-17): 2 px of --accent, 4 px under the active link's label. Every
 * link renders it only while active, so motion's shared layout id slides it from the previous
 * link to the new one with the snappy spring. Before the feature chunk has loaded, when it
 * failed to, or under reduced motion (the chunk is never fetched), the bar is a plain element
 * that simply sits under the active link.
 */
export function NavIndicator({ className }: NavIndicatorProps) {
  return (
    <m.span
      layoutId="nav-indicator"
      transition={springs.snappy.motion}
      aria-hidden="true"
      data-part="nav-indicator"
      className={cn('absolute inset-x-0 -bottom-1.5 h-0.5 bg-accent', className)}
    />
  )
}
