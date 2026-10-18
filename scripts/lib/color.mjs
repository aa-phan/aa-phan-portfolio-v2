// Color math for the contrast gate.
//
// OKLCH to sRGB conversion, CSS color-mix(in oklch, ...) and WCAG 2.x contrast,
// ported unchanged from the checker that verified the palette in the design
// documentation. Node built-ins only. The luminance comes from the 8-bit values
// a browser actually paints, so a printed hex reproduces the printed ratio.
//
// Do not "improve" the math here without rerunning tests/unit/tokens.test.ts:
// it pins 38 published ratios to two decimals.

export const THRESHOLDS = { text: 4.5, large: 3.0, ui: 3.0, focus: 3.0 }
export const ACHROMATIC = 0.0001

// ---------------------------------------------------------------- color math

export function srgbToLinear(c8) {
  const c = c8 / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

export function linearToSrgb8(c) {
  const v = Math.min(1, Math.max(0, c))
  const e = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
  return Math.round(e * 255)
}

export function parseHex(s) {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(s.trim())
  if (!m) throw new Error(`bad hex color: ${s}`)
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function rgb8ToHex(rgb8) {
  return rgb8.map((v) => v.toString(16).padStart(2, '0')).join('')
}

// Ottosson's published OKLab matrices.
export function oklabToLinear(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

export function linearToOklab(r, g, b) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

export const mod360 = (h) => ((h % 360) + 360) % 360

// A color is built from OKLCH; everything else is derived from it.
export function makeColor(L, C, H) {
  const rad = (H * Math.PI) / 180
  const lin = oklabToLinear(L, C * Math.cos(rad), C * Math.sin(rad))
  const inGamut = lin.every((v) => v >= -0.0001 && v <= 1.0001)
  const rgb8 = lin.map(linearToSrgb8)
  // Luminance from the 8-bit values a browser actually paints, so the printed hex
  // reproduces the printed ratio exactly.
  const [R, G, B] = rgb8.map(srgbToLinear)
  const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B
  return { L, C, H: mod360(H), lin, inGamut, rgb8, hex: rgb8ToHex(rgb8), Y }
}

export function colorFromHex(hex) {
  const rgb8 = parseHex(hex)
  const [L, a, b] = linearToOklab(...rgb8.map(srgbToLinear))
  const C = Math.hypot(a, b)
  const H = C < ACHROMATIC ? 0 : mod360((Math.atan2(b, a) * 180) / Math.PI)
  return makeColor(L, C, H)
}

export function contrast(c1, c2) {
  const hi = Math.max(c1.Y, c2.Y)
  const lo = Math.min(c1.Y, c2.Y)
  return (hi + 0.05) / (lo + 0.05)
}

// CSS color-mix(in oklch, a P%, b): L and C linear, hue along the shorter arc,
// an achromatic color adopts the other color's hue.
export function mixColors(a, b, pct) {
  const w = pct / 100
  let ha = a.H
  let hb = b.H
  const aGray = a.C < ACHROMATIC
  const bGray = b.C < ACHROMATIC
  if (aGray && bGray) {
    ha = 0
    hb = 0
  } else if (aGray) {
    ha = hb
  } else if (bGray) {
    hb = ha
  }
  let d = hb - ha
  if (d > 180) d -= 360
  if (d <= -180) d += 360
  const H = mod360(ha + d * (1 - w))
  return makeColor(a.L * w + b.L * (1 - w), a.C * w + b.C * (1 - w), H)
}

export function parseOklch(s) {
  const m = /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+%?)\s+([0-9.]+)(?:deg)?\s*\)$/.exec(s.trim())
  if (!m) throw new Error(`bad oklch color: ${s}`)
  const L = m[1].endsWith('%') ? parseFloat(m[1]) / 100 : parseFloat(m[1])
  const C = m[2].endsWith('%') ? (parseFloat(m[2]) * 0.4) / 100 : parseFloat(m[2])
  const H = parseFloat(m[3])
  if ([L, C, H].some(Number.isNaN)) throw new Error(`bad oklch color: ${s}`)
  return makeColor(L, C, H)
}

export const fmtOklch = (c) => `oklch(${c.L.toFixed(4)} ${c.C.toFixed(4)} ${c.H.toFixed(2)})`

// Authoring formatter for --convert: rounds L and H to 4 and 2 decimals, then lowers
// chroma in 0.0001 steps until the rounded color is inside the sRGB gamut. Rounding a
// saturated hex such as 7b75ff would otherwise land a hair outside the gamut and the
// checker (rightly) rejects out-of-gamut tokens.
export function fmtOklchInGamut(c) {
  const L = Number(c.L.toFixed(4))
  const H = Number(c.H.toFixed(2))
  let C = Math.floor(c.C * 10000) / 10000
  while (C > 0 && !makeColor(L, C, H).inGamut) C = Math.round((C - 0.0001) * 10000) / 10000
  return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(2)})`
}
