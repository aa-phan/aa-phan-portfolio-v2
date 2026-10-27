// Image gate over the built site and the image sources.
//
// Only optimized, metadata-free, used images may ship. This fails when:
//   - a raster image in dist or public is not AVIF or WebP (public may hold no raster at all),
//   - an image in dist carries an Exif or EXIF block or an XMP packet,
//   - an image in dist is not referenced by any built .html, .js or .css file,
//   - a file in src/assets/images is not imported by any src .ts or .tsx file.
// On a hit it prints only the file and the rule, never the bytes found.
//
// Flag: --root DIR (default cwd); scans ROOT/dist, ROOT/public and ROOT/src.
// Exit: 0 printing "check-images: OK", 1 on a finding, 2 when dist is missing.
import fs from 'node:fs'
import path from 'node:path'

const argv = process.argv.slice(2)
const rootFlag = argv.indexOf('--root')
const ROOT = path.resolve(rootFlag >= 0 && argv[rootFlag + 1] ? argv[rootFlag + 1] : process.cwd())
const DIST = path.join(ROOT, 'dist')
const PUBLIC = path.join(ROOT, 'public')
const SRC = path.join(ROOT, 'src')
const SOURCE_IMAGES = path.join(SRC, 'assets', 'images')

if (!fs.existsSync(DIST) || !fs.statSync(DIST).isDirectory()) {
  console.error(`check-images: ${path.relative(ROOT, DIST) || DIST} not found, run the build first`)
  process.exit(2)
}

const RASTER = /\.(png|apng|jpe?g|gif|bmp|tiff?|heic|heif|jxl|webp|avif)$/i
const SHIPPABLE = /\.(webp|avif)$/i
// Exif blocks and XMP packets, as raw byte strings (files are read as latin1).
const METADATA = [/Exif/, /EXIF/, /x:xmpmeta/, /<\?xpacket/]

function walk(dir, keep, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, keep, out)
    else if (entry.isFile() && keep.test(entry.name)) out.push(full)
  }
  return out
}

const rel = (file) => path.relative(ROOT, file)
const text = (file) => fs.readFileSync(file).toString('latin1')
const findings = []

// Built images: format, metadata, and use.
const builtImages = walk(DIST, RASTER)
const builtText = walk(DIST, /\.(html|js|css)$/i)
  .map(text)
  .join('\n')
for (const file of builtImages) {
  const name = path.basename(file)
  if (!SHIPPABLE.test(name)) findings.push(`${rel(file)} is not AVIF or WebP`)
  const bytes = text(file)
  if (METADATA.some((re) => re.test(bytes))) findings.push(`${rel(file)} carries image metadata`)
  if (!builtText.includes(name)) findings.push(`${rel(file)} is not referenced by the built site`)
}

// Raster files in public are served as they are, with no optimization or metadata strip.
for (const file of walk(PUBLIC, RASTER)) {
  findings.push(`${rel(file)} is a raster image in public (import it from src/assets/images)`)
}

// Source images: every file must be imported by name from some src module.
const sourceText = walk(SRC, /\.(ts|tsx)$/i)
  .map(text)
  .join('\n')
for (const file of walk(SOURCE_IMAGES, /./)) {
  if (!sourceText.includes(path.basename(file))) {
    findings.push(`${rel(file)} is not imported by any src module`)
  }
}

if (findings.length > 0) {
  for (const line of findings) console.error(`check-images: ${line}`)
  process.exit(1)
}
console.log('check-images: OK')
