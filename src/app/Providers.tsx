import type { ReactNode } from 'react'
import { MotionPreferenceProvider } from '@/anim'

export function Providers({ children }: { children: ReactNode }) {
  return <MotionPreferenceProvider>{children}</MotionPreferenceProvider>
}
