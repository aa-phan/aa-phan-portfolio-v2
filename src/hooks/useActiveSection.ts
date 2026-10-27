import { useCallback, useEffect, useRef, useState } from 'react'

const DESKTOP_QUERY = '(min-width: 768px)'
/** Share of the viewport, counted from the bottom, that sits below the active band. */
const BAND_BOTTOM = '-60%'
/** Fallback end of a click lock when `scrollend` never arrives or nothing scrolls. */
const LOCK_FALLBACK_MS = 700
/** A lock also ends once the page has been quiet this long, for browsers without `scrollend`. */
const LOCK_QUIET_MS = 150
/** Upper bound on any lock, so a stuck scroll can never freeze the indicator. */
const LOCK_CAP_MS = 3000

/**
 * Pick the active section. The last section, in page order, that touches the active band wins;
 * with nothing in the band the previous pick stays; at the bottom of the page the last section
 * wins because it may never reach the band.
 */
export function pickActive(
  order: readonly string[],
  intersecting: ReadonlySet<string>,
  prev: string | null,
  atBottom: boolean,
): string | null {
  if (order.length === 0) return prev
  if (atBottom) return order[order.length - 1]
  for (let i = order.length - 1; i >= 0; i--) {
    if (intersecting.has(order[i])) return order[i]
  }
  return prev
}

function atPageBottom(): boolean {
  return (
    window.scrollY > 0 &&
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
  )
}

/** The sticky nav's height in pixels, or 0 when the nav is not fixed (below 768 px). */
function stickyNavHeight(): number {
  if (!window.matchMedia(DESKTOP_QUERY).matches) return 0
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-h').trim()
  const value = Number.parseFloat(raw)
  if (!Number.isFinite(value)) return 0
  if (raw.endsWith('rem')) {
    return value * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  }
  return value
}

/** Deep link: the decoded hash if, and only if, it is one of the known section ids. */
function hashTarget(ids: readonly string[]): string | null {
  const raw = window.location.hash.slice(1)
  if (!raw) return null
  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return null
  }
  return ids.includes(decoded) ? decoded : null
}

/**
 * Scroll-spy for the section nav. One IntersectionObserver watches a thin band under the nav;
 * `activeId` is the section in view. `lockTo` marks a clicked target at once and ignores the
 * observer until the smooth scroll settles, so the indicator never sweeps through the sections
 * in between. Without IntersectionObserver the hook does nothing and `activeId` stays null.
 */
export function useActiveSection(ids: readonly string[]): {
  activeId: string | null
  lockTo: (id: string) => void
} {
  const [activeId, setActiveId] = useState<string | null>(null)
  const prevRef = useRef<string | null>(null)
  const intersectingRef = useRef(new Set<string>())
  const lockedRef = useRef(false)
  const releaseLockRef = useRef<(() => void) | null>(null)
  const recomputeRef = useRef<() => void>(() => {})

  const lockTo = useCallback((id: string) => {
    releaseLockRef.current?.()
    lockedRef.current = true
    prevRef.current = id
    setActiveId(id)

    let fallback: ReturnType<typeof setTimeout> | undefined
    let cap: ReturnType<typeof setTimeout> | undefined
    const release = () => {
      clearTimeout(fallback)
      clearTimeout(cap)
      window.removeEventListener('scrollend', release)
      window.removeEventListener('scroll', onScroll)
      releaseLockRef.current = null
      lockedRef.current = false
      recomputeRef.current()
    }
    const onScroll = () => {
      clearTimeout(fallback)
      fallback = setTimeout(release, LOCK_QUIET_MS)
    }
    fallback = setTimeout(release, LOCK_FALLBACK_MS)
    cap = setTimeout(release, LOCK_CAP_MS)
    window.addEventListener('scrollend', release, { once: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    releaseLockRef.current = release
  }, [])

  // Deep link: the static shell is short, so the browser's own hash jump lands in the wrong
  // place once React renders the taller sections. Jump again, once, to a known section only.
  useEffect(() => {
    const target = hashTarget(ids)
    if (target) document.getElementById(target)?.scrollIntoView({ behavior: 'instant' })
  }, [ids])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const intersecting = intersectingRef.current
    const recompute = () => {
      if (lockedRef.current) return
      const next = pickActive(ids, intersecting, prevRef.current, atPageBottom())
      if (next !== prevRef.current) {
        prevRef.current = next
        setActiveId(next)
      }
    }
    recomputeRef.current = recompute

    let observer: IntersectionObserver | undefined
    const connect = () => {
      observer?.disconnect()
      intersecting.clear()
      // rootMargin takes pixels or percentages only, never var() or calc(), so build it here.
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) intersecting.add(entry.target.id)
            else intersecting.delete(entry.target.id)
          }
          recompute()
        },
        { rootMargin: `${-stickyNavHeight()}px 0px ${BAND_BOTTOM} 0px` },
      )
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el) observer.observe(el)
      }
    }
    connect()

    const mql = window.matchMedia(DESKTOP_QUERY)
    mql.addEventListener('change', connect)
    window.addEventListener('scroll', recompute, { passive: true })
    return () => {
      mql.removeEventListener('change', connect)
      window.removeEventListener('scroll', recompute)
      observer?.disconnect()
      intersecting.clear()
      recomputeRef.current = () => {}
    }
  }, [ids])

  useEffect(() => () => releaseLockRef.current?.(), [])

  return { activeId, lockTo }
}
