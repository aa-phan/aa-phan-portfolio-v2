import { readFileSync } from 'node:fs'
import path from 'node:path'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Page } from '@/app/Page'
import { setMediaQuery } from '../setup'

interface CanonicalNode {
  tag: string
  attrs: Record<string, string | string[]>
  text: string
  children: CanonicalNode[]
}

const BASE_URL = import.meta.env.BASE_URL

function canonical(el: Element): CanonicalNode {
  const attrs: Record<string, string | string[]> = {}
  const names = el
    .getAttributeNames()
    .slice()
    .sort((a, b) => a.localeCompare(b))
  for (const name of names) {
    const value = el.getAttribute(name) ?? ''
    attrs[name] =
      name === 'class'
        ? value.split(/\s+/).filter(Boolean).sort()
        : value.replaceAll('%BASE_URL%', BASE_URL)
  }
  const text = Array.from(el.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  return {
    tag: el.tagName.toLowerCase(),
    attrs,
    text,
    children: Array.from(el.children).map(canonical),
  }
}

function shellMain(): HTMLElement {
  const html = readFileSync(path.resolve(import.meta.dirname, '../../index.html'), 'utf8')
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const main = doc.querySelector<HTMLElement>('#root main#main')
  if (!main) throw new Error('index.html has no main#main inside #root')
  return main
}

function reactMain(): HTMLElement {
  const { container } = render(<Page />)
  const main = container.querySelector<HTMLElement>('main#main')
  if (!main) throw new Error('Page did not render main#main')
  return main
}

describe('static shell parity', () => {
  it('index.html shell and the React Page render identically', () => {
    expect(canonical(shellMain())).toEqual(canonical(reactMain()))
  })

  it('shell and React Page render identically under reduced motion', () => {
    setMediaQuery('(prefers-reduced-motion: reduce)', true)
    expect(canonical(shellMain())).toEqual(canonical(reactMain()))
  })

  it('comparator self-check: dropping one class token from the shell h1 is detected', () => {
    const shell = shellMain().cloneNode(true) as HTMLElement
    const h1 = shell.querySelector('h1')
    if (!h1) throw new Error('shell has no h1')
    const tokens = (h1.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)
    expect(tokens.length).toBeGreaterThan(0)
    h1.setAttribute('class', tokens.slice(1).join(' '))
    expect(canonical(shell)).not.toEqual(canonical(reactMain()))
  })

  it('shell has exactly one h1 and the seven anchored sections in order', () => {
    const shell = shellMain()
    expect(shell.querySelectorAll('h1')).toHaveLength(1)
    const ids = Array.from(shell.querySelectorAll('section')).map((s) => s.id)
    expect(ids).toEqual([
      'hero',
      'experience',
      'projects',
      'about',
      'skills',
      'education',
      'contact',
    ])
  })
})
