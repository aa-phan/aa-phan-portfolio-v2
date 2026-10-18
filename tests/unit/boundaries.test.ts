import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(import.meta.dirname, '../..')
const RULE = 'no-restricted-imports'

interface Finding {
  rule: string
  line: number
}

interface LintResult {
  status: number | null
  findings: Finding[]
}

function lintFixture(relativePath: string): LintResult {
  const result = spawnSync(
    path.join(ROOT, 'node_modules/.bin/oxlint'),
    ['-c', '.oxlintrc.json', '--no-ignore', '--format', 'json', relativePath],
    { cwd: ROOT, encoding: 'utf8' },
  )
  const parsed = JSON.parse(result.stdout) as {
    diagnostics: { code: string; labels: { span: { line: number } }[] }[]
  }
  return {
    status: result.status,
    findings: parsed.diagnostics.map((d) => ({
      rule: d.code,
      line: d.labels[0]?.span.line ?? -1,
    })),
  }
}

// A specifier such as motion/react matches both the paths list and the animation-subpath
// pattern, so oxlint can report one line twice; lines are de-duplicated here.
function restrictedLines(result: LintResult): number[] {
  return result.findings
    .filter((f) => f.rule.includes(RULE))
    .map((f) => f.line)
    .filter((line, index, all) => all.indexOf(line) === index)
    .sort((a, b) => a - b)
}

/** 1-based line numbers of fixture lines whose trimmed text equals one of the given lines. */
function linesOf(relativePath: string, wanted: string[]): number[] {
  const lines = readFileSync(path.join(ROOT, relativePath), 'utf8').split('\n')
  const found = wanted.map((text) => {
    const index = lines.findIndex((line) => line.trim() === text)
    if (index === -1) throw new Error(`fixture ${relativePath} has no line: ${text}`)
    return index + 1
  })
  return found.sort((a, b) => a - b)
}

const SECTIONS = 'tests/fixtures/sections/Imports.tsx'

describe('import boundaries (oxlint no-restricted-imports)', () => {
  it('sections: every forbidden specifier is flagged on its own line, nine in total', () => {
    const result = lintFixture(SECTIONS)
    expect(result.status).not.toBe(0)
    const expected = linesOf(SECTIONS, [
      "import { motion } from 'motion/react'",
      "import { animated } from '@react-spring/web'",
      "import { motion as framerMotion } from 'framer-motion'",
      "import { animate } from 'motion'",
      "import { useSpring } from 'react-spring'",
      "import { useMotionPreference } from '@/anim/useMotionPreference'",
      "import { TextEffect } from '@/components/motion-primitives/text-effect'",
      "import { hero } from '@/content'",
      "const dynamicMotion = import('motion/react')",
    ])
    expect(expected).toHaveLength(9)
    const flagged = restrictedLines(result)
    for (const line of expected) expect(flagged).toContain(line)
  })

  it('sections: importing the @/anim barrel is allowed', () => {
    const [barrelLine] = linesOf(SECTIONS, ["import { ThemeThumb } from '@/anim'"])
    expect(restrictedLines(lintFixture(SECTIONS))).not.toContain(barrelLine)
  })

  it('sections: the dynamic import() line is flagged (T-02-08)', () => {
    const [dynamicLine] = linesOf(SECTIONS, ["const dynamicMotion = import('motion/react')"])
    expect(restrictedLines(lintFixture(SECTIONS))).toContain(dynamicLine)
  })

  it('sections: a re-export from motion/react is flagged', () => {
    const [reexportLine] = linesOf(SECTIONS, ["export { useScroll } from 'motion/react'"])
    expect(restrictedLines(lintFixture(SECTIONS))).toContain(reexportLine)
  })

  it('sections: deep paths under anim, motion-primitives, content and the libraries are flagged', () => {
    const deep = linesOf(SECTIONS, [
      "import { deepThumb } from '@/anim/physics/ThemeThumb'",
      "import { deepPrimitive } from '@/components/motion-primitives/nested/deep'",
      "import { deepContent } from '@/content/projects/data'",
      "import { deepSpring } from '@react-spring/web/nested/deep'",
    ])
    const flagged = restrictedLines(lintFixture(SECTIONS))
    for (const line of deep) expect(flagged).toContain(line)
  })

  it('sections: only the barrel line escapes (14 violation lines, the barrel excluded)', () => {
    const result = lintFixture(SECTIONS)
    const fixtureLines = readFileSync(path.join(ROOT, SECTIONS), 'utf8').split('\n')
    const importLines = fixtureLines.flatMap((text, index) =>
      /^(import|export) .* from |= import\(/.test(text.trim()) ? [index + 1] : [],
    )
    const [barrelLine] = linesOf(SECTIONS, ["import { ThemeThumb } from '@/anim'"])
    expect(restrictedLines(result)).toEqual(importLines.filter((line) => line !== barrelLine))
    expect(importLines).toHaveLength(15)
  })

  it('anim: may import both libraries but not sections (one diagnostic, on the sections line)', () => {
    const file = 'tests/fixtures/anim/Imports.tsx'
    const result = lintFixture(file)
    expect(result.status).not.toBe(0)
    expect(restrictedLines(result)).toEqual(
      linesOf(file, ["import { Hero } from '@/sections/Hero/Hero'"]),
    )
  })

  it('motion-primitives: importing motion/react raises no no-restricted-imports diagnostic', () => {
    const result = lintFixture('tests/fixtures/motion-primitives/Ok.tsx')
    expect(restrictedLines(result)).toEqual([])
    expect(result.status).toBe(0)
  })

  it('app/Page.tsx: may import content, but not an animation library', () => {
    const file = 'tests/fixtures/app/Page.tsx'
    const result = lintFixture(file)
    expect(result.status).not.toBe(0)
    expect(restrictedLines(result)).toEqual(
      linesOf(file, ["import { motion } from 'motion/react'"]),
    )
  })
})
