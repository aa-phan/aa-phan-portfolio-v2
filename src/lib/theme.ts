export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'

/** The current theme, read from html[data-theme]. Only 'dark' counts as dark. */
export function readTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

/**
 * Switch the theme: the attribute is written first so the switch always works, then the
 * choice is stored. When storage is blocked the choice lasts for the page session only.
 */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage blocked (private mode, policy): the in-memory choice still applies.
  }
}
