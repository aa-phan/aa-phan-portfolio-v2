# Information Architecture and Wireframes (DOC-03)

Status: Draft

Phase 1 plan 01-01 created this file with the anchor registry, the frame conventions and the Contact Me frames. Plan 01-07 set the final section order and added the hero, nav, rail, overlay and every other section at 375, 768 and 1280 px.

Wireframes are ASCII inside this markdown file (D-02). No HTML sketches.

## Section registry

Seven fixed anchors. Every phase doc refers to a section by its anchor, never by a position number. The page order is in the next section.

| Anchor | Section |
|--------|---------|
| {#hero} | Hero |
| {#experience} | Experience |
| {#projects} | Projects |
| {#about} | About Me |
| {#skills} | Skills |
| {#education} | Education |
| {#contact} | Contact Me |

## Section order

| Order | Section | Anchor | Why here |
|-------|---------|--------|----------|
| 1 | Hero | {#hero} | Name, role and the Resume and Copy email CTAs are visible at first paint, which is most of the 10-second test. |
| 2 | Experience | {#experience} | Recruiters look for experience first; it is the first thing below the fold and one pill tap from anywhere. |
| 3 | Projects | {#projects} | The signature rail and overlay; it follows Experience so the work sits next to the roles it came from. |
| 4 | About Me | {#about} | Personality (the DJ side) comes after the evidence, and links to the Instagram in Contact. |
| 5 | Skills | {#skills} | A scan-friendly summary once the reader knows the work. |
| 6 | Education | {#education} | Short, factual, needed for the GPA and degree check, but rarely the first stop. |
| 7 | Contact Me | {#contact} | The page ends on the action; it is also one tap from the hero CTA and the pill nav. |

## Navigation model

- Below 768 px a thumb-reachable bottom pill nav is fixed to the viewport. Collapsed, it has three segments: Experience, Projects and Menu. Experience and Projects jump straight to their section; the Menu segment morphs the pill in place into a panel of the six section links, the theme toggle and Resume [IX-07] (reference 445). Contact is one tap from the hero CTA and the Contact link in the panel.
- 768 px and wider use a sticky top nav: section links, the theme toggle [IX-10] and a Resume button, with a scroll-spy indicator under the active link [IX-08]. The bottom pill is not shown at this width.
- A skip link is the first focusable element and targets {#main}.
- Nav form is chosen by width. Hover effects are chosen by pointer capability, never by width.
- Nav links are plain anchors in a single page: there is no router, and the URL changes only by the browser's own hash handling.

## Recruiter fast path (10-second test)

A first-time visitor on a 375 px phone reaches each item with at most one tap from the first viewport.

| Item | Where at 375 | Taps from first viewport |
|------|--------------|--------------------------|
| Name | The h1 in the hero, visible on first paint | 0 |
| Role | The role line directly under the name | 0 |
| Experience | The Experience segment of the collapsed pill nav | 1 |
| Projects | The Projects segment of the collapsed pill nav | 1 |
| Resume | The Download resume CTA in the hero | 1 |
| Contact | The Contact CTA in the hero, or the Copy email CTA | 1 |

Pass rule: all six found in 10 seconds or less, timed on a real phone with motion enabled (the same rule as the design brief).

## Above the fold @ 375

A 375 x 667 viewport shows, top to bottom:

- The name as the h1.
- The role line under it, with the text effect [IX-01] on the role line only.
- The Download resume and Copy email CTAs (and a Contact link), each at least 44 px tall.
- The collapsed pill nav fixed at the bottom, clear of the CTAs.
- The top edge of {#experience}, so the reader knows there is more below.

The frame is `### Frame: Hero @ 375`. Nothing in the first viewport depends on JavaScript or motion.

## Anchors and landmarks

- Landmarks: header (skip link and nav), nav, main {#main}, footer.
- One h1 per page: the name in the hero. Every other section has one h2, and each section element is labelled by its heading with `aria-labelledby`.
- Section anchors are the seven in the registry above; nav links and CTAs are plain `<a href="#anchor">`.
- Each section carries `scroll-margin-top` equal to the sticky nav height at 768 px and up, and the height of the safe top area at 375, so a link jump never hides a heading.

## Project rail and overlay behavior

Featured order: PRJ-01, PRJ-02, PRJ-03, then PRJ-04, PRJ-05, PRJ-06, PRJ-07 (the remaining projects, newest first).

- The rail is native horizontal scrolling with scroll-snap on touch [IX-04] and a hover lift with neighbor shift on a fine pointer [IX-03], with the same lift on keyboard focus [IX-06].
- Opening a project shows an overlay with the index written as NN / 07. Prev and next wrap around (07 / 07 goes to 01 / 07). The overlay has a Close button; Escape closes it; focus returns to the rail item that opened it; the URL does not change (deep-linkable project URLs are a deferred requirement).
- Dialog accessibility is settled by ADR-0006: focus trap, inert background, scroll lock and focus return belong to the dialog primitive, and motion animates only the morph [IX-05].
- Project links and images are deferred (G-01, G-02), so overlay links show only when supplied and rail cards use a cover placeholder.

## Global behaviors

- Press-squish [IX-02] on all buttons and cards, on the inner surface only.
- Section reveals [IX-15] when a section enters the viewport; content is visible by default and the hidden start state is set after mount.
- Desktop smooth wheel scroll [IX-16], off on touch and under reduced motion.
- Desktop pointer polish [IX-17]: Tilt on the About photo, Magnetic on the hero and contact CTA wrappers, Spotlight on experience cards, fine pointer only.

## Frame conventions

- Frames are drawn in a fenced `text` block with printable ASCII only. The width counts the whole line including both `|` borders: 38 characters for 375 px, 64 for 768 px and 96 for 1280 px (so the inner width is 36, 62 and 94).
- Square-bracket annotations name an interaction ID from `01-MOTION-SPEC.md` (for example [IX-09]) or an anchor (for example [#contact]).
- `[ Label ]` is a button. `Label >` is a link. `(( ))` marks the toast. `=====` borders the bottom pill nav and its expanded panel on mobile. `#` borders mark a visible focus ring. `:::` marks a blurred backdrop. `( )` around a word is a chip, `[logo]` and `[ O ]` are logo and monogram chips.
- Touch targets are at least 44 px high and wide at 375 px.
- The fixed bottom pill is drawn only where it matters (Hero, Contact, the nav states); the sticky top nav is drawn in the Hero frames and the nav state frames. Dates in frames use an ASCII hyphen; on the site they are written with an en dash per the date policy in the inventory.
- Copy in frames is abbreviated where it does not fit (for example short month names at 375). The full copy is in `01-CONTENT-INVENTORY.md`.

## Wireframes

### Frame: Hero @ 375

The first viewport (375 x 667): name, role line, three CTAs in the HERO-03 order, the collapsed pill nav and the top edge of Experience. Nothing here waits on motion.

```text
+------------------------------------+
| {#hero} inside {#main}             |
|                                    |
| Aaron Phan                         |
| (h1, visible on first paint)       |
|                                    |
| Software engineer building         |
| cloud-native backends in Go.       |
|   ^ role line [IX-01]              |
|                                    |
| +--------------------------------+ |
| | [ Download resume ]    [IX-02] | |
| +--------------------------------+ |
| +--------------------------------+ |
| | [ Copy email ]         [IX-09] | |
| +--------------------------------+ |
| Contact >      (to {#contact})     |
|                                    |
| Experience                         |
|   (top edge of {#experience})      |
|                                    |
| ================================== |
| =  Experience | Projects | Menu  = |
| ================================== |
+------------------------------------+
```

Notes:

- Name, role and CTAs are in the HTML at first paint; [IX-01] animates only the role line.
- Every button and card carries the press-squish [IX-02] on its inner surface.
- Hero text is left aligned and the bottom pill never covers a CTA at 375 x 667.

### Frame: Experience @ 375

Five cards, newest first, one per inventory entry (EXP-01 to EXP-05). Logo chips [logo] come from the assets; EXP-04 and EXP-05 use monogram chips (G-05, G-06). Cards are collapsed by default; Details expands the three bullets.

```text
+------------------------------------+
| {#experience}                      |
|                                    |
| Experience                         |
|                                    |
| +--------------------------------+ |
| | [logo] Capital One             | |
| | Software Engineer Intern       | |
| | Plano, TX                      | |
| | June 2026 - Aug 2026           | |
| | 100K+ events/day       [IX-12] | |
| | v Details              [IX-11] | |
| +--------------------------------+ |
| +--------------------------------+ |
| | [logo] Spectrum                | |
| | Network Engineer Intern        | |
| | Austin, TX                     | |
| | May 2025 - Aug 2025            | |
| | 30% efficiency         [IX-12] | |
| | v Details              [IX-11] | |
| +--------------------------------+ |
| +--------------------------------+ |
| | [logo] Symbotic                | |
| | System Engineer Intern         | |
| | Raymond, NH                    | |
| | Jan 2025 - May 2025            | |
| | 8+ prod lines          [IX-12] | |
| | v Details              [IX-11] | |
| +--------------------------------+ |
| +--------------------------------+ |
| | [ O  ] OdderTech IT            | |
| | Software Engineer Intern       | |
| | (location not stated)          | |
| | June 2023 - Aug 2023           | |
| | v Details              [IX-11] | |
| +--------------------------------+ |
| +--------------------------------+ |
| | [ UT ] Univ. of Texas at Austin| |
| | ITS Student Consultant I       | |
| | (location not stated)          | |
| | Aug 2022 - Oct 2023            | |
| | v Details              [IX-11] | |
| +--------------------------------+ |
|                                    |
| reveal on scroll [IX-15]           |
+------------------------------------+
```

Notes:

- The metric (a number in the bullets) counts up once when it scrolls into view [IX-12]; the final value is in the DOM from the start.
- Card header is a button with aria-expanded [IX-11]. Frame labels are abbreviated; full copy lives in 01-CONTENT-INVENTORY.md.

### Frame: Projects @ 375

The touch rail: native horizontal scroll with scroll-snap. The current card is about 80 percent of the width and the next card peeks, so the rail reads as swipeable.

```text
+------------------------------------+
| {#projects}                        |
|                                    |
| Projects                           |
| swipe, then tap a card [IX-04]     |
|                                    |
| +--------------------------+ +-----|
| | cover (G-02)             | | cove|
| |                          | |     |
| | * Featured               | | * Fe|
| | RecipeCart               | | A.T.|
| |                          | |     |
| | TypeScript, Railway,     | | Pyth|
| | Docker, CSS              | | CSS,|
| |                          | |     |
| | July 2026                | | May |
| +--------------------------+ +-----|
|                                    |
| 1 / 7      o . . . . . .           |
|                                    |
| Featured first, then newest first. |
| Vertical page scroll is untouched. |
+------------------------------------+
```

Notes:

- Tap a card to open the overlay [IX-05]. Tapping squishes the card [IX-02]. See the Rail touch form state for the swipe strip.
- Cards show a cover placeholder because no screenshots exist yet (G-02, deferred to Phase 3).

### Frame: About Me @ 375

Photo first, then the two bio paragraphs and the quote. On touch the photo is static; Tilt is a fine-pointer effect only.

```text
+------------------------------------+
| {#about}                           |
|                                    |
| About Me                           |
|                                    |
| +--------------------------------+ |
| |                                | |
| |    photo (539 x 800)           | |
| |    about-dj.jpg                | |
| |    Tilt: desktop only [IX-17]  | |
| |                                | |
| +--------------------------------+ |
|                                    |
| Hello there! My name is Aaron      |
| Phan, and I'm a software           |
| engineer by day, and aspiring      |
| artist by night.                   |
|                                    |
| In my spare time, I enjoy          |
| listening to EDM, cooking, and     |
| DJing under the pseudonym          |
| PHVNTM.                            |
|                                    |
| "The best time to start was        |
| yesterday, the next best time      |
| to start is today."                |
|                                    |
| reveal on scroll [IX-15]           |
+------------------------------------+
```

Notes:

- Photo alt text: Aaron Phan DJing at his UT Austin graduation. The DJ Instagram link lives in {#contact}.

### Frame: Skills @ 375

The slider strip [IX-13] carries four rows (Languages, Frameworks, Developer Tools, Libraries). Every skill is also reachable as static text.

```text
+------------------------------------+
| {#skills}                          |
|                                    |
| Skills                             |
|                                    |
| Languages                          |
| (C/C++) (Go) (HTML/CSS) (Java) ->  |
|                                    |
| Frameworks                         |
| (Flask) (JavaFX) (JUnit) ->        |
|                                    |
| Developer Tools                    |
| (Anaconda) (Claude Code) ->        |
|                                    |
| Libraries                          |
| (Keras) (Matplotlib) (NumPy) ->    |
|                                    |
| strip drifts left slowly [IX-13];  |
| pauses on press, focus, off-screen |
| and a hidden tab                   |
|                                    |
| Static fallback (reduced motion or |
| no JS): the same chips wrapped in  |
| plain rows, nothing hidden.        |
+------------------------------------+
```

Notes:

- With reduced motion or no JavaScript the strip is replaced by the wrapped static list; no skill is only available inside the moving strip.

### Frame: Education @ 375

Two cards: UT Austin (the degree, newest first) and the high school entry. Cards expand to show the GPA.

```text
+------------------------------------+
| {#education}                       |
|                                    |
| Education                          |
|                                    |
| +--------------------------------+ |
| | B.S. Electrical & Computer     | |
| | Engineering                    | |
| | The University of Texas at     | |
| | Austin                         | |
| | Austin, TX                     | |
| | Aug 2022 - Dec 2026            | |
| |                                | |
| | GPA 3.2   Track: Data Science  | |
| |                                | |
| | ^ Details              [IX-14] | |
| +--------------------------------+ |
| +--------------------------------+ |
| | High School Diploma            | |
| | Glenda Dawson High School      | |
| | Pearland, TX   May 2022        | |
| | v Details              [IX-14] | |
| +--------------------------------+ |
|                                    |
| The first card is drawn expanded:  |
| GPA and track show after Details.  |
+------------------------------------+
```

Notes:

- Card header is a button with aria-expanded [IX-14]. Anchors: {#education}.

### Frame: Contact Me @ 375

Order: heading, one line of lead copy, the Copy email button (primary), the mailto link, Download resume, then the three profile links stacked. Each row is at least 44 px tall, with 8 px of space between rows. The page bottom keeps clear space for the bottom pill nav.

```text
+------------------------------------+
| {#contact}                         |
|                                    |
| Contact Me                         |
| The fastest way to reach me is     |
| email.                             |
|                                    |
| +--------------------------------+ |
| | [ Copy email ]         [IX-09] | |
| +--------------------------------+ |
| aaron.phan240@gmail.com  (mailto)  |
|                                    |
| +--------------------------------+ |
| | [ Download resume ]            | |
| +--------------------------------+ |
|                                    |
| +--------------------------------+ |
| | GitHub        github.com/...   | |
| +--------------------------------+ |
| +--------------------------------+ |
| | LinkedIn      linkedin.com/..  | |
| +--------------------------------+ |
| +--------------------------------+ |
| | DJ Instagram  instagram.com/.  | |
| +--------------------------------+ |
|                                    |
| ================================== |
| =  Experience | Projects | Menu  = |
| ================================== |
+------------------------------------+
```

Notes:

- Every row is a full-width 44 px or taller touch target; the email address is also a plain `mailto:` link so it works without JavaScript.
- Each link has a visible text label, so no link is identified by an icon alone.
- Focus order follows reading order: Copy email, mailto link, Download resume, GitHub, LinkedIn, DJ Instagram.
