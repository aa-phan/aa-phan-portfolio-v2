// Contrast gate.
//
// Reads the token file the site ships, resolves every color token per theme with
// the ported color math, and checks every pair in scripts/contrast-pairs.json in
// four themes (light, dark, and the inverted band on each page theme) against WCAG 2.2 AA:
// text 4.5, large text 3, UI components 3, focus indicators 3. Ratios are compared unrounded, and a color outside the sRGB gamut
// counts as a failure.
//
// A pair may carry "themes": [...] to limit where it is evaluated; the band-only sleeve grounds
// must, and only in the band themes.
//
// Flags: --tokens PATH (default src/styles/tokens.css)
//        --pairs PATH  (default scripts/contrast-pairs.json)
//        --matrix PATH (default docs/contrast-matrix.md)
//        --write       regenerate the matrix file instead of comparing with it
// Prints one row per check, then "RESULT: PASS checks=N" or
// "RESULT: FAIL failures=K checks=N".
//
// The committed matrix documents the shipped tokens only. A default run (no
// --tokens or --pairs override) compares the regenerated matrix with the file and
// fails with "matrix stale" when they differ or the file is missing.
// Exit: 0 pass, 1 any failure or a stale matrix, 2 a file or token that cannot be
// parsed.
import fs from 'node:fs'
import path from 'node:path'
import { THRESHOLDS, contrast } from './lib/color.mjs'
import {
  BAND_ONLY_TOKENS,
  COLOR_TOKENS,
  TokenError,
  parseTokensCss,
  resolveTheme,
} from './lib/tokens.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const THEMES = ['light', 'dark', 'band-on-light', 'band-on-dark']
const BAND_THEMES = ['band-on-light', 'band-on-dark']
const DEFAULT_TOKENS = path.join(ROOT, 'src/styles/tokens.css')
const DEFAULT_PAIRS = path.join(ROOT, 'scripts/contrast-pairs.json')
const DEFAULT_MATRIX = path.join(ROOT, 'docs/contrast-matrix.md')

class UsageError extends Error {}

function parseArgs(argv) {
  const opts = {
    tokens: DEFAULT_TOKENS,
    pairs: DEFAULT_PAIRS,
    matrix: DEFAULT_MATRIX,
    write: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i]
    if (flag === '--write') {
      opts.write = true
    } else if (flag === '--tokens' || flag === '--pairs' || flag === '--matrix') {
      const value = argv[++i]
      if (!value) throw new UsageError(`${flag} needs a PATH`)
      opts[flag.slice(2)] = path.resolve(value)
    } else {
      throw new UsageError(`unknown flag ${flag}`)
    }
  }
  return opts
}

function errorMessage(e) {
  return e instanceof Error ? e.message : String(e)
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8')
  } catch (e) {
    throw new UsageError(`cannot read ${file}: ${errorMessage(e)}`)
  }
}

function loadPairs(file) {
  let pairs
  try {
    pairs = JSON.parse(readText(file))
  } catch (e) {
    if (e instanceof UsageError) throw e
    throw new UsageError(`${file} is not valid JSON: ${errorMessage(e)}`)
  }
  if (!Array.isArray(pairs) || pairs.length === 0) {
    throw new UsageError(`${file} must hold a non-empty array of pairs`)
  }
  for (const p of pairs) {
    for (const key of ['fg', 'bg']) {
      if (!COLOR_TOKENS.includes(p?.[key])) {
        throw new UsageError(`pair ${JSON.stringify(p)}: ${key} is not a color token`)
      }
    }
    if (!Object.hasOwn(THRESHOLDS, p.category)) {
      throw new UsageError(`pair ${p.fg} on ${p.bg}: unknown category "${p.category}"`)
    }
    if (typeof p.usedBy !== 'string') {
      throw new UsageError(`pair ${p.fg} on ${p.bg}: usedBy must be a string`)
    }
    if (p.themes !== undefined) {
      if (!Array.isArray(p.themes) || p.themes.length === 0) {
        throw new UsageError(`pair ${p.fg} on ${p.bg}: themes must be a non-empty array`)
      }
      for (const t of p.themes) {
        if (!THEMES.includes(t)) {
          throw new UsageError(`pair ${p.fg} on ${p.bg}: unknown theme "${t}"`)
        }
      }
    }
    // The sleeve grounds exist only inside the band, so a pair using one must say so.
    if (BAND_ONLY_TOKENS.includes(p.fg) || BAND_ONLY_TOKENS.includes(p.bg)) {
      if (!p.themes || !p.themes.every((t) => BAND_THEMES.includes(t))) {
        throw new UsageError(
          `pair ${p.fg} on ${p.bg}: a band-only token needs "themes" limited to ${BAND_THEMES.join(' and ')}`,
        )
      }
    }
  }
  return pairs
}

// One result per theme and pair: light rows first, then dark, then the band themes, in pair order.
function evaluate(themes, pairs) {
  const results = []
  for (const theme of THEMES) {
    for (const p of pairs) {
      if (p.themes && !p.themes.includes(theme)) continue
      const fg = themes[theme][p.fg]
      const bg = themes[theme][p.bg]
      const min = THRESHOLDS[p.category]
      if (!fg.inGamut || !bg.inGamut) {
        results.push({ theme, ...p, ratio: null, min, pass: false })
        continue
      }
      const ratio = contrast(fg, bg)
      results.push({ theme, ...p, ratio, min, pass: ratio >= min })
    }
  }
  return results
}

function row(r) {
  const measured = r.ratio === null ? 'OUT-OF-GAMUT' : r.ratio.toFixed(2)
  const verdict = r.pass ? 'PASS' : 'FAIL'
  return `${r.theme} ${r.fg} on ${r.bg} ${r.category} ${measured} min ${r.min.toFixed(1)} ${verdict} ${r.usedBy}`.trimEnd()
}

// Deterministic markdown: no dates, no timestamps, so a rerun is byte-identical.
function buildMatrix(results) {
  const lines = [
    '# Contrast matrix',
    '',
    'Generated by `npm run check:contrast -- --write` from `src/styles/tokens.css` and ' +
      '`scripts/contrast-pairs.json`. CI fails when this file differs from the regenerated ' +
      'output, so it always documents the tokens the site ships. Standard: WCAG 2.2 AA, ' +
      'text 4.5:1, large text 3:1, UI components and focus indicators 3:1.',
    '',
    '| Theme | Foreground | Background | Category | Ratio | Min | Result | Used by |',
    '|-------|------------|------------|----------|-------|-----|--------|---------|',
  ]
  for (const r of results) {
    const ratio = r.ratio === null ? 'out of gamut' : r.ratio.toFixed(2)
    const cells = [
      r.theme,
      r.fg,
      r.bg,
      r.category,
      ratio,
      r.min.toFixed(1),
      r.pass ? 'PASS' : 'FAIL',
      r.usedBy,
    ]
    lines.push(`| ${cells.join(' | ')} |`)
  }
  return `${lines.join('\n')}\n`
}

function matrixIsStale(opts, expected) {
  if (opts.tokens !== DEFAULT_TOKENS || opts.pairs !== DEFAULT_PAIRS) return false
  let current
  try {
    current = fs.readFileSync(opts.matrix, 'utf8')
  } catch {
    return true
  }
  return current !== expected
}

function main(argv) {
  const opts = parseArgs(argv)
  const raw = parseTokensCss(readText(opts.tokens))
  const themes = {
    light: resolveTheme(raw.light),
    dark: resolveTheme(raw.dark),
    'band-on-light': resolveTheme(raw.bandOnLight, { band: true }),
    'band-on-dark': resolveTheme(raw.bandOnDark, { band: true }),
  }
  const pairs = loadPairs(opts.pairs)
  const results = evaluate(themes, pairs)

  for (const r of results) console.log(row(r))
  let failures = results.filter((r) => !r.pass).length

  const matrix = buildMatrix(results)
  if (opts.write) {
    fs.mkdirSync(path.dirname(opts.matrix), { recursive: true })
    fs.writeFileSync(opts.matrix, matrix)
    console.log(`wrote ${path.relative(ROOT, opts.matrix)}`)
  } else if (matrixIsStale(opts, matrix)) {
    console.log('matrix stale: run npm run check:contrast -- --write')
    failures += 1
  }

  if (failures === 0) {
    console.log(`RESULT: PASS checks=${results.length}`)
    return 0
  }
  console.log(`RESULT: FAIL failures=${failures} checks=${results.length}`)
  return 1
}

try {
  process.exitCode = main(process.argv.slice(2))
} catch (e) {
  if (e instanceof UsageError || e instanceof TokenError) {
    console.log(`ERROR: ${e.message}`)
    process.exitCode = 2
  } else {
    throw e
  }
}
