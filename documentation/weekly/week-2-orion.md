# week 2 · orion — hyperlinks as narrative

> _syllabus topic:_ The Anatomy of a Web Page, part 2 — semantic HTML, IDs vs
> classes, accessibility via alt/ARIA, CSS with classes, hyperlinks as an
> expressive medium.

> _artifact:_ `/projects/orion/`
> _flagship:_ this is the week's strongest piece and the template for all
> later project documentation. full write-up also exists in
> `/projects/orion/documentation.md`.

## intent
read the brief's prompt ("use hyperlinks in a creative/artistic context")
literally. if the web's native verb is _link_, then the structure of a
story _is_ the structure of its links. split a short piece of prose about
a man smoking alone at night across six pages; make each evocative noun
(a warm orange glow, a lighter, a crackle, wispy clouds, shooting stars)
a hyperlink that leads to its own scene.

a reader can follow the main path (`glow → lighter → sky → star`) or
branch off through sensory details (`crackle`, `memory`). the last scene
loops back to the first. _the web is the medium is the message._

## mechanic
- six html files + one stylesheet in `/projects/orion/`:
  - `index.html` (cover / "enter")
  - `pages/glow.html`, `lighter.html`, `sky.html`, `star.html`
  - `pages/crackle.html`, `memory.html` (branches)
- semantic landmarks on every page: `<main role="main">`, `<nav aria-label>`,
  `<a class="skip-link">`, `<meta name="description">`.
- ids (`#main-content` as skip-target) vs classes (`.narrative-link`,
  `.star`, `.smoke`, `.scene-title`, `.nav-path`) kept strictly separate —
  ids only where a unique target is needed.
- css custom properties for colour and font tokens; per-page background
  gradient by `body class="page-glow|page-sky|page-star"`; narrative link
  hover states split by theme (flame / star / smoke).

## build log
- **00:00** — mapped the scene graph on paper (glow → lighter → sky → star),
  sketched two branch points.
- **00:20** — built the navigation skeleton + skip link pattern, copied
  into every page.
- **00:45** — hover states per link class; tuned the gradients so each
  page feels tonally distinct.
- **01:10** — audited every `<a>` for a meaningful `aria-label`; added
  `meta description` per page.

(source: `/documentation/sessions/sample-session-note-week2.md`.)

## screenshots
> _to add before submission:_
> - `screens/orion-cover.png` — the enter card.
> - `screens/orion-glow.png` — scene I with visible link hover states.
> - `screens/orion-sitemap.png` — a hand-drawn map of the scene graph.

## accessibility notes
- every link has a meaningful `aria-label` (e.g. "follow the warm orange
  glow to the lighter") describing where it leads.
- skip-link at the top of every page; visible on focus.
- semantic structure: one `<h1>` per page, `<main>` landmark, `<nav>` for
  inter-scene links.
- mobile breakpoint at 600px; max-width `65ch` for readable line length
  (WCAG 1.4.8 technique).
- **limitation:** the experience is text-heavy — fine for screen readers,
  but the mood relies on typography and gradients that a reader with
  custom-contrast mode will lose. acceptable trade-off.

## ai disclaimer
- **no ai was used** for the narrative text — original creative writing.
- css structure and semantic html patterns were discussed with pi
  (coding agent) as a learning tool; every line of html and css was
  written / reviewed / edited by the student. no ai-generated code
  was shipped verbatim.

## references
- MDN (2024) _HTML elements reference._
  https://developer.mozilla.org/en-US/docs/Web/HTML/Element
- CSS-Tricks (2023) _Specifics on CSS Specificity._
  https://css-tricks.com/specifics-on-css-specificity/
- Google Fonts — _Crimson Pro, Space Mono._
