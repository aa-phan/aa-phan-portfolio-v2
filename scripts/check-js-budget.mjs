// Initial JavaScript budget gate.
//
// Sums the gzipped size (level 9) of every file the built index.html loads up
// front: the module script and each modulepreload link. Dynamic-import chunks
// are not referenced from the HTML, so they are excluded by construction.
//
// Env: JS_BUDGET_BYTES (default 150000), VITE_BASE (default '/').
// Flag: --dist DIR (default dist).
// Exit: 0 within budget, 1 over budget, 2 no initial JS found or a file is missing.
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const BUDGET = Number(process.env.JS_BUDGET_BYTES ?? 150_000)
const base = process.env.VITE_BASE || '/'
const argv = process.argv.slice(2)
const distFlag = argv.indexOf('--dist')
const dist = distFlag >= 0 && argv[distFlag + 1] ? argv[distFlag + 1] : 'dist'

if (!Number.isFinite(BUDGET) || BUDGET < 0) {
  console.error(
    `check:budget: JS_BUDGET_BYTES must be a non-negative number, got "${process.env.JS_BUDGET_BYTES}"`,
  )
  process.exit(2)
}

const htmlPath = path.join(dist, 'index.html')
if (!fs.existsSync(htmlPath)) {
  console.error(`check:budget: ${htmlPath} not found, run the build first`)
  process.exit(2)
}
const html = fs.readFileSync(htmlPath, 'utf8')

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'))
  return m ? (m[1] ?? m[2]) : null
}

// A Set so a file listed twice counts once.
const hrefs = new Set()
for (const [tag] of html.matchAll(/<script\b[^>]*>/gi)) {
  if (attr(tag, 'type') === 'module') {
    const src = attr(tag, 'src')
    if (src) hrefs.add(src)
  }
}
for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
  if (attr(tag, 'rel') === 'modulepreload') {
    const href = attr(tag, 'href')
    if (href) hrefs.add(href)
  }
}

if (hrefs.size === 0) {
  console.error(`check:budget: no initial JS found in ${htmlPath}`)
  process.exit(2)
}

// Map an href to a file under dist: strip the configured base when it matches,
// otherwise fall back to the substring starting at its first assets/ segment.
function toRel(href) {
  const clean = href.split(/[?#]/)[0]
  if (base !== '/' && clean.startsWith(base)) return clean.slice(base.length)
  const i = clean.indexOf('assets/')
  if (i >= 0) return clean.slice(i)
  return clean.replace(/^\.?\//, '')
}

let total = 0
for (const href of hrefs) {
  const rel = toRel(href)
  const file = path.join(dist, rel)
  if (!fs.existsSync(file)) {
    console.error(`check:budget: ${href} is referenced by ${htmlPath} but ${file} does not exist`)
    process.exit(2)
  }
  const bytes = zlib.gzipSync(fs.readFileSync(file), { level: 9 }).length
  total += bytes
  console.log(`${String(bytes).padStart(8)} B gz  ${rel}`)
}

console.log(
  `initial JS: ${total} B gzipped (${(total / 1000).toFixed(1)} kB) of ${BUDGET} B budget`,
)
process.exit(total > BUDGET ? 1 : 0)
