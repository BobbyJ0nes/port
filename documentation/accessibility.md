# accessibility · audit + reflection

> _brief requirement:_ "It needs to include a section on the accessibility
> of your website: what accessibility features you included with references
> to relevant guidelines, a screenshot of accessibility evaluation using one
> of the browser plugins from class. A reflection of the accessibility of
> your website could be further improved."

## 1 · features included

all features reference **WCAG 2.1 AA** unless otherwise stated.

### across the portfolio shell (the root index)
- **1.1.1 non-text content** — every `<img>` has meaningful `alt`; decorative
  gradient thumbnails in `.card__thumb` use `aria-hidden="true"`.
- **1.3.1 info + relationships** — semantic landmarks: `<header role="banner">`,
  `<main role="main">`, `<nav aria-label="primary">`, `<footer role="contentinfo">`.
  headings form a correct hierarchy (one `h1`, then `h2`s per section).
- **1.4.3 contrast (minimum)** — light-mode body text `#1a1a1a` on `#f4eee6` =
  15.8:1; dark-mode body text `#ece4d7` on `#0e0f10` = 15.3:1; both far above
  the 4.5:1 AA requirement.
- **1.4.10 reflow** — layout responds to viewport down to 320px without
  horizontal scroll; tested via devtools + physical phone.
- **1.4.12 text spacing** — line-height, letter-spacing and paragraph spacing
  all use relative units and respect user overrides.
- **1.4.13 content on hover/focus** — no content-on-hover beyond standard link
  underline/colour change.
- **2.1.1 keyboard** — every interactive element reachable with `tab`;
  additional `j/k` (or `↓/↑`) shortcut to walk through work cards; no
  keyboard traps.
- **2.4.1 bypass blocks** — visible skip-link on first focus (`.skip-link`).
- **2.4.7 focus visible** — custom `:focus-visible` outline with 3px offset,
  high-contrast accent colour.
- **2.5.3 label in name** — visible link text and `aria-label` start with the
  same words where both are present.
- **3.1.1 language of page** — `<html lang="en">` set on every page.
- **4.1.2 name, role, value** — `aria-pressed` on the theme toggle reflects
  current state and updates on click; `aria-current="page"` on nav links
  for the current page.

### customisable interface
- **theme toggle** (light / dark) persists to `localStorage` as
  `basaira-theme`; if no preference is stored, the site honours
  `prefers-color-scheme`. this satisfies the brief's "customisable interface"
  requirement.
- **`prefers-reduced-motion`** — when the OS signal is set, smooth scroll
  falls back to instant and all CSS transitions are reduced to effectively 0ms.

### per-project
- **orion** (`/projects/orion/`) — skip-link, `aria-label` on every narrative
  link describing the scene it leads to, semantic `<main>` and `<nav>`,
  `meta description` per page.
- **moss** — viewer controls labelled via `title` attributes (upgrade target:
  convert to proper `aria-label` + `aria-pressed` for toggle state).
- **seventeen** — decorative canvas hidden from assistive tech via `aria-hidden`;
  manual file-input fallback for browsers that block autoplay.
- **à toi** — pointer events work with touch, mouse, and pen; `user-scalable=no`
  is set — known issue, see reflection below.
- **basaira (v4)** — `alt` text on both the static and hover images.

## 2 · evaluation screenshot

> **TODO before submission:** run one of the plugins below on the deployed
> site, screenshot the results, save as `accessibility-audit.png` in this
> folder, and embed below.
>
> recommended tools (any one is sufficient):
> - **axe DevTools** (Chrome extension)
> - **WAVE** (https://wave.webaim.org/)
> - **Lighthouse** (built into Chrome DevTools → Lighthouse → Accessibility)
>
> expected result on the portfolio shell after the fixes listed in §1:
> 0 critical issues, possibly warnings about contrast on the
> `.card__tag` pill (over photo thumbnails) which should be re-checked.

`![axe DevTools result](./accessibility-audit.png)`

## 3 · reflection — what could be improved

honest list of known gaps, in priority order:

1. **`a_toi` disables zoom** — the meta viewport is
   `user-scalable=no`, which violates **1.4.4 resize text**. this was a design
   choice to prevent the ascii grid from breaking during pinch-zoom, but the
   right fix is to allow zoom and let the grid recompute on the
   `visualViewport` resize event. to-do.
2. **`seventeen` canvas is inert to keyboard** — the piece is consumed
   passively (watch the video), which is fine, but there's no textual
   alternative for the poem content. fix: add a visually-hidden `<div>`
   containing the raw prose so screen readers can access it. trivial to add.
3. **`moss` glitch animation does not honour `prefers-reduced-motion`** — the
   `@keyframes glitch` runs unconditionally. fix: wrap the animation rule in
   `@media (prefers-reduced-motion: no-preference)`.
4. **big-C contrast on the clicker red box** — red on purple marquee is not
   4.5:1 in some positions. fix: add a subtle dark backing to the
   `.clicker-box` or shift to a higher-contrast pairing.
5. **no high-contrast mode** — the portfolio has light/dark but not a true
   3-way toggle including a WCAG AAA 7:1 high-contrast theme. feasible but
   deferred.
6. **no explicit language tag on arabic text fragments** — `بصيرة` appears
   without `lang="ar"` around it, meaning some screen readers will
   mispronounce. fix: wrap with `<span lang="ar">بصيرة</span>` everywhere
   it appears.

## 4 · process notes

- developed against the WCAG 2.1 AA quickref (https://www.w3.org/WAI/WCAG21/quickref/).
- keyboard walkthrough performed manually for every page in the portfolio
  shell and for orion's full 6-page tree.
- colour contrast measured with https://webaim.org/resources/contrastchecker/.
- **session notes** for the accessibility sprint live in
  `/documentation/sessions/` (see `2026-04-16_week2_orion.md` for the
  pattern).

## 5 · references

- W3C (2023) _Web Content Accessibility Guidelines (WCAG) 2.1._
  https://www.w3.org/TR/WCAG21/
- WebAIM (2024) _Color Contrast Checker._
  https://webaim.org/resources/contrastchecker/
- MDN (2024) _ARIA landmarks._
  https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles
- Deque Systems (2024) _axe DevTools._
  https://www.deque.com/axe/devtools/
