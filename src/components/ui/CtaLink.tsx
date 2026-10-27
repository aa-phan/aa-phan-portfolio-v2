import type { MouseEvent, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CtaLinkProps {
  href: string
  variant: 'filled' | 'outlined'
  download?: boolean
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
  className?: string
  children: ReactNode
}

/**
 * Pill call to action (D-05). The ink flood is a decorative span that interactions.css grows
 * from the bottom edge on hover, keyboard focus and touch press; the label is a second span so
 * it can lift and change color without moving the anchor's box.
 */
export function CtaLink({ href, variant, download, onClick, className, children }: CtaLinkProps) {
  return (
    <a
      href={href}
      download={download}
      onClick={onClick}
      className={cn(
        'cta relative isolate inline-flex min-h-11 items-center justify-center overflow-hidden rounded-pill px-6 text-s font-medium',
        variant === 'filled'
          ? 'cta-filled bg-primary text-on-primary'
          : 'cta-outlined border border-border-strong text-text',
        className,
      )}
    >
      <span className="cta-flood" aria-hidden="true" />
      <span className="cta-label">{children}</span>
    </a>
  )
}
