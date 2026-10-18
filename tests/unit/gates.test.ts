import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
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
