import { act, render, renderHook, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useTheme } from '@/hooks/useTheme'

beforeEach(() => {
  document.documentElement.setAttribute('data-theme', 'light')
  localStorage.clear()
})

describe('useTheme', () => {
  it('reads html[data-theme] and toggles it', async () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    await act(async () => result.current.toggle())
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(result.current.theme).toBe('dark')
    await act(async () => result.current.toggle())
    expect(result.current.theme).toBe('light')
  })

  it('keeps every toggle in step with the one attribute', async () => {
    render(
      <>
        <ThemeToggle />
        <ThemeToggle />
      </>,
    )
    const toggles = screen.getAllByRole('button', { name: 'Dark theme' })
    expect(toggles).toHaveLength(2)
    await act(async () => toggles[0].click())
    for (const toggle of toggles) expect(toggle.getAttribute('aria-pressed')).toBe('true')
  })
})
