// D-24 threshold gate for the awwwards QA loop.
//
// Reads .shots/summary.json (written by shoot.mjs --crawl) and .shots/audit.txt (audit.mjs
// stdout) and gates every crawled page on:
//   no shootFailed; mobileLcpMs < 2500; mobileCls < 0.05; axeSerious === 0 (null is a skipped
//   axe pass and fails); noVisibleFocus 0; invisibleFocus 0; noHoverChange 0; audit FAIL count 0.
// Also requires the four dialog frames in .shots/extra/. Other report fields are printed as
// information and never gate. A metric that was not measured (null) fails its gate.
//
// Flag: --dir DIR (default .shots).
// Exit: 0 PASS, 1 at least one miss, 2 .shots/summary.json or .shots/audit.txt is missing.
import fs from 'node:fs'
import path from 'node:path'

const argv = process.argv.slice(2)
const dirFlag = argv.indexOf('--dir')
const dir = dirFlag >= 0 && argv[dirFlag + 1] ? argv[dirFlag + 1] : '.shots'

const LCP_MAX_MS = 2500
const CLS_MAX = 0.05

const summaryPath = path.join(dir, 'summary.json')
const auditPath = path.join(dir, 'audit.txt')
for (const file of [summaryPath, auditPath]) {
  if (!fs.existsSync(file)) {
    console.error(`check:qa: ${file} not found, run the QA pass first`)
    process.exit(2)
  }
}

let summary
try {
  summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'))
} catch (error) {
  console.error(
    `check:qa: ${summaryPath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
  )
  process.exit(2)
}
if (!Array.isArray(summary) || summary.length === 0) {
  console.error(`check:qa: ${summaryPath} lists no pages`)
  process.exit(2)
}

let misses = 0
const verdict = (ok) => {
  if (!ok) misses += 1
  return ok ? 'PASS' : 'FAIL'
}
const show = (value) => (value === null || value === undefined ? 'null' : String(value))

// Audit FAIL count from the final 'N FAIL, M WARN' line.
const auditText = fs.readFileSync(auditPath, 'utf8')
const tally = [...auditText.matchAll(/^(\d+) FAIL, (\d+) WARN\s*$/gm)].pop()
const auditFails = tally ? Number(tally[1]) : null
const auditWarns = tally ? Number(tally[2]) : null

console.log('Gate rows (page, gate, value, verdict)')
console.log(
  `audit      FAIL count ${show(auditFails)} (WARN ${show(auditWarns)}) ${verdict(auditFails === 0)}`,
)

for (const page of summary) {
  const name = page.page
  if (page.shootFailed) {
    console.log(`${name.padEnd(10)} shootFailed ${show(page.shootFailed)} ${verdict(false)}`)
    continue
  }
  const rows = [
    [
      'mobileLcpMs',
      page.mobileLcpMs,
      typeof page.mobileLcpMs === 'number' && page.mobileLcpMs < LCP_MAX_MS,
    ],
    ['mobileCls', page.mobileCls, typeof page.mobileCls === 'number' && page.mobileCls < CLS_MAX],
    ['axeSerious', page.axeSerious, page.axeSerious === 0],
    ['noVisibleFocus', page.noVisibleFocus, page.noVisibleFocus === 0],
    ['invisibleFocus', page.invisibleFocus, page.invisibleFocus === 0],
    ['noHoverChange', page.noHoverChange, page.noHoverChange === 0],
  ]
  for (const [gate, value, ok] of rows) {
    console.log(
      `${name.padEnd(10)} ${gate.padEnd(15)} ${String(show(value)).padEnd(8)} ${verdict(ok)}`,
    )
  }
}

const frames = ['d-dialog-light', 'd-dialog-dark', 'm-dialog-light', 'm-dialog-dark']
for (const frame of frames) {
  const file = path.join(dir, 'extra', `${frame}.png`)
  const present = fs.existsSync(file)
  console.log(
    `extra      ${frame.padEnd(15)} ${present ? 'present' : 'missing'}  ${verdict(present)}`,
  )
}

console.log('\nInformation (not gating)')
for (const page of summary) {
  if (page.shootFailed) continue
  const idle =
    page.idleMotion === false
      ? 'false (expected false (still page by decision))'
      : show(page.idleMotion)
  console.log(
    `${page.page}: errors=${show(page.errors)} overflow=${show(page.overflow)} ` +
      `smallTargets=${show(page.smallTargets)} hiddenTextReduced=${show(page.hiddenTextReduced)} ` +
      `movingReduced=${show(page.movingReduced)} desktopFps=${show(page.desktopFps)} ` +
      `mobileFps=${show(page.mobileFps)} colorOnly=${show(page.colorOnly)} idleMotion=${idle}`,
  )
}

if (misses === 0) {
  console.log('\nQA: PASS')
  process.exit(0)
}
console.log(`\nQA: FAIL misses=${misses}`)
process.exit(1)
