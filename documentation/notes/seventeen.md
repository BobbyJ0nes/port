# seventeen — javascript + canvas + time

> _artifact:_ `/projects/seventeen/`

## intent
two ideas — a _typewriter effect_ and a _clock_ — as studies in how
_time_ becomes a design material. _seventeen_ collapses them: the clock
is a video, the typewriter is the video, rendered one character at a
time over a long prose poem.

the poem ("seventeen seconds before he locked eyes with his destiny…")
was written first. the piece then asks: can a hundred rows of text, each
drifting at a different speed, still read as _one thing_?

## mechanic
- **canvas 2d** as the render surface; no framework.
- the video is drawn into an offscreen canvas at grid resolution
  (`offCanvas.width = imgCols`), then `getImageData` samples brightness
  per pixel.
- brightness maps to one of six fill styles (turquoise deep / light /
  pink / hot pink / orange / white hot core) — a hand-tuned palette
  across the candle's temperature range.
- **per-row independent velocity:** each row of text has its own
  `rowOffsets[y]` and `rowSpeeds[y]`, assigned once and then advanced
  every frame. rows shear past each other organically — each speed is
  `0.08 + sin(y * 0.2) * 0.04 + random * 0.1`.
- the character at `(x, y)` is pulled from a long string by
  `(currentOffset + y * imgCols + x) % chars.length`, so the text
  _is_ the prose, just permuted across the grid.
- **graceful fallback:** if autoplay is blocked, a file-input fallback
  lets the viewer pick the video manually.
- **animation loop:** `requestAnimationFrame(draw)`.

## build log
- **v1** — a single global offset advancing every frame → rows slide in
  lockstep. too mechanical.
- **v2** — per-row offsets, random speeds. too chaotic.
- **v3** — per-row speeds with a `sin()` organiser across y → rows shear
  but retain visible structure. kept.
- **v4** — brightness-to-palette mapping; tuned the six colour steps
  over several passes until the candle reads as a candle.
- **v5** — wrote the prose poem; fed it in as the chars array.
- **v6** — simplified the loading flow: moved the `<video>` element
  into HTML with a `<source src="candlez.mp4">` tag so the browser
  starts fetching + decoding during HTML parse (not after JS runs).
  removed the "[ IGNITING VIDEO ]" overlay; the canvas now fades in
  via a CSS opacity transition once the first frame is decoded and
  playback has started (`playing` event → `.ready` class). the
  autoplay-blocked fallback became a small tap-to-begin button instead
  of a full-screen file picker.
- **verification** — `verify.js` confirms `videoReadyState: 4`
  (HAVE_ENOUGH_DATA), `videoPaused: false`, `canvasReady: true`,
  `errorShown: false` with no manual intervention. screenshot saved
  to `projects/seventeen/verify_screenshot.png`.

## on tools
- the poem text is original creative writing, drafted by hand before the
  piece was built.
- pi was used to discuss the `getImageData` / brightness-mapping
  pattern and to debug an early bug where rows drifted off-screen
  (was using floats where ints were needed for char-index).
- the final colour palette was hand-picked by eye; no ai was involved
  in the palette choice.

## references
- MDN (2024) _Canvas API: pixel manipulation with ImageData._
  https://developer.mozilla.org/en-US/docs/Web/API/ImageData
- MDN (2024) _requestAnimationFrame._
  https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
- MDN (2024) _HTMLMediaElement.readyState._
  https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
