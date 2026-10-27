import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { contrast } from '../../scripts/lib/color.mjs'
import { COLOR_TOKENS, parseTokensCss, resolveTheme } from '../../scripts/lib/tokens.mjs'

const ROOT = path.resolve(import.meta.dirname, '../..')
const TOKENS = path.join(ROOT, 'src/styles/tokens.css')
const MATRIX = path.join(ROOT, 'docs/contrast-matrix.md')
const GATE = path.join(ROOT, 'scripts/check-contrast.mjs')

type ThemeName = 'light' | 'dark'

const raw = parseTokensCss(readFileSync(TOKENS, 'utf8'))
const themes = { light: resolveTheme(raw.light), dark: resolveTheme(raw.dark) }

// The chosen system: five role tokens, then the nine derived tokens, as hex.
const HEX: Record<string, { light: string; dark: string }> = {
  '--text': { light: '050315', dark: 'fbfbfe' },
  '--background': { light: 'fbfbfe', dark: '050315' },
  '--primary': { light: '5046e5', dark: '7b75ff' },
  '--secondary': { light: 'dedcff', dark: '1c1950' },
  '--accent': { light: '433bff', dark: '9d99ff' },
  '--surface': { light: 'f2f2ff', dark: '130e37' },
  '--muted': { light: '404053', dark: 'ababb6' },
  '--border': { light: 'd2d2d9', dark: '222135' },
  '--border-strong': { light: '646475', dark: '7e7e8c' },
  '--link': { light: '4236b6', dark: '9d99ff' },
  '--on-primary': { light: 'fbfbfe', dark: '050315' },
  '--on-accent': { light: 'fbfbfe', dark: '050315' },
  '--primary-hover': { light: '453ac1', dark: '736def' },
  '--focus-ring': { light: '050315', dark: 'fbfbfe' },
}

// The 38 audited ratios: theme, foreground, background, ratio to two decimals.
const RATIOS: Array<[ThemeName, string, string, number]> = [
  ['light', '--text', '--background', 19.73],
  ['light', '--text', '--surface', 18.36],
  ['light', '--text', '--secondary', 15.32],
  ['light', '--muted', '--background', 9.79],
  ['light', '--muted', '--surface', 9.11],
  ['light', '--link', '--background', 8.35],
  ['light', '--link', '--surface', 7.77],
  ['light', '--on-primary', '--primary', 6.07],
  ['light', '--on-primary', '--primary-hover', 7.74],
  ['light', '--on-accent', '--accent', 6.15],
  ['light', '--border-strong', '--background', 5.61],
  ['light', '--border-strong', '--surface', 5.22],
  ['light', '--primary', '--background', 6.07],
  ['light', '--accent', '--background', 6.15],
  ['light', '--accent', '--surface', 5.72],
  ['light', '--focus-ring', '--background', 19.73],
  ['light', '--focus-ring', '--surface', 18.36],
  ['light', '--focus-ring', '--primary', 3.25],
  ['light', '--focus-ring', '--secondary', 15.32],
  ['dark', '--text', '--background', 19.73],
  ['dark', '--text', '--surface', 17.75],
  ['dark', '--text', '--secondary', 15.59],
  ['dark', '--muted', '--background', 8.96],
  ['dark', '--muted', '--surface', 8.06],
  ['dark', '--link', '--background', 8.19],
  ['dark', '--link', '--surface', 7.36],
  ['dark', '--on-primary', '--primary', 5.66],
  ['dark', '--on-primary', '--primary-hover', 5.01],
  ['dark', '--on-accent', '--accent', 8.19],
  ['dark', '--border-strong', '--background', 5.1],
  ['dark', '--border-strong', '--surface', 4.58],
  ['dark', '--primary', '--background', 5.66],
  ['dark', '--accent', '--background', 8.19],
  ['dark', '--accent', '--surface', 7.36],
  ['dark', '--focus-ring', '--background', 19.73],
  ['dark', '--focus-ring', '--surface', 17.75],
  ['dark', '--focus-ring', '--primary', 3.49],
  ['dark', '--focus-ring', '--secondary', 15.59],
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

describe('palette A in src/styles/tokens.css', () => {
  it('resolves exactly the fourteen color tokens in both themes', () => {
    expect(Object.keys(HEX)).toEqual(COLOR_TOKENS)
    expect(Object.keys(themes.light)).toEqual(COLOR_TOKENS)
    expect(Object.keys(themes.dark)).toEqual(COLOR_TOKENS)
  })

  it('delivers the five role values as the swatch hexes', () => {
    for (const token of COLOR_TOKENS.slice(0, 5)) {
      expect(themes.light[token].hex, `light ${token}`).toBe(HEX[token].light)
      expect(themes.dark[token].hex, `dark ${token}`).toBe(HEX[token].dark)
    }
  })

  it('resolves the derived values to the chosen-system hexes', () => {
    for (const token of COLOR_TOKENS.slice(5)) {
      expect(themes.light[token].hex, `light ${token}`).toBe(HEX[token].light)
      expect(themes.dark[token].hex, `dark ${token}`).toBe(HEX[token].dark)
    }
  })

  it('keeps every color inside the sRGB gamut', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const token of COLOR_TOKENS) {
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

describe('check-contrast gate', () => {
  it('fails the build when light --primary is lightened below AA', () => {
    const dir = makeTemp()
    const tampered = readFileSync(TOKENS, 'utf8').replace(
      '--primary: oklch(0.5113 0.2298',
      '--primary: oklch(0.75 0.1',
    )
    expect(tampered).not.toContain('oklch(0.5113')
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
