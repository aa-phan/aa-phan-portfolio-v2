import { Container } from '@/layout/Container'
import { Wordmark } from '@/layout/Wordmark'

/**
 * The last frame of the page (D-01, D-12): the name set edge to edge, PHAN by day and PHVNTM by
 * night, over a real text line. The wordmark is aria-hidden; the small print carries the words.
 */
export function Footer() {
  return (
    <footer className="footer-finale pb-6 md:pb-8">
      <Container>
        <div className="finale-fit">
          <Wordmark size="finale" />
        </div>
        <div className="mt-4 flex flex-wrap justify-between gap-x-6 gap-y-1 text-s text-muted">
          <p>Aaron Phan. DJs as PHVNTM.</p>
          <p>Austin, TX</p>
        </div>
      </Container>
    </footer>
  )
}
