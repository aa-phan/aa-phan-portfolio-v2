import { beforeEach, describe, expect, it, vi } from 'vitest'
import { THEME_STORAGE_KEY, applyTheme, readTheme } from '@/lib/theme'

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
