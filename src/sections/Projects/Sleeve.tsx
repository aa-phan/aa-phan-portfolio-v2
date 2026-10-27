import type { MouseEvent } from 'react'
import { cn } from '@/lib/utils'
import type { ProjectRow } from './project-types'

/** Stack items shown on a sleeve before the "+N more" line. */
const STACK_SHOWN = 3

/** Ground per context kind (D-09): four neutral band tokens, spelled out so Tailwind sees each class. */
const GROUND = {
  personal: 'bg-(--sleeve-personal)',
  employer: 'bg-(--sleeve-employer)',
  hackathon: 'bg-(--sleeve-hackathon)',
  course: 'bg-(--sleeve-course)',
} as const

/**
 * One typographic record sleeve (D-09): no image. Dates and the context label sit at the top, the
 * first three stack items read like a tracklist, and the title is anchored bottom-left with a
 * negative bottom margin equal to the padding, so at most the descenders of the last line crop at
 * the sleeve edge. The ground is the band token for the project's context kind, and data-kind
 * carries that kind as a hook.
 */
export function Sleeve({
  project,
  position,
  total,
  onOpen,
}: {
  project: ProjectRow
  position: number
  total: number
  onOpen: () => void
}) {
  const shown = project.stack.slice(0, STACK_SHOWN)
  const more = project.stack.length - shown.length
  // Safari does not focus a button on click; the dialog restores focus to the active element.
  const open = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.focus()
    onOpen()
  }
  return (
    <li className="w-[min(72vw,280px)] shrink-0 snap-start md:w-[clamp(15rem,22vw,22.5rem)]">
      <button
        type="button"
        data-kind={project.context.kind}
        aria-label={`${project.title}, project ${position} of ${total}`}
        onClick={open}
        className={cn(
          'sleeve flex aspect-[4/5] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-hold p-4 text-left text-text',
          GROUND[project.context.kind],
        )}
      >
        <span className="flex flex-col gap-3">
          <span className="flex flex-col text-xs">
            <span className="tabular-nums">{project.dates.label}</span>
            <span>{project.context.label}</span>
          </span>
          <span className="flex flex-col text-xs text-muted">
            {shown.map((item) => (
              <span key={item}>{item}</span>
            ))}
            {more > 0 ? <span>+{more} more</span> : null}
          </span>
        </span>
        <span className="-mb-4 block text-l leading-[0.95] break-words hyphens-auto">
          {project.title}
        </span>
      </button>
    </li>
  )
}
