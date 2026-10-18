import { useState } from 'react'
import { ThemeThumb } from '@/anim'
import { applyTheme, readTheme, type Theme } from '@/lib/theme'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readTheme)
  const dark = theme === 'dark'

  function toggle() {
    const next: Theme = dark ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
  }

  return (
    <button
      type="button"
      aria-pressed={dark}
      aria-label="Dark theme"
      onClick={toggle}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill px-1"
    >
      <span
        aria-hidden="true"
        className="relative inline-flex h-7 w-12 items-center rounded-pill border border-border-strong bg-surface p-px"
      >
        <ThemeThumb on={dark} className="size-6 rounded-pill bg-primary" />
      </span>
    </button>
  )
}
