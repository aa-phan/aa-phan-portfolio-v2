import { useEffect, useRef, useState } from 'react'
import { CtaLink } from '@/components/ui/CtaLink'
import { CloseIcon } from '@/components/ui/icons/CloseIcon'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { NAV_ITEMS } from '@/layout/nav-items'
import { cn } from '@/lib/utils'

interface PillNavProps {
  /** The section in view, from the page's one scroll-spy. */
  activeId: string | null
  /** Called when a link is tapped, so the scroll-spy can lock onto the target. */
  onNavigate: (id: string) => void
}

const PANEL_ID = 'pill-panel'
/** The two sections that sit one tap away on the collapsed pill. */
const QUICK_IDS: readonly string[] = ['experience', 'projects']
const QUICK_ITEMS = NAV_ITEMS.filter((item) => QUICK_IDS.includes(item.id))

const SEGMENT =
  'pill-segment inline-flex min-h-11 min-w-24 items-center justify-center rounded-pill px-4 text-s font-medium aria-[current=location]:bg-accent aria-[current=location]:text-on-accent'

/**
 * The phone navigation (D-19): a pill fixed above the bottom edge with Experience, Projects and
 * Menu. Menu opens a panel with every section, the theme switch and Resume. The panel is not
 * modal: no focus trap, no inert page, and the page behind keeps scrolling. Focus moves to Close
 * on open and back to Menu on close.
 */
export function PillNav({ activeId, onNavigate }: PillNavProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (open) closeRef.current?.focus({ preventScroll: true })
    else if (wasOpen.current) menuRef.current?.focus({ preventScroll: true })
    wasOpen.current = open
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  /**
   * Close after the tap's default action has run. Unmounting the tapped anchor inside its own
   * click handler would cancel the jump (or the download), because a disconnected link cannot
   * navigate.
   */
  const closeAfterTap = () => {
    window.setTimeout(() => setOpen(false), 0)
  }

  return (
    <>
      {open ? (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-(--z-sticky-nav) bg-(--scrim) md:hidden"
        />
      ) : null}
      <nav
        aria-label="Sections"
        className={cn(
          'pill-nav fixed inset-x-0 bottom-[calc(16px+env(safe-area-inset-bottom))] z-(--z-pill-nav) mx-auto border border-border-strong bg-(--surface-frost) shadow-lg backdrop-blur-lg md:hidden',
          open
            ? 'max-h-[80dvh] w-[min(calc(100vw-32px),360px)] overflow-y-auto rounded-panel'
            : 'flex h-14 w-fit items-center gap-1 rounded-pill px-1.5',
        )}
      >
        {open ? (
          <div id={PANEL_ID}>
            <div className="flex items-center justify-between py-1 ps-4 pe-1">
              <p className="text-m">Menu</p>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex size-11 items-center justify-center rounded-pill"
              >
                <CloseIcon />
              </button>
            </div>
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={activeId === item.id ? 'location' : undefined}
                    onClick={() => {
                      onNavigate(item.id)
                      closeAfterTap()
                    }}
                    className="flex min-h-12 w-full items-center border-s-2 border-transparent px-4 text-m aria-[current=location]:border-accent"
                  >
                    {item.panelLabel}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex min-h-12 items-center justify-between px-4">
              <p className="text-m">Theme</p>
              <ThemeToggle />
            </div>
            <div className="p-2">
              <CtaLink
                href={`${import.meta.env.BASE_URL}resume.pdf`}
                variant="filled"
                download
                onClick={closeAfterTap}
                className="w-full"
              >
                Resume
              </CtaLink>
            </div>
          </div>
        ) : (
          <>
            {QUICK_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={activeId === item.id ? 'location' : undefined}
                onClick={() => onNavigate(item.id)}
                className={SEGMENT}
              >
                {item.label}
              </a>
            ))}
            <button
              ref={menuRef}
              type="button"
              aria-expanded={false}
              aria-controls={PANEL_ID}
              onClick={() => setOpen(true)}
              className={SEGMENT}
            >
              Menu
            </button>
          </>
        )}
      </nav>
    </>
  )
}
