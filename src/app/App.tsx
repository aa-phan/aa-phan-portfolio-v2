import { Page } from '@/app/Page'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function App() {
  return (
    <>
      <header className="fixed top-3 right-3 z-(--z-sticky-nav)">
        <ThemeToggle />
      </header>
      <Page />
    </>
  )
}
