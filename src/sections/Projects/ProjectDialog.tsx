import { useEffect, useId, useRef } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { ChevronLeftIcon } from '@/components/ui/icons/ChevronLeftIcon'
import { ChevronRightIcon } from '@/components/ui/icons/ChevronRightIcon'
import { CloseIcon } from '@/components/ui/icons/CloseIcon'
import type { ProjectRow } from './project-types'

const two = (n: number) => String(n).padStart(2, '0')

/**
 * The project detail as one native dialog (ADR-0006 native path). showModal() in an effect gives
 * the focus trap, the inert background and native Escape; interactions.css locks the page scroll
 * while a dialog is open. On the close event the index goes back to null and focus is restored
 * explicitly to the element that was active when the dialog first opened, however many projects
 * were stepped through. Previous, Next, ArrowLeft and ArrowRight wrap 07 to 01 and back.
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
  const total = projects.length

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

  // A new project starts at the top of the panel.
  useEffect(() => {
    if (dialogRef.current) dialogRef.current.scrollTop = 0
  }, [index])

  const handleClose = () => {
    onIndexChange(null)
    openerRef.current?.focus()
    openerRef.current = null
  }

  const step = (delta: number) => {
    if (index === null || total === 0) return
    onIndexChange((index + delta + total) % total)
  }

  // The dialog box is the panel itself and the padding lives on an inner element, so a click whose
  // target is the dialog element can only have landed on the backdrop.
  const handleBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) event.currentTarget.close()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
    }
  }

  const project = index === null ? undefined : projects[index]
  const codeUrl = project?.links?.code

  return (
    <dialog
      ref={dialogRef}
      className="project-dialog"
      aria-labelledby={titleId}
      onClose={handleClose}
      onClick={handleBackdrop}
      onKeyDown={handleKeyDown}
    >
      {project && index !== null ? (
        <div className="project-panel">
          <div className="flex items-center justify-between">
            <p className="text-s tabular-nums">
              {two(index + 1)} / {two(total)}
            </p>
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
          <h2 id={titleId} className="mt-4 text-l">
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
          {codeUrl ? (
            <p className="mt-8 text-body">
              <a
                href={codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-link underline underline-offset-4"
              >
                Code on GitHub<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
          ) : null}
          <div className="project-footer">
            <button
              type="button"
              aria-label="Previous project"
              onClick={() => step(-1)}
              className="project-nav project-nav-prev"
            >
              <ChevronLeftIcon className="project-nav-icon" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              aria-label="Next project"
              onClick={() => step(1)}
              className="project-nav project-nav-next"
            >
              <span>Next</span>
              <ChevronRightIcon className="project-nav-icon" />
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  )
}
