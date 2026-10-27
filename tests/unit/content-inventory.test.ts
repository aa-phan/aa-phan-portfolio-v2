import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { siteContent } from '@/content'

const INVENTORY_PATH = path.resolve(
  import.meta.dirname,
  '../../.planning/phases/01-decisions-and-documentation/01-CONTENT-INVENTORY.md',
)

export interface InventoryBlock {
  id: string
  heading: string
  /** First line value of each "- Label: value" line, keyed by label. */
  labels: Map<string, string>
  /** Indented continuation lines under each label, keyed by label. */
  children: Map<string, string[]>
  /** Items of the numbered list under "- Bullets:". */
  bullets: string[]
}

/** Parse every "### ID Title" block of the inventory into labels and numbered bullets. */
export function parseInventory(markdown: string): Map<string, InventoryBlock> {
  const blocks = new Map<string, InventoryBlock>()
  let current: InventoryBlock | undefined
  let currentLabel: string | undefined
  for (const line of markdown.split('\n')) {
    if (line.startsWith('### ')) {
      const heading = line.slice(4).trim()
      const id = heading.split(/\s+/)[0] ?? heading
      current = { id, heading, labels: new Map(), children: new Map(), bullets: [] }
      blocks.set(id, current)
      currentLabel = undefined
      continue
    }
    if (line.startsWith('## ')) {
      current = undefined
      currentLabel = undefined
      continue
    }
    if (!current) continue
    const labelMatch = /^- ([^:]+):[ ]?(.*)$/.exec(line)
    if (labelMatch) {
      currentLabel = labelMatch[1] ?? ''
      current.labels.set(currentLabel, labelMatch[2] ?? '')
      current.children.set(currentLabel, [])
      continue
    }
    const childMatch = /^ {2,}(\S.*)$/.exec(line)
    if (childMatch && currentLabel !== undefined) {
      const text = childMatch[1] ?? ''
      current.children.get(currentLabel)?.push(text)
      const numbered = /^\d+\.\s+(.*)$/.exec(text)
      if (currentLabel === 'Bullets' && numbered) current.bullets.push(numbered[1] ?? '')
    }
  }
  return blocks
}

/** Exact copy comparison. NFC on both sides is the only normalization applied. */
export function sameCopy(a: string, b: string): boolean {
  return a.normalize('NFC') === b.normalize('NFC')
}

/** A field annotated with a source note in parentheses keeps the text before " (". */
export function withoutSourceNote(value: string): string {
  const i = value.indexOf(' (')
  return i === -1 ? value : value.slice(0, i)
}

const inventory = parseInventory(readFileSync(INVENTORY_PATH, 'utf8'))

function block(id: string): InventoryBlock {
  const found = inventory.get(id)
  if (!found) throw new Error(`01-CONTENT-INVENTORY.md has no ${id} block`)
  return found
}

function label(id: string, name: string): string {
  const value = block(id).labels.get(name)
  if (value === undefined) throw new Error(`${id} has no "${name}" line`)
  return value
}

function contactHref(kind: string): string {
  const link = siteContent.contacts.find((c) => c.kind === kind)
  if (!link) throw new Error(`siteContent has no ${kind} contact`)
  return link.href
}

describe('inventory parser', () => {
  it('returns a block per inventory ID with labels and numbered bullets', () => {
    for (const id of ['HERO-01', 'EXP-01', 'PRJ-01', 'ABT-01', 'CON-01']) {
      expect(inventory.has(id), id).toBe(true)
    }
    expect(block('EXP-01').bullets).toHaveLength(3)
    expect(block('PRJ-03').bullets).toHaveLength(4)
    expect(label('EXP-01', 'Organization')).toBe('Capital One')
    expect(label('PRJ-01', 'Links')).toContain('https://github.com/aa-phan/RecipeCart')
  })

  it('strips a parenthesised source note from GPA and Track values', () => {
    expect(withoutSourceNote(label('EDU-01', 'GPA'))).toBe('3.2')
    expect(withoutSourceNote(label('EDU-01', 'Track'))).toBe('Data Science')
    expect(withoutSourceNote('3.911')).toBe('3.911')
  })
})

describe('profile parity with the inventory', () => {
  const { profile } = siteContent

  it('HERO-01 equals the name', () => {
    expect(sameCopy(label('HERO-01', 'Value'), profile.name)).toBe(true)
  })

  it('HERO-02 Chosen equals the tagline', () => {
    expect(sameCopy(label('HERO-02', 'Chosen'), profile.tagline)).toBe(true)
  })

  it('ABT-01 and ABT-02 equal the bio paragraphs, including U+2019', () => {
    expect(sameCopy(label('ABT-01', 'Value'), profile.bio[0] ?? '')).toBe(true)
    expect(sameCopy(label('ABT-02', 'Value'), profile.bio[1] ?? '')).toBe(true)
    expect(profile.bio[0]).toContain('I’m')
  })

  it('ABT-03 matches the quote: undefined when the inventory says none', () => {
    const value = label('ABT-03', 'Value')
    const quote = 'quote' in profile ? (profile as { quote?: string }).quote : undefined
    if (/^none\b/i.test(value)) {
      expect(quote).toBeUndefined()
    } else {
      expect(sameCopy(value, quote ?? '')).toBe(true)
    }
  })
})

describe('contacts parity with the inventory', () => {
  it('CON-01 equals the email address behind mailto', () => {
    expect(sameCopy(label('CON-01', 'Value'), contactHref('email').replace(/^mailto:/, ''))).toBe(
      true,
    )
  })

  it('CON-02 to CON-04 equal their hrefs', () => {
    expect(sameCopy(label('CON-02', 'Value'), contactHref('github'))).toBe(true)
    expect(sameCopy(label('CON-03', 'Value'), contactHref('linkedin'))).toBe(true)
    expect(sameCopy(label('CON-04', 'Value'), contactHref('instagram'))).toBe(true)
  })
})

describe('write-up rule (03-02, permanent)', () => {
  const figure = /\d+(?:\.\d+)?%?/g

  it.each(['PRJ-01', 'PRJ-02', 'PRJ-03'])(
    '%s write-up figures all appear in the project bullets',
    (id) => {
      const entry = block(id)
      const key = [...entry.labels.keys()].find((k) => /^Write-up \(.*(approved|edited)/.test(k))
      expect(key, `${id} has an approved or edited write-up`).toBeDefined()
      const writeup = (entry.children.get(key ?? '') ?? []).join(' ')
      expect(writeup.length).toBeGreaterThan(0)
      const bulletText = entry.bullets.join(' ')
      for (const found of writeup.match(figure) ?? []) {
        expect(bulletText, `${id} figure ${found}`).toContain(found)
      }
    },
  )
})

describe('comparator self-check', () => {
  it('detects a swapped en dash or typographic apostrophe', () => {
    const range = label('EXP-02', 'Dates')
    expect(range).toContain('–')
    expect(sameCopy(range, range.replace('–', '-'))).toBe(false)
    const bio = label('ABT-01', 'Value')
    expect(bio).toContain('’')
    expect(sameCopy(bio, bio.replace('’', "'"))).toBe(false)
  })

  it('treats canonically equivalent Unicode as equal via NFC', () => {
    expect(sameCopy('é', 'é')).toBe(true)
  })

  it('has no phone value recorded for CON-06', () => {
    expect(label('CON-06', 'Value')).toBe('EXCLUDED.')
  })
})
