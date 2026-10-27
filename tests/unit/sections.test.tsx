import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { siteContent } from '@/content'
import { About } from '@/sections/About/About'
import { Education } from '@/sections/Education/Education'
import { Experience } from '@/sections/Experience/Experience'
import { ProjectDialog } from '@/sections/Projects/ProjectDialog'
import { Projects } from '@/sections/Projects/Projects'
import { Skills } from '@/sections/Skills/Skills'

describe('Experience section', () => {
  it('is labelled by an h2 named Experience', () => {
    render(<Experience entries={siteContent.experience} />)
    const heading = screen.getByRole('heading', { level: 2, name: 'Experience' })
    const section = heading.closest('section')
    expect(section?.getAttribute('aria-labelledby')).toBe(heading.id)
    expect(section?.id).toBe('experience')
  })

  it('renders one closed details row with a summary per entry', () => {
    const { container } = render(<Experience entries={siteContent.experience} />)
    expect(container.querySelectorAll('summary')).toHaveLength(5)
    const rows = container.querySelectorAll('details')
    expect(rows).toHaveLength(5)
    for (const row of rows) expect(row.hasAttribute('open')).toBe(false)
  })

  it('names each row by its company h3, in content order', () => {
    render(<Experience entries={siteContent.experience} />)
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings).toHaveLength(5)
    // The aria-hidden chip stays out of the accessible name, so it equals the organisation.
    siteContent.experience.forEach((entry, index) => {
      expect(
        screen.getByRole('heading', { level: 3, name: entry.org }),
        `${entry.org} heading`,
      ).toBe(headings[index])
    })
  })

  it('shows the monogram chip and no img for an entry without a logo, and a decorative logo for the rest', () => {
    const { container } = render(<Experience entries={siteContent.experience} />)
    const rows = Array.from(container.querySelectorAll('details'))
    const odder = rows[3]
    if (!odder) throw new Error('no OdderTech IT row')
    const chip = odder.querySelector('.exp-chip')
    expect(chip?.textContent).toBe('OT')
    expect(chip?.getAttribute('aria-hidden')).toBe('true')
    expect(odder.querySelector('img')).toBeNull()
    const logos = Array.from(container.querySelectorAll('img'))
    expect(logos).toHaveLength(3)
    for (const logo of logos) {
      expect(logo.getAttribute('alt')).toBe('')
      expect(logo.getAttribute('width')).toBe('20')
    }
    expect(container.querySelectorAll('picture source[type="image/avif"]')).toHaveLength(3)
    // Spectrum's 32 px source yields one width, so imagetools folds its WebP into the img fallback.
    expect(container.querySelectorAll('picture source[type="image/webp"]')).toHaveLength(2)
  })

  it('keeps an empty 24 px slot for an entry with neither logo nor monogram', () => {
    const entry = { ...siteContent.experience[0], monogram: undefined }
    const { container } = render(<Experience entries={[entry]} />)
    const slot = container.querySelector('.exp-slot')
    expect(slot).not.toBeNull()
    expect(slot?.querySelector('.exp-chip')).toBeNull()
  })

  it('omits the location line when the entry has none and renders it when present', () => {
    const { container } = render(<Experience entries={siteContent.experience} />)
    const rows = Array.from(container.querySelectorAll('details'))
    expect(within(rows[0] as HTMLElement).getByText('Plano, TX')).toBeTruthy()
    expect(rows[3]?.querySelector('.exp-body-inner > p')).toBeNull()
    expect(rows[4]?.querySelector('.exp-body-inner > p')).toBeNull()
  })

  it('lists three bullets per row', () => {
    const { container } = render(<Experience entries={siteContent.experience} />)
    for (const row of container.querySelectorAll('details')) {
      expect(row.querySelectorAll('.exp-bullets > li')).toHaveLength(3)
    }
  })
})

describe('Projects section', () => {
  const TITLES = siteContent.projects.map((project) => project.title)

  it('is labelled by an h2 named Projects and lists the crate', () => {
    render(<Projects projects={siteContent.projects} />)
    const heading = screen.getByRole('heading', { level: 2, name: 'Projects' })
    expect(heading.closest('section')?.id).toBe('projects')
    expect(screen.getByRole('list', { name: 'Projects' })).toBeTruthy()
  })

  it('renders seven sleeve buttons named by title and position, in order', () => {
    render(<Projects projects={siteContent.projects} />)
    const crate = screen.getByRole('list', { name: 'Projects' })
    const buttons = within(crate).getAllByRole('button')
    expect(buttons).toHaveLength(7)
    buttons.forEach((button, index) => {
      expect(button.getAttribute('aria-label')).toBe(`${TITLES[index]}, project ${index + 1} of 7`)
    })
  })

  it('shows the first three stack items then +N more, and none for a short stack', () => {
    render(<Projects projects={siteContent.projects} />)
    const atlas = screen.getByRole('button', { name: 'A.T.L.A.S, project 2 of 7' })
    expect(atlas.textContent).toContain('Python')
    expect(atlas.textContent).toContain('+2 more')
    expect(atlas.textContent).not.toContain('JavaScript')
    const mirror = screen.getByRole('button', { name: 'Smart Mirror, project 7 of 7' })
    expect(mirror.textContent).not.toContain('more')
  })

  it('shows the crate index at 1 / 7 and hides it from assistive technology', () => {
    const { container } = render(<Projects projects={siteContent.projects} />)
    const index = Array.from(container.querySelectorAll('p')).find((p) => p.textContent === '1 / 7')
    expect(index?.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders no dialog content until a sleeve is activated', () => {
    const { container } = render(<Projects projects={siteContent.projects} />)
    expect(container.querySelector('dialog')?.children).toHaveLength(0)
  })
})

const TITLE_4 = 'MediaDash: Content Recommendation Hub'

describe('ProjectDialog', () => {
  beforeEach(() => {
    // jsdom has no showModal; the stand-ins mark the dialog open and fire the close event.
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
  })

  afterEach(() => {
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
  })

  it('shows the bullets and no link row for a project without links or a write-up', () => {
    const { container } = render(
      <ProjectDialog projects={siteContent.projects} index={3} onIndexChange={() => {}} />,
    )
    const dialog = container.querySelector('dialog') as HTMLDialogElement
    expect(within(dialog).getByRole('heading', { level: 2 }).textContent).toBe(TITLE_4)
    expect(dialog.querySelectorAll('ul:not([aria-label]) > li')).toHaveLength(4)
    expect(within(dialog).queryByRole('link')).toBeNull()
    expect(dialog.textContent).not.toContain('Problem')
    expect(dialog.textContent).toContain('04 / 07')
  })

  it('shows Problem, Approach and Outcome instead of bullets, and the code link, for RecipeCart', () => {
    const { container } = render(
      <ProjectDialog projects={siteContent.projects} index={0} onIndexChange={() => {}} />,
    )
    const dialog = container.querySelector('dialog') as HTMLDialogElement
    for (const label of ['Problem', 'Approach', 'Outcome']) {
      expect(within(dialog).getByRole('heading', { level: 3, name: label })).toBeTruthy()
    }
    expect(dialog.querySelectorAll('ul:not([aria-label]) > li')).toHaveLength(0)
    const link = within(dialog).getByRole('link', { name: /Code on GitHub/ })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    expect(link.getAttribute('href')).toBe('https://github.com/aa-phan/RecipeCart')
  })

  it('wraps Next from 07 to 01 and Previous from 01 to 07', () => {
    const onIndexChange = vi.fn()
    const { rerender } = render(
      <ProjectDialog projects={siteContent.projects} index={6} onIndexChange={onIndexChange} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Next project', hidden: true }))
    expect(onIndexChange).toHaveBeenLastCalledWith(0)
    rerender(
      <ProjectDialog projects={siteContent.projects} index={0} onIndexChange={onIndexChange} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Previous project', hidden: true }))
    expect(onIndexChange).toHaveBeenLastCalledWith(6)
  })

  it('steps with ArrowRight and ArrowLeft', () => {
    const onIndexChange = vi.fn()
    const { container } = render(
      <ProjectDialog projects={siteContent.projects} index={2} onIndexChange={onIndexChange} />,
    )
    const dialog = container.querySelector('dialog') as HTMLDialogElement
    fireEvent.keyDown(dialog, { key: 'ArrowRight' })
    expect(onIndexChange).toHaveBeenLastCalledWith(3)
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' })
    expect(onIndexChange).toHaveBeenLastCalledWith(1)
  })

  it('closes on a click whose target is the dialog element, not on a click inside the panel', () => {
    const onIndexChange = vi.fn()
    const { container } = render(
      <ProjectDialog projects={siteContent.projects} index={1} onIndexChange={onIndexChange} />,
    )
    const dialog = container.querySelector('dialog') as HTMLDialogElement
    fireEvent.click(dialog.querySelector('h2') as HTMLElement)
    expect(onIndexChange).not.toHaveBeenCalled()
    fireEvent.click(dialog)
    expect(onIndexChange).toHaveBeenCalledWith(null)
  })
})

describe('About section', () => {
  it('renders the photo with its exact alt, lazy loading and no quote', () => {
    const { container } = render(<About profile={siteContent.profile} />)
    const photo = container.querySelector('img')
    expect(photo?.getAttribute('alt')).toBe('Aaron Phan DJing at his UT Austin graduation')
    expect(photo?.getAttribute('loading')).toBe('lazy')
    expect(photo?.getAttribute('width')).toBe('539')
    expect(photo?.getAttribute('height')).toBe('800')
    expect(container.querySelectorAll('img')).toHaveLength(1)
    expect(container.querySelector('blockquote')).toBeNull()
  })

  it('renders a blockquote only when the profile carries a quote', () => {
    const { container, rerender } = render(<About profile={{ bio: ['One.', 'Two.'] }} />)
    expect(container.querySelector('blockquote')).toBeNull()
    rerender(<About profile={{ bio: ['One.', 'Two.'], quote: 'A line.' }} />)
    expect(container.querySelector('blockquote')?.textContent).toBe('A line.')
  })
})

describe('Skills section', () => {
  it('renders four statements, each with a weight 750 label and a closing period', () => {
    const { container } = render(<Skills groups={siteContent.skills} />)
    const items = container.querySelectorAll('li')
    expect(items).toHaveLength(4)
    for (const item of items) {
      expect(item.querySelector('.skill-label')?.className).toContain('font-[750]')
      expect(item.textContent?.endsWith('.')).toBe(true)
    }
    expect(items[0]?.textContent).toBe(
      'Languages: C/C++, Go, HTML/CSS, Java, JavaScript, MATLAB, Python, SQL (Postgres).',
    )
  })
})

describe('Education section', () => {
  it('leads with the graduation date and shows both GPAs in tabular figures', () => {
    render(<Education entries={siteContent.education} />)
    for (const text of ['December 2026', 'GPA 3.2', 'GPA 3.911']) {
      const node = screen.getByText(text)
      expect(node.className, text).toContain('tabular-nums')
    }
    expect(screen.getByText('Graduating')).toBeTruthy()
    expect(screen.getByText('Data Science track')).toBeTruthy()
    expect(screen.getByText('High School Diploma, May 2022')).toBeTruthy()
  })
})
