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
import zlib from 'node:zlib'

const argv = process.argv.slice(2)
const rootFlag = argv.indexOf('--root')
const ROOT = path.resolve(rootFlag >= 0 && argv[rootFlag + 1] ? argv[rootFlag + 1] : process.cwd())
const DIST = path.join(ROOT, 'dist')

if (!fs.existsSync(DIST) || !fs.statSync(DIST).isDirectory()) {
  console.error(`no-phone: ${path.relative(ROOT, DIST) || DIST} not found, run the build first`)
  process.exit(2)
}

const SCANNED = /\.(html|js|css|json|txt|svg|xml|webmanifest|pdf)$/i
// Markup and text files, where prose can name a number outright. A PDF's decoded text
// layer reads as prose too, so extracted PDF text is scanned as text (see TEXT_NAME).
// The PDF's own bytes are not: xref offsets are ten-digit runs.
const MARKUP_FILES = /\.(html|txt)$/i
const TEXT_NAME = 'extracted.txt'
const PDF_FILES = /\.pdf$/i

// A tel: link is a URI scheme, so it sits right after a quote, backtick, opening
// parenthesis, equals sign or tag end (or after whitespace in markup and text). A bare
// key such as {tel:true} in minified JS, which React DOM ships in its list of input
// types, is not a link and is not flagged.
// Standalone ten-digit runs are checked in markup and text only: minified JS
// legitimately holds ten-digit constants.
//
// Separators between the digit groups: dash, dot, space, tab, a non-breaking space (the
// bytes 0xC2 0xA0 read as latin1) or an HTML entity for one, in any run. A leading +CC
// or 1 country prefix and a parenthesised area code are allowed.
const SEP = '(?:[-. \\t\\xa0\\xc2]|&nbsp;|&#160;)'
const PREFIX = `(?:\\+\\d{1,2}${SEP}*|1${SEP}+)?`
const SHAPES = [
  {
    label: 'separated number',
    re: new RegExp(
      `(?<!\\d)${PREFIX}(?:\\(\\d{3}\\)${SEP}*|\\d{3}${SEP}+)\\d{3}${SEP}+\\d{4}(?!\\d)`,
      'g',
    ),
  },
  { label: 'tel: link', re: /(?<=["'`(=>]|^)tel:/gim },
  { label: 'tel: link', re: /(?<=\s)tel:/gi, only: MARKUP_FILES },
  { label: 'ten-digit run', re: /(?<![0-9A-Za-z])\d{10}(?![0-9A-Za-z])/g, only: MARKUP_FILES },
]

// PDF text lives in content streams, usually Flate-compressed, so a raw byte scan of the
// file cannot see it. Inflate every stream that inflates, then pull out the strings the
// content stream draws (Tj and TJ operators) so a number split across kerned runs still
// reads as one. Limit: text set in a font with a custom or CID encoding stores glyph ids,
// not characters, and is not readable without the font's ToUnicode map. The resume PDF
// is also reviewed by hand for that reason.
function inflatePdfStreams(buf) {
  const text = buf.toString('latin1')
  const streams = []
  const open = /stream\r?\n/g
  let m
  while ((m = open.exec(text)) !== null) {
    const start = m.index + m[0].length
    const end = text.indexOf('endstream', start)
    if (end < 0) break
    // Resume after "endstream", whose tail would otherwise match "stream" again.
    open.lastIndex = end + 'endstream'.length
    const slice = buf.subarray(start, end)
    try {
      streams.push(zlib.inflateSync(slice, { finishFlush: zlib.constants.Z_SYNC_FLUSH }))
    } catch {
      // Not Flate (an image, a font program, plain content): the raw scan covers it.
    }
  }
  return streams
}

function decodePdfLiteral(body) {
  return body.replace(/\\(?:([0-7]{1,3})|(\r?\n)|(.))/gs, (_all, oct, eol, ch) => {
    if (oct) return String.fromCharCode(parseInt(oct, 8) & 0xff)
    if (eol) return ''
    return { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' }[ch] ?? ch
  })
}

function decodePdfHex(body) {
  const hex = body.replace(/\s+/g, '')
  const padded = hex.length % 2 ? `${hex}0` : hex
  // Dropping NULs also reads UTF-16BE text whose characters are plain ASCII.
  return Buffer.from(padded, 'hex').toString('latin1').replaceAll('\0', '')
}

function pdfShownText(content) {
  const out = []
  const operand = String.raw`\((?:\\[\s\S]|[^()\\])*\)|<[0-9A-Fa-f\s]*>`
  const tj = new RegExp(`\\[((?:${operand}|[^\\]()<])*)\\]\\s*TJ|(${operand})\\s*(?:Tj|'|")`, 'g')
  const item = new RegExp(`(${operand})|(-?\\d*\\.?\\d+)`, 'g')
  const one = (token) =>
    token.startsWith('(') ? decodePdfLiteral(token.slice(1, -1)) : decodePdfHex(token.slice(1, -1))
  for (const m of content.matchAll(tj)) {
    if (m[2] !== undefined) {
      out.push(one(m[2]))
      continue
    }
    let line = ''
    for (const part of m[1].matchAll(item)) {
      if (part[1] !== undefined) line += one(part[1])
      // A large negative kern in a TJ array is a word gap.
      else if (Number(part[2]) < -200) line += ' '
    }
    out.push(line)
  }
  return out.join(' ')
}

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
// `name` decides which shapes apply (the shape's `only` filter); `label` is what is printed.
function scan(label, name, text) {
  for (const shape of SHAPES) {
    if (shape.only && !shape.only.test(name)) continue
    for (const match of text.matchAll(shape.re)) {
      hits.push(`${label} at offset ${match.index} (${shape.label})`)
    }
  }
}

for (const file of files) {
  const rel = path.relative(ROOT, file)
  const bytes = fs.readFileSync(file)
  // latin1 keeps one character per byte, so an index is a byte offset.
  scan(rel, file, bytes.toString('latin1'))
  if (PDF_FILES.test(file)) {
    inflatePdfStreams(bytes).forEach((stream, i) => {
      const content = stream.toString('latin1')
      scan(`${rel} (stream ${i + 1})`, file, content)
      scan(`${rel} (stream ${i + 1} text)`, TEXT_NAME, pdfShownText(content))
    })
  }
}

if (hits.length > 0) {
  for (const line of hits) console.error(`no-phone: ${line}`)
  process.exit(1)
}
console.log('no-phone: OK')
