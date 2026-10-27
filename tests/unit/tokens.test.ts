import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { contrast } from '../../scripts/lib/color.mjs'
import {
  BAND_ONLY_TOKENS,
  COLOR_TOKENS,
  parseTokensCss,
  resolveTheme,
} from '../../scripts/lib/tokens.mjs'

const ROOT = path.resolve(import.meta.dirname, '../..')
const TOKENS = path.join(ROOT, 'src/styles/tokens.css')
const MATRIX = path.join(ROOT, 'docs/contrast-matrix.md')
const GATE = path.join(ROOT, 'scripts/check-contrast.mjs')

type ThemeName = 'light' | 'dark'

const raw = parseTokensCss(readFileSync(TOKENS, 'utf8'))
const themes = { light: resolveTheme(raw.light), dark: resolveTheme(raw.dark) }
const bandThemes = {
  bandOnLight: resolveTheme(raw.bandOnLight, { band: true }),
  bandOnDark: resolveTheme(raw.bandOnDark, { band: true }),
}
// The fourteen page tokens: every color token except the band-only sleeve grounds.
const PAGE_TOKENS: string[] = COLOR_TOKENS.filter((t: string) => !BAND_ONLY_TOKENS.includes(t))
const SLEEVES = ['--sleeve-personal', '--sleeve-employer', '--sleeve-hackathon', '--sleeve-course']

// The chosen system: five role tokens, then the nine derived tokens, as hex.
const HEX: Record<string, { light: string; dark: string }> = {
  '--text': { light: '0b0a10', dark: 'f5f5f7' },
  '--background': { light: 'f5f5f7', dark: '0b0a10' },
  '--primary': { light: '5046e5', dark: '7b75ff' },
  '--secondary': { light: 'e9e9ee', dark: '1c1b24' },
  '--accent': { light: '433bff', dark: '9d99ff' },
  '--surface': { light: 'f1f1f4', dark: '15141c' },
  '--muted': { light: '46464b', dark: 'aaaaae' },
  '--border': { light: 'cfcfd2', dark: '29282e' },
  '--border-strong': { light: '68686d', dark: '808084' },
  '--link': { light: '4638b4', dark: '9d99ff' },
  '--on-primary': { light: 'f5f5f7', dark: '0b0a10' },
  '--on-accent': { light: 'f5f5f7', dark: '0b0a10' },
  '--primary-hover': { light: '493cc0', dark: '756dee' },
  '--focus-ring': { light: '0b0a10', dark: 'f5f5f7' },
}

// The 38 audited ratios: theme, foreground, background, ratio to two decimals.
const RATIOS: Array<[ThemeName, string, string, number]> = [
  ['light', '--text', '--background', 18.11],
  ['light', '--text', '--surface', 17.49],
  ['light', '--text', '--secondary', 16.29],
  ['light', '--muted', '--background', 8.62],
  ['light', '--muted', '--surface', 8.32],
  ['light', '--link', '--background', 7.76],
  ['light', '--link', '--surface', 7.5],
  ['light', '--on-primary', '--primary', 5.76],
  ['light', '--on-primary', '--primary-hover', 7.17],
  ['light', '--on-accent', '--accent', 5.83],
  ['light', '--border-strong', '--background', 5.09],
  ['light', '--border-strong', '--surface', 4.92],
  ['light', '--primary', '--background', 5.76],
  ['light', '--accent', '--background', 5.83],
  ['light', '--accent', '--surface', 5.63],
  ['light', '--focus-ring', '--background', 18.11],
  ['light', '--focus-ring', '--surface', 17.49],
  ['light', '--focus-ring', '--primary', 3.14],
  ['light', '--focus-ring', '--secondary', 16.29],
  ['dark', '--text', '--background', 18.11],
  ['dark', '--text', '--surface', 16.79],
  ['dark', '--text', '--secondary', 15.66],
  ['dark', '--muted', '--background', 8.52],
  ['dark', '--muted', '--surface', 7.9],
  ['dark', '--link', '--background', 7.92],
  ['dark', '--link', '--surface', 7.34],
  ['dark', '--on-primary', '--primary', 5.47],
  ['dark', '--on-primary', '--primary-hover', 4.86],
  ['dark', '--on-accent', '--accent', 7.92],
  ['dark', '--border-strong', '--background', 5.01],
  ['dark', '--border-strong', '--surface', 4.65],
  ['dark', '--primary', '--background', 5.47],
  ['dark', '--accent', '--background', 7.92],
  ['dark', '--accent', '--surface', 7.34],
  ['dark', '--focus-ring', '--background', 18.11],
  ['dark', '--focus-ring', '--surface', 16.79],
  ['dark', '--focus-ring', '--primary', 3.31],
  ['dark', '--focus-ring', '--secondary', 15.66],
]

const tempDirs: string[] = []

function makeTemp(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'tokens-'))
  tempDirs.push(dir)
  return dir
}

function runGate(args: string[]) {
  const result = spawnSync(process.execPath, [GATE, ...args], { cwd: ROOT, encoding: 'utf8' })
  return { status: result.status, out: `${result.stdout}${result.stderr}` }
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('palette D in src/styles/tokens.css', () => {
  it('resolves exactly the fourteen page color tokens in both themes', () => {
    expect(Object.keys(HEX)).toEqual(PAGE_TOKENS)
    expect(Object.keys(themes.light)).toEqual(PAGE_TOKENS)
    expect(Object.keys(themes.dark)).toEqual(PAGE_TOKENS)
  })

  it('lists eighteen color tokens, the last four being the band-only sleeve grounds', () => {
    expect(COLOR_TOKENS).toHaveLength(18)
    expect(BAND_ONLY_TOKENS).toEqual(SLEEVES)
    expect(COLOR_TOKENS.slice(14)).toEqual(SLEEVES)
  })

  it('delivers the five role values as the swatch hexes', () => {
    for (const token of COLOR_TOKENS.slice(0, 5)) {
      expect(themes.light[token].hex, `light ${token}`).toBe(HEX[token].light)
      expect(themes.dark[token].hex, `dark ${token}`).toBe(HEX[token].dark)
    }
  })

  it('resolves the derived values to the chosen-system hexes', () => {
    for (const token of PAGE_TOKENS.slice(5)) {
      expect(themes.light[token].hex, `light ${token}`).toBe(HEX[token].light)
      expect(themes.dark[token].hex, `dark ${token}`).toBe(HEX[token].dark)
    }
  })

  it('keeps every color inside the sRGB gamut', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const token of PAGE_TOKENS) {
        expect(themes[theme][token].inGamut, `${theme} ${token}`).toBe(true)
      }
    }
  })

  it('reproduces all 38 audited ratios to two decimals', () => {
    expect(RATIOS).toHaveLength(38)
    for (const [theme, fg, bg, want] of RATIOS) {
      const got = contrast(themes[theme][fg], themes[theme][bg])
      expect(got.toFixed(2), `${theme} ${fg} on ${bg}`).toBe(want.toFixed(2))
    }
  })
})

describe('parseTokensCss and resolveTheme', () => {
  it('ignores comments and non-color tokens, and lets later declarations win', () => {
    const css = `
      /* --text: oklch(0 0 0); */
      :root, [data-theme='light'] { --text: oklch(0.2 0 0); --z-base: 0; }
      :root { --text: oklch(0.3 0 0); }
      [data-theme='dark'] { --text: oklch(0.9 0 0); }
    `
    const parsed = parseTokensCss(css)
    expect(parsed.light['--text']).toBe('oklch(0.3 0 0)')
    expect(parsed.dark['--text']).toBe('oklch(0.9 0 0)')
    expect(parsed.light['--z-base']).toBe('0')
  })

  it('reads a final declaration that has no trailing semicolon', () => {
    const parsed = parseTokensCss(':root { --text: oklch(0.2 0 0); --muted: oklch(0.4 0 0) }')
    expect(parsed.light['--text']).toBe('oklch(0.2 0 0)')
    expect(parsed.light['--muted']).toBe('oklch(0.4 0 0)')
  })

  it.each([
    '@media (prefers-color-scheme: dark)',
    '@layer tokens',
    '@supports (color: oklch(0 0 0))',
  ])('fails loudly when tokens are wrapped in %s', (wrapper) => {
    const css = `${wrapper} { :root { --text: oklch(0.2 0 0); } }`
    expect(() => parseTokensCss(css)).toThrow(/uses @/)
  })

  it('files .band-invert blocks into their own maps and never into the page themes', () => {
    const css = `
      :root, [data-theme='light'] { --text: oklch(0.2 0 0); --muted: oklch(0.4 0 0); }
      [data-theme='dark'] { --text: oklch(0.9 0 0); --muted: oklch(0.7 0 0); }
      [data-theme='light'] .band-invert { --text: oklch(0.91 0 0); --muted: oklch(0.71 0 0); }
      [data-theme='dark'] .band-invert { --text: oklch(0.21 0 0); --muted: oklch(0.41 0 0) }
    `
    const parsed = parseTokensCss(css)
    expect(parsed.light).toEqual({ '--text': 'oklch(0.2 0 0)', '--muted': 'oklch(0.4 0 0)' })
    expect(parsed.dark).toEqual({ '--text': 'oklch(0.9 0 0)', '--muted': 'oklch(0.7 0 0)' })
    expect(parsed.bandOnLight).toEqual({
      '--text': 'oklch(0.91 0 0)',
      '--muted': 'oklch(0.71 0 0)',
    })
    expect(parsed.bandOnDark).toEqual({ '--text': 'oklch(0.21 0 0)', '--muted': 'oklch(0.41 0 0)' })
  })

  it('names the token when a required one is missing or malformed', () => {
    const { '--surface': _dropped, ...withoutSurface } = raw.light
    expect(() => resolveTheme(withoutSurface)).toThrow('--surface')
    expect(() => resolveTheme({ ...raw.light, '--accent': '#433bff' })).toThrow('--accent')
  })

  it('rejects a circular derived token', () => {
    const cyclic = {
      ...raw.light,
      '--surface': 'color-mix(in oklch, var(--muted) 30%, var(--background))',
      '--muted': 'color-mix(in oklch, var(--surface) 70%, var(--background))',
    }
    expect(() => resolveTheme(cyclic)).toThrow('circular')
  })
})

describe('inverted band in src/styles/tokens.css', () => {
  it('gives the band the opposite theme complete token block', () => {
    for (const token of PAGE_TOKENS) {
      expect(bandThemes.bandOnLight[token].hex, `band on light ${token}`).toBe(
        themes.dark[token].hex,
      )
      expect(bandThemes.bandOnDark[token].hex, `band on dark ${token}`).toBe(
        themes.light[token].hex,
      )
    }
  })

  it('resolves the sleeve grounds only for a band', () => {
    expect(Object.keys(bandThemes.bandOnLight)).toEqual(COLOR_TOKENS)
    expect(Object.keys(bandThemes.bandOnDark)).toEqual(COLOR_TOKENS)
    for (const token of SLEEVES) {
      expect(themes.light, token).not.toHaveProperty(token)
      expect(raw.light, token).not.toHaveProperty(token)
      expect(raw.dark, token).not.toHaveProperty(token)
    }
    expect(() => resolveTheme(raw.light, { band: true })).toThrow('--sleeve-personal')
  })

  it('derives each sleeve ground from --text, --secondary and --background only', () => {
    for (const map of [raw.bandOnLight, raw.bandOnDark]) {
      for (const token of SLEEVES) {
        const refs = [...map[token].matchAll(/var\((--[a-z-]+)\)/g)].map((m) => m[1])
        expect(refs.length, token).toBe(2)
        for (const ref of refs) {
          expect(['--text', '--secondary', '--background'], `${token} -> ${ref}`).toContain(ref)
        }
        expect(map[token]).not.toMatch(/primary|accent|oklch\(/)
      }
    }
  })

  it('keeps the four sleeve grounds visibly distinct from each other and from the band', () => {
    for (const band of [bandThemes.bandOnLight, bandThemes.bandOnDark]) {
      const lightness = [...SLEEVES, '--background'].map((t) => band[t].L)
      for (let a = 0; a < lightness.length; a++) {
        for (let b = a + 1; b < lightness.length; b++) {
          expect(Math.abs(lightness[a] - lightness[b])).toBeGreaterThan(0.03)
        }
      }
    }
  })

  it('keeps the page theme maps free of band declarations', () => {
    expect(raw.light['--text']).toBe('oklch(0.1491 0.0128 292.39)')
    expect(raw.dark['--text']).toBe('oklch(0.9696 0.003 290)')
  })
})

describe('check-contrast gate', () => {
  it('audits the band in both themes and fails when the band --muted drops below AA', () => {
    const dir = makeTemp()
    const css = readFileSync(TOKENS, 'utf8')
    const block = /(\[data-theme='light'\] \.band-invert \{[^}]*?--muted:)[^;]+;/
    expect(css).toMatch(block)
    writeFileSync(
      path.join(dir, 'tokens.css'),
      css.replace(block, '$1 color-mix(in oklch, var(--text) 30%, var(--background));'),
    )
    const run = runGate(['--tokens', path.join(dir, 'tokens.css')])
    expect(run.status).toBe(1)
    expect(run.out).toMatch(/^band-on-light --muted on --background text .* FAIL/m)
    expect(run.out).toMatch(/^band-on-dark --muted on --background text .* PASS/m)
    expect(run.out.trimEnd().split('\n').at(-1)).toMatch(/^RESULT: FAIL/)
  })

  it('fails when a sleeve ground is mixed so --text on it falls below AA', () => {
    const dir = makeTemp()
    const css = readFileSync(TOKENS, 'utf8')
    const block = /(\[data-theme='dark'\] \.band-invert \{[^}]*?--sleeve-employer:)[^;]+;/
    expect(css).toMatch(block)
    writeFileSync(
      path.join(dir, 'tokens.css'),
      css.replace(block, '$1 color-mix(in oklch, var(--text) 70%, var(--background));'),
    )
    const run = runGate(['--tokens', path.join(dir, 'tokens.css')])
    expect(run.status).toBe(1)
    expect(run.out).toMatch(/^band-on-dark --text on --sleeve-employer text .* FAIL/m)
    expect(run.out.trimEnd().split('\n').at(-1)).toMatch(/^RESULT: FAIL/)
  })

  it('evaluates a pair with a themes field only in those themes', () => {
    const dir = makeTemp()
    const pairs = path.join(dir, 'pairs.json')
    writeFileSync(
      pairs,
      JSON.stringify([
        {
          fg: '--text',
          bg: '--sleeve-personal',
          category: 'text',
          usedBy: 'test',
          themes: ['band-on-light'],
        },
        { fg: '--text', bg: '--background', category: 'text', usedBy: 'test' },
      ]),
    )
    const run = runGate(['--pairs', pairs])
    expect(run.status).toBe(0)
    expect(run.out).toMatch(/^band-on-light --text on --sleeve-personal text /m)
    expect(run.out).not.toMatch(/^(light|dark|band-on-dark) --text on --sleeve-personal/m)
    expect(run.out.trimEnd().split('\n').at(-1)).toBe('RESULT: PASS checks=5')
  })

  it.each([
    ['a band-only token without a themes field', { bg: '--sleeve-course' }, 'band-only'],
    [
      'a band-only token in a page theme',
      { bg: '--sleeve-course', themes: ['band-on-dark', 'dark'] },
      'band-only',
    ],
    ['an unknown theme name', { themes: ['sepia'] }, 'unknown theme "sepia"'],
    ['an empty themes array', { themes: [] }, 'themes'],
  ])('exits 2 for %s', (_label, extra, message) => {
    const dir = makeTemp()
    const pairs = path.join(dir, 'pairs.json')
    writeFileSync(
      pairs,
      JSON.stringify([
        { fg: '--text', bg: '--background', category: 'text', usedBy: 'test', ...extra },
      ]),
    )
    const run = runGate(['--pairs', pairs])
    expect(run.status).toBe(2)
    expect(run.out).toContain(message)
  })

  it('exits 2 when a band block lacks a token', () => {
    const dir = makeTemp()
    const css = readFileSync(TOKENS, 'utf8').replace(
      /(\[data-theme='dark'\] \.band-invert \{[^}]*?)--surface:[^;]+;/,
      '$1',
    )
    writeFileSync(path.join(dir, 'tokens.css'), css)
    const run = runGate(['--tokens', path.join(dir, 'tokens.css')])
    expect(run.status).toBe(2)
    expect(run.out).toContain('--surface')
  })

  it('fails the build when light --primary is lightened below AA', () => {
    const dir = makeTemp()
    const tampered = readFileSync(TOKENS, 'utf8').replace(
      '--primary: oklch(0.5113 0.2298',
      '--primary: oklch(0.75 0.1',
    )
    // Only the page theme is tampered; the dark page's band keeps its own copy of the value.
    expect(tampered.split('oklch(0.5113')).toHaveLength(2)
    writeFileSync(path.join(dir, 'tokens.css'), tampered)
    const run = runGate(['--tokens', path.join(dir, 'tokens.css')])
    expect(run.status).toBe(1)
    expect(run.out).toMatch(/^light --on-primary on --primary text .* FAIL/m)
    expect(run.out.trimEnd().split('\n').at(-1)).toMatch(/^RESULT: FAIL/)
  })

  it('exits 2 and names a missing token', () => {
    const dir = makeTemp()
    const broken = readFileSync(TOKENS, 'utf8').replace(/^\s*--surface:.*$/gm, '')
    writeFileSync(path.join(dir, 'tokens.css'), broken)
    const run = runGate(['--tokens', path.join(dir, 'tokens.css')])
    expect(run.status).toBe(2)
    expect(run.out).toContain('--surface')
  })

  it.each(['constructor', 'toString', 'nope'])(
    'exits 2 naming an unknown category "%s" instead of crashing',
    (category) => {
      const dir = makeTemp()
      const pairs = path.join(dir, 'pairs.json')
      writeFileSync(
        pairs,
        JSON.stringify([{ fg: '--text', bg: '--background', category, usedBy: 'test' }]),
      )
      const run = runGate(['--pairs', pairs])
      expect(run.status).toBe(2)
      expect(run.out).toContain(`unknown category "${category}"`)
    },
  )

  it('exits 1 with "matrix stale" when the committed matrix drifts', () => {
    const dir = makeTemp()
    const matrix = path.join(dir, 'matrix.md')
    copyFileSync(MATRIX, matrix)
    writeFileSync(matrix, `${readFileSync(matrix, 'utf8')}extra\n`)
    const run = runGate(['--matrix', matrix])
    expect(run.status).toBe(1)
    expect(run.out).toContain('matrix stale')
  })

  it('exits 1 with "matrix stale" when the matrix file is missing', () => {
    const run = runGate(['--matrix', path.join(makeTemp(), 'absent.md')])
    expect(run.status).toBe(1)
    expect(run.out).toContain('matrix stale')
  })

  it('skips the staleness comparison for a non-default tokens file', () => {
    const dir = makeTemp()
    copyFileSync(TOKENS, path.join(dir, 'tokens.css'))
    const run = runGate([
      '--tokens',
      path.join(dir, 'tokens.css'),
      '--matrix',
      path.join(dir, 'absent.md'),
    ])
    expect(run.status).toBe(0)
    expect(run.out).not.toContain('matrix stale')
  })

  it('passes on the committed matrix and token file', () => {
    const run = runGate([])
    expect(run.out.trimEnd().split('\n').at(-1)).toMatch(/^RESULT: PASS checks=\d+$/)
    expect(run.status).toBe(0)
  })
})
