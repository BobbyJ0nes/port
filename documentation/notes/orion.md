# orion — hyperlinks as narrative

> _artifact:_ `/projects/orion/`
>
> A standalone write-up also lives alongside the project in
> `/projects/orion/documentation.md`.

## intent
take the idea of the hyperlink as an expressive medium literally. if the
web's native verb is _link_, then the structure of a story _is_ the
structure of its links. split a short piece of prose about a man smoking
alone at night across six pages; make each evocative noun (a warm orange
glow, a lighter, a crackle, wispy clouds, shooting stars) a hyperlink
that leads to its own scene.

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

## on tools
- the narrative text is original creative writing, no ai involvement.
- css structure and semantic html patterns were discussed with pi
  (coding agent) as a learning reference; every line of html and css was
  written / reviewed / edited by hand.

## references
- MDN (2024) _HTML elements reference._
  https://developer.mozilla.org/en-US/docs/Web/HTML/Element
- CSS-Tricks (2023) _Specifics on CSS Specificity._
  https://css-tricks.com/specifics-on-css-specificity/
- Google Fonts — _Crimson Pro, Space Mono._
