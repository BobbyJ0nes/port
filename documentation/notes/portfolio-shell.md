# portfolio shell — grid + flex + responsive

> _artifact:_ the root directory (the site you are inside).

## intent
build the shell last, once the pieces are known, so the layout follows
the work instead of forcing it. the shell has one job: _introduce the
reader, then step out of the way_.

design rules:
- typographic hierarchy over ornament.
- cards are tonal gradients, not photos — so the page loads fast and
  contrast is under my control.
- the grid breathes at three widths: stacked (mobile), 2-col (tablet),
  3-col (desktop) with the flagship card spanning the full row.

## mechanic
- **grid (2d):** `.grid` is a css grid. at mobile, one column. at ≥720px,
  two. at ≥1100px, three. the `.card--feature` card uses
  `grid-column: span N` to stretch wider at each breakpoint.
- **flex (1d):** `.top` (header) is flex with `justify-content: space-between`
  for logo / nav / toggle. `.nav` is flex with a wrap-friendly gap.
  `.foot` is flex with `flex-wrap: wrap`.
- **tokens:** all colours, spacing and type scale are custom properties
  on `:root`. a `data-theme="dark"` override ships a second palette.
  `prefers-color-scheme: dark` provides the default when the user hasn't
  toggled.
- **responsive type:** `clamp()` on headings and body so font size scales
  fluidly between breakpoints without media-query jumps.
- **motion safety:** `@media (prefers-reduced-motion: reduce)` collapses
  transition durations to effectively 0.

## build log
- **v0** — wireframe on paper: header / intro / work grid / stack list /
  footer.
- **v1** — built the grid with a fixed 3-col layout.
- **v2** — added media queries; confirmed the flagship card span adjusts
  at each breakpoint.
- **v3** — introduced the custom-property token system and the dark-mode
  override.
- **v4** — added the theme-toggle button, `localStorage` persistence,
  aria-pressed state; wired keyboard shortcuts (j/k) to walk the cards.

## on tools
pi was used as a sparring partner for the token system (which custom
properties to expose, how to name them) and for drafting the boilerplate
of the semantic html. every declaration in `style.css` was read, adjusted
for voice, and committed by hand. the copy on `index.html` and
`about.html` is my own writing.

## references
- Rachel Andrew (2023) _A complete guide to CSS Grid._ CSS-Tricks.
  https://css-tricks.com/snippets/css/complete-guide-grid/
- Chris Coyier (2023) _A complete guide to Flexbox._ CSS-Tricks.
  https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- MDN (2024) _Using media queries._
  https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries
- MDN (2024) _prefers-color-scheme, prefers-reduced-motion._
