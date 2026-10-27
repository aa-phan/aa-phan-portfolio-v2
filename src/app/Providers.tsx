import type { ReactNode } from 'react'
import { MotionFeatures, MotionPreferenceProvider } from '@/anim'
import { ToastProvider } from '@/components/ui/Toast'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionPreferenceProvider>
      <MotionFeatures>
        <ToastProvider>{children}</ToastProvider>
      </MotionFeatures>
    </MotionPreferenceProvider>
  )
}
