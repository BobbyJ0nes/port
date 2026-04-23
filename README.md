# بصيرة · basaira

A small portfolio of typographic web objects and 3d sketches.
Each piece is a short narrative built in code — html, css, canvas,
three.js, gsap.

**Live site:** https://bobbyj0nes.github.io/cci_web_dev_port/

## work

| project                  | tech                                  | notes                                   |
|--------------------------|---------------------------------------|-----------------------------------------|
| `basaira`                | html · css                            | typographic page on the word basaira    |
| `archv_tgzt`             | video · canvas · color sampling       | short film in a reactive viewer         |
| `dark_chclt_dgstv`       | video · canvas · color sampling       | short film in a reactive viewer         |
| `seventeen`              | canvas · imageData · time             | video as drifting ascii                 |
| `à toi`                  | canvas · pointer events               | pointer-driven ascii field              |
| `moss-tech`              | three.js · gltf · draco · gsap        | photogrammetry scan in a fake shop ui   |

Source lives in `/projects/`. Process notes for each piece live in
`/documentation/notes/`.

Two earlier pieces are archived in the repo but not linked from the
index: `/projects/orion/` (a non-linear short story across 6 pages)
and `/projects/big-C/` (`makaira shop` — a layered css positioning
study with three.js).

## libraries

- **three.js** — `moss-tech`, `makaira`.
- **gsap** — intro timeline in `moss-tech`.

## accessibility

Targets WCAG 2.1 AA. Semantic landmarks, skip-links, visible
`:focus-visible`, keyboard shortcuts, light/dark theme with
`localStorage` persistence, `prefers-color-scheme` and
`prefers-reduced-motion` respected site-wide. Full audit in
[`documentation/accessibility.md`](documentation/accessibility.md).

## on ai use

Parts of this portfolio were built alongside an AI coding agent, used
as a sparring partner for structure and refactor decisions. No
generated code was shipped without being read, understood, and often
rewritten. All narrative writing (seventeen's poem, the voice of the
documentation) is my own.
