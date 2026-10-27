import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { pickActive, useActiveSection } from '@/hooks/useActiveSection'
import { NAV_ITEMS, SECTION_IDS } from '@/layout/nav-items'

const ORDER = ['hero', 'experience', 'projects', 'about'] as const

describe('pickActive', () => {
  it('returns the previous id when nothing intersects', () => {
    expect(pickActive(ORDER, new Set(), 'projects', false)).toBe('projects')
    expect(pickActive(ORDER, new Set(), null, false)).toBeNull()
  })

  it('returns the last intersecting id in DOM order when several intersect', () => {
    // Insertion order of the set must not matter, only the order of the sections.
    const intersecting = new Set(['projects', 'experience'])
    expect(pickActive(ORDER, intersecting, 'hero', false)).toBe('projects')
  })

  it('returns the last id of the order when the page is at the bottom', () => {
    expect(pickActive(ORDER, new Set(['experience']), 'experience', true)).toBe('about')
    expect(pickActive(ORDER, new Set(), null, true)).toBe('about')
  })

  it('returns the previous id for an empty order', () => {
    expect(pickActive([], new Set(['x']), 'x', false)).toBe('x')
    expect(pickActive([], new Set(), 'y', true)).toBe('y')
  })

  it('ignores intersecting ids that are not in the order', () => {
    expect(pickActive(ORDER, new Set(['stranger']), 'experience', false)).toBe('experience')
  })
})

describe('useActiveSection', () => {
  it('renders without IntersectionObserver and reports no active section', () => {
    expect('IntersectionObserver' in window).toBe(false)
    const { result } = renderHook(() => useActiveSection(SECTION_IDS))
    expect(result.current.activeId).toBeNull()
    expect(typeof result.current.lockTo).toBe('function')
  })
})

describe('nav items', () => {
  it('lists hero first then the six nav sections in order', () => {
    expect(SECTION_IDS).toEqual([
      'hero',
      'experience',
      'projects',
      'about',
      'skills',
      'education',
      'contact',
    ])
    expect(NAV_ITEMS.map((item) => item.id)).toEqual(SECTION_IDS.slice(1))
    expect(NAV_ITEMS.map((item) => item.label)).toEqual([
      'Experience',
      'Projects',
      'About',
      'Skills',
      'Education',
      'Contact',
    ])
    expect(NAV_ITEMS.map((item) => item.panelLabel)).toEqual([
      'Experience',
      'Projects',
      'About Me',
      'Skills',
      'Education',
      'Contact Me',
    ])
  })
})
