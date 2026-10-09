#!/usr/bin/env node
// contrast-check.mjs
// WCAG 2.x contrast checker for the OKLCH token blocks in 01-DESIGN-TOKENS.md.
// Verification tool for the tokens doc, not application code. Node built-ins only,
// no package.json, no network. Phase 2 may port the logic into a token-contrast test.
//
// Usage:
//   node contrast-check.mjs --selftest
//   node contrast-check.mjs --convert 2f27ce        (hex -> oklch(L C H))
//   node contrast-check.mjs --convert "oklch(0.5 0.1 270)"   (oklch -> hex)
//   node contrast-check.mjs DOC [--require-chosen]
//
// Fenced blocks parsed from DOC (info string -> content):
//   palette X   lines "THEME TOKEN oklch(L C H)" (the 5 roles) plus optional
//               derived-override lines "THEME TOKEN mix(TOKEN_A P%, TOKEN_B)"
//   derived     lines "THEME TOKEN mix(TOKEN_A P%, TOKEN_B)"
//   pairs       lines "FG on BG CATEGORY USED-BY..."  (text 4.5, large 3, ui 3, focus 3)
// Exit codes: 0 pass, 1 contrast/selftest/chosen failure, 2 structural error.

import fs from 'node:fs';
import process from 'node:process';

const ROLES = ['--text', '--background', '--primary', '--secondary', '--accent'];
const THEMES = ['light', 'dark'];
const THRESHOLDS = { text: 4.5, large: 3.0, ui: 3.0, focus: 3.0 };
const ACHROMATIC = 0.0001;

// ---------------------------------------------------------------- color math

function srgbToLinear(c8) {
  const c = c8 / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb8(c) {
  const v = Math.min(1, Math.max(0, c));
  const e = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return Math.round(e * 255);
}

function parseHex(s) {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(s.trim());
  if (!m) throw new Error(`bad hex color: ${s}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgb8ToHex(rgb8) {
  return rgb8.map((v) => v.toString(16).padStart(2, '0')).join('');
}

// Ottosson's published OKLab matrices.
function oklabToLinear(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function linearToOklab(r, g, b) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const mod360 = (h) => ((h % 360) + 360) % 360;

// A color is built from OKLCH; everything else is derived from it.
function makeColor(L, C, H) {
  const rad = (H * Math.PI) / 180;
  const lin = oklabToLinear(L, C * Math.cos(rad), C * Math.sin(rad));
  const inGamut = lin.every((v) => v >= -0.0001 && v <= 1.0001);
  const rgb8 = lin.map(linearToSrgb8);
  // Luminance from the 8-bit values a browser actually paints, so the printed hex
  // reproduces the printed ratio exactly.
  const [R, G, B] = rgb8.map(srgbToLinear);
  const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  return { L, C, H: mod360(H), lin, inGamut, rgb8, hex: rgb8ToHex(rgb8), Y };
}

function colorFromHex(hex) {
  const rgb8 = parseHex(hex);
  const [L, a, b] = linearToOklab(...rgb8.map(srgbToLinear));
  const C = Math.hypot(a, b);
  const H = C < ACHROMATIC ? 0 : mod360((Math.atan2(b, a) * 180) / Math.PI);
  return makeColor(L, C, H);
}

function contrast(c1, c2) {
  const hi = Math.max(c1.Y, c2.Y);
  const lo = Math.min(c1.Y, c2.Y);
  return (hi + 0.05) / (lo + 0.05);
}

// CSS color-mix(in oklch, a P%, b): L and C linear, hue along the shorter arc,
// an achromatic color adopts the other color's hue.
function mixColors(a, b, pct) {
  const w = pct / 100;
  let ha = a.H;
  let hb = b.H;
  const aGray = a.C < ACHROMATIC;
  const bGray = b.C < ACHROMATIC;
  if (aGray && bGray) {
    ha = 0;
    hb = 0;
  } else if (aGray) {
    ha = hb;
  } else if (bGray) {
    hb = ha;
  }
  let d = hb - ha;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  const H = mod360(ha + d * (1 - w));
  return makeColor(a.L * w + b.L * (1 - w), a.C * w + b.C * (1 - w), H);
}

function parseOklch(s) {
  const m = /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+%?)\s+([0-9.]+)(?:deg)?\s*\)$/.exec(s.trim());
  if (!m) throw new Error(`bad oklch color: ${s}`);
  const L = m[1].endsWith('%') ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
  const C = m[2].endsWith('%') ? (parseFloat(m[2]) * 0.4) / 100 : parseFloat(m[2]);
  const H = parseFloat(m[3]);
  if ([L, C, H].some(Number.isNaN)) throw new Error(`bad oklch color: ${s}`);
  return makeColor(L, C, H);
}

const fmtOklch = (c) => `oklch(${c.L.toFixed(4)} ${c.C.toFixed(4)} ${c.H.toFixed(2)})`;

// Authoring formatter for --convert: rounds L and H to 4 and 2 decimals, then lowers
// chroma in 0.0001 steps until the rounded color is inside the sRGB gamut. Rounding a
// saturated hex such as 7b75ff would otherwise land a hair outside the gamut and the
// checker (rightly) rejects out-of-gamut tokens.
function fmtOklchInGamut(c) {
  const L = Number(c.L.toFixed(4));
  const H = Number(c.H.toFixed(2));
  let C = Math.floor(c.C * 10000) / 10000;
  while (C > 0 && !makeColor(L, C, H).inGamut) C = Math.round((C - 0.0001) * 10000) / 10000;
  return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(2)})`;
}

// ---------------------------------------------------------------- selftest

function selftest() {
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok, detail });
  const ratio = (h1, h2) => contrast(colorFromHex(h1), colorFromHex(h2));
  const near = (got, want, tol = 0.01) => Math.abs(got - want) <= tol;

  const hexCases = [
    ['050315', 'fbfbfe', 19.73],
    ['2f27ce', 'fbfbfe', 8.83],
    ['2f27ce', '050315', 2.23],
    ['433bff', '050315', 3.21],
    ['7b75ff', '050315', 5.66],
    ['dedcff', 'fbfbfe', 1.29],
  ];
  for (const [fg, bg, want] of hexCases) {
    const got = ratio(fg, bg);
    check(`hex ${fg}/${bg} = ${want}`, near(got, want), `got ${got.toFixed(4)}`);
  }

  const white = parseOklch('oklch(1 0 0)');
  const black = parseOklch('oklch(0 0 0)');
  const wb = contrast(white, black);
  check('oklch white vs black = 21.00', near(wb, 21.0, 0.005), `got ${wb.toFixed(4)}`);

  const rt = colorFromHex('2f27ce');
  const back = parseOklch(fmtOklchInGamut(rt));
  check('hex 2f27ce round-trips through OKLCH', back.hex === '2f27ce', `got ${back.hex}`);

  const half = mixColors(white, black, 50);
  check('50% mix of white and black has L = 0.5', near(half.L, 0.5, 1e-9), `got ${half.L}`);

  const tinted = mixColors(parseOklch('oklch(0.5 0 0)'), parseOklch('oklch(0.5 0.1 270)'), 50);
  check('achromatic mix adopts the other hue', near(tinted.H, 270, 1e-6), `got ${tinted.H}`);

  const arc = mixColors(parseOklch('oklch(0.5 0.1 350)'), parseOklch('oklch(0.5 0.1 10)'), 50);
  check('hue mix takes the shorter arc (350 and 10 -> 0)', near(mod360(arc.H + 180) - 180, 0, 1e-6), `got ${arc.H}`);

  const wild = parseOklch('oklch(0.6 0.4 150)');
  check('out-of-gamut color is detected', wild.inGamut === false);

  // Unrounded comparison: 4.499 must fail a 4.5 threshold even though it prints as 4.50.
  const fakeRatio = 4.499;
  check('unrounded threshold: 4.499 fails 4.5', !(fakeRatio >= THRESHOLDS.text) && fakeRatio.toFixed(2) === '4.50');

  const failures = results.filter((r) => !r.ok);
  if (failures.length === 0) {
    console.log(`SELFTEST PASS ${results.length}/${results.length}`);
    return 0;
  }
  for (const f of failures) console.log(`SELFTEST FAIL ${f.name} ${f.detail}`.trimEnd());
  return 1;
}

// ---------------------------------------------------------------- convert

function convert(value) {
  if (/^\s*oklch\(/i.test(value)) {
    const c = parseOklch(value.trim().toLowerCase());
    console.log(c.hex + (c.inGamut ? '' : ' (OUT-OF-GAMUT, clamped)'));
  } else {
    console.log(fmtOklchInGamut(colorFromHex(value)));
  }
  return 0;
}

// ---------------------------------------------------------------- doc parsing

class DocError extends Error {}

function parseDoc(text) {
  const palettes = new Map(); // letter -> { roles: {theme: {token: Color}}, overrides: {theme: {token: mixSpec}} }
  const derived = { light: new Map(), dark: new Map() };
  const pairs = [];
  let chosen = null;

  const lines = text.split(/\r?\n/);
  let block = null; // { kind, letter, startLine }
  lines.forEach((raw, idx) => {
    const lineNo = idx + 1;
    const fence = /^```(.*)$/.exec(raw);
    if (!block) {
      if (fence && fence[1].trim() !== '') {
        const info = fence[1].trim();
        let m;
        if ((m = /^palette ([A-Z])$/.exec(info))) {
          if (palettes.has(m[1])) throw new DocError(`line ${lineNo}: duplicate palette ${m[1]}`);
          palettes.set(m[1], { roles: { light: {}, dark: {} }, overrides: { light: new Map(), dark: new Map() } });
          block = { kind: 'palette', letter: m[1] };
        } else if (info === 'derived') {
          block = { kind: 'derived' };
        } else if (info === 'pairs') {
          block = { kind: 'pairs' };
        } else {
          block = { kind: 'other' };
        }
      } else if (fence) {
        block = { kind: 'other' }; // bare fence
      } else {
        const m = /^\s*Chosen palette:\s*([A-Z])\s*$/.exec(raw);
        if (m) chosen = m[1];
      }
      return;
    }
    if (fence && fence[1].trim() === '') {
      block = null;
      return;
    }
    if (block.kind === 'other') return;
    const line = raw.trim();
    if (line === '' || line.startsWith('//')) return;
    const where = `line ${lineNo}`;

    if (block.kind === 'palette' || block.kind === 'derived') {
      const m = /^(light|dark)\s+(--[A-Za-z0-9-]+)\s+(.+)$/.exec(line);
      if (!m) throw new DocError(`${where}: cannot parse token line "${line}"`);
      const [, theme, token, value] = m;
      const isMix = /^mix\(/.test(value);
      if (block.kind === 'derived') {
        if (!isMix) throw new DocError(`${where}: derived token ${token} must be a mix(), not a literal color`);
        if (derived[theme].has(token)) throw new DocError(`${where}: derived ${theme} ${token} defined twice`);
        derived[theme].set(token, parseMix(value, where));
        return;
      }
      const pal = palettes.get(block.letter);
      if (isMix) {
        if (pal.overrides[theme].has(token)) throw new DocError(`${where}: override ${theme} ${token} defined twice`);
        pal.overrides[theme].set(token, parseMix(value, where));
        return;
      }
      if (!ROLES.includes(token)) {
        throw new DocError(`${where}: ${token} is not one of the 5 role tokens; derived tokens must be mix() of roles (D-06)`);
      }
      if (pal.roles[theme][token]) throw new DocError(`${where}: role ${theme} ${token} defined twice`);
      try {
        pal.roles[theme][token] = parseOklch(value);
      } catch (e) {
        throw new DocError(`${where}: ${e.message}`);
      }
      return;
    }

    if (block.kind === 'pairs') {
      const m = /^(--[A-Za-z0-9-]+)\s+on\s+(--[A-Za-z0-9-]+)\s+(\S+)\s*(.*)$/.exec(line);
      if (!m) throw new DocError(`${where}: cannot parse pair line "${line}"`);
      if (!(m[3] in THRESHOLDS)) throw new DocError(`${where}: unknown category "${m[3]}"`);
      pairs.push({ fg: m[1], bg: m[2], category: m[3], usedBy: m[4] });
    }
  });
  if (block) throw new DocError('unterminated fenced block');
  return { palettes, derived, pairs, chosen };
}

function parseMix(value, where) {
  const m = /^mix\(\s*(--[A-Za-z0-9-]+)\s+([0-9]+(?:\.[0-9]+)?)%\s*,\s*(--[A-Za-z0-9-]+)\s*\)$/.exec(value);
  if (!m) throw new DocError(`${where}: cannot parse ${value}`);
  const pct = parseFloat(m[2]);
  if (pct < 0 || pct > 100) throw new DocError(`${where}: mix percentage out of range`);
  return { a: m[1], pct, b: m[3] };
}

function validatePalettes(doc) {
  for (const [letter, pal] of doc.palettes) {
    for (const theme of THEMES) {
      const have = Object.keys(pal.roles[theme]);
      const missing = ROLES.filter((r) => !have.includes(r));
      if (missing.length || have.length !== ROLES.length) {
        throw new DocError(`palette ${letter} ${theme}: needs exactly the 5 roles (${ROLES.join(', ')}); missing ${missing.join(', ') || 'none'}`);
      }
    }
  }
}

function resolver(doc, palette, theme) {
  const pal = doc.palettes.get(palette);
  const defs = new Map(doc.derived[theme]);
  for (const [k, v] of pal.overrides[theme]) defs.set(k, v);
  const cache = new Map();
  const resolve = (token, stack = []) => {
    if (pal.roles[theme][token]) return pal.roles[theme][token];
    if (cache.has(token)) return cache.get(token);
    const def = defs.get(token);
    if (!def) throw new DocError(`palette ${palette} ${theme}: token ${token} does not resolve`);
    if (stack.includes(token)) throw new DocError(`palette ${palette} ${theme}: circular derived token ${token}`);
    const color = mixColors(resolve(def.a, [...stack, token]), resolve(def.b, [...stack, token]), def.pct);
    cache.set(token, color);
    return color;
  };
  return { resolve, derivedNames: [...defs.keys()] };
}

function checkDoc(path, requireChosen) {
  let text;
  try {
    text = fs.readFileSync(path, 'utf8');
  } catch (e) {
    console.log(`ERROR: cannot read ${path}: ${e.message}`);
    return 2;
  }
  let doc;
  try {
    doc = parseDoc(text);
    if (doc.palettes.size === 0) throw new DocError('no palette block found');
    if (doc.pairs.length === 0) throw new DocError('no pairs block found');
    validatePalettes(doc);
  } catch (e) {
    if (e instanceof DocError) {
      console.log(`ERROR: ${e.message}`);
      return 2;
    }
    throw e;
  }

  let failures = 0;
  let checks = 0;
  const letters = [...doc.palettes.keys()].sort();
  try {
    for (const letter of letters) {
      for (const theme of THEMES) {
        const { resolve, derivedNames } = resolver(doc, letter, theme);
        for (const name of [...ROLES, ...derivedNames]) {
          const c = resolve(name);
          console.log(`TOKEN ${letter} ${theme} ${name} ${fmtOklch(c)} #${c.hex}${c.inGamut ? '' : ' OUT-OF-GAMUT'}`);
        }
      }
    }
    for (const letter of letters) {
      for (const theme of THEMES) {
        const { resolve } = resolver(doc, letter, theme);
        for (const p of doc.pairs) {
          const fg = resolve(p.fg);
          const bg = resolve(p.bg);
          const min = THRESHOLDS[p.category];
          const label = `${letter} ${theme} ${p.fg} on ${p.bg} ${p.category}`;
          checks += 1;
          if (!fg.inGamut || !bg.inGamut) {
            failures += 1;
            console.log(`${label} OUT-OF-GAMUT min ${min.toFixed(1)} FAIL ${p.usedBy}`.trimEnd());
            continue;
          }
          const ratio = contrast(fg, bg);
          const pass = ratio >= min; // unrounded
          if (!pass) failures += 1;
          console.log(`${label} ${ratio.toFixed(2)} min ${min.toFixed(1)} ${pass ? 'PASS' : 'FAIL'} ${p.usedBy}`.trimEnd());
        }
      }
    }
  } catch (e) {
    if (e instanceof DocError) {
      console.log(`ERROR: ${e.message}`);
      return 2;
    }
    throw e;
  }

  let chosenFail = false;
  if (requireChosen) {
    if (doc.chosen && doc.palettes.has(doc.chosen)) {
      console.log(`CHOSEN ${doc.chosen}`);
    } else {
      chosenFail = true;
      console.log(`CHOSEN-MISSING: no "Chosen palette: X" line naming an existing palette (found: ${doc.chosen ?? 'none'})`);
    }
  }

  if (failures === 0 && !chosenFail) {
    console.log(`RESULT: PASS palettes=${letters.length} checks=${checks}`);
    return 0;
  }
  console.log(`RESULT: FAIL failures=${failures + (chosenFail ? 1 : 0)}`);
  return 1;
}

// ---------------------------------------------------------------- main

function main(argv) {
  let selftestFlag = false;
  let requireChosen = false;
  let convertValue = null;
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--selftest') selftestFlag = true;
    else if (a === '--require-chosen') requireChosen = true;
    else if (a === '--convert') {
      convertValue = argv[++i];
      if (convertValue === undefined) {
        console.log('ERROR: --convert needs a VALUE');
        return 2;
      }
    } else if (a.startsWith('--')) {
      console.log(`ERROR: unknown flag ${a}`);
      return 2;
    } else positional.push(a);
  }
  try {
    if (selftestFlag) return selftest();
    if (convertValue !== null) return convert(convertValue);
    if (positional.length === 0) {
      console.log('ERROR: usage: contrast-check.mjs --selftest | --convert VALUE | DOC [--require-chosen]');
      return 2;
    }
    return checkDoc(positional[0], requireChosen);
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
    return 2;
  }
}

process.exitCode = main(process.argv.slice(2));
