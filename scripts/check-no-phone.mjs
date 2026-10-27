// Phone-number gate over the built site.
//
// Everything in dist is served to the world, and CI logs of a public repository
// are public too. This fails when a served file holds a phone-shaped string or a
// tel: link. On a hit it prints only the file and a byte offset (or a PDF page, or a
// metadata key name), never the matched characters.
//
// A PDF is read twice. A byte-level pass over its dictionaries and decoded content streams
// (below) is kept as a second opinion. The main pass loads it with pdfjs-dist, the parser the
// browsers' PDF viewers use, and scans the text of every page (joined with spaces and joined
// with nothing, so a number split across text items still reads as one), every link
// annotation (any telephone-scheme link fails) and the document metadata (the Info
// dictionary entry by entry, and the XMP packet). A PDF that cannot be read fails the gate:
// it exits 0 only after every file and every page has been scanned. dist/resume.pdf must also
// read as the real resume (the owner's name and at least 1500 non-whitespace characters of
// text), so the small stand-in file can never be deployed.
//
// Flag: --root DIR (default cwd); scans ROOT/dist.
// Exit: 0 printing "no-phone: OK", 1 on a hit or an unreadable PDF, 2 when dist is missing.
import fs from 'node:fs'
import { createRequire } from 'node:module'
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
//
// Separators between the digit groups, in any run: hyphen, dot, slash, space, tab, and the
// typographic dashes and spaces a word processor or resume produces (en and em dash,
// non-breaking hyphen, minus sign, no-break, narrow no-break, thin, figure and the other
// Unicode spaces). Each is matched as the character itself, as its UTF-8 bytes (files are
// read as latin1, one character per byte), as a JS \uXXXX escape, and as an HTML entity.
// A leading +CC or 1 country prefix and a parenthesised area code are allowed.
const SEPARATOR_CODE_POINTS = [
  0xa0,
  0xad,
  ...Array.from({ length: 0x0b }, (_, i) => 0x2000 + i), // U+2000 to U+200A spaces
  ...Array.from({ length: 6 }, (_, i) => 0x2010 + i), // U+2010 to U+2015 hyphens and dashes
  0x202f,
  0x205f,
  0x2212,
  0x3000,
]
const hex = (cp, width) => cp.toString(16).padStart(width, '0')
const SEPARATOR_FORMS = [
  '[-. \\t/\\x96\\x97]', // plain ASCII, plus WinAnsi en and em dash in extracted PDF text
  `[${SEPARATOR_CODE_POINTS.map((cp) => `\\u${hex(cp, 4)}`).join('')}]`,
  ...SEPARATOR_CODE_POINTS.map((cp) =>
    [...Buffer.from(String.fromCodePoint(cp), 'utf8')].map((b) => `\\x${hex(b, 2)}`).join(''),
  ),
  ...SEPARATOR_CODE_POINTS.map((cp) => `\\\\u${hex(cp, 4)}`),
  ...SEPARATOR_CODE_POINTS.map((cp) => `&#(?:${cp}|x0*${hex(cp, 1)});`),
  '&(?:nbsp|ensp|emsp|thinsp|numsp|hyphen|dash|ndash|mdash|horbar|minus);',
]
const SEP = `(?:${SEPARATOR_FORMS.join('|')})`
const PREFIX = `(?:\\+\\d{1,2}${SEP}*|1${SEP}+)?`

// A plausible North American number: area code and exchange start 2 to 9, with an optional
// 1 or +1 country prefix. Used for runs with no separators at all, where a loose ten-digit
// pattern would also match hashes and numeric constants. The 32-bit integer limits (and
// the few values below the signed one) are excluded, since a quoted 2147483647 is a CSS
// z-index in many libraries.
const NANP_RUN =
  '(?<![0-9A-Za-z])(?!214748364\\d|429496729[56])(?:\\+?1)?[2-9]\\d{2}[2-9]\\d{6}(?![0-9A-Za-z])'

// Where a shape applies. `raw` is the file as read (for a PDF, with stream bodies masked
// out), `literal` is the string literals of a JS or JSON file, `stream` is a decoded PDF
// content stream and `text` is the text a PDF content stream draws.
const LITERAL_FILES = /\.(js|mjs|cjs|json|webmanifest)$/i
const SHAPES = [
  {
    label: 'separated number',
    views: ['raw', 'text'],
    re: new RegExp(
      `(?<!\\d)${PREFIX}(?:\\(\\d{3}\\)${SEP}*|\\d{3}${SEP}+)\\d{3}${SEP}+\\d{4}(?!\\d)`,
      'gi',
    ),
  },
  { label: 'tel: link', views: ['raw', 'text', 'stream'], re: /(?<=["'`(=>]|^)tel:/gim },
  { label: 'tel: link', views: ['raw', 'text'], re: /(?<=\s)tel:/gi, only: MARKUP_FILES },
  // Standalone digit runs are checked in markup and text only: minified JS legitimately
  // holds ten-digit constants. A number in a JS string literal is caught by the `literal`
  // view, which ignores code outside strings.
  {
    label: 'ten-digit run',
    views: ['raw', 'text'],
    re: /(?<![0-9A-Za-z])\d{10}(?![0-9A-Za-z])/g,
    only: MARKUP_FILES,
  },
  {
    label: 'eleven-digit run',
    views: ['raw', 'text'],
    re: /(?<![0-9A-Za-z])\+?1[2-9]\d{2}[2-9]\d{6}(?![0-9A-Za-z])/g,
    only: MARKUP_FILES,
  },
  { label: 'unseparated number', views: ['literal'], re: new RegExp(NANP_RUN, 'g') },
]

// The string literals of a JS or JSON file, kept at their byte offsets with everything else
// blanked to NUL, so a numeric constant, an identifier or a comment can never match. This is
// a small tokenizer, not a parser: comments and regex literals are skipped so an apostrophe in
// either does not shift which quotes open a string, and the `${...}` expressions inside a
// template literal count as code (minified bundles hold numeric constants there).
const REGEX_AFTER = new Set([...'(,=:[!&|?{};+-*%<>~^'])
function literalView(text) {
  const n = text.length
  const view = Buffer.alloc(n)
  const keep = (from, to) => view.write(text.slice(from, to), from, 'latin1')
  const templateDepth = [] // one entry per open `${`: the `{` nesting inside it
  let i = 0
  let prev = '' // last non-space character of code, for telling a regex from a division

  // i is just past an opening backtick or a closing brace of a `${...}`.
  const templateBody = () => {
    const from = i
    while (i < n) {
      if (text[i] === '\\') i += 2
      else if (text[i] === '`') {
        keep(from, i)
        i++
        return
      } else if (text[i] === '$' && text[i + 1] === '{') {
        keep(from, i)
        i += 2
        templateDepth.push(0)
        return
      } else i++
    }
    keep(from, n)
  }

  while (i < n) {
    const c = text[i]
    const next = text[i + 1]
    if (c === '/' && next === '*') {
      const end = text.indexOf('*/', i + 2)
      i = end < 0 ? n : end + 2
    } else if (c === '/' && next === '/') {
      const end = text.indexOf('\n', i)
      i = end < 0 ? n : end
    } else if (c === '"' || c === "'") {
      const from = ++i
      while (i < n && text[i] !== c && text[i] !== '\n') i += text[i] === '\\' ? 2 : 1
      keep(from, i)
      i++
      prev = c
    } else if (c === '`') {
      i++
      templateBody()
      prev = c
    } else if (
      c === '/' &&
      (prev === '' ||
        REGEX_AFTER.has(prev) ||
        /\b(?:return|typeof)\s*$/.test(text.slice(i - 10, i)))
    ) {
      let inClass = false
      for (i++; i < n && text[i] !== '\n'; i++) {
        if (text[i] === '\\') i++
        else if (text[i] === '[') inClass = true
        else if (text[i] === ']') inClass = false
        else if (text[i] === '/' && !inClass) break
      }
      i++
      prev = '/'
    } else {
      if (templateDepth.length > 0) {
        if (c === '{') templateDepth[templateDepth.length - 1]++
        else if (c === '}') {
          if (templateDepth[templateDepth.length - 1] === 0) {
            templateDepth.pop()
            i++
            templateBody()
            continue
          }
          templateDepth[templateDepth.length - 1]--
        }
      }
      if (c > ' ') prev = c
      i++
    }
  }
  return view.toString('latin1')
}

// PDF text lives in content streams, usually Flate-compressed, so a raw byte scan of the
// file cannot see it. Each stream is inflated when it inflates (otherwise its raw bytes are
// taken as an uncompressed content stream), then the strings it draws (Tj and TJ operators)
// are pulled out so a number split across kerned runs still reads as one. The number shapes
// apply to that drawn text only. Stream bytes are never scanned for them: drawing operands
// are decimals and integers (a move to a three-decimal x and a four-digit y) that read as a
// separated number, and xref offsets are ten-digit runs. Stream bodies are blanked out of the raw scan for the same
// reason, so the raw scan still covers the PDF's own dictionaries (document info strings,
// URI actions) at their byte offsets. tel: links are checked in decoded streams too.
// Limit: text set in a font with a custom or CID encoding stores glyph ids, not characters,
// and is not readable without the font's ToUnicode map, and strings inside compressed object
// streams are not read as text. The resume PDF is also reviewed by hand for that reason.
function pdfStreams(buf) {
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
    let content = slice
    try {
      content = zlib.inflateSync(slice, { finishFlush: zlib.constants.Z_SYNC_FLUSH })
    } catch {
      // Not Flate (an image, a font program, plain content): read the bytes as they are.
    }
    streams.push({ start, end, content })
  }
  return streams
}

// The PDF text with every stream body replaced by NULs, so offsets are unchanged.
function maskStreams(text, streams) {
  let out = ''
  let at = 0
  for (const { start, end } of streams) {
    out += text.slice(at, start) + '\0'.repeat(end - start)
    at = end
  }
  return out + text.slice(at)
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
  const bytes = Buffer.from(padded, 'hex')
  // A byte order mark marks UTF-16BE text, whose dashes and spaces are real characters.
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return bytes.subarray(2).swap16().toString('utf16le')
  // Otherwise dropping NULs reads two-byte text whose characters are plain ASCII.
  return bytes.toString('latin1').replaceAll('\0', '')
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
// `name` is matched against a shape's `only` filter; `view` selects the shapes that read this
// text; `label` is what is printed (a file and a byte offset, never the matched characters).
function scan(label, name, view, text) {
  for (const shape of SHAPES) {
    if (!shape.views.includes(view)) continue
    if (shape.only && !shape.only.test(name)) continue
    for (const match of text.matchAll(shape.re)) {
      hits.push(`${label} at offset ${match.index} (${shape.label})`)
    }
  }
}

// The shape labels that match somewhere in `text`, each once. A PDF's text has no useful
// byte offset, so its hits are reported by page or metadata key instead.
function shapeLabels(text) {
  const labels = new Set()
  for (const shape of SHAPES) {
    if (!shape.views.includes('text')) continue
    if (shape.only && !shape.only.test(TEXT_NAME)) continue
    shape.re.lastIndex = 0
    if (shape.re.test(text)) labels.add(shape.label)
    shape.re.lastIndex = 0
  }
  return [...labels]
}

// pdfjs's own structural flags in `info`; everything else is an entry of the document's Info
// dictionary, whose key names are listed for the owner to review.
const PDFJS_INFO_FLAGS = new Set([
  'PDFFormatVersion',
  'Language',
  'EncryptFilterName',
  'IsLinearized',
  'IsAcroFormPresent',
  'IsXFAPresent',
  'IsCollectionPresent',
  'IsSignaturesPresent',
])
const TEL_SCHEME = /^\s*tel:/i

// The one file visitors are sent to download. The 594-byte stand-in must never ship, so its
// text layer has to read as a resume: the owner's name and a body of text.
const RESUME_FILE = /^dist\/resume\.pdf$/
const RESUME_NAME = 'Aaron Phan'
const RESUME_MIN_CHARS = 1500

// Reads one PDF with pdfjs and records hits. Anything that throws is a hit (fail closed).
async function scanPdfWithPdfjs(rel, bytes) {
  let task
  const resumeText = []
  try {
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const require = createRequire(import.meta.url)
    const fontDir = path.join(
      path.dirname(require.resolve('pdfjs-dist/package.json')),
      'standard_fonts',
    )
    // pdfjs 6.3.289 never evaluates generated code and ignores isEvalSupported (the option was
    // removed upstream); it stays so a build of pdfjs that honours it is still held to false.
    /** @type {any} */
    const params = {
      data: new Uint8Array(bytes),
      isEvalSupported: false,
      useSystemFonts: false,
      disableFontFace: true,
      verbosity: 0,
      standardFontDataUrl: `${fontDir}${path.sep}`,
    }
    task = getDocument(params)
    const doc = await task.promise

    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n)
      const items = (await page.getTextContent()).items.map((item) =>
        'str' in item ? item.str : '',
      )
      resumeText.push(items.join(''))
      const labels = new Set([...shapeLabels(items.join(' ')), ...shapeLabels(items.join(''))])
      for (const label of labels) hits.push(`${rel} page ${n} (${label})`)
      const links = (await page.getAnnotations()).flatMap((a) => [a.url, a.unsafeUrl])
      if (links.some((url) => typeof url === 'string' && TEL_SCHEME.test(url))) {
        hits.push(`${rel} (link annotation)`)
      }
      page.cleanup()
    }

    if (RESUME_FILE.test(rel)) {
      // Whitespace is ignored, so the count does not depend on how the export spaces its words.
      const compact = resumeText.join('').replace(/\s+/g, '')
      if (!compact.includes(RESUME_NAME.replace(/\s+/g, '')) || compact.length < RESUME_MIN_CHARS) {
        hits.push(`${rel} is not a real resume (text layer too short or missing the name)`)
      }
    }

    const { info = {}, metadata } = await doc.getMetadata()
    const keys = []
    for (const [key, value] of Object.entries(info)) {
      if (PDFJS_INFO_FLAGS.has(key)) continue
      keys.push(key)
      const text = typeof value === 'string' ? value : JSON.stringify(value)
      if (shapeLabels(text).length > 0) hits.push(`${rel} (metadata ${key})`)
    }
    const xmp = typeof metadata?.getRaw === 'function' ? metadata.getRaw() : ''
    if (xmp) {
      keys.push('XMP')
      if (shapeLabels(xmp).length > 0) hits.push(`${rel} (metadata XMP)`)
    }
    // Key names only, for review; the values are never printed.
    console.log(`no-phone: ${rel} metadata keys: ${keys.length > 0 ? keys.join(', ') : 'none'}`)
  } catch {
    hits.push(`${rel} could not be read`)
  } finally {
    try {
      await task?.destroy()
    } catch {
      // Nothing left to release.
    }
  }
}

for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/')
  const bytes = fs.readFileSync(file)
  // latin1 keeps one character per byte, so an index is a byte offset.
  const text = bytes.toString('latin1')
  if (PDF_FILES.test(file)) {
    const streams = pdfStreams(bytes)
    scan(rel, file, 'raw', maskStreams(text, streams))
    streams.forEach(({ content }, i) => {
      const decoded = content.toString('latin1')
      scan(`${rel} (stream ${i + 1})`, file, 'stream', decoded)
      scan(`${rel} (stream ${i + 1} text)`, TEXT_NAME, 'text', pdfShownText(decoded))
    })
    await scanPdfWithPdfjs(rel, bytes)
    continue
  }
  scan(rel, file, 'raw', text)
  if (LITERAL_FILES.test(file)) scan(rel, file, 'literal', literalView(text))
}

if (hits.length > 0) {
  for (const line of hits) console.error(`no-phone: ${line}`)
  process.exit(1)
}
console.log('no-phone: OK')
