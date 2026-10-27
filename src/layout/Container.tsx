import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto max-w-[1680px] px-[clamp(1rem,2vw,2rem)]', className)}>
      {children}
    </div>
  )
}
