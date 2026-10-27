# Information Architecture and Wireframes (DOC-03)

Status: Accepted

Phase 1 plan 01-01 created this file with the anchor registry, the frame conventions and the Contact Me frames. Plan 01-07 set the final section order and added the hero, nav, rail, overlay and every other section at 375, 768 and 1280 px.

Wireframes are ASCII inside this markdown file (D-02). No HTML sketches.

## Section registry

Seven fixed anchors. Every phase doc refers to a section by its anchor, never by a position number. The page order is in the next section.

| Anchor        | Section    |
| ------------- | ---------- |
| {#hero}       | Hero       |
| {#experience} | Experience |
| {#projects}   | Projects   |
| {#about}      | About Me   |
| {#skills}     | Skills     |
| {#education}  | Education  |
| {#contact}    | Contact Me |

## Section order

| Order | Section    | Anchor        | Why here                                                                                                       |
| ----- | ---------- | ------------- | -------------------------------------------------------------------------------------------------------------- |
| 1     | Hero       | {#hero}       | Name, role and the Resume and Copy email CTAs are visible at first paint, which is most of the 10-second test. |
| 2     | Experience | {#experience} | Recruiters look for experience first; it is the first thing below the fold and one pill tap from anywhere.     |
| 3     | Projects   | {#projects}   | The signature rail and overlay; it follows Experience so the work sits next to the roles it came from.         |
| 4     | About Me   | {#about}      | Personality (the DJ side) comes after the evidence, and links to the Instagram in Contact.                     |
| 5     | Skills     | {#skills}     | A scan-friendly summary once the reader knows the work.                                                        |
| 6     | Education  | {#education}  | Short, factual, needed for the GPA and degree check, but rarely the first stop.                                |
| 7     | Contact Me | {#contact}    | The page ends on the action; it is also one tap from the hero CTA and the pill nav.                            |

## Navigation model

- 768 px and wider use a sticky top nav, always visible, on a solid ground (D-18): the wordmark top left (PHAN in the light theme, PHVNTM in the dark theme; it is the home link), the six section links (Experience, Projects, About, Skills, Education, Contact), the theme toggle [IX-10] and a Resume button, with a scroll-spy indicator under the active link [IX-08]. The bottom pill is not shown at this width.
- Below 768 px a non-fixed top bar sits above the hero (D-19): the wordmark on the left and the theme toggle on the right, visible on first paint. A thumb-reachable bottom pill nav is fixed to the viewport. Collapsed, it has three segments: Experience, Projects and Menu. Experience and Projects jump straight to their section; the Menu segment morphs the pill in place into a panel of the six section links, the theme toggle and Resume [IX-07] (reference 445). The panel carries Contact Me.
- A skip link is the first focusable element and targets {#main}.
- Nav form is chosen by width. Hover effects are chosen by pointer capability, never by width.
- Nav links are plain anchors in a single page: there is no router, and the URL changes only by the browser's own hash handling.

## Recruiter fast path (10-second test)

A first-time visitor on a 375 px phone reaches each item with at most one tap from the first viewport.

| Item       | Where at 375                                                    | Taps from first viewport |
| ---------- | --------------------------------------------------------------- | ------------------------ |
| Name       | The h1 in the hero, visible on first paint                      | 0                        |
| Role       | The role line directly under the name                           | 0                        |
| Experience | The Experience segment of the collapsed pill nav                | 1                        |
| Projects   | The Projects segment of the collapsed pill nav                  | 1                        |
| Resume     | The Download resume CTA in the hero                             | 1                        |
| Contact    | The Copy email CTA in the hero (Contact Me is in the pill menu) | 1                        |

Pass rule: all six found in 10 seconds or less, timed on a real phone with motion enabled (the same rule as the design brief).

## Above the fold @ 375

A 375 x 667 viewport shows, top to bottom:

- The top bar with the wordmark and the theme toggle.
- The name as the h1, "Aaron" over "Phan".
- The role line under it, plain text from first paint (the text effect [IX-01] arrives in Phase 5).
- The Download resume and Copy email CTAs, each at least 44 px tall. There is no Contact link in the hero.
- The two corner facts under the CTAs: "Graduating December 2026, UT Austin ECE" and "Last role: Capital One, summer 2026".
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

The first viewport (375 x 667): the top bar, the name over two lines, the role line, the two CTAs in the HERO-03 order, the corner facts (HERO-04), the collapsed pill nav and the top edge of Experience. Nothing here waits on motion.

```text
+------------------------------------+
| PHAN                           (o) |
| top bar, not fixed                 |
|                                    |
| Aaron                              |
| Phan   (h1, two lines)             |
|                                    |
| Software engineer building         |
| cloud-native backends in Go.       |
|                                    |
| +--------------------------------+ |
| | [ Download resume ]    [IX-02] | |
| +--------------------------------+ |
| +--------------------------------+ |
| | [ Copy email ]         [IX-09] | |
| +--------------------------------+ |
| Graduating Dec 2026, UT Austin ECE |
| Last role: Capital One, summer 2026|
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

- Name, role, CTAs and facts are in the HTML at first paint. The role line is plain text; the text effect [IX-01] arrives in Phase 5.
- Every button and card gets the press-squish [IX-02] on its inner surface in Phase 4; until then the CTAs answer with the ink flood on press.
- The facts are abbreviated in the frame only ("Dec"); the site shows the full HERO-04 copy.
- Hero text is left aligned and the bottom pill never covers a CTA at 375 x 667.

### Frame: Hero @ 768

The sticky top nav replaces the pill nav at 768 px. The nav row is drawn to scale, so it has no side padding in this frame, and its link labels are abbreviated in the frame only.

```text
+--------------------------------------------------------------+
| PHAN Exp. Proj. About Skills Edu. Contact (o) [ Resume ]     |
| sticky top nav, solid ground [IX-08] indicator [IX-10] theme |
|                                                              |
| {#hero}                                                      |
|                                                              |
| Aaron                                                        |
| Phan                          (h1, two lines, columns 1 to 9)|
|                                                              |
| Software engineer building           +---------------------+ |
| cloud-native backends in Go.         | [ Download resume ] | |
|                                      +---------------------+ |
|                                      +---------------------+ |
|                                      | [ Copy email ]      | |
|                                      +---------------------+ |
|                                                              |
| Grad. Dec 2026, UT Austin ECE  Last: Capital One, summer 2026|
|                                                              |
| Experience                                                   |
| (top edge of {#experience})                                  |
+--------------------------------------------------------------+
```

Notes:

- Nav is chosen by width (768 px and up); pointer effects are chosen by pointer capability.
- The skip link targets {#main} and appears before the nav on first Tab.
- The corner facts are abbreviated in the frame only; the site shows the full HERO-04 copy. The role line text effect [IX-01] arrives in Phase 5; press-squish [IX-02] arrives in Phase 4.

### Frame: Hero @ 1280

The hero at desktop width: a poster with the name at the top, the role line and CTAs in the middle band, and the two corner facts along the bottom.

```text
+----------------------------------------------------------------------------------------------+
| PHAN        Experience  Projects  About  Skills  Education  Contact            (o) [ Resume ]|
| sticky top nav, solid ground    scroll-spy [IX-08]    theme toggle [IX-10]                   |
|                                                                                              |
| {#hero}                                                                                      |
|                                                                                              |
| Aaron                                                                                        |
| Phan                                                  (h1, two lines, columns 1 to 9)        |
|                                                                                              |
| Software engineer building cloud-native                          +---------------------+     |
| backends in Go.                      (columns 1 to 6)            | [ Download resume ] |     |
|                                                                  +---------------------+     |
|                                                                  +---------------------+     |
|                                                                  | [ Copy email ]      |     |
|                                                                  +---------------------+     |
|                                                                    (columns 9 to 12)         |
|                                                                                              |
| Graduating December 2026, UT Austin ECE              Last role: Capital One, summer 2026     |
+----------------------------------------------------------------------------------------------+
```

Notes:

- The CTAs carry the ink flood on hover and focus; press-squish [IX-02] arrives in Phase 4, the role line text effect [IX-01] in Phase 5.
- IX IDs used here: [IX-01] (Phase 5) [IX-02] (Phase 4) [IX-08] [IX-09] [IX-10]. Anchors: {#hero}, {#main}.

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

### Frame: Experience @ 768

A single column of full-width cards. The sticky nav is above; expanding a card pushes the next one down (layout animation, [IX-11]).

```text
+--------------------------------------------------------------+
| {#experience}                                                |
|                                                              |
| Experience                                                   |
|                                                              |
| +----------------------------------------------------------+ |
| | [logo] Software Engineer Intern                          | |
| |        Capital One, Plano, TX     June 2026 - August 2026| |
| |        100K+ events/day [IX-12]         v Details [IX-11]| |
| +----------------------------------------------------------+ |
| +----------------------------------------------------------+ |
| | [logo] Network Engineer Intern                           | |
| |        Spectrum, Austin, TX        May 2025 - August 2025| |
| |        30% efficiency [IX-12]           v Details [IX-11]| |
| +----------------------------------------------------------+ |
| +----------------------------------------------------------+ |
| | [logo] System Engineer Intern                            | |
| |        Symbotic, Raymond, NH      January 2025 - May 2025| |
| |        8+ prod lines [IX-12]            v Details [IX-11]| |
| +----------------------------------------------------------+ |
| +----------------------------------------------------------+ |
| | [ O  ] Software Engineer Intern                          | |
| |        OdderTech IT               June 2023 - August 2023| |
| |                                         v Details [IX-11]| |
| +----------------------------------------------------------+ |
| +----------------------------------------------------------+ |
| | [ UT ] ITS Student Consultant I                          | |
| |        Univ. of Texas at Austin    August 2022 - Oct 2023| |
| |                                         v Details [IX-11]| |
| +----------------------------------------------------------+ |
|                                                              |
| each card reveals on scroll [IX-15]                          |
+--------------------------------------------------------------+
```

Notes:

- Card expand and metric count-up behave as at 375. Anchors: {#experience}. IX IDs: [IX-11] [IX-12] [IX-15].

### Frame: Experience @ 1280

Two columns. Spotlight [IX-17] is on the experience cards and is fine-pointer only.

```text
+----------------------------------------------------------------------------------------------+
| {#experience}                                                                                |
|                                                                                              |
| Experience                                                                                   |
|                                                                                              |
| +-------------------------------------------+  +-------------------------------------------+ |
| | [logo] Software Engineer Intern           |  | [logo] Network Engineer Intern            | |
| |        Capital One, Plano, TX             |  |        Spectrum, Austin, TX               | |
| |        June 2026 - August 2026            |  |        May 2025 - August 2025             | |
| |        100K+ events/day [IX-12]           |  |        30% efficiency [IX-12]             | |
| |                         v Details [IX-11] |  |                         v Details [IX-11] | |
| |        Spotlight follows pointer [IX-17]  |  |                                           | |
| +-------------------------------------------+  +-------------------------------------------+ |
|                                                                                              |
| +-------------------------------------------+  +-------------------------------------------+ |
| | [logo] System Engineer Intern             |  | [ O  ] Software Engineer Intern           | |
| |        Symbotic, Raymond, NH              |  |        OdderTech IT                       | |
| |        January 2025 - May 2025            |  |        June 2023 - August 2023            | |
| |        8+ prod lines [IX-12]              |  |        (no metric)                        | |
| |                         v Details [IX-11] |  |                         v Details [IX-11] | |
| |                                           |  |                                           | |
| +-------------------------------------------+  +-------------------------------------------+ |
|                                                                                              |
| +-------------------------------------------+                                                |
| | [ UT ] ITS Student Consultant I           |                                                |
| |        Univ. of Texas at Austin           |                                                |
| |        August 2022 - October 2023         |                                                |
| |        (no metric)                        |                                                |
| |                         v Details [IX-11] |                                                |
| |                                           |                                                |
| +-------------------------------------------+                                                |
|                                                                                              |
| each card reveals on scroll [IX-15]                                                          |
+----------------------------------------------------------------------------------------------+
```

Notes:

- Card expand [IX-11] and metric count-up [IX-12] are the same on every width. Anchors: {#experience}.

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

### Frame: Projects @ 768

The same scroll-snap rail, with two and a half cards visible.

```text
+--------------------------------------------------------------+
| {#projects}                                                  |
|                                                              |
| Projects                                                     |
| swipe, then tap a card [IX-04]                               |
|                                                              |
| +----------------------+ +----------------------+ +--------  |
| | cover (G-02)         | | cover (G-02)         | | cover (  |
| |                      | |                      | |          |
| | * Featured           | | * Featured           | | * Featu  |
| | RecipeCart           | | A.T.L.A.S            | | Suspect  |
| |                      | |                      | |          |
| | TypeScript, Railway, | | Python, Flask, HTML, | | Python,  |
| | Docker, CSS          | | CSS, JavaScript      | | TensorF  |
| |                      | |                      | | Scikit-  |
| | July 2026            | | May 2025-Aug 2025    | | Jan 202  |
| +----------------------+ +----------------------+ +--------  |
|                                                              |
| 1 / 7      o . . . . . .                                     |
|                                                              |
| At 768 the rail stays a touch rail; trackpad and             |
| shift-wheel also scroll it.                                  |
+--------------------------------------------------------------+
```

Notes:

- Anchors: {#projects}. IX IDs: [IX-04] [IX-05] (open) [IX-02].

### Frame: Projects @ 1280

Rail at rest on a fine pointer. The hover and keyboard-focus forms are drawn in the state frames.

```text
+----------------------------------------------------------------------------------------------+
| {#projects}                                                                                  |
|                                                                                              |
| Projects                                                                                     |
| hover lifts a card [IX-03]; Tab and arrow keys do the same [IX-06]                           |
|                                                                                              |
| +--------------------+ +--------------------+ +--------------------+ +--------------------+ +|
| | cover (G-02)       | | cover (G-02)       | | cover (G-02)       | | cover (G-02)       | ||
| |                    | |                    | |                    | |                    | ||
| | * Featured         | | * Featured         | | * Featured         | |                    | ||
| | RecipeCart         | | A.T.L.A.S          | | Suspect Genie      | | MediaDash: Content | ||
| |                    | |                    | |                    | | Recommendation Hub | ||
| | TypeScript,        | | Python, Flask,     | | Python, PyQt,      | | Python, Langchain, | ||
| | Railway, Docker,   | | HTML, CSS,         | | TensorFlow, Keras, | | Supabase           | ||
| | CSS                | | JavaScript         | | Scikit-learn       | |                    | ||
| | July 2026          | | May 2025-Aug 2025  | | Jan 2025-May 2025  | | November 2024      | ||
| +--------------------+ +--------------------+ +--------------------+ +--------------------+ +|
|                                                                                              |
| 1 / 7      scroll with trackpad or shift-wheel [IX-04]                                       |
| click or Enter opens the overlay [IX-05]                                                     |
+----------------------------------------------------------------------------------------------+
```

Notes:

- No Tilt on rail cards (IX-17 is scoped to the About photo). Anchors: {#projects}. IX IDs: [IX-03] [IX-04] [IX-05] [IX-06].

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

### Frame: About Me @ 768

Photo left, copy right.

```text
+--------------------------------------------------------------+
| {#about}                                                     |
|                                                              |
| About Me                                                     |
|                                                              |
| +----------------------+  Hello there! My name is Aaron      |
| |                      |  Phan, and I'm a software engineer  |
| |  photo (539 x 800)   |  by day, and aspiring artist by     |
| |  about-dj.jpg        |  night.                             |
| |                      |                                     |
| |  Tilt: desktop only  |  In my spare time, I enjoy          |
| |  [IX-17]             |  listening to EDM, cooking, and     |
| |                      |  DJing under the pseudonym PHVNTM.  |
| +----------------------+                                     |
|                           "The best time to start was        |
|                           yesterday, the next best time to   |
|                           start is today."                   |
|                                                              |
| reveal on scroll [IX-15]                                     |
+--------------------------------------------------------------+
```

Notes:

- Anchors: {#about}. IX IDs: [IX-15] [IX-17] (Tilt, fine pointer only).

### Frame: About Me @ 1280

The About photo is the only Tilt target on the page.

```text
+----------------------------------------------------------------------------------------------+
| {#about}                                                                                     |
|                                                                                              |
| About Me                                                                                     |
|                                                                                              |
|  +--------------------------+    Hello there! My name is Aaron Phan, and I'm a software      |
|  |                          |    engineer by day, and aspiring artist by night.              |
|  |  photo (539 x 800)       |                                                                |
|  |  about-dj.jpg            |    In my spare time, I enjoy listening to EDM, cooking, and    |
|  |                          |    DJing under the pseudonym PHVNTM.                           |
|  |  Tilt on pointer [IX-17] |                                                                |
|  |                          |    "The best time to start was yesterday, the next best time   |
|  +--------------------------+    to start is today."                                         |
|                                                                                              |
| reveal on scroll [IX-15]                                                                     |
+----------------------------------------------------------------------------------------------+
```

Notes:

- Tilt is disabled on touch and under reduced motion. Anchors: {#about}.

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

### Frame: Skills @ 768

Four labelled strips.

```text
+--------------------------------------------------------------+
| {#skills}                                                    |
|                                                              |
| Skills                                                       |
|                                                              |
| Languages        (C/C++) (Go) (HTML/CSS) (Java) ->           |
| Frameworks       (Flask) (JavaFX) (JUnit) (Langchain) ->     |
| Developer Tools  (Anaconda) (Claude Code) (Docker) ->        |
| Libraries        (Keras) (Matplotlib) (NumPy) ->             |
|                                                              |
| strips drift [IX-13]; static list if motion is reduced       |
+--------------------------------------------------------------+
```

Notes:

- Anchors: {#skills}. IX IDs: [IX-13] [IX-15].

### Frame: Skills @ 1280

Four strips; the chips repeat to make the loop seamless.

```text
+----------------------------------------------------------------------------------------------+
| {#skills}                                                                                    |
|                                                                                              |
| Skills                                                                                       |
|                                                                                              |
|  Languages        (C/C++) (Go) (HTML/CSS) (Java) (JavaScript) (MATLAB) (Python) ->           |
|  Frameworks       (Flask) (JavaFX) (JUnit) (Langchain) (PyQt) (Flask) (JavaFX) ->            |
|  Developer Tools  (Anaconda) (Claude Code) (Docker) (Git) (IntelliJ) (Jenkins) ->            |
|  Libraries        (Keras) (Matplotlib) (NumPy) (Pandas) (PyTorch) (Scikit-learn) ->          |
|                                                                                              |
| strips drift and pause on hover or focus [IX-13]                                             |
+----------------------------------------------------------------------------------------------+
```

Notes:

- The repeated chips are aria-hidden copies; screen readers get each skill once. Anchors: {#skills}.

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

### Frame: Education @ 768

Full-width cards; UT Austin is drawn expanded.

```text
+--------------------------------------------------------------+
| {#education}                                                 |
|                                                              |
| Education                                                    |
|                                                              |
| +----------------------------------------------------------+ |
| | B.S. Electrical & Computer Engineering                   | |
| | The University of Texas at Austin, Austin, TX            | |
| | August 2022 - December 2026                              | |
| | GPA 3.2   Track: Data Science                            | |
| |                                        ^ Details [IX-14] | |
| +----------------------------------------------------------+ |
| +----------------------------------------------------------+ |
| | High School Diploma                             May 2022 | |
| | Glenda Dawson High School, Pearland, TX                  | |
| |                                        v Details [IX-14] | |
| +----------------------------------------------------------+ |
+--------------------------------------------------------------+
```

Notes:

- Anchors: {#education}. IX IDs: [IX-14] [IX-15].

### Frame: Education @ 1280

Two cards side by side; the UT Austin card is drawn expanded.

```text
+----------------------------------------------------------------------------------------------+
| {#education}                                                                                 |
|                                                                                              |
| Education                                                                                    |
|                                                                                              |
|  +--------------------------------------------+   +--------------------------------------+   |
|  | B.S. Electrical & Computer Engineering     |   | High School Diploma                  |   |
|  | The University of Texas at Austin          |   | Glenda Dawson High School            |   |
|  | Austin, TX   August 2022 - December 2026   |   | Pearland, TX   May 2022              |   |
|  | GPA 3.2   Track: Data Science              |   |                                      |   |
|  |                          ^ Details [IX-14] |   |                    v Details [IX-14] |   |
|  +--------------------------------------------+   +--------------------------------------+   |
+----------------------------------------------------------------------------------------------+
```

Notes:

- Anchors: {#education}. IX IDs: [IX-14] [IX-15].

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

### Frame: Contact Me @ 768

Two columns: the copy and email actions on the left, the resume and the three profile links on the right. Touch targets stay at least 44 px. The sticky top nav is in use at this width, so there is no bottom pill.

```text
+--------------------------------------------------------------+
| {#contact}                                                   |
|                                                              |
| Contact Me                                                   |
| The fastest way to reach me is email.                        |
|                                                              |
| +--------------------------+  +--------------------------+   |
| | [ Copy email ]   [IX-09] |  | [ Download resume ]      |   |
| +--------------------------+  +--------------------------+   |
|  aaron.phan240@gmail.com       GitHub       github.com/..    |
|  (mailto)                      LinkedIn     linkedin.com/..  |
|                                DJ Instagram instagram.com/.  |
+--------------------------------------------------------------+
```

### Frame: Contact Me @ 1280

A wide block in the content column. At this width the sticky nav is at the top of the page, so there is no bottom pill.

```text
+----------------------------------------------------------------------------------------------+
| {#contact}                                                                                   |
|                                                                                              |
| Contact Me                                                                                   |
| The fastest way to reach me is email.                                                        |
|                                                                                              |
| +------------------------------+       +--------------------------------------------------+  |
| | [ Copy email ]       [IX-09] |       | GitHub          github.com/aa-phan               |  |
| +------------------------------+       | LinkedIn        linkedin.com/in/aa-phan          |  |
|  aaron.phan240@gmail.com (mailto)      | DJ Instagram    instagram.com/phvntm_            |  |
|                                        +--------------------------------------------------+  |
| +------------------------------+                                                             |
| | [ Download resume ]          |                                                             |
| +------------------------------+                                                             |
|                                                                                              |
| Copy email is the Magnetic wrapper target [IX-17]; the copy action itself is [IX-09]         |
+----------------------------------------------------------------------------------------------+
```

### State: Rail hover form @ 1280

Reference 539: the hovered project lifted and enlarged out of the rail, its neighbors shifted aside, label visible. Fine pointer only; touch uses the swipe form.

```text
+----------------------------------------------------------------------------------------------+
| {#projects}   pointer is over card 3 (fine pointer only) [IX-03]                             |
|                                                                                              |
|                               +----------------------------+                                 |
|                               | cover (G-02)               |                                 |
|                               |                            |                                 |
|  --+ +--------------------+   | * Featured                 |   +--------------------+ +--    |
|    | | cover (G-02)       |   | Suspect Genie              |   | cover (G-02)       | | c    |
|    | |                    |   |                            |   |                    | |      |
|    | | * Featured         |   | Python, PyQt, TensorFlow,  |   |                    | |      |
|    | | A.T.L.A.S          |   | Keras, Scikit-learn        |   | MediaDash: Content | | F    |
|    | |                    |   |                            |   | Recommendation Hub | | S    |
|    | | Python, Flask,     |   | Jan 2025-May 2025          |   | Python, Langchain, | | J    |
|    | | HTML, CSS,         |   |                            |   | Supabase           | |      |
|    | | JavaScript         |   | Open (click or Enter)      |   |                    | |      |
|    | | May 2025-Aug 2025  |   +----------------------------+   | November 2024      | | J    |
|  --+ +--------------------+                                    +--------------------+ +--    |
|                                                                                              |
|  The hovered card lifts and grows out of the rail; its neighbors make room                   |
|  (translate only). 3 / 7                                                                     |
+----------------------------------------------------------------------------------------------+
```

Lift and neighbor shift are react-spring springs on the outer rail item [IX-03]; under reduced motion the card gets an elevation and outline change instead of the lift.

### State: Rail keyboard focus @ 1280

The focused card lifts like the hover form and carries a visible focus ring.

```text
+----------------------------------------------------------------------------------------------+
| {#projects}   card 2 has keyboard focus [IX-06]                                              |
|                                                                                              |
|                            ######################                                            |
|                            # cover (G-02)       #                                            |
|   +--------------------+   #                    #   +--------------------+                   |
|   | cover (G-02)       |   # * Featured         #   | cover (G-02)       |                   |
|   |                    |   # A.T.L.A.S          #   |                    |                   |
|   | * Featured         |   #                    #   | * Featured         |                   |
|   | RecipeCart         |   # Python, Flask,     #   | Suspect Genie      |                   |
|   |                    |   # HTML, CSS,         #   |                    |                   |
|   | TypeScript,        |   # JavaScript         #   | Python, PyQt,      |                   |
|   | Railway, Docker,   |   # May 2025-Aug 2025  #   | TensorFlow, Keras, |                   |
|   | CSS                |   #                    #   | Scikit-learn       |                   |
|   | July 2026          |   # Enter opens        #   | Jan 2025-May 2025  |                   |
|   +--------------------+   ######################   +--------------------+                   |
|                                                                                              |
|  # marks the visible focus ring (3:1 contrast against both backgrounds)                      |
|  Left and Right arrows move between cards; Enter opens the overlay [IX-05];                  |
|  Tab leaves the rail. The lift uses the same springs as the hover form [IX-03].              |
+----------------------------------------------------------------------------------------------+
```

Under reduced motion the lift is dropped and the focus ring alone marks the card.

### State: Rail touch form @ 375

A horizontal swipe strip with scroll-snap. The current card is about 80 percent of the width and the next card peeks.

```text
+------------------------------------+
| {#projects}                        |
|                                    |
| Projects  swipe [IX-04]            |
|                                    |
| +--------------------------+ +-----|
| | cover (G-02)             | | cove|
| |                          | |     |
| | * Featured               | | * Fe|
| | A.T.L.A.S                | | Susp|
| |                          | |     |
| | Python, Flask, HTML,     | | Pyth|
| | CSS, JavaScript          | | Tens|
| |                          | | Scik|
| | May 2025-Aug 2025        | | Jan |
| +--------------------------+ +-----|
|                                    |
| 2 / 7      . o . . . . .           |
|                                    |
| snaps to the next card on release  |
| tap a card to open [IX-05]         |
| press squishes the card [IX-02]    |
| page scroll stays vertical         |
+------------------------------------+
```

Native horizontal overflow with scroll-snap; no touch-action is set, so vertical page scroll is never captured. Keyboard users get the focus form above.

### State: Rail touch form @ 768

At 768 the rail stays a touch rail but the cards cap at a fixed width, so two and a half cards show instead of one at about 80 percent.

```text
+--------------------------------------------------------------+
| {#projects}                                                  |
|                                                              |
| Projects  swipe left or right [IX-04]                        |
|                                                              |
| +----------------------+ +----------------------+ +--------  |
| | cover (G-02)         | | cover (G-02)         | | cover (  |
| |                      | |                      | |          |
| | * Featured           | | * Featured           | |          |
| | A.T.L.A.S            | | Suspect Genie        | | MediaDa  |
| |                      | |                      | | Recomme  |
| | Python, Flask, HTML, | | Python, PyQt,        | | Python,  |
| | CSS, JavaScript      | | TensorFlow, Keras,   | | Supabas  |
| |                      | | Scikit-learn         | |          |
| | May 2025-Aug 2025    | | Jan 2025-May 2025    | | Novembe  |
| +----------------------+ +----------------------+ +--------  |
|                                                              |
| 2 / 7      . o . . . . .                                     |
|                                                              |
| tap a card to open [IX-05]; page scroll stays vertical       |
+--------------------------------------------------------------+
```

Native horizontal overflow with scroll-snap; no touch-action is set, so vertical page scroll is never captured. Keyboard users get the focus form above.

### State: Overlay open @ 1280

Reference 539: a focused project panel with the rail blurred behind it, an NN / 07 index, prev and next at the sides and a clear Close at the top right.

```text
+----------------------------------------------------------------------------------------------+
| :::::::::: blurred rail behind (backdrop) :::::::::::::::::::::::::::::::::::::::::::::::::: |
| :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: |
|         +----------------------------------------------------------+                         |
|         | RecipeCart                                   [ X Close ] |                         |
|         | 01 / 07                                        July 2026 |                         |
|         |                                                          |                         |
|  [ < ]  | (TypeScript) (Railway) (Docker) (CSS)                    |  [ > ]                  |
|  Prev   |                                                          |  Next                   |
|         | - Built a TypeScript pipeline converting TikTok          |                         |
|         |   recipes into Kroger cart items using OCR and Claude.   |                         |
|         | - Developed a deterministic matching engine ...          |                         |
|         | - Implemented an OAuth2-secured cart workflow ...        |                         |
|         |                                                          |                         |
|         | Links: shown only if supplied (none yet, G-01)           |                         |
|         +----------------------------------------------------------+                         |
| :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: |
|                                                                                              |
| [IX-05] the panel morphs out of the card; prev and next crossfade and wrap around.           |
| Arrow keys also move prev and next; the URL does not change.                                 |
+----------------------------------------------------------------------------------------------+
```

Dialog behavior (ADR-0006): role="dialog" with aria-modal="true", labelled by the project title; focus moves into the panel and is trapped there; Escape and the Close button dismiss; the background is inert and scroll-locked; focus returns to the rail item that opened it. Motion animates only the morph and the backdrop (D-13d); if the vendored MorphingDialog fails the spike, a native dialog element drawn the same way is used.

### State: Overlay open @ 375

A full-screen sheet opened by tapping a card; the Close button has a 44 px target at the top right and prev and next sit in the bottom thumb zone.

```text
+------------------------------------+
| 01 / 07               [ X ]  Close |
|                     (44 px target) |
|                                    |
| RecipeCart                         |
| July 2026                          |
|                                    |
| (TypeScript) (Railway)             |
| (Docker) (CSS)                     |
|                                    |
| - Built a TypeScript pipeline      |
|   converting TikTok recipes into   |
|   Kroger cart items using OCR      |
|   and Claude.                      |
| - Developed a deterministic        |
|   matching engine ...              |
| - Implemented an OAuth2-secured    |
|   cart workflow ...                |
|                                    |
| Links: shown only if supplied      |
|                                    |
| +--------------+  +--------------+ |
| | [ < Prev ]   |  | [ Next > ]   | |
| +--------------+  +--------------+ |
| thumb zone: prev and next [IX-05]  |
+------------------------------------+
```

Dialog behavior (ADR-0006): role="dialog" with aria-modal="true", labelled by the project title; focus moves into the panel and is trapped there; Escape and the Close button dismiss; the background is inert and scroll-locked; focus returns to the rail item that opened it. Motion animates only the morph and the backdrop (D-13d); if the vendored MorphingDialog fails the spike, a native dialog element drawn the same way is used.

### State: Pill nav collapsed @ 375

The bottom pill collapsed: two direct section segments and a Menu segment (the recruiter fast path needs no extra tap).

```text
+------------------------------------+
| {#contact} (page scrolls behind)   |
|                                    |
| Contact Me                         |
| The fastest way to reach me is     |
| email.                             |
|                                    |
|                                    |
| ================================== |
| =  Experience | Projects | Menu  = |
| ================================== |
|                                    |
|  tap Experience or Projects: jump  |
|  tap Menu: expand in place [IX-07] |
+------------------------------------+
```

The pill is a fixed element 50 on the z-index scale and sits clear of the page content. The Menu segment is a native button with aria-expanded.

### State: Pill nav expanded @ 375

Reference 445: the pill expands in place into a frosted panel with the six section links, the theme toggle and Resume.

```text
+------------------------------------+
| (page dims behind the panel)       |
|                                    |
|                                    |
|                                    |
|                                    |
| ================================== |
| = Menu               [ X ] close = |
| =                                = |
| =   Experience                   = |
| =   Projects                     = |
| =   About Me                     = |
| =   Skills                       = |
| =   Education                    = |
| =   Contact Me                   = |
| =                                = |
| = Theme  (o)             [IX-10] = |
| = [ Resume ]                     = |
| ================================== |
|                                    |
| one element morphs pill to panel   |
| [IX-07]; Escape or X collapses and |
| returns focus to the pill          |
+------------------------------------+
```

Layout animation is motion's job [IX-07]; the theme toggle thumb is a react-spring spring [IX-10]. Reduced motion switches state instantly.

### State: Sticky nav scroll-spy @ 1280

The sticky top nav with the scroll-spy indicator under the active link.

```text
+----------------------------------------------------------------------------------------------+
| Aaron Phan      Experience  Projects  About  Skills  Education  Contact     (o) [ Resume ]   |
|                             ========   <- indicator slides to the active link [IX-08]        |
|                                                                                              |
| {#projects} is in the active band, so Projects is marked                                     |
|                                                                                              |
|   ... Experience section above (scrolled past) ...                                           |
|                                                                                              |
|   Projects                                                                                   |
|   (rail cards)                                                                               |
|                                                                                              |
| scroll-margin-top on every section equals the sticky nav height, so a link jump              |
| never hides a heading under the nav.                                                         |
+----------------------------------------------------------------------------------------------+
```

The indicator is a shared-layout element that slides between links [IX-08]; nav links are plain anchors.

### State: Skip link focus @ 1280

The skip link on first Tab: it is the first focusable element, becomes visible on focus and sits on the top z-index layer.

```text
+----------------------------------------------------------------------------------------------+
| [ Skip to main content ]                                                                     |
|                                                                                              |
| Aaron Phan      Experience  Projects  About  Skills  Education  Contact     (o) [ Resume ]   |
|                                                                                              |
| {#main} receives focus when the skip link is activated                                       |
+----------------------------------------------------------------------------------------------+
```

Targets {#main}. Keyboard users then reach nav links, theme toggle and Resume in reading order.

### State: Copy-email toast @ 375

After Copy email is activated, a toast appears above the bottom pill nav, centered, with the confirmation text. It fades and slides in, stays about 4 seconds, then leaves. The text is also announced through a polite live region that is in the DOM before the toast appears. The toast never covers the Copy email button.

```text
+------------------------------------+
| Contact Me                         |
| The fastest way to reach me is     |
| email.                             |
|                                    |
| +--------------------------------+ |
| | [ Copy email ]                 | |
| +--------------------------------+ |
| aaron.phan240@gmail.com  (mailto)  |
|                                    |
|   ((  Email copied to clipboard )) |
|   ((  [IX-09]                   )) |
|                                    |
| ================================== |
| =  Experience | Projects | Menu  = |
| ================================== |
+------------------------------------+
```
