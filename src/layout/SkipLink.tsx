/**
 * First Tab stop. It waits just above the viewport and drops to the top-left corner on focus,
 * so it stays in the accessibility tree the whole time. Enter moves focus to main#main, which
 * carries tabindex="-1".
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed top-4 left-4 z-(--z-skip-link) inline-flex min-h-11 -translate-y-[200%] items-center rounded-pill bg-text px-6 text-s font-medium text-background focus:translate-y-0"
    >
      Skip to main content
    </a>
  )
}
