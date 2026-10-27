import type { ReactNode } from 'react'
import { Container } from '@/layout/Container'
import { cn } from '@/lib/utils'

export function Section({
  id,
  title,
  className,
  children,
}: {
  id: string
  title: string
  className?: string
  children?: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn('scroll-mt-6 py-16', className)}
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
