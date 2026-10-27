import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { siteContent } from '@/content'
import { Experience } from '@/sections/Experience/Experience'

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

  it('shows the monogram chip and no img for an entry without a logo', () => {
    const { container } = render(<Experience entries={siteContent.experience} />)
    const rows = Array.from(container.querySelectorAll('details'))
    const odder = rows[3]
    if (!odder) throw new Error('no OdderTech IT row')
    const chip = odder.querySelector('.exp-chip')
    expect(chip?.textContent).toBe('OT')
    expect(chip?.getAttribute('aria-hidden')).toBe('true')
    expect(odder.querySelector('img')).toBeNull()
    expect(container.querySelectorAll('img')).toHaveLength(0)
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
