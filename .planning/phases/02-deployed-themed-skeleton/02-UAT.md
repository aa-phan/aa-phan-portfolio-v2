---
status: testing
phase: 02-deployed-themed-skeleton
source: [02-VERIFICATION.md]
started: 2026-10-26T00:00:00Z
updated: 2026-10-26T00:00:00Z
---

## Current Test

number: 1
name: Real-device smoke test on the live staging URL (D5)
expected: |
  On a phone, https://aa-phan.github.io/aa-phan-portfolio-v2/ shows the hero laid out at phone width; the theme toggle switches light/dark and the choice survives a reload; the resume link opens the stand-in PDF; the email CTA hands off to the mail app; no console errors or 404s on desktop.
awaiting: user response

## Tests

### 1. Real-device smoke test on the live staging URL (D5)
expected: Hero fits phone width; theme toggle works and persists across reload; resume stand-in PDF opens; email CTA opens the mail app; no console errors or 404s on desktop.
result: [pending]

### 2. Role-line re-reveal at 375 px
expected: The ~0.35 s hide-then-reveal of the hero role line when the lazy TextEffect chunk arrives reads as intentional, not as a flicker, with motion on; with the OS reduce-motion setting on, the line stays static (see 02-REVIEW WR-02).
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
