import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Container } from '@/layout/Container'
import { Section } from '@/layout/Section'

describe('layout class merging', () => {
  it('lets a caller override Section padding instead of emitting both utilities', () => {
    const { container } = render(<Section id="x" title="X" className="py-8" />)
    const classes = container.querySelector('section')!.className.split(/\s+/)
    expect(classes).toContain('py-8')
    expect(classes).not.toContain('py-24')
    expect(classes).toContain('md:scroll-mt-(--nav-h)')
  })

  it('gives sections 96 px of rhythm by default and 160 px on top when airy', () => {
    const tight = render(<Section id="a" title="A" />).container.querySelector('section')!
    expect(tight.className.split(/\s+/)).toContain('py-24')
    const airy = render(<Section id="b" title="B" mood="airy" />).container.querySelector(
      'section',
    )!
    const classes = airy.className.split(/\s+/)
    expect(classes).toContain('pt-40')
    expect(classes).toContain('pb-24')
    expect(classes).not.toContain('py-24')
  })

  it('lets a caller override Container width', () => {
    const { container } = render(<Container className="max-w-3xl">hi</Container>)
    const classes = container.firstElementChild!.className.split(/\s+/)
    expect(classes).toContain('max-w-3xl')
    expect(classes).not.toContain('max-w-[1680px]')
  })
})
