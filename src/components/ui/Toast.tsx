import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastPresence } from '@/anim'
import { ToastContext } from '@/components/ui/useToast'

const TOAST_MS = 4000

/**
 * One toast at a time. The polite live region is in the DOM from mount (a region added together
 * with its text is often not announced), and the visual pill is hidden from assistive tech so
 * the message is not read twice.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [announced, setAnnounced] = useState('')
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const frame = useRef<number | undefined>(undefined)

  const show = useCallback((next: string) => {
    // Clear first and write on the next frame so a repeated message is announced again.
    setAnnounced('')
    if (frame.current !== undefined) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => setAnnounced(next))
    setMessage(next)
    setVisible(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setVisible(false), TOAST_MS)
  }, [])

  useEffect(
    () => () => {
      clearTimeout(hideTimer.current)
      if (frame.current !== undefined) cancelAnimationFrame(frame.current)
    },
    [],
  )

  const api = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div role="status" aria-live="polite" className="sr-only">
        {announced}
      </div>
      <ToastPresence
        show={visible}
        className="fixed bottom-[calc(56px+16px+16px+env(safe-area-inset-bottom))] left-1/2 z-(--z-toast) w-max max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-pill bg-text px-6 py-2 text-center text-s font-medium text-background shadow-lg md:bottom-6"
      >
        {message}
      </ToastPresence>
    </ToastContext.Provider>
  )
}
