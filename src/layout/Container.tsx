import type { ReactNode } from 'react'

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={['mx-auto max-w-5xl px-5 md:px-8', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
