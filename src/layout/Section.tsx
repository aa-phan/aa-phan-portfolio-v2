import type { ReactNode } from 'react'
import { Container } from '@/layout/Container'
import { cn } from '@/lib/utils'

export function Section({
  id,
  title,
  mood = 'tight',
  className,
  children,
}: {
  id: string
  title: string
  /** Vertical rhythm: tight is 96 px top and bottom, airy opens with 160 px on top. */
  mood?: 'tight' | 'airy'
  className?: string
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
        <h2 id={`${id}-heading`} className="text-xl">
          {title}
        </h2>
        {children}
      </Container>
    </section>
  )
}
