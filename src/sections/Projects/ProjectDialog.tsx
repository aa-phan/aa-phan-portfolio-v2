import { useEffect, useId, useRef } from 'react'
import { CloseIcon } from '@/components/ui/icons/CloseIcon'
import type { ProjectRow } from './project-types'

/**
 * The project detail as one native dialog (ADR-0006 native path). showModal() in an effect gives
 * the focus trap, the inert background and native Escape; on the close event the index goes back
 * to null and focus is restored explicitly to the element that was active when it opened.
 */
export function ProjectDialog({
  projects,
  index,
  onIndexChange,
}: {
  projects: readonly ProjectRow[]
  index: number | null
  onIndexChange: (index: number | null) => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const isOpen = index !== null

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) {
      const active = document.activeElement
      openerRef.current = active instanceof HTMLElement ? active : null
      dialog.showModal()
      closeRef.current?.focus()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  const handleClose = () => {
    onIndexChange(null)
    openerRef.current?.focus()
    openerRef.current = null
  }

  const project = index === null ? undefined : projects[index]

  return (
    <dialog
      ref={dialogRef}
      className="project-dialog"
      aria-labelledby={titleId}
      onClose={handleClose}
    >
      {project ? (
        <div className="project-panel">
          <div className="flex items-center justify-end">
            <button
              ref={closeRef}
              type="button"
              aria-label="Close project details"
              onClick={() => dialogRef.current?.close()}
              className="project-close inline-flex size-11 cursor-pointer items-center justify-center rounded-pill"
            >
              <CloseIcon />
            </button>
          </div>
          <h2 id={titleId} className="text-l">
            {project.title}
          </h2>
          <p className="mt-2 text-s text-muted">
            {project.context.label} · <span className="tabular-nums">{project.dates.label}</span>
          </p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Stack">
            {project.stack.map((item) => (
              <li key={item} className="rounded-pill bg-secondary px-2 py-1 text-xs text-text">
                {item}
              </li>
            ))}
          </ul>
          {project.writeup ? (
            <div className="mt-8 grid gap-6 text-body">
              <div>
                <h3 className="text-s font-semibold">Problem</h3>
                <p>{project.writeup.problem}</p>
              </div>
              <div>
                <h3 className="text-s font-semibold">Approach</h3>
                <p>{project.writeup.approach}</p>
              </div>
              <div>
                <h3 className="text-s font-semibold">Outcome</h3>
                <p>{project.writeup.outcome}</p>
              </div>
            </div>
          ) : (
            <ul className="mt-8 grid list-disc gap-4 ps-5 text-body">
              {project.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </dialog>
  )
}
