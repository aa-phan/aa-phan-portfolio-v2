// Contrast gate.
//
// Reads the token file the site ships, resolves every color token per theme with
// the ported color math, and checks every pair in scripts/contrast-pairs.json in
// both themes against WCAG 2.2 AA: text 4.5, large text 3, UI components 3, focus
// indicators 3. Ratios are compared unrounded, and a color outside the sRGB gamut
// counts as a failure.
//
// Flags: --tokens PATH (default src/styles/tokens.css)
//        --pairs PATH  (default scripts/contrast-pairs.json)
// Prints one row per check, then "RESULT: PASS checks=N" or
// "RESULT: FAIL failures=K checks=N".
// Exit: 0 pass, 1 any failure, 2 a file or token that cannot be parsed.
import fs from 'node:fs'
import path from 'node:path'
import { THRESHOLDS, contrast } from './lib/color.mjs'
import { COLOR_TOKENS, TokenError, parseTokensCss, resolveTheme } from './lib/tokens.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const THEMES = ['light', 'dark']

class UsageError extends Error {}

function parseArgs(argv) {
  const opts = {
    tokens: path.join(ROOT, 'src/styles/tokens.css'),
    pairs: path.join(ROOT, 'scripts/contrast-pairs.json'),
  }
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i]
    if (flag === '--tokens' || flag === '--pairs') {
      const value = argv[++i]
      if (!value) throw new UsageError(`${flag} needs a PATH`)
      opts[flag.slice(2)] = path.resolve(value)
    } else {
      throw new UsageError(`unknown flag ${flag}`)
    }
  }
  return opts
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8')
  } catch (e) {
    throw new UsageError(`cannot read ${file}: ${e.message}`)
  }
}

function loadPairs(file) {
  let pairs
  try {
    pairs = JSON.parse(readText(file))
  } catch (e) {
    if (e instanceof UsageError) throw e
    throw new UsageError(`${file} is not valid JSON: ${e.message}`)
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
    if (!(p.category in THRESHOLDS)) {
      throw new UsageError(`pair ${p.fg} on ${p.bg}: unknown category "${p.category}"`)
    }
    if (typeof p.usedBy !== 'string') {
      throw new UsageError(`pair ${p.fg} on ${p.bg}: usedBy must be a string`)
    }
  }
  return pairs
}

// One result per theme and pair: light rows first, then dark, in pair order.
function evaluate(themes, pairs) {
  const results = []
  for (const theme of THEMES) {
    for (const p of pairs) {
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

function main(argv) {
  const opts = parseArgs(argv)
  const raw = parseTokensCss(readText(opts.tokens))
  const themes = { light: resolveTheme(raw.light), dark: resolveTheme(raw.dark) }
  const pairs = loadPairs(opts.pairs)
  const results = evaluate(themes, pairs)

  for (const r of results) console.log(row(r))
  const failures = results.filter((r) => !r.pass).length
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
