# Information Architecture and Wireframes (DOC-03)

Status: Draft

Phase 1 plan 01-01 created this file with the anchor registry, the frame conventions and the Contact Me frames. Plan 01-07 sets the final section order and adds the hero, nav, rail, overlay and every other section at 375, 768 and 1280 px.

Wireframes are ASCII inside this markdown file (D-02). No HTML sketches.

## Section registry

Seven fixed anchors. Every phase doc refers to a section by its anchor, never by a position number. The final order on the page is set in plan 01-07.

| Anchor | Section |
|--------|---------|
| {#hero} | Hero |
| {#experience} | Experience |
| {#projects} | Projects |
| {#about} | About Me |
| {#skills} | Skills |
| {#education} | Education |
| {#contact} | Contact Me |

## Frame conventions

- Frames are drawn in a fenced `text` block, 38 columns wide for 375 px, 64 columns for 768 px and 96 columns for 1280 px. Widths count the space between the two `|` borders, so each drawn line is 40, 66 or 98 characters long.
- Square-bracket annotations name an interaction ID from `01-MOTION-SPEC.md` (for example [IX-09]) or an anchor (for example [#contact]).
- `[ Label ]` is a button. `Label >` or an underlined word in prose is a link. `(( ))` marks the toast. `=====` is the bottom pill nav on mobile.
- Touch targets are at least 44 px high and wide at 375 px.

## Wireframes

### Frame: Contact Me @ 375

Order: heading, one line of lead copy, the Copy email button (primary), the mailto link, Download resume, then the three profile links stacked. Each row is at least 44 px tall, with 8 px of space between rows. The page bottom keeps clear space for the bottom pill nav.

```text
+--------------------------------------+
|  [#contact]                          |
|                                      |
|  Contact Me                          |
|  The fastest way to reach me is      |
|  email.                              |
|                                      |
|  +--------------------------------+  |
|  |  [ Copy email ]        [IX-09] |  |
|  +--------------------------------+  |
|  aaron.phan240@gmail.com  (mailto)   |
|                                      |
|  +--------------------------------+  |
|  |  [ Download resume ]           |  |
|  +--------------------------------+  |
|                                      |
|  +--------------------------------+  |
|  |  GitHub        github.com/...  |  |
|  +--------------------------------+  |
|  +--------------------------------+  |
|  |  LinkedIn      linkedin.com/.. |  |
|  +--------------------------------+  |
|  +--------------------------------+  |
|  |  DJ Instagram  instagram.com.. |  |
|  +--------------------------------+  |
|                                      |
|          ======================      |
|          =  bottom pill nav   =      |
|          ======================      |
+--------------------------------------+
```

Notes:

- Every row is a full-width 44 px or taller touch target; the email address is also a plain `mailto:` link so it works without JavaScript.
- Each link has a visible text label, so no link is identified by an icon alone.
- Focus order follows reading order: Copy email, mailto link, Download resume, GitHub, LinkedIn, DJ Instagram.

### Frame: Contact Me @ 768

Two columns: the copy and email actions on the left, the resume and the three profile links on the right. Touch targets stay at least 44 px.

```text
+----------------------------------------------------------------+
|  [#contact]                                                    |
|                                                                |
|  Contact Me                                                    |
|  The fastest way to reach me is email.                         |
|                                                                |
|  +---------------------------+  +----------------------------+ |
|  |  [ Copy email ]  [IX-09]  |  |  [ Download resume ]       | |
|  +---------------------------+  +----------------------------+ |
|  aaron.phan240@gmail.com        GitHub        github.com/...   |
|  (mailto)                       LinkedIn      linkedin.com/... |
|                                 DJ Instagram  instagram.com... |
|                                                                |
|                    ====================                        |
|                    =  bottom pill nav =                        |
|                    ====================                        |
+----------------------------------------------------------------+
```

### Frame: Contact Me @ 1280

A wide block in the content column. At this width the desktop sticky nav sits at the top of the page, so there is no bottom pill. The Copy email button is the hover and press target for the desktop pointer polish in IX-17 (Magnetic on the CTA wrapper); the copy action itself is IX-09.

```text
+------------------------------------------------------------------------------------------------+
|  [#contact]                                                                                    |
|                                                                                                |
|  Contact Me                                                                                    |
|  The fastest way to reach me is email.                                                         |
|                                                                                                |
|  +------------------------------+     +------------------------------------------------------+ |
|  |  [ Copy email ]      [IX-09] |     |  GitHub          github.com/aa-phan                  | |
|  +------------------------------+     |  LinkedIn        linkedin.com/in/aa-phan             | |
|  aaron.phan240@gmail.com (mailto)     |  DJ Instagram    instagram.com/phvntm_               | |
|                                       +------------------------------------------------------+ |
|  +------------------------------+                                                              |
|  |  [ Download resume ]         |                                                              |
|  +------------------------------+                                                              |
|                                                                                                |
+------------------------------------------------------------------------------------------------+
```

### State: Copy-email toast @ 375

After Copy email is activated, a toast appears above the bottom pill nav, centered, with the confirmation text. It fades and slides in, stays about 4 seconds, then leaves. The text is also announced through a polite live region that is in the DOM before the toast appears. The toast never covers the Copy email button.

```text
+--------------------------------------+
|  Contact Me                          |
|  The fastest way to reach me is      |
|  email.                              |
|                                      |
|  +--------------------------------+  |
|  |  [ Copy email ]                |  |
|  +--------------------------------+  |
|  aaron.phan240@gmail.com  (mailto)   |
|                                      |
|    ((  Email copied to clipboard ))  |
|    ((  [IX-09]                   ))  |
|                                      |
|          ======================      |
|          =  bottom pill nav   =      |
|          ======================      |
+--------------------------------------+
```
