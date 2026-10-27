import { Component, lazy, Suspense, type ReactNode } from 'react'
import { useMotionPreference } from '@/anim/useMotionPreference'
import { cn } from '@/lib/utils'

// The motion runtime lives in the vendored primitive, so it is split into its own chunk and
// only requested for visitors who have not asked for reduced motion.
const TextEffect = lazy(() =>
  import('@/components/motion-primitives/text-effect').then((m) => ({ default: m.TextEffect })),
)

type TextRevealProps = {
  children: string
  className?: string
}

type BoundaryProps = { fallback: ReactNode; children: ReactNode }

/** A failed chunk load (offline, stale deploy) leaves the static paragraph instead of a blank tree. */
class ChunkBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/**
 * Word-by-word reveal for a short line of text. The loading, failed and reduced-motion states
 * all render exactly one plain paragraph with the same text, so the static HTML shell and every
 * fallback match. The shell, the loading fallback and the reduced-motion paragraph carry
 * `reveal-pending`, which hides the line (when motion is allowed) until the effect mounts, so it
 * never shows, vanishes and reveals again. The failed-chunk paragraph omits it and shows at once.
 * Per-word slide: about 0.35 s in total (13 segments, stagger
 * 0.05 / 3 s, segment 0.3 / 2 s).
 */
export function TextReveal({ children, className }: TextRevealProps) {
  const { reduced } = useMotionPreference()
  const pending = <p className={cn(className, 'reveal-pending')}>{children}</p>
  if (reduced) return pending
  return (
    <ChunkBoundary fallback={<p className={className}>{children}</p>}>
      <Suspense fallback={pending}>
        <TextEffect
          per="word"
          preset="slide"
          speedReveal={3}
          speedSegment={2}
          className={className}
        >
          {children}
        </TextEffect>
      </Suspense>
    </ChunkBoundary>
  )
}
