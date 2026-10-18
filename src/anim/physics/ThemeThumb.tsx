import { animated, useSpring } from '@react-spring/web'
import { springs } from '@/anim/tokens'

type ThemeThumbProps = {
  on: boolean
  className?: string
}

/**
 * The theme toggle thumb (IX-10). react-spring owns this element alone: translateX only,
 * snappy spring. No CSS transition utilities belong on it. The initial value is the target,
 * so mounting does not animate.
 */
export function ThemeThumb({ on, className }: ThemeThumbProps) {
  const { x } = useSpring({ x: on ? 20 : 0, config: springs.snappy.reactSpring })
  return (
    <animated.span
      aria-hidden="true"
      data-part="theme-thumb"
      className={className}
      style={{ transform: x.to((value) => `translateX(${value}px)`) }}
    />
  )
}
