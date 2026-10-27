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

interface SectionSkeleton {
  id: string
  labelledBy: string | null
  headingId: string | null
  headingText: string | null
}

/** The ordered id and heading skeleton of main's direct section children. */
function skeleton(main: HTMLElement): SectionSkeleton[] {
  return Array.from(main.children)
    .filter((child) => child.tagName === 'SECTION')
    .map((section) => {
      const heading = section.querySelector('h1, h2')
      return {
        id: section.id,
        labelledBy: section.getAttribute('aria-labelledby'),
        headingId: heading?.id ?? null,
        headingText: heading?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
      }
    })
}

function heroOf(main: HTMLElement): HTMLElement {
  const hero = main.querySelector<HTMLElement>('section#hero')
  if (!hero) throw new Error('main has no section#hero')
  return hero
}

describe('static shell parity', () => {
  it('index.html section#hero and the React hero render identically', () => {
    expect(canonical(heroOf(shellMain()))).toEqual(canonical(heroOf(reactMain())))
  })

  it('hero renders identically under reduced motion', () => {
    setMediaQuery('(prefers-reduced-motion: reduce)', true)
    expect(canonical(heroOf(shellMain()))).toEqual(canonical(heroOf(reactMain())))
  })

  it('shell and React agree on the section ids and heading skeleton of main', () => {
    expect(skeleton(shellMain())).toEqual(skeleton(reactMain()))
  })

  it('comparator self-check: dropping one class token from the shell h1 is detected', () => {
    const shell = shellMain().cloneNode(true) as HTMLElement
    const h1 = shell.querySelector('h1')
    if (!h1) throw new Error('shell has no h1')
    const tokens = (h1.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)
    expect(tokens.length).toBeGreaterThan(0)
    h1.setAttribute('class', tokens.slice(1).join(' '))
    expect(canonical(heroOf(shell))).not.toEqual(canonical(heroOf(reactMain())))
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

  it('hero accessible name is Aaron Phan and the facts are present', () => {
    const hero = heroOf(shellMain())
    expect(hero.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Aaron Phan')
    expect(hero.textContent).toContain('Graduating December 2026, UT Austin ECE')
    expect(hero.textContent).toContain('Last role: Capital One, summer 2026')
    expect(Array.from(hero.querySelectorAll('a')).map((a) => a.textContent?.trim())).toEqual([
      'Download resume',
      'Copy email',
    ])
  })
})
