import { act, render, renderHook } from '@testing-library/react'
import { useReducedMotionConfig } from 'motion/react'
import { Globals } from '@react-spring/web'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MotionPreferenceProvider } from '@/anim/MotionPreferenceProvider'
import { useMotionPreference } from '@/anim/useMotionPreference'
import { setMediaQuery } from '../setup'

const QUERY = '(prefers-reduced-motion: reduce)'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useMotionPreference', () => {
  it('reports reduced false by default', () => {
    const { result } = renderHook(() => useMotionPreference())
    expect(result.current.reduced).toBe(false)
  })

  it('follows a live media query change without remounting, both directions', () => {
    const { result } = renderHook(() => useMotionPreference())
    act(() => setMediaQuery(QUERY, true))
    expect(result.current.reduced).toBe(true)
    act(() => setMediaQuery(QUERY, false))
    expect(result.current.reduced).toBe(false)
  })

  it('returns false and does not throw when matchMedia is missing', () => {
    const original = window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: undefined,
    })
    try {
      const { result } = renderHook(() => useMotionPreference())
      expect(result.current.reduced).toBe(false)
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: original,
      })
    }
  })
})

describe('MotionPreferenceProvider', () => {
  it('assigns skipAnimation true under reduce, false when it flips off, and resets on unmount', () => {
    const assign = vi.spyOn(Globals, 'assign')
    setMediaQuery(QUERY, true)
    const { unmount } = render(
      <MotionPreferenceProvider>
        <span>child</span>
      </MotionPreferenceProvider>,
    )
    expect(assign).toHaveBeenLastCalledWith({ skipAnimation: true })

    act(() => setMediaQuery(QUERY, false))
    expect(assign).toHaveBeenLastCalledWith({ skipAnimation: false })

    act(() => setMediaQuery(QUERY, true))
    expect(assign).toHaveBeenLastCalledWith({ skipAnimation: true })

    unmount()
    expect(assign).toHaveBeenLastCalledWith({ skipAnimation: false })
  })

  it('feeds motion: useReducedMotionConfig reports true under reduce and false otherwise', () => {
    const seen: Array<boolean | null> = []
    function Probe() {
      seen.push(useReducedMotionConfig())
      return null
    }
    setMediaQuery(QUERY, true)
    render(
      <MotionPreferenceProvider>
        <Probe />
      </MotionPreferenceProvider>,
    )
    expect(seen.at(-1)).toBe(true)
    act(() => setMediaQuery(QUERY, false))
    expect(seen.at(-1)).toBeFalsy()
  })
})
