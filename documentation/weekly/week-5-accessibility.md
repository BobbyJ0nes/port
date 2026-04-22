# week 5 · accessibility sprint

> _syllabus topic:_ accessibility basics, inclusive design, design sprint,
> getting ready for formative assessment.

> _artifact:_ `/documentation/accessibility.md` (the audit itself) +
> retrofit commits across `/projects/orion/`, `/projects/moss/`,
> `/projects/big-C/`, root `/`.

## intent
accessibility as _default craft_, not as a patch. the week's task was
to audit the portfolio, fix the easy wins, and honestly document what
remains. pick one finished project (orion) and one in-progress project
(moss) and take them from "works for me" to "passes axe DevTools with
no critical issues".

## mechanic
- **manual keyboard walkthrough** for every page in the shell and
  the full six-page orion tree. noted focus-ring visibility and
  tab-order at each stop.
- **axe DevTools** (chrome extension) run on the deployed shell; results
  captured in `accessibility-audit.png`.
- **webaim contrast checker** used for every foreground/background
  pairing in the design tokens.
- **WCAG 2.1 AA quickref** used as the checklist.

## build log
- **step 1** — walk the shell with keyboard only; note any focus traps,
  missing skip-links, missing aria.
- **step 2** — run axe DevTools against the live URL. capture screenshot.
- **step 3** — fix every critical issue. log warnings for later.
- **step 4** — retrofit orion's links to all carry meaningful `aria-label`
  (already done — verified).
- **step 5** — wrap every arabic-text span with `lang="ar"` so screen
  readers switch pronunciation.
- **step 6** — add `<noscript>` graceful fallback on portfolio `index.html`
  so the grid is still readable if js fails.
- **step 7** — wrap moss's glitch animation in
  `@media (prefers-reduced-motion: no-preference)`.
- **step 8** — write the reflection (what's fixed, what remains).

## screenshots
> _mandatory before submission:_
> - `screens/axe-portfolio.png` — axe DevTools summary on the shell.
> - `screens/axe-orion.png` — axe run on orion/index.html.
> - `screens/keyboard-walk.png` — focus ring visible on a representative card.

## retrofit summary

| item                                   | before             | after                                           |
|----------------------------------------|--------------------|--------------------------------------------------|
| `<html>` lang missing                  | no `lang`          | `lang="en"`, arabic spans get `lang="ar"`        |
| theme toggle semantics                 | `<div>`            | `<button>` with `aria-pressed`, `aria-label`     |
| decorative gradient thumbs             | announced to AT    | `aria-hidden="true"` on decorative containers    |
| moss glitch animation                  | ran for everyone   | gated behind `prefers-reduced-motion` check      |
| arabic glyph pronunciation             | read as latin      | wrapped in `<span lang="ar">`                    |
| keyboard nav on portfolio grid         | tab only           | tab + j/k + ↓/↑ shortcut                         |

## ai disclaimer
pi was used to cross-check WCAG success-criteria numbers against the
actual attributes i had in my html (e.g. "does my skip-link satisfy
2.4.1?"). no ai-written code was shipped in the retrofit — fixes were
applied by hand, with pi as a reference-book substitute.

## references
- W3C (2023) _WCAG 2.1 AA quickref._
  https://www.w3.org/WAI/WCAG21/quickref/
- Deque Systems (2024) _axe DevTools._ https://www.deque.com/axe/devtools/
- WebAIM (2024) _Contrast Checker._
  https://webaim.org/resources/contrastchecker/
- GOV.UK (2024) _Accessible autocomplete guidance (inclusive design reference)._
  https://www.gov.uk/service-manual/technology/designing-for-different-browsers-and-devices
