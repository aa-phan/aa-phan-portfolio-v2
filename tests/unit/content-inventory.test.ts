import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { siteContent } from '@/content'
import type { Writeup } from '@/content'

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

describe('experience parity with the inventory', () => {
  const ids = ['EXP-01', 'EXP-02', 'EXP-03', 'EXP-04', 'EXP-05']
  const { experience } = siteContent

  it('has five entries, one per EXP block', () => {
    expect(experience).toHaveLength(5)
    expect(ids).toHaveLength(5)
  })

  it.each(ids.map((id, index) => [id, index] as const))(
    '%s equals the module entry at its position: role, org, location, dates and bullets',
    (id, index) => {
      const entry = experience[index]
      if (!entry) throw new Error(`module has no entry at position ${index}`)
      expect(sameCopy(label(id, 'Title'), entry.role), `${id} role`).toBe(true)
      expect(sameCopy(label(id, 'Organization'), entry.org), `${id} org`).toBe(true)
      const location = label(id, 'Location')
      const entryLocation =
        'location' in entry ? (entry as { location?: string }).location : undefined
      if (/^not stated\b/i.test(location)) {
        expect(entryLocation, `${id} location`).toBeUndefined()
      } else {
        expect(sameCopy(location, entryLocation ?? ''), `${id} location`).toBe(true)
      }
      expect(sameCopy(label(id, 'Dates'), entry.dates.label), `${id} dates`).toBe(true)
      const bullets = block(id).bullets
      expect(bullets).toHaveLength(entry.bullets.length)
      bullets.forEach((text, i) => {
        expect(sameCopy(text, entry.bullets[i] ?? ''), `${id} bullet ${i + 1}`).toBe(true)
      })
    },
  )

  it('keeps the Spectrum less-than-or-equal sign and the 30% figure (R-07)', () => {
    expect(experience[1]?.bullets[0]).toContain('≤')
    expect(experience[1]?.bullets[1]).toContain('30%')
  })

  it('self-check: a swapped en dash in a date label is detected', () => {
    const entry = experience[0]
    expect(entry).toBeDefined()
    expect(sameCopy(label('EXP-01', 'Dates'), (entry?.dates.label ?? '').replace('–', '-'))).toBe(
      false,
    )
  })
})

describe('project parity with the inventory', () => {
  const ids = ['PRJ-01', 'PRJ-02', 'PRJ-03', 'PRJ-04', 'PRJ-05', 'PRJ-06', 'PRJ-07']
  const { projects, experience } = siteContent

  it('has seven entries, one per PRJ block, in inventory order', () => {
    expect(projects).toHaveLength(7)
    expect(projects.map((project) => project.title)).toEqual(ids.map((id) => label(id, 'Title')))
  })

  it.each(ids.map((id, index) => [id, index] as const))(
    '%s equals the module entry at its position',
    (id, index) => {
      const entry = projects[index]
      if (!entry) throw new Error(`module has no project at position ${index}`)
      expect(sameCopy(label(id, 'Title'), entry.title), `${id} title`).toBe(true)

      // "Context: kind, label": the label may not contain the kind separator.
      const [kind, ...rest] = label(id, 'Context').split(', ')
      expect(kind, `${id} context kind`).toBe(entry.context.kind)
      expect(sameCopy(rest.join(', '), entry.context.label), `${id} context label`).toBe(true)

      expect(sameCopy(label(id, 'Dates'), entry.dates.label), `${id} dates`).toBe(true)
      expect(label(id, 'Stack').split(', '), `${id} stack`).toEqual([...entry.stack])

      const bullets = block(id).bullets
      expect(bullets).toHaveLength(entry.bullets.length)
      bullets.forEach((text, i) => {
        expect(sameCopy(text, entry.bullets[i] ?? ''), `${id} bullet ${i + 1}`).toBe(true)
      })

      expect(/^yes\b/i.test(label(id, 'Featured')), `${id} featured`).toBe(entry.featured)

      const links = label(id, 'Links')
      const code =
        'links' in entry ? (entry as { links?: { code?: string } }).links?.code : undefined
      if (/^Code /.test(links)) {
        expect(code, `${id} code link`).toBe(links.slice('Code '.length).trim())
        expect(code?.startsWith('https://'), `${id} code link is https`).toBe(true)
      } else {
        expect(links, `${id} links line`).toMatch(/^none\b/i)
        expect(code, `${id} code link`).toBeUndefined()
      }

      const related = label(id, 'Related experience')
      const relatedId = 'relatedExperienceId' in entry ? entry.relatedExperienceId : undefined
      if (/^EXP-\d+/.test(related)) {
        const expectedId = experience[Number(related.slice(4, 6)) - 1]?.id
        expect(relatedId, `${id} related experience`).toBe(expectedId)
      } else {
        expect(relatedId, `${id} related experience`).toBeUndefined()
      }

      const writeup = 'writeup' in entry ? (entry as { writeup?: Writeup }).writeup : undefined
      const key = [...block(id).labels.keys()].find((k) =>
        /^Write-up \(.*(approved|edited)/.test(k),
      )
      if (key === undefined) {
        expect(writeup, `${id} write-up`).toBeUndefined()
      } else {
        const lines = block(id).children.get(key) ?? []
        const part = (name: string) =>
          lines.find((line) => line.startsWith(`${name}: `))?.slice(name.length + 2) ?? ''
        expect(sameCopy(part('Problem'), writeup?.problem ?? ''), `${id} problem`).toBe(true)
        expect(sameCopy(part('Approach'), writeup?.approach ?? ''), `${id} approach`).toBe(true)
        expect(sameCopy(part('Outcome'), writeup?.outcome ?? ''), `${id} outcome`).toBe(true)
      }
    },
  )

  it('keeps the 30% figure in both the EXP-02 and the PRJ-02 bullets (R-07)', () => {
    expect(block('EXP-02').bullets.join(' ')).toContain('30%')
    expect(block('PRJ-02').bullets.join(' ')).toContain('30%')
    expect(experience[1]?.bullets.join(' ')).toContain('30%')
    expect(projects[1]?.bullets.join(' ')).toContain('30%')
  })

  it('self-check: a changed stack item is detected', () => {
    const stack = label('PRJ-01', 'Stack').split(', ')
    expect(stack).not.toEqual([...(projects[0]?.stack ?? [])].map((item) => item.toLowerCase()))
  })
})

describe('skills parity with the inventory', () => {
  const ids = ['SKL-01', 'SKL-02', 'SKL-03', 'SKL-04']
  const { skills } = siteContent

  it.each(ids.map((id, index) => [id, index] as const))(
    '%s items equal the module group at its position',
    (id, index) => {
      const group = skills[index]
      if (!group) throw new Error(`module has no skill group at position ${index}`)
      expect(group.label).toBe(block(id).heading.slice(id.length + 1))
      expect([...group.items]).toEqual(label(id, 'Value').split(', ').reduce(joinParens, []))
    },
  )
})

/** Re-join items split inside a parenthesis, such as "SQL (Postgres)". */
function joinParens(acc: string[], part: string): string[] {
  const last = acc[acc.length - 1]
  if (last !== undefined && last.includes('(') && !last.includes(')')) {
    acc[acc.length - 1] = `${last}, ${part}`
  } else {
    acc.push(part)
  }
  return acc
}

describe('education parity with the inventory', () => {
  const ids = ['EDU-01', 'EDU-02']
  const { education } = siteContent

  it.each(ids.map((id, index) => [id, index] as const))(
    '%s equals the module entry at its position',
    (id, index) => {
      const entry = education[index]
      if (!entry) throw new Error(`module has no education entry at position ${index}`)
      expect(sameCopy(label(id, 'Degree'), entry.degree), `${id} degree`).toBe(true)
      expect(sameCopy(label(id, 'Organization'), entry.school), `${id} school`).toBe(true)
      expect(sameCopy(label(id, 'Location'), entry.location), `${id} location`).toBe(true)
      expect(sameCopy(label(id, 'Dates'), entry.dates.label), `${id} dates`).toBe(true)
      expect(withoutSourceNote(label(id, 'GPA')), `${id} gpa`).toBe(entry.gpa)
      const track = 'track' in entry ? (entry as { track?: string }).track : undefined
      const inventoryTrack = block(id).labels.get('Track')
      if (inventoryTrack === undefined) {
        expect(track, `${id} track`).toBeUndefined()
      } else {
        expect(withoutSourceNote(inventoryTrack), `${id} track`).toBe(track)
      }
    },
  )
})

describe('inventory completeness (CNT-02)', () => {
  const idsWith = (prefix: string) => [...inventory.keys()].filter((id) => id.startsWith(prefix))
  const isPublicContact = (id: string) => /^(https:\/\/|[^\s@]+@[^\s@]+$)/.test(label(id, 'Value'))
  const { experience, projects, education, skills, contacts } = siteContent

  it.each([
    ['EXP', experience.length, 5],
    ['PRJ', projects.length, 7],
    ['EDU', education.length, 2],
    ['SKL', skills.length, 4],
  ] as const)(
    'every %s inventory block has exactly one module entry (%i of %i)',
    (prefix, count, expected) => {
      expect(idsWith(prefix)).toHaveLength(expected)
      expect(count).toBe(expected)
    },
  )

  it('every public CON block has exactly one contact, and no excluded one is present', () => {
    const publicIds = idsWith('CON').filter(isPublicContact)
    expect(publicIds).toEqual(['CON-01', 'CON-02', 'CON-03', 'CON-04'])
    expect(contacts).toHaveLength(4)
    expect(contacts.map((c) => c.kind)).toEqual(['email', 'github', 'linkedin', 'instagram'])
  })

  it('module ids are unique within each array', () => {
    for (const list of [experience, projects, education, skills]) {
      const ids = list.map((entry) => entry.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('self-check: a missing module entry would be detected', () => {
    expect(idsWith('SKL')).not.toHaveLength(skills.length - 1)
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
