// Import path case gate.
//
// macOS and Windows disks are case-insensitive, so an import whose case differs
// from the file name works locally and only fails on Linux CI. This script
// compares every path segment of each resolved import against the directory
// listing, which tells the two apart on any disk.
//
// Flag: --root DIR (default cwd).
// Exit: 0 printing "path-case: OK", 1 printing one line per offending import.
import fs from 'node:fs'
import path from 'node:path'

const argv = process.argv.slice(2)
const rootFlag = argv.indexOf('--root')
const ROOT = path.resolve(rootFlag >= 0 && argv[rootFlag + 1] ? argv[rootFlag + 1] : process.cwd())

const SKIP_DIRS = new Set(['node_modules', 'dist'])
const FILE_EXT = /\.(ts|tsx|js|jsx|mjs|css|html)$/
const WALK_DIRS = ['src', 'tests', 'scripts']
const RESOLVE_EXT = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.json']
const RESOLVE_INDEX = ['/index.ts', '/index.tsx', '/index.js']
const SPECIFIER = /(?:from\s+|import\s*\(\s*|import\s+|@import\s+|url\(\s*)['"]?([^'")\s]+)['"]?/g

function walk(dir, out) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.isFile() && FILE_EXT.test(entry.name)) out.push(full)
  }
}

const files = []
if (fs.existsSync(path.join(ROOT, 'index.html'))) files.push(path.join(ROOT, 'index.html'))
for (const name of fs.readdirSync(ROOT)) {
  if (/\.config\.(ts|mjs|js)$/.test(name) && fs.statSync(path.join(ROOT, name)).isFile()) {
    files.push(path.join(ROOT, name))
  }
}
for (const dir of WALK_DIRS) walk(path.join(ROOT, dir), files)

// 'exact' when the file exists with this exact case, 'case' when it exists only
// under different casing, 'none' otherwise. Walks segment by segment so a
// case-insensitive disk cannot hide a mismatch.
function probe(abs) {
  const rel = path.relative(ROOT, abs)
  if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) return 'none'
  let dir = ROOT
  let mismatch = false
  for (const segment of rel.split(path.sep)) {
    let entries
    try {
      entries = fs.readdirSync(dir)
    } catch {
      return 'none'
    }
    if (entries.includes(segment)) {
      dir = path.join(dir, segment)
      continue
    }
    const alt = entries.find((e) => e.toLowerCase() === segment.toLowerCase())
    if (!alt) return 'none'
    mismatch = true
    dir = path.join(dir, alt)
  }
  try {
    if (!fs.statSync(dir).isFile()) return 'none'
  } catch {
    return 'none'
  }
  return mismatch ? 'case' : 'exact'
}

function resolveSpecifier(file, raw) {
  const specifier = raw.split(/[?#]/)[0]
  let base
  if (specifier.startsWith('@/')) base = path.join(ROOT, 'src', specifier.slice(2))
  else if (specifier.startsWith('./') || specifier.startsWith('../')) {
    base = path.resolve(path.dirname(file), specifier)
  } else return 'none'
  const candidates = [...RESOLVE_EXT, ...RESOLVE_INDEX].map((suffix) => base + suffix)
  let sawCase = false
  for (const candidate of candidates) {
    const result = probe(candidate)
    if (result === 'exact') return 'exact'
    if (result === 'case') sawCase = true
  }
  return sawCase ? 'case' : 'none'
}

const problems = []

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8')
  const seen = new Set()
  for (const match of text.matchAll(SPECIFIER)) {
    const raw = match[1]
    if (seen.has(raw)) continue
    seen.add(raw)
    if (resolveSpecifier(file, raw) === 'case') {
      problems.push(`${path.relative(ROOT, file)}: '${raw}' differs in case from the file on disk`)
    }
  }
}

// Two walked paths that differ only by case collide on a case-insensitive disk.
const byLower = new Map()
for (const file of files) {
  const rel = path.relative(ROOT, file)
  const key = rel.toLowerCase()
  const other = byLower.get(key)
  if (other && other !== rel) problems.push(`${rel}: collides with ${other} (differs only in case)`)
  else byLower.set(key, rel)
}

if (problems.length > 0) {
  for (const line of problems) console.error(line)
  process.exit(1)
}
console.log('path-case: OK')
