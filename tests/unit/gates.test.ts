import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import zlib from 'node:zlib'
import { afterEach, describe, expect, it } from 'vitest'

const ROOT = path.resolve(import.meta.dirname, '../..')
const SCRIPTS = path.join(ROOT, 'scripts')

const tempRoots: string[] = []

function makeRoot(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'gates-'))
  tempRoots.push(dir)
  return dir
}

function write(root: string, rel: string, content: string | Buffer): void {
  const file = path.join(root, rel)
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, content)
}

interface Run {
  status: number | null
  out: string
}

function runGate(script: string, args: string[]): Run {
  const result = spawnSync(process.execPath, [path.join(SCRIPTS, script), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
  })
  return { status: result.status, out: `${result.stdout}${result.stderr}` }
}

// A phone-shaped probe is assembled at runtime from separate groups so that no
// committed file ever holds a phone-shaped literal.
function phoneShape(area: string, exchange: string, line: string, sep: string): string {
  return [[area, exchange].join(' '), line].join(sep)
}

// Joins digit groups with one separator, for probes that are not the legacy shape above.
function groups(sep: string, ...parts: string[]): string {
  return parts.join(sep)
}

// A minimal PDF whose only content is one Flate-compressed content stream.
function pdfWithStream(content: string): Buffer {
  const body = zlib.deflateSync(Buffer.from(content, 'latin1'))
  return Buffer.concat([
    Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Length ' + body.length + ' /Filter /FlateDecode >>\nstream\n',
    ),
    body,
    Buffer.from('\nendstream\nendobj\n%%EOF\n'),
  ])
}

interface PdfOptions {
  /** Text drawn on the page. */
  text?: string
  /** Draw the text in two Tj operators, splitting after this many characters. */
  splitAt?: number
  /** Flate-compress the content stream. */
  compressed?: boolean
  /** A link annotation whose action is a URI. */
  annotationUri?: string
  /** Entries of the document Info dictionary, as plain strings. */
  info?: Record<string, string>
  /** A raw content stream, used instead of the drawn text. */
  content?: string
}

const pdfString = (value: string): string => `(${value.replace(/[\\()]/g, '\\$&')})`

// A well-formed one-page PDF assembled at runtime: catalog, pages, a page with a Helvetica
// Type1 resource, one content stream, an optional link annotation and Info dictionary, and an
// xref table whose byte offsets are computed. No committed file holds a phone-shaped literal.
function makePdf(options: PdfOptions = {}): Buffer {
  const { text = 'Hello', splitAt, compressed = false, annotationUri, info, content } = options
  const shown =
    splitAt === undefined
      ? `${pdfString(text)} Tj`
      : `${pdfString(text.slice(0, splitAt))} Tj ${pdfString(text.slice(splitAt))} Tj`
  const stream = Buffer.from(content ?? `BT /F1 12 Tf 72 700 Td ${shown} ET`, 'latin1')
  const body = compressed ? zlib.deflateSync(stream) : stream
  const filter = compressed ? ' /Filter /FlateDecode' : ''
  const objects: Array<Buffer | string> = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R${annotationUri === undefined ? '' : ' /Annots [6 0 R]'} >>`,
    Buffer.concat([
      Buffer.from(`<< /Length ${body.length}${filter} >>\nstream\n`, 'latin1'),
      body,
      Buffer.from('\nendstream', 'latin1'),
    ]),
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  if (annotationUri !== undefined) {
    objects.push(
      `<< /Type /Annot /Subtype /Link /Rect [72 690 200 710] /Border [0 0 0] /A << /S /URI /URI ${pdfString(annotationUri)} >> >>`,
    )
  }
  const infoNumber = info === undefined ? undefined : objects.length + 1
  if (info !== undefined) {
    const entries = Object.entries(info).map(([key, value]) => `/${key} ${pdfString(value)}`)
    objects.push(`<< ${entries.join(' ')} >>`)
  }

  const parts: Buffer[] = [Buffer.from('%PDF-1.7\n', 'latin1')]
  const offsets: number[] = []
  let length = parts[0].length
  objects.forEach((object, i) => {
    offsets.push(length)
    const chunk = Buffer.concat([
      Buffer.from(`${i + 1} 0 obj\n`, 'latin1'),
      typeof object === 'string' ? Buffer.from(object, 'latin1') : object,
      Buffer.from('\nendobj\n', 'latin1'),
    ])
    parts.push(chunk)
    length += chunk.length
  })
  const xref = ['xref', `0 ${objects.length + 1}`, '0000000000 65535 f ']
  for (const offset of offsets) xref.push(`${String(offset).padStart(10, '0')} 00000 n `)
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R${infoNumber === undefined ? '' : ` /Info ${infoNumber} 0 R`} >>\nstartxref\n${length}\n%%EOF\n`
  parts.push(Buffer.from(`${xref.join('\n')}\n${trailer}`, 'latin1'))
  return Buffer.concat(parts)
}

afterEach(() => {
  while (tempRoots.length > 0) {
    rmSync(tempRoots.pop() as string, { recursive: true, force: true })
  }
})

describe('check-path-case', () => {
  const script = 'check-path-case.mjs'

  it('flags an alias import that differs in case from the file on disk', () => {
    const root = makeRoot()
    write(root, 'src/lib/Gadget.ts', 'export const gadget = 1\n')
    write(root, 'src/Bad.ts', "import { gadget } from '@/lib/gadget'\nexport const x = gadget\n")
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain("'@/lib/gadget'")
    expect(run.out).toContain('differs in case from the file on disk')
  })

  it('flags a relative import that differs in case', () => {
    const root = makeRoot()
    write(root, 'src/lib/Gadget.ts', 'export const gadget = 1\n')
    write(root, 'src/Bad2.ts', "import { gadget } from './lib/gadget'\nexport const x = gadget\n")
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain("'./lib/gadget'")
  })

  it('flags a directory segment that differs in case', () => {
    const root = makeRoot()
    write(root, 'src/Widgets/index.ts', 'export const w = 1\n')
    write(root, 'src/Bad3.ts', "import { w } from '@/widgets'\nexport const x = w\n")
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain("'@/widgets'")
  })

  it('flags a CSS @import that differs in case', () => {
    const root = makeRoot()
    write(root, 'src/styles/Tokens.css', ':root {}\n')
    write(root, 'src/styles/index.css', '@import "./tokens.css";\n')
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('./tokens.css')
  })

  it('passes when every import matches the file on disk exactly', () => {
    const root = makeRoot()
    write(root, 'src/lib/Gadget.ts', 'export const gadget = 1\n')
    write(root, 'src/Good.ts', "import { gadget } from '@/lib/Gadget'\nexport const x = gadget\n")
    write(root, 'src/Good2.ts', "export { gadget } from './lib/Gadget'\n")
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(0)
    expect(run.out).toContain('path-case: OK')
  })

  it('ignores package specifiers and files that do not exist (typecheck owns those)', () => {
    const root = makeRoot()
    write(
      root,
      'src/Pkg.ts',
      "import { motion } from 'motion/react'\nimport { x } from '@/not/there'\nexport const y = [motion, x]\n",
    )
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(0)
  })

  it('passes on the real repository', () => {
    const run = runGate(script, [])
    expect(run.out).toContain('path-case: OK')
    expect(run.status).toBe(0)
  })
})

describe('check-colors', () => {
  const script = 'check-colors.mjs'

  it('flags a Tailwind default palette utility in TSX', () => {
    const root = makeRoot()
    write(root, 'src/Bad.tsx', 'export const B = () => <div className="p-2 bg-white" />\n')
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('src/Bad.tsx:1')
    expect(run.out).toContain('bg-white')
  })

  it('flags a palette utility behind a variant prefix and with a shade', () => {
    const root = makeRoot()
    write(root, 'src/Bad.tsx', 'export const B = () => <div className="hover:text-red-500" />\n')
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('text-red-500')
  })

  it.each([
    ['border-t-red-500'],
    ['border-x-blue-500'],
    ['divide-y-red-500'],
    ['ring-offset-white'],
    ['placeholder-gray-400'],
    ['inset-ring-red-500'],
    ['md:hover:border-b-black'],
    ['bg-[red]'],
    ['text-[color:tomato]'],
    ['ring-[Navy]'],
  ])('flags the directional, prefixed or arbitrary utility %s', (utility) => {
    const root = makeRoot()
    write(root, 'src/Bad.tsx', `export const B = () => <div className="p-2 ${utility}" />\n`)
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('src/Bad.tsx:1')
    expect(run.out).toContain(utility.replace(/^md:hover:/, ''))
  })

  it.each([
    ['a style object', 'src/Bad.tsx', "export const s = { color: 'red' }\n"],
    ['a camelCase border', 'src/Bad.tsx', "export const s = { border: '1px solid tomato' }\n"],
    ['an svg attribute', 'src/Bad.tsx', 'export const B = () => <path fill="teal" />\n'],
    ['a CSS property', 'src/styles/extra.css', '.a {\n  background-color: rebeccapurple;\n}\n'],
  ])('flags a raw named color in %s', (_name, file, content) => {
    const root = makeRoot()
    write(root, file, content)
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('raw color')
  })

  it('scans the root index.html shell', () => {
    const root = makeRoot()
    write(root, 'src/Good.tsx', 'export const G = 1\n')
    write(root, 'index.html', '<p class="mt-4 bg-white">hi</p>\n')
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('index.html:1')
    expect(run.out).toContain('bg-white')
  })

  it('passes themable keywords, var() forms and token utilities that share a prefix', () => {
    const root = makeRoot()
    write(
      root,
      'src/Good.tsx',
      [
        'export const G = () => (',
        '  <div',
        '    className="bg-[transparent] text-[currentColor] bg-[var(--surface)] border-t-primary ring-offset-background inset-ring-border"',
        "    style={{ color: 'inherit', fill: 'none', border: '1px solid var(--border)' }}",
        '  />',
        ')',
        '',
      ].join('\n'),
    )
    write(root, 'index.html', '<p class="mt-4 text-muted">hi</p>\n')
    const run = runGate(script, ['--root', root])
    expect(run.out).toContain('colors: OK')
    expect(run.status).toBe(0)
  })

  it('flags a three-digit hex in CSS', () => {
    const root = makeRoot()
    write(root, 'src/styles/extra.css', '.a {\n  color: #f00;\n}\n')
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('src/styles/extra.css:2')
  })

  it('flags rgb, hsl, oklch and oklab calls outside tokens.css', () => {
    const root = makeRoot()
    write(root, 'src/styles/a.css', '.a { color: rgb(1 2 3); }\n')
    write(root, 'src/styles/b.css', '.b { color: hsl(10 20% 30%); }\n')
    write(root, 'src/styles/c.css', '.c { color: oklch(0.5 0.1 200); }\n')
    write(root, 'src/styles/d.css', '.d { color: oklab(0.5 0.1 0.1); }\n')
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    for (const name of ['a', 'b', 'c', 'd']) expect(run.out).toContain(`src/styles/${name}.css:1`)
  })

  it('passes token utilities and anchor hrefs', () => {
    const root = makeRoot()
    write(
      root,
      'src/Good.tsx',
      [
        'export const G = () => (',
        '  <nav className="bg-primary text-on-primary hover:bg-primary-hover">',
        '    <a href="#contact">Contact</a>',
        '    <a href="#education">Education</a>',
        '    <a href="#about">About</a>',
        '    <span>&#169;</span>',
        '  </nav>',
        ')',
        '',
      ].join('\n'),
    )
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(0)
    expect(run.out).toContain('colors: OK')
  })

  it('ignores raw values inside src/styles/tokens.css and the vendored primitives', () => {
    const root = makeRoot()
    write(root, 'src/styles/tokens.css', ':root { --text: oklch(0.1 0.05 280); --x: #050315; }\n')
    write(root, 'src/components/motion-primitives/p.tsx', 'export const p = "bg-white #fff"\n')
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(0)
  })

  it('passes on the real repository', () => {
    const run = runGate(script, [])
    expect(run.out).toContain('colors: OK')
    expect(run.status).toBe(0)
  })
})

describe('check-no-phone', () => {
  const script = 'check-no-phone.mjs'

  it('flags a phone-shaped string in dist HTML without printing its digits', () => {
    const root = makeRoot()
    write(root, 'dist/index.html', `<p>Call ${phoneShape('555', '010', '0123', '-')}</p>\n`)
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('index.html')
    expect(run.out).toMatch(/offset \d+/)
    for (const digits of ['555', '010', '0123']) expect(run.out).not.toContain(digits)
  })

  it('flags a dot-separated phone shape inside a JS bundle', () => {
    const root = makeRoot()
    write(root, 'dist/assets/app.js', `var s="${phoneShape('555', '010', '0123', '.')}";\n`)
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('app.js')
    expect(run.out).not.toContain('0123')
  })

  it('flags a tel: link', () => {
    const root = makeRoot()
    write(root, 'dist/index.html', '<a href="tel:+1">call</a>\n')
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('index.html')
  })

  it.each([
    ['an unquoted href', '<a href=tel:+1>call</a>\n', 'index.html'],
    ['a quoted scheme string in JS', 'var u="tel:"+n;\n', 'assets/app.js'],
    ['a template string in JS', 'var u=`tel:${n}`;\n', 'assets/app.js'],
    ['a CSS url', 'a{background:url(tel:x)}\n', 'assets/app.css'],
  ])('flags a tel: link as %s', (_name, content, file) => {
    const root = makeRoot()
    write(root, `dist/${file}`, content)
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
  })

  it('does not flag a bare tel key in minified JS (React DOM input-type list)', () => {
    const root = makeRoot()
    write(root, 'dist/assets/app.js', 'var t={search:!0,tel:!0,text:!0};\n')
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(0)
    expect(run.out).toContain('no-phone: OK')
  })

  it('flags a standalone ten-digit run in HTML', () => {
    const root = makeRoot()
    write(root, 'dist/index.html', `<p>${['55501', '00123'].join('')}</p>\n`)
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
  })

  it('does not flag a ten-digit numeric constant in minified JS', () => {
    const root = makeRoot()
    write(root, 'dist/index.html', '<p>hello</p>\n')
    write(root, 'dist/assets/app.js', `var big=${['12345', '67890'].join('')};\n`)
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(0)
    expect(run.out).toContain('no-phone: OK')
  })

  it.each([
    ['spaces', ' ', ' '],
    ['mixed spaces and a dash', ' ', '-'],
    ['a run of spaces', '   ', '   '],
    ['non-breaking spaces', '\u00a0', '\u00a0'],
  ])('flags a number separated by %s', (_name, first, second) => {
    const root = makeRoot()
    const probe = `${groups(first, '555', '010')}${second}0123`
    write(root, 'dist/index.html', `<p>${probe}</p>\n`)
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    for (const digits of ['555', '010', '0123']) expect(run.out).not.toContain(digits)
  })

  it.each([
    ['parenthesised area code and spaces', `(${'555'}) ${groups(' ', '010', '0123')}`],
    ['parenthesised area code, no space', `(${'555'})${groups('-', '010', '0123')}`],
    ['a +1 prefix', `+1 ${groups(' ', '555', '010', '0123')}`],
    ['a +1 prefix joined to the area code', `+1${groups(' ', '555', '010', '0123')}`],
    ['a bare 1 prefix with dashes', `1-${groups('-', '555', '010', '0123')}`],
    ['an HTML non-breaking space', groups('&nbsp;', '555', '010', '0123')],
  ])('flags a number written with %s', (_name, probe) => {
    const root = makeRoot()
    write(root, 'dist/index.html', `<p>${probe}</p>\n`)
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    for (const digits of ['555', '010', '0123']) expect(run.out).not.toContain(digits)
  })

  it('flags a spaced number inside a JS bundle', () => {
    const root = makeRoot()
    write(root, 'dist/assets/app.js', `var s="${groups(' ', '555', '010', '0123')}";\n`)
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('app.js')
  })

  it('does not flag digit groups of other sizes', () => {
    const root = makeRoot()
    write(
      root,
      'dist/assets/app.js',
      `var a="${groups(' ', '2024', '010', '0123')}",b="${groups(' ', '55', '010', '01234')}";\n`,
    )
    write(root, 'dist/index.html', '<p>hello</p>\n')
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(0)
  })

  // Typographic dashes and spaces are what pasting copy from a resume or word processor gives.
  // Each separator is written as an escape or built from a code point, never as digits.
  const TYPOGRAPHIC = [
    ['an en dash', '–'],
    ['an em dash', '—'],
    ['a non-breaking hyphen', '‑'],
    ['a minus sign', '−'],
    ['a slash', '/'],
    ['a narrow no-break space', ' '],
    ['a thin space', ' '],
    ['a figure space', ' '],
    ['an en dash entity', '&ndash;'],
    ['a numeric entity', '&#8209;'],
    ['a hex entity', '&#x202F;'],
  ] as const

  it.each(TYPOGRAPHIC)('flags a number separated by %s in HTML', (_name, sep) => {
    const root = makeRoot()
    write(root, 'dist/index.html', `<p>${groups(sep, '555', '210', '0123')}</p>\n`)
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('index.html')
    for (const digits of ['555', '210', '0123']) expect(run.out).not.toContain(digits)
  })

  it.each(TYPOGRAPHIC)('flags a number separated by %s in a JS bundle', (_name, sep) => {
    const root = makeRoot()
    write(root, 'dist/assets/app.js', `var s="${groups(sep, '555', '210', '0123')}";\n`)
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('app.js')
    for (const digits of ['555', '210', '0123']) expect(run.out).not.toContain(digits)
  })

  it('flags a number written with a JS unicode escape for the dash', () => {
    const root = makeRoot()
    write(root, 'dist/assets/app.js', `var s="${groups('\\u2013', '555', '210', '0123')}";\n`)
    expect(runGate(script, ['--root', root]).status).toBe(1)
  })

  describe('contiguous numbers', () => {
    const ten = ['555', '210', '0123'].join('')
    const eleven = ['1', ten].join('')

    it.each([
      ['a double-quoted literal', `var s="${ten}";\n`],
      ['a single-quoted literal', `var s='${ten}';\n`],
      ['a template literal', `var s=\`${ten}\`;\n`],
      ['a +1 literal', `var s="+${eleven}";\n`],
      ['an 11-digit literal', `var s="${eleven}";\n`],
      ['a number inside a sentence', `var s="Call ${ten} today";\n`],
      ['a JSX children prop', `r("a",{children:"${ten}"});\n`],
    ])('flags %s in a JS bundle without printing digits', (_name, content) => {
      const root = makeRoot()
      write(root, 'dist/assets/app.js', content)
      const run = runGate(script, ['--root', root])
      expect(run.status).toBe(1)
      expect(run.out).toContain('app.js')
      expect(run.out).toMatch(/offset \d+/)
      for (const digits of ['555', '210', '0123']) expect(run.out).not.toContain(digits)
    })

    it('flags a literal after a regex literal that holds a quote', () => {
      const root = makeRoot()
      write(root, 'dist/assets/app.js', `var r=/["']/g;/* it's */var s="${ten}";\n`)
      expect(runGate(script, ['--root', root]).status).toBe(1)
    })

    it.each([
      ['a +1 number', `<p>+${eleven}</p>\n`],
      ['an 11-digit number', `<p>${eleven}</p>\n`],
    ])('flags %s in HTML', (_name, content) => {
      const root = makeRoot()
      write(root, 'dist/index.html', content)
      const run = runGate(script, ['--root', root])
      expect(run.status).toBe(1)
      for (const digits of ['555', '210', '0123']) expect(run.out).not.toContain(digits)
    })

    it('does not flag unquoted numeric constants, hashes or other digit strings in JS', () => {
      const root = makeRoot()
      write(root, 'dist/index.html', '<p>hello</p>\n')
      write(
        root,
        'dist/assets/app.js',
        [
          `var a=${ten},b=${eleven},c=+${eleven};`, // numeric constants, not text
          `var h="${['e3b0c442', '98fc1c14', '9afbf4c8'].join('')}";`, // a hex hash
          `var t=${['1700000', '000000'].join('')};`, // a millisecond timestamp
          `var q="${['1234', '567890'].join('')}";`, // not a plausible NANP number
          `var l="${['1', ten, '9'].join('')}";`, // longer run
          `var r=/${['x', ten].join('')}/;`, // inside a regex literal
          `/* ${ten} */`, // a comment
          '',
        ].join('\n'),
      )
      const run = runGate(script, ['--root', root])
      expect(run.status).toBe(0)
      expect(run.out).toContain('no-phone: OK')
    })
  })

  describe('PDF text layer', () => {
    it('flags a number separated by a WinAnsi en dash in a Tj string', () => {
      const root = makeRoot()
      const content = `BT (${groups('\\226', '555', '210', '0123')}) Tj ET`
      write(root, 'dist/resume.pdf', pdfWithStream(content))
      expect(runGate(script, ['--root', root]).status).toBe(1)
    })

    it('flags a contiguous number in an uncompressed content stream', () => {
      const root = makeRoot()
      const ten = ['555', '210', '0123'].join('')
      write(root, 'dist/resume.pdf', `%PDF-1.4\nstream\nBT (${ten}) Tj ET\nendstream\n%%EOF\n`)
      expect(runGate(script, ['--root', root]).status).toBe(1)
    })

    it('flags a number in a document-info string outside any stream', () => {
      const root = makeRoot()
      const probe = groups(' ', '555', '210', '0123')
      write(
        root,
        'dist/resume.pdf',
        `%PDF-1.4\n1 0 obj\n<< /Subject (${probe}) >>\nendobj\n%%EOF\n`,
      )
      expect(runGate(script, ['--root', root]).status).toBe(1)
    })

    it('does not flag drawing operands in a compressed content stream', () => {
      const root = makeRoot()
      // A move with a three-decimal x and a four-digit y reads like a separated number.
      const coords = `${['123', '456'].join('.')} ${['12', '34'].join('')} m ${['150', '250'].join('.')} ${['3000'].join('')} l S`
      write(
        root,
        'dist/resume.pdf',
        makePdf({ compressed: true, content: `${coords}\nBT /F1 12 Tf (Hello) Tj ET` }),
      )
      const run = runGate(script, ['--root', root])
      expect(run.status).toBe(0)
      expect(run.out).toContain('no-phone: OK')
    })

    it('does not flag drawing operands in an uncompressed content stream', () => {
      const root = makeRoot()
      const coords = `${['123', '456'].join('.')} ${['12', '34'].join('')} m ${['150', '250'].join('.')} ${['3000'].join('')} l S`
      write(root, 'dist/resume.pdf', makePdf({ content: `${coords}\nBT /F1 12 Tf (Hello) Tj ET` }))
      expect(runGate(script, ['--root', root]).status).toBe(0)
    })

    it('flags a number inside a Flate-compressed Tj string without printing digits', () => {
      const root = makeRoot()
      const probe = groups(' ', '555', '010', '0123')
      write(root, 'dist/resume.pdf', pdfWithStream(`BT /F1 12 Tf 72 700 Td (${probe}) Tj ET`))
      const run = runGate(script, ['--root', root])
      expect(run.status).toBe(1)
      expect(run.out).toContain('resume.pdf')
      expect(run.out).toMatch(/offset \d+/)
      for (const digits of ['555', '010', '0123']) expect(run.out).not.toContain(digits)
    })

    it('flags a number split across kerned TJ runs', () => {
      const root = makeRoot()
      const content = `BT [(555) -300 (010) -300 (0123)] TJ ET`
      write(root, 'dist/resume.pdf', pdfWithStream(content))
      expect(runGate(script, ['--root', root]).status).toBe(1)
    })

    it('flags a number written as hex strings', () => {
      const root = makeRoot()
      const hex = (text: string) => Buffer.from(text, 'latin1').toString('hex')
      const content = `BT [<${hex('555')}> -300 <${hex('010')}> -300 <${hex('0123')}>] TJ ET`
      write(root, 'dist/resume.pdf', pdfWithStream(content))
      expect(runGate(script, ['--root', root]).status).toBe(1)
    })

    it('flags a number escaped with octal codes in a literal string', () => {
      const root = makeRoot()
      const octal = [...groups(' ', '555', '010', '0123')]
        .map((ch) => '\\' + ch.charCodeAt(0).toString(8).padStart(3, '0'))
        .join('')
      write(root, 'dist/resume.pdf', pdfWithStream(`BT (${octal}) Tj ET`))
      expect(runGate(script, ['--root', root]).status).toBe(1)
    })

    it('flags a tel: link inside a compressed stream', () => {
      const root = makeRoot()
      write(root, 'dist/resume.pdf', pdfWithStream('<< /S /URI /URI (tel:+1) >>'))
      expect(runGate(script, ['--root', root]).status).toBe(1)
    })

    it('passes a PDF whose compressed text holds no phone shape', () => {
      const root = makeRoot()
      write(root, 'dist/resume.pdf', makePdf({ text: 'Aaron Phan 2019 2024', compressed: true }))
      const run = runGate(script, ['--root', root])
      expect(run.status).toBe(0)
      expect(run.out).toContain('no-phone: OK')
    })

    it('flags a contiguous ten-digit run in PDF text but not in xref offsets', () => {
      // Every well-formed PDF carries ten-digit xref offsets.
      const clean = makeRoot()
      write(clean, 'dist/resume.pdf', makePdf({ text: 'Aaron Phan' }))
      expect(runGate(script, ['--root', clean]).status).toBe(0)

      const dirty = makeRoot()
      write(dirty, 'dist/resume.pdf', pdfWithStream(`BT (${['55501', '00123'].join('')}) Tj ET`))
      expect(runGate(script, ['--root', dirty]).status).toBe(1)
    })

    it('tolerates a PDF with a stream that is not Flate', () => {
      const root = makeRoot()
      write(root, 'dist/resume.pdf', makePdf({ text: 'Aaron Phan', compressed: false }))
      expect(runGate(script, ['--root', root]).status).toBe(0)
    })
  })

  // The pdfjs pass: text of every page, link annotations and document metadata.
  describe('PDF read with pdfjs', () => {
    const probe = groups(' ', '555', '010', '0123')
    const noDigits = (out: string) => {
      for (const digits of ['555', '010', '0123']) expect(out).not.toContain(digits)
    }

    it('flags a number in page text without printing its digits', () => {
      const root = makeRoot()
      write(root, 'dist/resume.pdf', makePdf({ text: `Contact ${probe} today` }))
      const run = runGate(script, ['--root', root])
      expect(run.status).toBe(1)
      expect(run.out).toMatch(/dist\/resume\.pdf page 1 \(/)
      noDigits(run.out)
    })

    it('flags the same text inside a FlateDecode stream', () => {
      const root = makeRoot()
      write(root, 'dist/resume.pdf', makePdf({ text: `Contact ${probe}`, compressed: true }))
      const run = runGate(script, ['--root', root])
      expect(run.status).toBe(1)
      expect(run.out).toMatch(/dist\/resume\.pdf page 1 \(/)
      noDigits(run.out)
    })

    it('flags a number split across two text-show operators', () => {
      const root = makeRoot()
      write(root, 'dist/resume.pdf', makePdf({ text: probe, splitAt: 5 }))
      const run = runGate(script, ['--root', root])
      expect(run.status).toBe(1)
      expect(run.out).toMatch(/dist\/resume\.pdf page 1 \(/)
      noDigits(run.out)
    })

    it('flags a link annotation that uses the telephone scheme', () => {
      const root = makeRoot()
      write(root, 'dist/resume.pdf', makePdf({ annotationUri: ['tel', '+1'].join(':') }))
      const run = runGate(script, ['--root', root])
      expect(run.status).toBe(1)
      expect(run.out).toContain('dist/resume.pdf (link annotation)')
    })

    it('does not flag mailto and https link annotations', () => {
      const root = makeRoot()
      const mail = makePdf({ annotationUri: 'mailto:someone@example.com' })
      write(root, 'dist/resume.pdf', mail)
      expect(runGate(script, ['--root', root]).status).toBe(0)
      write(root, 'dist/resume.pdf', makePdf({ annotationUri: 'https://example.com/' }))
      expect(runGate(script, ['--root', root]).status).toBe(0)
    })

    it('flags a number in the Info dictionary and names only the key', () => {
      const root = makeRoot()
      write(root, 'dist/resume.pdf', makePdf({ info: { Author: probe } }))
      const run = runGate(script, ['--root', root])
      expect(run.status).toBe(1)
      expect(run.out).toContain('dist/resume.pdf (metadata Author)')
      noDigits(run.out)
    })

    it('passes a clean PDF with ordinary text and lists the metadata key names', () => {
      const root = makeRoot()
      write(
        root,
        'dist/resume.pdf',
        makePdf({
          text: 'Aaron Phan, design engineer',
          info: { Title: 'Resume', Author: 'Aaron' },
        }),
      )
      const run = runGate(script, ['--root', root])
      expect(run.status).toBe(0)
      expect(run.out).toContain('no-phone: OK')
      expect(run.out).toContain('dist/resume.pdf metadata keys: Title, Author')
      expect(run.out).not.toContain('Aaron,')
    })

    it('fails closed on a file that starts like a PDF and is garbage', () => {
      const root = makeRoot()
      write(root, 'dist/resume.pdf', '%PDF-1.7\nthis is not a pdf at all\n')
      const run = runGate(script, ['--root', root])
      expect(run.status).toBe(1)
      expect(run.out).toContain('dist/resume.pdf could not be read')
    })

    it('scans every PDF in dist, not only resume.pdf', () => {
      const root = makeRoot()
      write(root, 'dist/resume.pdf', makePdf({ text: 'Aaron Phan' }))
      write(root, 'dist/docs/extra.pdf', makePdf({ text: probe }))
      const run = runGate(script, ['--root', root])
      expect(run.status).toBe(1)
      expect(run.out).toContain('dist/docs/extra.pdf')
      noDigits(run.out)
    })
  })

  it('passes a clean dist', () => {
    const root = makeRoot()
    write(root, 'dist/index.html', '<p>Aaron Phan</p>\n')
    write(root, 'dist/assets/app.css', 'a{color:red}\n')
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(0)
    expect(run.out).toContain('no-phone: OK')
  })

  it('exits 2 when dist is missing', () => {
    const root = makeRoot()
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(2)
  })
})

describe('check-images', () => {
  const script = 'check-images.mjs'

  // Tiny stand-ins: the gate reads extensions and bytes, never decodes an image.
  const clean = Buffer.from('RIFF....WEBPVP8 clean-pixels')
  const withMarker = (marker: string) => Buffer.from(`RIFF....WEBPVP8 ${marker} payload`)

  // A built page that references one image by its hashed name.
  function cleanDist(root: string): void {
    write(root, 'dist/index.html', '<script type="module" src="/assets/index-abc.js"></script>\n')
    write(root, 'dist/assets/index-abc.js', 'const logo="/assets/logo-1a2b.avif 40w"\n')
    write(root, 'dist/assets/logo-1a2b.avif', clean)
  }

  it('passes a clean fixture with check-images: OK', () => {
    const root = makeRoot()
    cleanDist(root)
    write(root, 'src/assets/images/logo.png', 'png-bytes')
    write(root, 'src/content/images.ts', "import logo from '@/assets/images/logo.png?w=40'\n")
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(0)
    expect(run.out).toContain('check-images: OK')
  })

  it('exits 2 when dist is missing', () => {
    expect(runGate(script, ['--root', makeRoot()]).status).toBe(2)
  })

  it('flags a .png in dist and accepts .avif and .webp', () => {
    const root = makeRoot()
    cleanDist(root)
    write(root, 'dist/assets/extra.webp', clean)
    write(root, 'dist/assets/index-abc.js', 'a="logo-1a2b.avif extra.webp"\n')
    expect(runGate(script, ['--root', root]).status).toBe(0)

    write(root, 'dist/assets/photo-9.png', clean)
    write(root, 'dist/assets/index-abc.js', 'a="logo-1a2b.avif extra.webp photo-9.png"\n')
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('photo-9.png')
  })

  it.each(['Exif', 'EXIF', 'x:xmpmeta'])('flags a %s marker and names the file only', (marker) => {
    const root = makeRoot()
    cleanDist(root)
    write(root, 'dist/assets/logo-1a2b.avif', withMarker(marker))
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('logo-1a2b.avif')
    expect(run.out).not.toContain(marker)
  })

  it('flags an image in dist that no page, script or stylesheet references', () => {
    const root = makeRoot()
    cleanDist(root)
    write(root, 'dist/assets/orphan-77.webp', clean)
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('orphan-77.webp')
  })

  it('accepts an image referenced only from a stylesheet', () => {
    const root = makeRoot()
    cleanDist(root)
    write(root, 'dist/assets/bg-5.webp', clean)
    write(root, 'dist/assets/index-abc.css', '.x{background:url(/assets/bg-5.webp)}\n')
    expect(runGate(script, ['--root', root]).status).toBe(0)
  })

  it('flags a source image that no src file imports, and accepts several widths of one import', () => {
    const root = makeRoot()
    cleanDist(root)
    write(root, 'src/assets/images/used.png', 'png-bytes')
    write(root, 'src/content/images.ts', "import a from '@/assets/images/used.png?w=40;60'\n")
    expect(runGate(script, ['--root', root]).status).toBe(0)

    write(root, 'src/assets/images/unused.jpg', 'jpg-bytes')
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('unused.jpg')
  })

  it('flags a raster image under public', () => {
    const root = makeRoot()
    cleanDist(root)
    write(root, 'public/favicon.svg', '<svg/>')
    expect(runGate(script, ['--root', root]).status).toBe(0)
    write(root, 'public/hero.jpg', 'jpg-bytes')
    const run = runGate(script, ['--root', root])
    expect(run.status).toBe(1)
    expect(run.out).toContain('hero.jpg')
  })
})
