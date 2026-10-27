import { useSyncExternalStore } from 'react'
import { readTheme, subscribeTheme, type Theme } from '@/lib/theme'

const getServerSnapshot = (): Theme => 'light'

/** The current theme, kept in step with html[data-theme], other tabs and the OS scheme. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribeTheme, readTheme, getServerSnapshot)
}
