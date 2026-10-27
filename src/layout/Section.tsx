import type { ReactNode } from 'react'
import { Container } from '@/layout/Container'
import { cn } from '@/lib/utils'

export function Section({
  id,
  title,
  mood = 'tight',
  className,
  aside,
  children,
}: {
  id: string
  title: string
  /** Vertical rhythm: tight is 96 px top and bottom, airy opens with 160 px on top. */
  mood?: 'tight' | 'airy'
  className?: string
  /** Optional content on the heading's baseline at the right (the Projects crate index). */
  aside?: ReactNode
  children?: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        // Anchors clear the 64 px sticky nav at 768 px and up; on phones the top bar scrolls away.
        'md:scroll-mt-(--nav-h)',
        mood === 'airy' ? 'pt-40 pb-24' : 'py-24',
        className,
      )}
    >
      <Container>
        {aside ? (
          <div className="flex items-baseline justify-between gap-4">
            <h2 id={`${id}-heading`} className="text-xl">
              {title}
            </h2>
            {aside}
          </div>
        ) : (
          <h2 id={`${id}-heading`} className="text-xl">
            {title}
          </h2>
        )}
        {children}
      </Container>
    </section>
  )
}
