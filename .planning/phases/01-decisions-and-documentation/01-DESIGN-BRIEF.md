# Design Brief (DOC-01)

Status: Accepted

This brief sets the intent every later doc and phase is checked against. When a design or content choice is unclear, this file decides.

## Purpose

A remake of Aaron Phan's personal portfolio, currently the click-wheel iPod site, as a playful, tactile React site with a strong visual identity. The iPod concept is dropped entirely; the new site has its own identity. The content stays the same (same six sections, existing copy and images, updated from the current resume) and the presentation is new.

## Audience

Recruiters and hiring managers, and the design-engineering community, served equally. Recruiters need name, role, experience, projects, resume and contact fast. The design-engineering audience looks for craft in how the page feels. The site has to satisfy both without making either wait.

## Core value

The site must feel crafted and memorable (tactile, physics-based motion and strong visual identity) while key info stays instantly accessible, on mobile as much as desktop.

## Personality

Playful, tactile, crafted, plus four more.

- **Playful:** small surprises reward curiosity (a role line that cycles, a copy-email toast that eases in) without blocking anything.
- **Tactile:** buttons and cards press and squish, the project rail is something you handle, and motion carries weight and settles like a physical object.
- **Crafted:** consistent spacing, type and motion tokens; nothing looks defaulted; details such as focus rings and reduced-motion states are designed, not patched.
- **Warm:** soft shapes, large friendly type and gentle color bands, taken from the tone reference.
- **Confident:** short, plain copy that states what Aaron does and has built, with no filler.
- **Fast:** pages load quickly on a phone and every interaction responds immediately.
- **Inclusive:** keyboard, screen reader and reduced-motion users get the same content and the same personality in a calmer form.

## Anti-goals

- Scroll-jacking: the page scrolls natively on touch and never traps the wheel.
- A preloader or intro animation that blocks content.
- Hover-only content: everything reachable by hover is also reachable by tap and keyboard.
- A site-wide custom cursor.
- 3D or WebGL.
- Skill percentage bars.
- Effects stacked on every card: one spatial idea, used where it earns its place.
- The phone number anywhere.

## The 10-second test

A first-time visitor on a phone can find name, role, experience, projects, resume and contact within 10 seconds.

| Item | Where it lives | How it is reached |
|------|----------------|-------------------|
| Name | {#hero} | Visible on first paint with no scrolling |
| Role | {#hero} | The role line directly under the name |
| Experience | {#experience} | Bottom pill nav: open the pill, tap the item |
| Projects | {#projects} | Bottom pill nav: open the pill, tap the item |
| Resume | {#hero} | The hero Resume CTA, one tap |
| Contact | {#contact} | Bottom pill nav: open the pill, tap the item |

Pass rule: all six found in 10 seconds or less, timed on a real phone with motion enabled.

## References

Source clips are in `references/` (private, not in the public repo). Notes come from still frames, so timing and physics are inferred; the feel is verified with the user during the interaction work.

### 539 — Handled project rail (signature)

The signature interaction: an object you handle. On hover a project lifts out and enlarges while its neighbors shift aside; a click opens a focused detail view with the rail blurred behind it, prev and next controls, an index and a close control. On touch the visitor swipes the rail and taps to open.

- Borrow: the lift, the neighbors making room, the focused detail with a blurred backdrop, prev/next with an index, and a clear close control.
- Do not borrow: hover as the only way in (touch uses swipe and tap), the garment-and-hanger metaphor, the newsletter ticker, and the corner-only About/Contact placement.

### 445 — Morphing pill nav (mobile)

A bottom pill expands in place into frosted panels, then collapses. One element morphs between states, which is the strongest mobile pattern in the set.

- Borrow: the single pill that expands and collapses in place, the frosted panel surface, and the one-element-morphs idea.
- Do not borrow: the audiobook-specific panels (search, settings) and the phone-mockup framing.

### 355 — Tone

A soft marketing site with a pastel hero, cream and navy alternating bands, a card carousel, an accordion list and an oversized wordmark footer. It is the tone reference, not the signature.

- Borrow: softness, large type, and alternating background bands between sections.
- Do not borrow: the cursor-reactive text distortion (hover-only and a site-wide cursor effect), the illustration set, and the cloud-textured wordmark.

### godly.design — Mood board

Curated posts of interface interaction clips. Inspiration only; it is not a dependency and has no code or package implications.

- Borrow: spring feel, press states and motion patterns, captured as written notes in the motion spec before any coding.
- Do not borrow: whole layouts, or any effect that needs a mouse.

## Launch gates

- Mobile Lighthouse performance at least 90 and accessibility at least 95.
- Initial JavaScript at most 150 kB gzipped (relaxed from a stricter 120 kB because the stack probe measured about 139 kB before real content; code-split to stay under).
- LCP at most 2.5 s and CLS under 0.1.
- WCAG 2.2 AA.
- Full `prefers-reduced-motion` support.

## Content principles

- The resume PDF is the source of truth; on any conflict it wins over the old site. Items the resume does not cover are kept from the old site.
- The same six sections as before: About Me, Skills, Education, Experience, Projects, Contact Me.
- The phone number is never published, in site copy, the served resume, meta tags, JSON-LD or Open Graph data. The served resume is a phone-stripped copy.
- Public email, GPA and the DJ Instagram link stay public (D-11).
