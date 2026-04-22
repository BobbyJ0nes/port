# week 9 · node + vite + npm workflow

> _syllabus topic:_ Node.js, npm, modules, vite, project structure.

> _artifact:_ `/projects/big-C/package.json` + the import-map pattern used
> in `/projects/big-C/index.html` and `/projects/moss/index.html`.

## intent
understand how modern web tooling stitches together — and where the
lightweight middle-ground of _import maps_ sits against the full
vite/bundler path. two of the portfolio's projects are already set up
to demonstrate this; this week's work is about _naming_ that
infrastructure and documenting it honestly.

## mechanic

### 1. import maps (current deployed approach)
both `moss` and `big-C` use browser-native import maps to resolve
bare specifiers to cdn urls, so module code can import `three` and
`three/addons/...` as if they were installed:

```html
<script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
    }
  }
</script>
<script type="module" src="app.js"></script>
```

then inside `app.js`:

```js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
```

**trade-offs** — no install step, no build, works on github pages out of
the box; but no tree-shaking, no minification, and a hard dependency on
the cdn being up.

### 2. npm (big-C)
`/projects/big-C/package.json` is a real npm project:

```json
{
  "name": "js_funds",
  "type": "commonjs",
  "dependencies": {
    "playwright": "^1.59.1",
    "playwright-core": "^1.59.1"
  }
}
```

playwright is used here as a _development_ dependency — for scraping a
reference design (see `inspect.js` in the original working folder) and
for automated visual regression checks. it is not shipped to the page.

### 3. vite (upgrade path, not deployed)
the next step is to run `npm create vite@latest` inside `big-C`, move
the static files into `src/`, and swap the cdn imports for real npm
dependencies (`npm i three gsap`). vite's dev server gives HMR;
`vite build` produces a minified, hashed output suitable for real
deployment.

this has not been executed (the import-map flow is sufficient for the
portfolio) but the _understanding_ is documented here.

## build log
- **v1** — ran `npm init -y` in big-C, installed playwright.
- **v2** — wrote `inspect.js` (playwright script that captured the
  reference design's dom + a screenshot for reference).
- **v3** — added the import map to `index.html` so `app.js` could use
  real esm imports.
- **next** — optional: migrate to vite for the final deploy if time
  permits.

## screenshots
> _to add before submission:_
> - `screens/npm-install.png` — `npm ls` output showing the tree.
> - `screens/devtools-imports.png` — chrome devtools network panel
>   showing the import-map cdn fetches.

## accessibility notes
this week is infrastructure-focused; no direct a11y implications on
the page. however — the _choice_ of import maps over a bundled build
has one small a11y advantage: the raw, readable source is what's
served, so assistive-tech users who read source (rare but real) see
the same code i wrote.

## ai disclaimer
pi was used to double-check import-map syntax (particularly the
trailing-slash rule for `three/addons/`) and to suggest playwright
for the reference-scrape task. the `package.json` was authored by
`npm init` and then edited by hand.

## references
- nodejs.org (2024) _about node.js._ https://nodejs.org/en/about
- npm docs (2024) _package.json._
  https://docs.npmjs.com/cli/v10/configuring-npm/package-json
- vite (2024) _guide._ https://vitejs.dev/guide/
- WICG (2023) _Import Maps._
  https://github.com/WICG/import-maps
- three.js (2024) _installation._
  https://threejs.org/docs/#manual/en/introduction/Installation
