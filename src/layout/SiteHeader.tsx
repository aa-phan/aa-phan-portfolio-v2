import { NavIndicator } from '@/anim'
import { CtaLink } from '@/components/ui/CtaLink'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Container } from '@/layout/Container'
import { NAV_ITEMS } from '@/layout/nav-items'
import { SkipLink } from '@/layout/SkipLink'
import { Wordmark } from '@/layout/Wordmark'

interface SiteHeaderProps {
  /** The section in view, from the page's one scroll-spy. */
  activeId: string | null
  /** Called when a nav link is clicked, so the scroll-spy can lock onto the target. */
  onNavigate: (id: string) => void
}

/** The wordmark as the home link. Its name is "Aaron Phan, home" in both themes. */
function HomeLink({ onNavigate }: Pick<SiteHeaderProps, 'onNavigate'>) {
  return (
    <a
      href="#hero"
      aria-label="Aaron Phan, home"
      onClick={() => onNavigate('hero')}
      className="home-link inline-flex min-h-11 items-center"
    >
      <Wordmark size="nav" />
    </a>
  )
}

/**
 * The skip link, the phone top bar (below 768 px, D-19) and the desktop nav (768 px and up, D-18).
 * Each bar is `display: none` at the other size, so exactly one home link, one theme toggle and
 * (on desktop) the one navigation landmark are in the accessibility tree. The phone bar is not
 * fixed: it scrolls away, but the day and night switch is on the first paint. The header itself
 * is the sticky element on desktop, so that bar stays on screen for the whole page.
 */
export function SiteHeader({ activeId, onNavigate }: SiteHeaderProps) {
  return (
    <header className="z-(--z-sticky-nav) md:sticky md:top-0">
      <SkipLink />
      <div className="h-16 bg-background md:hidden">
        <Container className="flex h-full items-center justify-between">
          <HomeLink onNavigate={onNavigate} />
          <ThemeToggle />
        </Container>
      </div>
      <div className="hidden h-16 border-b border-border bg-background md:block">
        <Container className="flex h-full items-center gap-4 lg:gap-6">
          <HomeLink onNavigate={onNavigate} />
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
