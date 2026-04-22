# week 3 · makaira — positioning + transforms

> _syllabus topic:_ CSS Box Model, Display Properties, Position
> (static/relative/absolute/fixed), transformations, fluid layouts.

> _artifact:_ `/projects/big-C/`

## intent
take the visual language of mid-00s merch shop design — marquees, blocky
typography, a loud centrepiece — and rebuild it with honest css layering.
the piece is a study in _what positioning mode does what_: the vertical
marquee lives behind everything (`z-index: 0`, `position: fixed`), the
ui overlay floats in front (`z-index: 10`), and the left "clicker"
rotates through pure `transform: rotate()` driven by the scroll wheel.

the 3d object in the middle is drafted with three.js (week 10 territory)
but the _composition_ of this page is a positioning problem.

## mechanic
- **three layers, three positioning modes:**
  - `.bg-marquee-container` → `position: fixed; z-index: 0` — vertical
    infinite scroll via `@keyframes scrollVertical { translateY(0) → -50% }`.
  - `.ui-layer` → `position: fixed; z-index: 10; pointer-events: none` —
    overlays the header, title, and clicker without blocking canvas clicks.
  - `#canvas-container` → `position: fixed; z-index: 5` — sits between
    marquee and ui.
  - `.bottom-marquee-container` → `position: fixed; bottom: 0; z-index: 20` —
    pinned horizontal marquee on top of everything.
- **scroll-driven rotation:** a `wheel` event listener accumulates a
  virtual scroll value and assigns it to `transform: rotate(...)` on the
  left clicker. smooth, declarative, no library needed.
- **typography transforms:** `.clicker-text` uses layered `text-shadow`
  to fake a stroke; `.title .purple` / `.green` / `.black` sit on the
  same line with three different sizes to stagger the baseline.
- **custom properties** for all palette colours.

## build log
- **v1** — scaffolded the html with two marquees and a placeholder title.
- **v2** — built the fixed stacking system, verified z-index layering with
  temporary outlines.
- **v3** — added the `wheel` listener and confirmed rotation accumulates
  smoothly with `% 360` normalisation.
- **v4** — wired up three.js with import maps (week 9 concern, noted
  here for traceability).
- **v5** — replaced the `BoxGeometry` placeholder with `MR new.glb`
  loaded via GLTFLoader + DRACOLoader. bounding box measured
  (1.08 × 4.13 × 3.42); the model sits inside a `THREE.Group` pivot
  that's scaled by height (target 3.2 units) and rotated `π/2` on the
  y-axis so the wide face — the cigarette pack and "smoking kills"
  label — faces the camera.
- **v6** — swapped the `"Marlboro"` placeholder `<div>` for a real
  `<img src="MM 1.jpg">` with descriptive alt text.
- **v7** — rewrote the title layout to match the intended composition:
  "WelCome tO" in black Anton, "CLoUd City" in magenta + small lime
  "SHOP" inline, separate green "SHOP" button top-right. added a
  sky-blue top band and a pixelated hand cursor as a decorative cue.
- **v8** — added a `verify.js` playwright script that serves the page,
  loads it in headless chromium with `swiftshader`, pauses the render
  loop, and captures a full-viewport screenshot. output saved as
  `verify_screenshot.png`; compared visually against
  `readymag_screenshot.png` (original reference) and
  `cloudcityshop_ss.png` (clean target).
- **verification result** — composition matches the clean reference
  target on all major elements (title, bag, clicker, marquees,
  colours, hand cursor, bottom bar).

## screenshots
> _to add before submission:_
> - `screens/bigc-layers.png` — with dev-tools outlines on, to show the
>   stacking.
> - `screens/bigc-final.png` — the composed page with the 3d object
>   replaced.

## accessibility notes
- all marquee content is decorative (repeated slogan); the marquees sit
  behind the ui and carry `pointer-events: none` so keyboard/touch users
  aren't snagged by them.
- the `"SHOP"` element is currently a `<div>` — should become a `<button>`
  or `<a>` before deploy (semantic correction).
- the scroll-rotation interaction has no keyboard equivalent — fix: add
  a `keydown` handler for `←` / `→` that nudges the rotation.
- contrast on `.clicker-text` (white with black stroke on green marquee)
  is strong (>7:1 when measured against the text-shadow-defined edge).
  contrast on `.clicker-box` red-on-purple is borderline and should be
  nudged.

## ai disclaimer
pi was used to discuss the stacking strategy (three fixed layers, whose
z-index goes where, how to keep the ui layer click-transparent). the
css was written by hand. the `wheel`-driven rotation was implemented
independently after reading the MDN `WheelEvent` page.

## references
- MDN (2024) _CSS position._
  https://developer.mozilla.org/en-US/docs/Web/CSS/position
- MDN (2024) _CSS transform._
  https://developer.mozilla.org/en-US/docs/Web/CSS/transform
- MDN (2024) _WheelEvent._
  https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent
- three.js (2024) _importmap example._
  https://threejs.org/docs/#manual/en/introduction/Installation
