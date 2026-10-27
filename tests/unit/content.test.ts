import { describe, expect, it } from 'vitest'
import { siteContent } from '@/content'

type Visit = { path: string; value: unknown }

function walk(value: unknown, path = 'siteContent'): Visit[] {
  const out: Visit[] = [{ path, value }]
  if (Array.isArray(value)) {
    value.forEach((item, i) => out.push(...walk(item, `${path}[${i}]`)))
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) out.push(...walk(child, `${path}.${key}`))
  }
  return out
}

const visits = walk(siteContent)
const strings = visits.filter(
  (v): v is { path: string; value: string } => typeof v.value === 'string',
)

// The phone probe is composed from digit-group quantifiers so no phone-shaped literal is committed.
const SEP = '[\\s.\\-\\u2010-\\u2015\\u00a0]*'
const PHONE_SHAPE = new RegExp(
  `(?<!\\d)(?:\\+?\\d{1,2}${SEP})?(?:\\(\\d{3}\\)|\\d{3})${SEP}\\d{3}${SEP}\\d{4}(?!\\d)|(?<![0-9A-Za-z])\\d{10}(?![0-9A-Za-z])`,
)
const TEL_SCHEME = /^\s*tel:/i

describe('content rules', () => {
  it('walks a non-trivial tree', () => {
    expect(strings.length).toBeGreaterThan(5)
  })

  it('has no phone-shaped string and no telephone link scheme', () => {
    for (const { path, value } of strings) {
      expect(PHONE_SHAPE.test(value), `${path} looks like a phone number`).toBe(false)
      expect(TEL_SCHEME.test(value), `${path} is a telephone link`).toBe(false)
    }
  })

  it('has no phone key anywhere in the model', () => {
    for (const { path } of visits) {
      expect(path.toLowerCase(), path).not.toMatch(/\.(phone|tel|telephone|mobile)\b/)
    }
  })

  it('probe self-check: a runtime-built phone shape and a tel scheme are caught', () => {
    const digits = (n: number) => '4'.repeat(n)
    const shaped = `(${digits(3)}) ${digits(3)}-${digits(4)}`
    expect(PHONE_SHAPE.test(shaped)).toBe(true)
    expect(PHONE_SHAPE.test(digits(10))).toBe(true)
    expect(PHONE_SHAPE.test('May 2025 – August 2025')).toBe(false)
    expect(TEL_SCHEME.test(`tel:${digits(10)}`)).toBe(true)
  })

  it('has external contact links on https and the email link on mailto', () => {
    for (const link of siteContent.contacts) {
      if (link.external) expect(link.href.startsWith('https://'), link.href).toBe(true)
    }
    const email = siteContent.contacts.find((c) => c.kind === 'email')
    expect(email?.href.startsWith('mailto:')).toBe(true)
    expect(email?.external).toBe(false)
  })

  it('has unique ids within every array of objects that carry an id', () => {
    for (const { path, value } of visits) {
      if (!Array.isArray(value)) continue
      const ids = value
        .filter((item): item is { id: string } => typeof item?.id === 'string')
        .map((item) => item.id)
      expect(new Set(ids).size, `${path} has duplicate ids`).toBe(ids.length)
    }
  })

  it('keeps experience start dates non-increasing in array order (ties allowed)', () => {
    const starts = siteContent.experience.map((entry) => entry.dates.start)
    expect(starts).toHaveLength(5)
    for (let i = 1; i < starts.length; i++) {
      // ISO year-month strings sort lexically in date order.
      const newer = starts[i - 1] ?? ''
      const older = starts[i] ?? ''
      expect(newer >= older, `entry ${i - 1} starts before entry ${i}`).toBe(true)
    }
  })

  it('writes experience date labels with an en dash and ISO year-months', () => {
    for (const { dates } of siteContent.experience) {
      expect(dates.start).toMatch(/^\d{4}-\d{2}$/)
      expect(dates.end).toMatch(/^(\d{4}-\d{2}|present)$/)
      expect(dates.label).toContain(' – ')
    }
  })

  it('gives every image with a src a defined alt (empty string means decorative)', () => {
    for (const { path, value } of visits) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) continue
      const image = value as { src?: unknown; alt?: unknown }
      if (typeof image.src === 'string') {
        expect(typeof image.alt, `${path} needs alt text`).toBe('string')
      }
    }
  })
})
