export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'

/** The current theme, read from html[data-theme]. Only 'dark' counts as dark. */
export function readTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

/**
 * True when the visitor chose a theme but storage refused it. Storage is the record of an
 * explicit choice, so without this flag a blocked-storage visitor would look like one who
 * never chose, and the next OS scheme change would silently undo their choice.
 */
let unsavedChoice = false

/**
 * Switch the theme: the attribute is written first so the switch always works, then the
 * choice is stored. When storage is blocked the choice lasts for the page session only, and
 * the OS scheme no longer overrides it.
 */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    unsavedChoice = false
  } catch {
    // Storage blocked (private mode, policy): the in-memory choice still applies.
    unsavedChoice = true
  }
}

const DARK_QUERY = '(prefers-color-scheme: dark)'

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(value) ? value : null
  } catch {
    return null
  }
}

function systemTheme(): Theme {
  try {
    return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

/** Write the attribute without storing anything, and only when it would change. */
function syncAttribute(theme: Theme): void {
  if (readTheme() !== theme || !document.documentElement.hasAttribute('data-theme')) {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

/**
 * Subscribe to theme changes made outside the toggle: another tab changing or clearing the
 * stored choice, and the OS scheme changing while nothing is stored. Both are folded into
 * html[data-theme], which stays the single source of truth, and `onChange` fires when that
 * attribute changes for any reason. Returns the cleanup.
 */
export function subscribeTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  // `storage` fires in other tabs only. A null key means the whole store was cleared.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== THEME_STORAGE_KEY) return
    // Storage events only fire when storage works, and it is now the record of the choice.
    unsavedChoice = false
    syncAttribute(storedTheme() ?? systemTheme())
  }
  window.addEventListener('storage', onStorage)

  let mql: MediaQueryList | null = null
  try {
    mql = window.matchMedia(DARK_QUERY)
  } catch {
    // matchMedia missing or blocked: OS scheme changes are simply not followed.
  }
  const onSystemChange = () => {
    if (!unsavedChoice && storedTheme() === null) syncAttribute(systemTheme())
  }
  mql?.addEventListener('change', onSystemChange)

  return () => {
    observer.disconnect()
    window.removeEventListener('storage', onStorage)
    mql?.removeEventListener('change', onSystemChange)
  }
}
