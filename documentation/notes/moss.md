# moss-tech — three.js

> _artifact:_ `/projects/moss/`

## intent
most three.js demos end at a coloured cube on a grey background. this
piece starts there and asks a different question: _can a three.js scene
live inside a fake product page without overwhelming it?_

the fiction is a cyberpunk-esque product page for
`[ID: MSS-001] ORGANIC MOSS TEXTURE` — an imaginary 3d-asset shop. the
three.js canvas is the _preview_ widget, framed by a terminal-green ui,
with orbit controls, auto-rotate, and a reset button. the model is a
real photogrammetry scan of moss (`10_1_2025.glb`).

## mechanic
- **scene** set up in `MossViewer` class (`moss-viewer.js`):
  - `PerspectiveCamera(45, aspect, 0.1, 1000)` at `(0, 1.2, 4)`.
  - `WebGLRenderer` with `antialias: true`, `ACESFilmicToneMapping`,
    `SRGBColorSpace`, shadow map enabled.
  - `AmbientLight(#ffffff, 0.8)` + `DirectionalLight(#ffffff, 1.5)`
    at `(5, 5, 5)` with shadows on.
- **loading pipeline:** `GLTFLoader` + `DRACOLoader` (decoder path from
  google's cdn). on load:
  - compute the bounding box, recenter the mesh, and scale so the largest
    dimension is `2.5` — consistent framing regardless of model size.
  - wrap in a `pivot` Group so auto-rotate operates around the model's
    centre, not the scene origin.
  - enable shadow cast / receive on every sub-mesh.
- **controls:** `OrbitControls` with `enableDamping: true`.
- **viewer controls** wired up in `script.js`:
  - `#toggle-rotation` → `mossViewer.toggleAutoRotate()`
  - `#reset-view` → camera and target return to defaults.
- **ui layer** (`index.html` + `style.css`):
  - glitch-effect `h1` via multiple `text-shadow` overlays and a
    `@keyframes glitch` animation.
  - terminal-style typing effect for `PRODUCT_DESCRIPTION.TXT` using
    `setInterval` character-by-character, with a reverse/re-forward
    loop triggered by `IntersectionObserver`.

## build log
- **v1** — cube on a grey background. boring but correct.
- **v2** — swapped cube for the `.glb`; debugged the DRACO decoder path
  (found in three.js examples repo).
- **v3** — added the bounding-box recenter+scale; models of any size
  now frame consistently.
- **v4** — added the terminal ui wrapper and the glitch title.
- **v5** — added auto-rotate toggle, reset view; polished lighting
  (dropped ambient from 1.0 → 0.8 so the directional gets a chance).

## on tools
pi was used to debug the DRACO decoder path (had the wrong version
string initially) and to suggest the bounding-box recenter pattern for
robust model framing. every line of `moss-viewer.js` was written by me
after reading the three.js `GLTFLoader` example. the ui copy, colour
palette, and glitch animation are my own.

## references
- three.js (2024) _GLTFLoader._
  https://threejs.org/docs/#examples/en/loaders/GLTFLoader
- three.js (2024) _DRACOLoader._
  https://threejs.org/docs/#examples/en/loaders/DRACOLoader
- three.js (2024) _OrbitControls._
  https://threejs.org/docs/#examples/en/controls/OrbitControls
- Bruno Simon (2024) _Three.js Journey — camera framing utilities._
  https://threejs-journey.com/
- MDN (2024) _IntersectionObserver._
  https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
