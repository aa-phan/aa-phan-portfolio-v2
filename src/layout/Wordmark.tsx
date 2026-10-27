import { cn } from '@/lib/utils'

interface WordmarkProps {
  /** `nav` is the corner size. `finale` is styled by the footer. */
  size: 'nav' | 'finale'
  className?: string
}

/**
 * PHAN by day, PHVNTM by night (D-01). Both strings are always in the DOM; CSS on html[data-theme]
 * shows one, so there is no JS state and no flash. The whole mark is aria-hidden: the link or
 * heading around it carries the accessible name. The A and the V sit in their own span so the
 * later flip (IX-18) can target the glyph. Caps are typed here, not applied with text-transform.
 */
export function Wordmark({ size, className }: WordmarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('wordmark', size === 'nav' ? 'wordmark-nav' : 'wordmark-finale', className)}
    >
      <span className="wordmark-day">
        PH<span className="wordmark-glyph">A</span>N
      </span>
      <span className="wordmark-night">
        PH<span className="wordmark-glyph">V</span>NTM
      </span>
    </span>
  )
}
