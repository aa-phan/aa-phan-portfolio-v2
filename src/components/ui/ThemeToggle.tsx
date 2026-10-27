import { ThemeThumb } from '@/anim'
import { applyTheme, type Theme } from '@/lib/theme'
import { useTheme } from '@/lib/useTheme'

export function ThemeToggle() {
  const dark = useTheme() === 'dark'

  function toggle() {
    const next: Theme = dark ? 'light' : 'dark'
    applyTheme(next)
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
