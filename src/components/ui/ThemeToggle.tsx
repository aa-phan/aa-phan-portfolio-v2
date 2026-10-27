import { ThemeThumb } from '@/anim'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      aria-pressed={dark}
      aria-label="Dark theme"
      onClick={toggle}
      className="theme-toggle inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill px-1"
    >
      <span
        aria-hidden="true"
        className="theme-track relative inline-flex h-7 w-12 items-center rounded-pill border border-border-strong bg-surface p-px"
      >
        <ThemeThumb on={dark} className="size-6 rounded-pill bg-primary" />
      </span>
    </button>
  )
}
