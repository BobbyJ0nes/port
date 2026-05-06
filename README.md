# بصيرة · basaira (v2)

a small portfolio of typographic web objects + a blog. each piece is a
short narrative built in code — html, css, canvas, three.js, gsap.

**live site:** https://bobbyjones.xyz/

## what's new in v2

- a `/blog/` section. the first piece is **animus** — the user-model layer.
  long-form essay with interactive figures (cross-model bar chart,
  reasoning-chain explorer, radar+table viz), at `/blog/animus/`.
- a `/notes/` section. an obsidian-style wiki built from a vault, served
  as static html. the article links into it on hover (popover preview)
  and on click; the wiki links back. one origin, no cors.
- the home page features the article above the work grid.

## structure

```
port_v2/
├── index.html               ← home (work + featured ANIMUS card)
├── about.html
├── style.css                ← design tokens, shared
├── script.js                ← theme toggle + j/k keyboard nav
├── projects/                ← portfolio pieces (moss, à toi, seventeen, …)
├── blog/
│   ├── index.html           ← blog index, ANIMUS featured
│   └── animus/              ← the article (html + css + js)
├── notes/                   ← wiki, BUILD OUTPUT — do not edit by hand
├── documentation/notes/     ← these docs
├── build-notes.js           ← build the wiki from ../notes_quartz
├── serve.py                 ← local dev server with pretty-URL fallback
├── CNAME
└── README.md
```

the wiki SOURCE lives in `../notes_quartz/content/` (a separate Quartz
project, not part of this repo). running `node build-notes.js` builds
it and stages the output into `notes/`. that staged copy is what the
site serves and what gets committed.

## run locally

```
python serve.py 5188
```

then open http://127.0.0.1:5188/. `serve.py` is a tiny Python
http.server with extension-less url fallback, so localhost behaves
like GitHub Pages.

## documentation

written-up so future-you can extend without re-deriving:

- [`site-structure.md`](documentation/notes/site-structure.md) — what
  lives where, what each file does, why the splits exist.
- [`adding-articles.md`](documentation/notes/adding-articles.md) — how
  to add a new blog post. uses ANIMUS as the reference pattern.
- [`wiki-content.md`](documentation/notes/wiki-content.md) — how to
  add or edit notes in the vault, link back into articles, embed
  research papers.
- [`build-and-deploy.md`](documentation/notes/build-and-deploy.md) —
  build script, deploy workflow, what changes when going live.

## on ai use

parts of this site were built alongside an AI coding agent, used as a
sparring partner for structure and refactor decisions. no generated
code was shipped without being read, understood, and often rewritten.
all narrative writing — seventeen's poem, this README, the article —
is my own.
