// Raw color gate.
//
// Components use semantic token utilities only. This fails when src (outside
// src/styles/tokens.css and the vendored primitives) contains a raw hex, rgb,
// hsl, oklch or oklab value, or a Tailwind default palette utility. The theme
// sets --color-*: initial, so default palette utilities compile to nothing and
// would fail silently without this check. The root index.html (the static shell, and an
// @source for Tailwind) is scanned too.
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
  'bg|text|border|ring|fill|stroke|from|to|via|outline|decoration|shadow|accent|caret|divide|placeholder|inset|drop'
const COLORS =
  'white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
// CSS named colors (not transparent or currentcolor, which are themable keywords).
const NAMED =
  'aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen'
// Utilities may carry direction or modifier words between the prefix and the color
// (border-t-red-500, ring-offset-white, inset-ring-red-500, divide-y-red-500).
const UTILITY = `(?<![\\w-])(?:${PREFIXES})(?:-[a-z]+)*`
// Properties that take a color, in CSS and in camelCase style objects.
const COLOR_PROPERTIES =
  'color|background-color|background|border(?:-(?:top|right|bottom|left))?(?:-color)?|outline(?:-color)?|fill|stroke|caret-color|accent-color|text-decoration-color|backgroundColor|borderColor|outlineColor|caretColor|accentColor|textDecorationColor'

// Section anchors such as #contact never match: a hex run needs three hex digits
// and a word boundary. The lookbehind skips HTML entities such as &#169;.
const RULES = [
  { label: 'hex', re: /(?<![&\w])#[0-9a-fA-F]{3,8}\b/g },
  { label: 'function', re: /\b(?:rgba?|hsla?|oklch|oklab)\s*\(/g },
  {
    label: 'palette utility',
    re: new RegExp(`${UTILITY}-(?:${COLORS})(?:-\\d+)?(?![\\w-])`, 'g'),
  },
  {
    // bg-[red], text-[color:red]. Themable keywords and var() / hex forms are not letters-only.
    label: 'arbitrary named color',
    re: new RegExp(
      `${UTILITY}-\\[(?:color:)?(?!(?:transparent|currentcolor|inherit|initial|unset|none|auto)\\])[a-z]+\\]`,
      'gi',
    ),
  },
  {
    label: 'named color',
    re: new RegExp(
      `(?<![\\w-])(?:${COLOR_PROPERTIES})\\s*:\\s*['"]?[^;,}\\n]*?\\b(?:${NAMED})\\b`,
      'g',
    ),
  },
  {
    label: 'named color',
    re: new RegExp(
      `(?<![\\w-])(?:fill|stroke|stopColor|floodColor)\\s*=\\s*["'](?:${NAMED})["']`,
      'g',
    ),
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
const SHELL = path.join(ROOT, 'index.html')
if (fs.existsSync(SHELL)) files.push(SHELL)

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
