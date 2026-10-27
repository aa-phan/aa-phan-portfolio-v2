// Parses the shipped token file and resolves every color token per theme.
//
// The contrast gate reads src/styles/tokens.css itself, not a copy, so a change to
// a token value changes the gate result. Only the color tokens are resolved: fourteen page
// tokens, plus four sleeve grounds that exist only inside the inverted band. Every other custom property (elevation, z-index, duration, easing) is
// ignored and never parsed.

import { mixColors, parseOklch } from './color.mjs'

export const COLOR_TOKENS = [
  '--text',
  '--background',
  '--primary',
  '--secondary',
  '--accent',
  '--surface',
  '--muted',
  '--border',
  '--border-strong',
  '--link',
  '--on-primary',
  '--on-accent',
  '--primary-hover',
  '--focus-ring',
  '--sleeve-personal',
  '--sleeve-employer',
  '--sleeve-hackathon',
  '--sleeve-course',
]

// Tokens declared only in the band blocks. A page theme does not define them, so resolveTheme
// reads them only for a band, and a pair using one must name the band themes it applies to.
export const BAND_ONLY_TOKENS = COLOR_TOKENS.slice(14)

export class TokenError extends Error {}

const BLOCK = /([^{}]+)\{([^{}]*)\}/g
// The closing semicolon is optional: the last declaration in a block may omit it.
const DECLARATION = /(--[A-Za-z0-9-]+)\s*:\s*([^;]+)(?:;|$)/g
const MIX =
  /^color-mix\(\s*in\s+oklch\s*,\s*var\(\s*(--[A-Za-z0-9-]+)\s*\)\s+([0-9]+(?:\.[0-9]+)?)%\s*,\s*var\(\s*(--[A-Za-z0-9-]+)\s*\)\s*\)$/

// A block whose selector names .band-invert is a band block and never touches the page
// themes: with data-theme dark in the selector it is the band on the dark page, otherwise the
// band on the light page. Of the rest, a block naming data-theme dark is the dark theme and
// every other block (":root", the light selector, a shared ":root" block) is the light theme.
// Later declarations win, matching the cascade for equal specificity.
export function parseTokensCss(cssText) {
  const css = cssText.replace(/\/\*[\s\S]*?\*\//g, '')
  // BLOCK matches flat rules only. A wrapper such as @media or @layer would make its inner
  // :root look like a top-level light block and silently audit the wrong palette.
  const atRule = /@[A-Za-z-]+/.exec(css)
  if (atRule) {
    throw new TokenError(
      `tokens.css uses ${atRule[0]}; the contrast gate parses flat rule blocks only, so keep tokens out of at-rules`,
    )
  }
  /** @type {Record<string, string>} */
  const light = {}
  /** @type {Record<string, string>} */
  const dark = {}
  /** @type {Record<string, string>} */
  const bandOnLight = {}
  /** @type {Record<string, string>} */
  const bandOnDark = {}
  for (const block of css.matchAll(BLOCK)) {
    const selector = block[1].trim()
    const isBand = /\.band-invert\b/.test(selector)
    const isDark = /data-theme\s*=\s*['"]?dark['"]?/.test(selector)
    const target = isBand ? (isDark ? bandOnDark : bandOnLight) : isDark ? dark : light
    for (const decl of block[2].matchAll(DECLARATION)) {
      target[decl[1]] = decl[2].trim().replace(/\s+/g, ' ')
    }
  }
  return { light, dark, bandOnLight, bandOnDark }
}

// Resolve every COLOR_TOKENS name in one theme's raw map to a color from makeColor. The
// band-only sleeve grounds are resolved only when band is true. A color-mix argument may
// reference a role token or another derived token.
export function resolveTheme(raw, { band = false } = {}) {
  const cache = new Map()
  const resolve = (name, stack) => {
    if (cache.has(name)) return cache.get(name)
    const value = raw[name]
    if (value === undefined) throw new TokenError(`missing token ${name}`)
    if (stack.includes(name)) {
      throw new TokenError(`circular token ${[...stack, name].join(' -> ')}`)
    }
    let color
    const mix = MIX.exec(value)
    if (mix) {
      const next = [...stack, name]
      color = mixColors(resolve(mix[1], next), resolve(mix[3], next), parseFloat(mix[2]))
    } else if (/^oklch\(/.test(value)) {
      try {
        color = parseOklch(value)
      } catch {
        throw new TokenError(`token ${name} has an unreadable oklch value: ${value}`)
      }
    } else {
      throw new TokenError(
        `token ${name} must be oklch(L C H) or color-mix(in oklch, var(--a) P%, var(--b)): ${value}`,
      )
    }
    cache.set(name, color)
    return color
  }
  /** @type {Record<string, ReturnType<typeof parseOklch>>} */
  const out = {}
  for (const name of COLOR_TOKENS) {
    if (!band && BAND_ONLY_TOKENS.includes(name)) continue
    out[name] = resolve(name, [])
  }
  return out
}
