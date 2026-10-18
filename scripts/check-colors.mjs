// Raw color gate.
//
// Components use semantic token utilities only. This fails when src (outside
// src/styles/tokens.css and the vendored primitives) contains a raw hex, rgb,
// hsl, oklch or oklab value, or a Tailwind default palette utility. The theme
// sets --color-*: initial, so default palette utilities compile to nothing and
// would fail silently without this check.
//
// Flag: --root DIR (default cwd).
// Exit: 0 printing "colors: OK", 1 printing FILE:LINE: raw color MATCH.
import fs from 'node:fs'
import path from 'node:path'

const argv = process.argv.slice(2)
const rootFlag = argv.indexOf('--root')
const ROOT = path.resolve(rootFlag >= 0 && argv[rootFlag + 1] ? argv[rootFlag + 1] : process.cwd())
const SRC = path.join(ROOT, 'src')

const EXCLUDED = [
  path.join(SRC, 'styles', 'tokens.css'),
  path.join(SRC, 'components', 'motion-primitives'),
]
const FILE_EXT = /\.(ts|tsx|css)$/

const PREFIXES =
  'bg|text|border|ring|fill|stroke|from|to|via|outline|decoration|shadow|accent|caret|divide'
const COLORS =
  'white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'

// Section anchors such as #contact never match: a hex run needs three hex digits
// and a word boundary. The lookbehind skips HTML entities such as &#169;.
const RULES = [
  { label: 'hex', re: /(?<![&\w])#[0-9a-fA-F]{3,8}\b/g },
  { label: 'function', re: /\b(?:rgba?|hsla?|oklch|oklab)\s*\(/g },
  {
    label: 'palette utility',
    re: new RegExp(`(?<![\\w-])(?:${PREFIXES})-(?:${COLORS})(?:-\\d+)?(?![\\w-])`, 'g'),
  },
]

function isExcluded(file) {
  return EXCLUDED.some((ex) => file === ex || file.startsWith(ex + path.sep))
}

function walk(dir, out) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (isExcluded(full)) continue
    if (entry.isDirectory()) walk(full, out)
    else if (entry.isFile() && FILE_EXT.test(entry.name)) out.push(full)
  }
}

const files = []
walk(SRC, files)

const problems = []
for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, index) => {
    for (const { re } of RULES) {
      for (const match of line.matchAll(re)) {
        const found = match[0].replace(/\s*\($/, '(')
        problems.push(`${path.relative(ROOT, file)}:${index + 1}: raw color ${found}`)
      }
    }
  })
}

if (problems.length > 0) {
  for (const line of problems) console.error(line)
  console.error('Use the semantic token utilities (bg-primary, text-text, ...) or add a token.')
  process.exit(1)
}
console.log('colors: OK')
