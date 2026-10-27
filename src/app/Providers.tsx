import type { ReactNode } from 'react'
import { MotionPreferenceProvider } from '@/anim'
import { ToastProvider } from '@/components/ui/Toast'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionPreferenceProvider>
      <ToastProvider>{children}</ToastProvider>
    </MotionPreferenceProvider>
  )
}
