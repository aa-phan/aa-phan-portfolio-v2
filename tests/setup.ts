import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

type ChangeListener = (event: { matches: boolean; media: string }) => void

const results = new Map<string, boolean>()
const listeners = new Map<string, Set<ChangeListener>>()

function listenersFor(query: string): Set<ChangeListener> {
  let set = listeners.get(query)
  if (!set) {
    set = new Set()
    listeners.set(query, set)
  }
  return set
}

function matchMediaStub(query: string): MediaQueryList {
  const mql = {
    get matches() {
      return results.get(query) ?? false
    },
    media: query,
    onchange: null,
    addEventListener(type: string, listener: unknown) {
      if (type === 'change' && typeof listener === 'function') {
        listenersFor(query).add(listener as ChangeListener)
      }
    },
    removeEventListener(type: string, listener: unknown) {
      if (type === 'change' && typeof listener === 'function') {
        listenersFor(query).delete(listener as ChangeListener)
      }
    },
    addListener(listener: unknown) {
      if (typeof listener === 'function') listenersFor(query).add(listener as ChangeListener)
    },
    removeListener(listener: unknown) {
      if (typeof listener === 'function') listenersFor(query).delete(listener as ChangeListener)
    },
    dispatchEvent() {
      return true
    },
  }
  return mql as unknown as MediaQueryList
}

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  writable: true,
  value: matchMediaStub,
})

/**
 * Set the result of a media query on the stubbed window.matchMedia and notify every
 * registered change listener. All queries reset to false after each test.
 */
export function setMediaQuery(query: string, matches: boolean): void {
  results.set(query, matches)
  const event = { matches, media: query }
  for (const listener of [...listenersFor(query)]) listener(event)
}

afterEach(() => {
  cleanup()
  results.clear()
  listeners.clear()
})
