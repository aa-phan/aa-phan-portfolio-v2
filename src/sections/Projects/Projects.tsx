import { useState } from 'react'
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
  return (
    <>
      <Section id="projects" title="Projects" mood="tight">
        <ul
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
