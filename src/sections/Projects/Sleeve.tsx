import type { MouseEvent } from 'react'
import type { ProjectRow } from './project-types'

/** Stack items shown on a sleeve before the "+N more" line. */
const STACK_SHOWN = 3

/**
 * One typographic record sleeve (D-09): no image. Dates and the context label sit at the top, the
 * first three stack items read like a tracklist, and the title is anchored bottom-left with a
 * negative bottom margin equal to the padding, so at most the descenders of the last line crop at
 * the sleeve edge. data-kind carries the context kind for the ground tokens plan 03-13 adds.
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
        className="sleeve flex aspect-[4/5] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-hold bg-secondary p-4 text-left text-text"
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
