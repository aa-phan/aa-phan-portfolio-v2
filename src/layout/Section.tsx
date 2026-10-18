import type { ReactNode } from 'react'
import { Container } from '@/layout/Container'

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
      className={['scroll-mt-6 py-16', className].filter(Boolean).join(' ')}
    >
      <Container>
        <h2 id={`${id}-heading`} className="text-3xl font-semibold">
          {title}
        </h2>
        {children}
      </Container>
    </section>
  )
}
