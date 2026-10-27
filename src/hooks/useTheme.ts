import { useCallback, useSyncExternalStore } from 'react'
import { applyTheme, readTheme, subscribeTheme, type Theme } from '@/lib/theme'

const getServerSnapshot = (): Theme => 'light'

/**
 * The one theme store, read from html[data-theme]. Every ThemeToggle and anything else that
 * needs the theme subscribes here, so no instance keeps a copy that can drift from another.
 * The attribute also follows other tabs and the OS scheme (see subscribeTheme).
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, getServerSnapshot)
  const toggle = useCallback(() => applyTheme(readTheme() === 'dark' ? 'light' : 'dark'), [])
  return { theme, toggle }
}
