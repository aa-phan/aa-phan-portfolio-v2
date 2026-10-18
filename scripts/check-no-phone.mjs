// Phone-number gate over the built site.
//
// Everything in dist is served to the world, and CI logs of a public repository
// are public too. This fails when a served file holds a phone-shaped string or a
// tel: link. On a hit it prints only the file and byte offset, never the
// matched characters.
//
// Flag: --root DIR (default cwd); scans ROOT/dist.
// Exit: 0 printing "no-phone: OK", 1 on a hit, 2 when dist is missing.
import fs from 'node:fs'
import path from 'node:path'

const argv = process.argv.slice(2)
const rootFlag = argv.indexOf('--root')
const ROOT = path.resolve(rootFlag >= 0 && argv[rootFlag + 1] ? argv[rootFlag + 1] : process.cwd())
const DIST = path.join(ROOT, 'dist')

if (!fs.existsSync(DIST) || !fs.statSync(DIST).isDirectory()) {
  console.error(`no-phone: ${path.relative(ROOT, DIST) || DIST} not found, run the build first`)
  process.exit(2)
}

const SCANNED = /\.(html|js|css|json|txt|svg|xml|webmanifest|pdf)$/i
// Markup and text files, where prose can name a number outright.
const MARKUP_FILES = /\.(html|txt)$/i

// A tel: link is a URI scheme, so it sits right after a quote, backtick, opening
// parenthesis, equals sign or tag end (or after whitespace in markup and text). A bare
// key such as {tel:true} in minified JS, which React DOM ships in its list of input
// types, is not a link and is not flagged.
// Standalone ten-digit runs are checked in markup and text only: minified JS
// legitimately holds ten-digit constants.
const SHAPES = [
  { label: 'separated number', re: /(?<!\d)\d{3}[-. )]+\d{3}[-.]\d{4}(?!\d)/g },
  { label: 'tel: link', re: /(?<=["'`(=>]|^)tel:/gim },
  { label: 'tel: link', re: /(?<=\s)tel:/gi, only: MARKUP_FILES },
  { label: 'ten-digit run', re: /(?<![0-9A-Za-z])\d{10}(?![0-9A-Za-z])/g, only: MARKUP_FILES },
]

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.isFile() && SCANNED.test(entry.name)) out.push(full)
  }
}

const files = []
walk(DIST, files)

const hits = []
for (const file of files) {
  // latin1 keeps one character per byte, so an index is a byte offset.
  const text = fs.readFileSync(file, 'latin1')
  for (const shape of SHAPES) {
    if (shape.only && !shape.only.test(file)) continue
    for (const match of text.matchAll(shape.re)) {
      hits.push(`${path.relative(ROOT, file)} at offset ${match.index} (${shape.label})`)
    }
  }
}

if (hits.length > 0) {
  for (const line of hits) console.error(`no-phone: ${line}`)
  process.exit(1)
}
console.log('no-phone: OK')
