import { useEffect, useRef, useState } from 'react'
import { Section } from '@/layout/Section'
import { ProjectDialog } from './ProjectDialog'
import type { ProjectRow } from './project-types'
import { Sleeve } from './Sleeve'

/**
 * Projects as a crate (D-08): seven typographic sleeves in a sideways scroll-snap row that scrolls
 * inside itself only, so vertical page scroll is never captured. Activating a sleeve opens the
 * native dialog, which is a sibling after the section (outside any band plan 03-13 adds).
 */
export function Projects({ projects }: { projects: readonly ProjectRow[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [leftmost, setLeftmost] = useState(1)
  const crateRef = useRef<HTMLUListElement>(null)

  // The crate index follows the leftmost sleeve that is fully inside the crate's visible box.
  // One animation frame of throttle on a passive scroll listener; resizing re-measures.
  useEffect(() => {
    const crate = crateRef.current
    if (!crate) return
    let frame = 0
    const measure = () => {
      frame = 0
      const box = crate.getBoundingClientRect()
      const at = Array.from(crate.children).findIndex((item) => {
        const rect = item.getBoundingClientRect()
        return rect.left >= box.left - 1 && rect.right <= box.right + 1
      })
      setLeftmost(at === -1 ? 1 : at + 1)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    crate.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      crate.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
      <Section
        id="projects"
        title="Projects"
        mood="tight"
        aside={
          <p aria-hidden="true" className="text-s tabular-nums">
            {leftmost} / {projects.length}
          </p>
        }
      >
        <ul
          ref={crateRef}
          aria-label="Projects"
          className="-mx-[clamp(1rem,2vw,2rem)] mt-8 flex snap-x snap-mandatory scroll-px-[clamp(1rem,2vw,2rem)] gap-4 overflow-x-auto px-[clamp(1rem,2vw,2rem)] pt-3 pb-6 md:mt-12"
        >
          {projects.map((project, index) => (
            <Sleeve
              key={project.id}
              project={project}
              position={index + 1}
              total={projects.length}
              onOpen={() => setOpenIndex(index)}
            />
          ))}
        </ul>
      </Section>
      <ProjectDialog projects={projects} index={openIndex} onIndexChange={setOpenIndex} />
    </>
  )
}
