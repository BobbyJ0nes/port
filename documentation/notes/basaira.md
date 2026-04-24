# basaira — a typographic page

> _artifact:_ `/projects/basaira/BASAIRA4/`
> _earlier drafts kept for reference in `BASAIRA1`–`BASAIRA3`._

## intent
A quiet, self-contained typographic page built around one idea: the
arabic word **بصيرة (basaira)** — *clear vision*, an understanding that
is earned rather than glanced at. The page is the name stated plainly,
in type, with a single image that shifts from stillness to motion on
hover.

## mechanic
- semantic: `<header>`, `<section class="intro">`,
  `<section class="description">`, and a `<div class="hover-box">`
  containing two `<img>` elements with alt text.
- type: `Cairo` via google fonts, css custom properties for colour,
  `max-width` on images, relative units throughout.
- interaction: css-only opacity swap on `:hover` of `.hover-box`, so
  the static cloud photograph becomes a short cloud gif. no javascript.

## on tools
Written by hand. No AI involvement.

## references
- MDN (2024) _HTML: img._ https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
- W3C (2023) _WCAG 2.1 AA · 1.1.1 non-text content._
