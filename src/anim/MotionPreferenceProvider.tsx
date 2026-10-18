import { useEffect, type ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import { Globals } from '@react-spring/web'
import { useMotionPreference } from '@/anim/useMotionPreference'

/**
 * Feeds the one preference to both animation libraries. 'always' and 'never' (not 'user')
 * keep motion from reading its own media query, so there is exactly one source.
 */
export function MotionPreferenceProvider({ children }: { children: ReactNode }) {
  const { reduced } = useMotionPreference()
  useEffect(() => {
    Globals.assign({ skipAnimation: reduced })
    return () => Globals.assign({ skipAnimation: false })
  }, [reduced])
  return <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>{children}</MotionConfig>
}
