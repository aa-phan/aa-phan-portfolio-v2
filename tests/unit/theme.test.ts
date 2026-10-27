import { beforeEach, describe, expect, it, vi } from 'vitest'
import { THEME_STORAGE_KEY, applyTheme, readTheme, subscribeTheme } from '@/lib/theme'
import { setMediaQuery } from '../setup'

beforeEach(() => {
  document.documentElement.removeAttribute('data-theme')
  localStorage.clear()
})

describe('applyTheme', () => {
  it('sets the attribute and stores the choice', () => {
    applyTheme('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })

  it('still sets the attribute and does not throw when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => applyTheme('dark')).not.toThrow()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('stores nothing but the single theme key', () => {
    applyTheme('light')
    applyTheme('dark')
    expect(localStorage.length).toBe(1)
    expect(localStorage.key(0)).toBe('theme')
    expect(THEME_STORAGE_KEY).toBe('theme')
  })
})

describe('readTheme', () => {
  it('returns dark only when the attribute is dark', () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    expect(readTheme()).toBe('dark')
  })

  it('returns light for a light, missing or unknown attribute', () => {
    document.documentElement.setAttribute('data-theme', 'light')
    expect(readTheme()).toBe('light')
    document.documentElement.removeAttribute('data-theme')
    expect(readTheme()).toBe('light')
    document.documentElement.setAttribute('data-theme', 'purple')
    expect(readTheme()).toBe('light')
  })
})

describe('subscribeTheme', () => {
  const DARK_QUERY = '(prefers-color-scheme: dark)'
  const theme = () => document.documentElement.getAttribute('data-theme')

  function storageEvent(key: string | null): StorageEvent {
    return new StorageEvent('storage', { key })
  }

  it('follows the system scheme while no choice is stored', () => {
    document.documentElement.setAttribute('data-theme', 'light')
    const stop = subscribeTheme(() => {})
    setMediaQuery(DARK_QUERY, true)
    expect(theme()).toBe('dark')
    setMediaQuery(DARK_QUERY, false)
    expect(theme()).toBe('light')
    stop()
  })

  it('ignores a system scheme change when a choice is stored', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    document.documentElement.setAttribute('data-theme', 'light')
    const stop = subscribeTheme(() => {})
    setMediaQuery(DARK_QUERY, true)
    expect(theme()).toBe('light')
    stop()
  })

  it('keeps an explicit choice for the session when storage is blocked', async () => {
    // A fresh module copy, so the session flag does not leak into the other tests.
    vi.resetModules()
    const fresh = await import('@/lib/theme')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    document.documentElement.setAttribute('data-theme', 'light')
    const stop = fresh.subscribeTheme(() => {})
    fresh.applyTheme('dark')
    setMediaQuery(DARK_QUERY, true)
    setMediaQuery(DARK_QUERY, false)
    expect(theme()).toBe('dark')
    stop()
  })

  it('follows the system scheme again once storage works and the choice is cleared elsewhere', async () => {
    vi.resetModules()
    const fresh = await import('@/lib/theme')
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    document.documentElement.setAttribute('data-theme', 'light')
    const stop = fresh.subscribeTheme(() => {})
    fresh.applyTheme('dark')
    setItem.mockRestore()
    window.dispatchEvent(storageEvent(null))
    setMediaQuery(DARK_QUERY, true)
    setMediaQuery(DARK_QUERY, false)
    expect(theme()).toBe('light')
    stop()
  })

  it('adopts a choice stored by another tab and a cleared store', () => {
    document.documentElement.setAttribute('data-theme', 'light')
    const stop = subscribeTheme(() => {})
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    window.dispatchEvent(storageEvent(THEME_STORAGE_KEY))
    expect(theme()).toBe('dark')
    localStorage.clear()
    window.dispatchEvent(storageEvent(null))
    expect(theme()).toBe('light')
    stop()
  })

  it('never applies a stored value other than light or dark', () => {
    document.documentElement.setAttribute('data-theme', 'light')
    localStorage.setItem(THEME_STORAGE_KEY, 'purple')
    const stop = subscribeTheme(() => {})
    window.dispatchEvent(storageEvent(THEME_STORAGE_KEY))
    expect(theme()).toBe('light')
    stop()
  })

  it('ignores storage events for other keys', () => {
    document.documentElement.setAttribute('data-theme', 'light')
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    const stop = subscribeTheme(() => {})
    window.dispatchEvent(storageEvent('other'))
    expect(theme()).toBe('light')
    stop()
  })

  it('notifies when the attribute changes and stops after cleanup', async () => {
    const onChange = vi.fn()
    const stop = subscribeTheme(onChange)
    document.documentElement.setAttribute('data-theme', 'dark')
    await Promise.resolve()
    expect(onChange).toHaveBeenCalledTimes(1)
    stop()
    document.documentElement.setAttribute('data-theme', 'light')
    await Promise.resolve()
    expect(onChange).toHaveBeenCalledTimes(1)
    setMediaQuery(DARK_QUERY, true)
    expect(theme()).toBe('light')
  })
})
