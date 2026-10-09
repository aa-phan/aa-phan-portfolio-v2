# Content Inventory (DOC-02, CNT-03)

Status: Draft

Phase 1 plan 01-01 created this file with the structure, the source-of-truth rules and the Contact Me section. Plan 01-03 adds the other six sections, the gap register (D-07) and the experience recount (D-09).

## Sources

| Source | Role | Version |
|--------|------|---------|
| `references/Aaron_Phan_Resume.pdf` | Source of truth | File modified 2026-10-09. Kept out of version control by design (D-03). |
| `aa-phan.github.io/index.html` (the iPod site) | Legacy source | Repo `aa-phan.github.io` at commit `d9d97db`. Content constants sit at lines 460-545. |

## Source-of-truth rules

1. The resume wins on any conflict with the legacy site.
2. Items the resume does not cover are kept from the legacy site (for example the DJ Instagram link).
3. Copy is verbatim. Any edit is recorded in this file with a before and an after.
4. The phone number is never published (D-11): not in site copy, the served resume, meta tags, JSON-LD or Open Graph data. It is never written into any planning doc either. The resume is read only through a redacting pipe that replaces phone-shaped strings.
5. Each item carries Value, Source, Legacy-site value and Resolution so a later phase can build the typed content module (CNT-01) without re-reading the sources.

## Contact Me {#contact}

Interaction: IX-09 (copy-email toast) in `01-MOTION-SPEC.md`. Wireframes: `### Frame: Contact Me @ 375`, `@ 768`, `@ 1280` and the toast state in `01-IA-WIREFRAMES.md`. Color pairs: the `#contact` rows in `01-DESIGN-TOKENS.md`.

Six items. Five are public; one (CON-06) is recorded only to make its exclusion explicit.

### CON-01 Email

- **Value:** aaron.phan240@gmail.com
- **Source:** Resume header.
- **Legacy-site value:** aaron.phan240@gmail.com (`mailto:aaron.phan240@gmail.com`).
- **Resolution:** Resume and legacy agree, so there is no conflict. The user already confirmed a public email on 2026-10-09 (PROJECT.md key decisions); plan 01-03 rules on the final confirmation per D-11. Rendered as a `mailto:` link plus a Copy email button (IX-09).

### CON-02 GitHub

- **Value:** https://github.com/aa-phan
- **Source:** Resume header shows the short form github.com/aa-phan.
- **Legacy-site value:** https://github.com/aa-phan (label github.com/aa-phan).
- **Resolution:** Agree. Opens in a new tab; the visible label is the short form.

### CON-03 LinkedIn

- **Value:** https://www.linkedin.com/in/aa-phan/
- **Source:** Resume header shows the short form linkedin.com/in/aa-phan.
- **Legacy-site value:** https://www.linkedin.com/in/aa-phan/ (label linkedin.com/in/aa-phan).
- **Resolution:** Agree. Opens in a new tab; the visible label is the short form.

### CON-04 DJ Instagram

- **Value:** https://www.instagram.com/phvntm_
- **Source:** Not on the resume.
- **Legacy-site value:** https://www.instagram.com/phvntm_ (label instagram.com/phvntm_).
- **Resolution:** Legacy only, kept per the user (the DJ Instagram link is explicitly OK to keep public). Pairs with the About Me DJ personality block.

### CON-05 Resume PDF

- **Value:** A downloadable PDF of the resume, linked from the hero Resume CTA and from the Contact Me section.
- **Source:** `references/Aaron_Phan_Resume.pdf` is the content source of truth.
- **Legacy-site value:** None. The iPod site has no resume download.
- **Resolution:** The file the site serves is a phone-stripped derivative of the source resume, produced under CNT-04 in Phase 3. The source file is never copied into the public repo. The served copy must be checked for the phone number in its text layer and its metadata before it ships.

### CON-06 Phone

- **Value:** EXCLUDED.
- **Source:** Present on the source resume header.
- **Legacy-site value:** Not on the legacy site.
- **Resolution:** EXCLUDED. Never published on the site, the web resume, meta tags, JSON-LD or OG data (D-11, and the saved content rule). The digits are deliberately not written in this file or any other planning doc. No `tel:` link and no copy-to-clipboard for it. Contact by phone is not offered; email is the primary channel.
