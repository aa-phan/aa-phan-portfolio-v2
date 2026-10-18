import { Page } from '@/app/Page'
import { Providers } from '@/app/Providers'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function App() {
  return (
    <Providers>
      <header className="fixed top-3 right-3 z-(--z-sticky-nav)">
        <ThemeToggle />
      </header>
      <Page />
    </Providers>
  )
}
