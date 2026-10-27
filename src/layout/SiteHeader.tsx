import { NavIndicator } from '@/anim'
import { CtaLink } from '@/components/ui/CtaLink'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Container } from '@/layout/Container'
import { NAV_ITEMS } from '@/layout/nav-items'
import { SkipLink } from '@/layout/SkipLink'

interface SiteHeaderProps {
  /** The section in view, from the page's one scroll-spy. */
  activeId: string | null
  /** Called when a nav link is clicked, so the scroll-spy can lock onto the target. */
  onNavigate: (id: string) => void
}

/**
 * The skip link and the desktop nav (768 px and up, D-18). The bar is `display: none` below 768 px
 * so its landmark leaves the accessibility tree; the phone chrome arrives with the pill nav. The
 * header itself is the sticky element, so the bar stays on screen for the whole page.
 */
export function SiteHeader({ activeId, onNavigate }: SiteHeaderProps) {
  return (
    <header className="z-(--z-sticky-nav) md:sticky md:top-0">
      <SkipLink />
      <div className="hidden h-16 border-b border-border bg-background md:block">
        <Container className="flex h-full items-center gap-4 lg:gap-6">
          <a
            href="#hero"
            aria-label="Aaron Phan, home"
            onClick={() => onNavigate('hero')}
            className="inline-flex min-h-11 items-center text-m font-extrabold whitespace-nowrap"
          >
            Aaron Phan
          </a>
          <nav aria-label="Primary" className="ml-auto">
            <ul className="flex items-center gap-4 lg:gap-6">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={activeId === item.id ? 'location' : undefined}
                    onClick={() => onNavigate(item.id)}
                    className="nav-link inline-flex min-h-11 items-center text-s font-medium whitespace-nowrap"
                  >
                    <span className="relative inline-block">
                      <span className="nav-roll">
                        <span className="nav-roll-a">{item.label}</span>
                        <span className="nav-roll-b" aria-hidden="true">
                          {item.label}
                        </span>
                      </span>
                      {activeId === item.id ? <NavIndicator /> : null}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2 lg:gap-4">
            <ThemeToggle />
            <CtaLink
              href={`${import.meta.env.BASE_URL}resume.pdf`}
              variant="outlined"
              download
              className="whitespace-nowrap"
            >
              Resume
            </CtaLink>
          </div>
        </Container>
      </div>
    </header>
  )
}
