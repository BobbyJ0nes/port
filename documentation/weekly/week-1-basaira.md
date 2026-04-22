# week 1 · basaira — first pages

> _syllabus topic:_ The Anatomy of a Web Page, part 1 — VS Code, HTML skeleton,
> CSS basics, folder structure, accessible text formatting.

> _artifact:_ `/projects/basaira/BASAIRA1 → BASAIRA4/`

## intent
write one page four times. each rewrite forces a different question:
- v1 — _can i build a page from memory?_
- v2 — _what breaks when i extract css to its own file?_
- v3 — _does the page still read if i strip it back to typography?_
- v4 — _can i make a single interaction (hover → gif) feel intentional?_

the subject is _basaira_ — the arabic word for _clear vision_ — used as
both the page's content and the studio's name. meaning → form.

## mechanic
- semantic: `<header>`, `<section class="intro">`, `<section class="description">`,
  `<div class="hover-box">` containing two `<img>` elements with alt text.
- css: imported `Cairo` via google fonts, custom properties for colour,
  `max-width` on images, relative units throughout.
- interaction (v4): css-only opacity swap on hover over `.hover-box`, so
  the static clouds become a short gif. no javascript required.

## build log
- **v1** — inline `<style>` block, one `h1`, one paragraph, no image.
- **v2** — moved styles into `style.css`, introduced a header landmark
  and an `<img>` with `alt="a peak into heaven"`.
- **v3** — added more typographic hierarchy (`h2` for the arabic gloss,
  `<strong>` for the keyword), tuned margins.
- **v4** — added the hover gif: second `<img>` stacked absolutely over
  the first inside `.hover-box`, `opacity: 0 → 1` on `:hover`.

## screenshots
> _to add before submission:_ `screens/basaira-v1.png`, `basaira-v4.png`,
> showing the static state vs the hovered state.

## accessibility notes
- `<html>` lacks a `lang` attribute in v1 — fixed in v4.
- both images carry `alt` text; the hover image's alt (`peeks into heaven`)
  echoes the static one so the meaning is preserved if animation fails.
- hover-only interactions are an a11y soft-spot (no keyboard equivalent).
  candidate for a v5 retrofit: trigger the gif swap on `:focus-within` too.
- colour contrast: `#0e3855` on `#e191e1` measures 5.1:1 — passes AA for
  body text but fails AAA.

## ai disclaimer
no ai was used for v1–v4. the four files were written by hand during the
studio session and iterated in the week that followed.

## references
- MDN (2024) _HTML: img._ https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
- GeeksforGeeks (2023) _How to import Google Fonts in HTML._
  https://www.geeksforgeeks.org/html/how-to-import-google-fonts-in-html/
  (linked from the week 1 syllabus.)
- W3C (2023) _WCAG 2.1 AA · 1.1.1 non-text content._
