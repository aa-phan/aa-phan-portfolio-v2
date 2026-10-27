import { readFileSync } from 'node:fs'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { THEME_STORAGE_KEY } from '@/lib/theme'
import { setMediaQuery } from '../setup'

const DARK_QUERY = '(prefers-color-scheme: dark)'

// Read the real index.html at test time, so this always covers whatever ships.
const html = readFileSync(path.resolve(import.meta.dirname, '../../index.html'), 'utf8')
const doc = new DOMParser().parseFromString(html, 'text/html')
const scripts = [...doc.querySelectorAll('script:not([src])')]

function runScript() {
  new Function(scripts[0]!.textContent ?? '')()
}

function theme() {
  return document.documentElement.getAttribute('data-theme')
}

beforeEach(() => {
  document.documentElement.removeAttribute('data-theme')
})

describe('inline theme-init script in index.html', () => {
  it('is exactly one classic inline script in the head, before the module script', () => {
    expect(scripts).toHaveLength(1)
    expect(scripts[0]!.hasAttribute('type')).toBe(false)
    expect(scripts[0]!.parentElement).toBe(doc.head)
  })

  it('reads the same storage key that theme.ts writes', () => {
    expect(scripts[0]!.textContent).toContain(`getItem('${THEME_STORAGE_KEY}')`)
  })

  it('uses the system preference when nothing is stored (system dark)', () => {
    setMediaQuery(DARK_QUERY, true)
    runScript()
    expect(theme()).toBe('dark')
  })

  it('uses the system preference when nothing is stored (system light)', () => {
    setMediaQuery(DARK_QUERY, false)
    runScript()
    expect(theme()).toBe('light')
  })

  it('a stored light choice wins over a dark system', () => {
    setMediaQuery(DARK_QUERY, true)
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('light')
    runScript()
    expect(theme()).toBe('light')
  })

  it('a stored dark choice wins over a light system', () => {
    setMediaQuery(DARK_QUERY, false)
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('dark')
    runScript()
    expect(theme()).toBe('dark')
  })

  it('ignores a stored value that is not light or dark', () => {
    setMediaQuery(DARK_QUERY, true)
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('purple')
    runScript()
    expect(theme()).toBe('dark')
  })

  it('falls back to the system preference when getItem throws, without an uncaught error', () => {
    setMediaQuery(DARK_QUERY, true)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => runScript()).not.toThrow()
    expect(theme()).toBe('dark')
  })

  it('gives light when matchMedia is missing', () => {
    const original = window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: undefined,
    })
    try {
      expect(() => runScript()).not.toThrow()
      expect(theme()).toBe('light')
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: original,
      })
    }
  })

  it('gives light when matchMedia throws', () => {
    const original = window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: () => {
        throw new Error('unsupported')
      },
    })
    try {
      expect(() => runScript()).not.toThrow()
      expect(theme()).toBe('light')
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: original,
      })
    }
  })
})

describe('inline theme-init script in 404.html (second HTML entry)', () => {
  const notFound = new DOMParser().parseFromString(
    readFileSync(path.resolve(import.meta.dirname, '../../404.html'), 'utf8'),
    'text/html',
  )
  const notFoundScripts = [...notFound.querySelectorAll('script:not([src])')]

  it('is exactly one classic inline script in the head', () => {
    expect(notFoundScripts).toHaveLength(1)
    expect(notFoundScripts[0]!.hasAttribute('type')).toBe(false)
    expect(notFoundScripts[0]!.parentElement).toBe(notFound.head)
    // No module script and no external script: the page ships no JavaScript beyond this one.
    expect(notFound.querySelectorAll('script[src], script[type="module"]')).toHaveLength(0)
  })

  it('is byte-identical to the one in index.html', () => {
    expect(notFoundScripts[0]!.textContent).toBe(scripts[0]!.textContent)
  })

  it('the identity check reports a one-character change as different', () => {
    const original = scripts[0]!.textContent ?? ''
    const altered = original.replace("'dark'", "'darl'")
    expect(altered).not.toBe(original)
    expect(altered).not.toBe(notFoundScripts[0]!.textContent)
  })
})
