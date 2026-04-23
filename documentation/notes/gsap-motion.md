# gsap — motion + timeline

> _artifact:_ gsap integration inside `/projects/moss/` — a short intro
> timeline that types the terminal lines, fades in the product card,
> and pulses the ADD TO CART button once per cycle.

## intent
motion as a way of introducing the reader to the page: the product
details reveal sequentially, the way a product page _should_ feel
heavier than a landing page. the ADD TO CART button then pulses once
every 6 seconds — an attention ping, not a nag.

## mechanic
- **import** via cdn:
  `import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';`
- **one shared timeline** (`const tl = gsap.timeline()`) running on
  `DOMContentLoaded`:
  - `tl.from('.product-code', {opacity: 0, y: -4, duration: 0.4});`
  - `tl.from('.product-title h2', {opacity: 0, y: 10, duration: 0.6}, '-=0.2');`
  - `tl.from('.price', {opacity: 0, scale: 0.95, duration: 0.5}, '-=0.3');`
  - `tl.from('.detail-line', {opacity: 0, x: -8, duration: 0.3, stagger: 0.08}, '-=0.2');`
  - `tl.from('.action-buttons button', {opacity: 0, y: 6, duration: 0.3, stagger: 0.1}, '-=0.1');`
- **recurring pulse** via a separate `gsap.to('.pulse', { scale: 1.03,
  yoyo: true, repeat: -1, duration: 1.5, ease: 'sine.inOut', repeatDelay: 4 });`
- **reduced motion guard:** the whole timeline is wrapped in
  `if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)`
  — users who ask for no motion see the final state immediately.

## build log
- **v1** — quick pen with a css `@keyframes` pulse. worked, but the
  stagger across detail lines is awkward in pure css.
- **v2** — added gsap, moved the pulse to `gsap.to` so the reduced-motion
  guard is a single `if` at the top.
- **v3** — tuned the stagger values; `-=0.2` overlap gives the reveal
  momentum without blurring the beats.

## accessibility notes
- **prefers-reduced-motion** honoured — no animation runs when the
  user has asked not to see them.
- gsap does not change the accessible name / role of any element;
  elements fade in from `opacity: 0`, so screen-reader order remains
  the original DOM order.
- the pulse ping is subtle (`scale: 1.03`) and infrequent (every 6s),
  so it does not cause motion-sickness risk (WCAG 2.3.3 — animation
  from interactions).

## on tools
pi was used to review the timeline structure and to remind me of the
`stagger` syntax i always forget. every line of the gsap code was
written by me after reading the gsap docs for `timeline.from()` and
`stagger` options.

## references
- GreenSock (2024) _GSAP Timeline docs._
  https://gsap.com/docs/v3/GSAP/Timeline/
- GreenSock (2024) _Stagger examples._
  https://gsap.com/resources/getting-started/Staggers/
- MDN (2024) _prefers-reduced-motion._
  https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- WCAG 2.1 (2023) _2.3.3 animation from interactions._
