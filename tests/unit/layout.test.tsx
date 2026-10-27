import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Container } from '@/layout/Container'
import { Section } from '@/layout/Section'

describe('layout class merging', () => {
  it('lets a caller override Section padding instead of emitting both utilities', () => {
    const { container } = render(<Section id="x" title="X" className="py-8" />)
    const classes = container.querySelector('section')!.className.split(/\s+/)
    expect(classes).toContain('py-8')
    expect(classes).not.toContain('py-16')
    expect(classes).toContain('scroll-mt-6')
  })

  it('lets a caller override Container width', () => {
    const { container } = render(<Container className="max-w-3xl">hi</Container>)
    const classes = container.firstElementChild!.className.split(/\s+/)
    expect(classes).toContain('max-w-3xl')
    expect(classes).not.toContain('max-w-5xl')
  })
})
