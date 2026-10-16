# adding a blog article

reference pattern: `blog/animus/`. anything you add should mirror it
unless the post explicitly needs to break a rule.

## the shape

```
blog/<slug>/
├── index.html       ← the article
├── style.css        ← article-specific styles, imports nothing
└── *.js             ← interactive figure modules, optional
```

`<slug>` is lowercase-kebab, e.g. `the-shape-was-right`, `kai-the-system-prompt`.
no spaces, no underscores.

## minimum viable article

1. **start from a clone.** copy `blog/animus/` to `blog/<your-slug>/`.
   strip the figure JS modules + their HTML if your piece doesn't have
   interactive figures.

2. **wire the shell.**
   - update `<title>` to `<your-title> · بصيرة basaira`.
   - update the `<header class="top">` mark href to `../../` (back to
     portfolio root) and the nav to `← blog · essay · …`.
   - keep the j/k nav script and theme toggle wiring — they're shared.

3. **section structure.** keep the `<section class="lab-section" id="sN">`
   pattern. ANIMUS uses `s1` through `s7`. the section nav at the top
   uses `IntersectionObserver` to highlight the active section as you
   scroll — see `app.js`. if you don't want section numbering, drop the
   `<span class="lab-section__num">` and the section nav.

4. **fonts + tokens.** import the parent stylesheet and the article
   stylesheet:

   ```html
   <link rel="stylesheet" href="../../style.css">
   <link rel="stylesheet" href="style.css">
   ```

   any new tokens go in `../../style.css` (so other articles can reuse).
   article-specific layout goes in `<your-slug>/style.css`.

## listing the post on the blog index

`blog/index.html` lists equally weighted cards inside `.grid--articles`:

```html
<li class="card">
  <a href="<your-slug>/" class="card__link" aria-label="…">
    <div class="card__thumb card__thumb--<your-slug>" aria-hidden="true">
      <span class="card__tag">essay · {n} min read</span>
    </div>
    <div class="card__body">
      <p class="card__kicker">essay 00X · {month} {year}</p>
      <h3 class="card__title">{post title}</h3>
      <p class="card__blurb">{one-sentence pitch}</p>
    </div>
  </a>
</li>
```

then in `style.css` add a tonal gradient for the thumb:

```css
.card__thumb--<your-slug>::before {
  background: radial-gradient(circle at 30% 40%, <hex1>, <hex2> 75%);
}
```

terracotta-toned for analytical pieces, teal for technical, dark for
sombre/personal — match the post's voice.

## selecting articles for the home page

add selected articles to `index.html` under the `✶ writing` section,
inside `.grid--articles`. ANIMA and ANIMUS use the same `.card` markup,
thumbnail proportions and title size: neither is a featured lead.
articles sit in two equal columns from 720px up and stack below that.
the separate project grid still expands to three columns on desktop.

## linking into the wiki

inside the article body, link to a wiki page like this:

```html
<a href="/notes/animus/Inter-Model_Analysis">Inter-Model_Analysis.md</a>
```

the path prefix `/notes/` is the wiki-link signal. `popover.js` will
auto-wire any link with that prefix to:

- show a popover preview on hover (cross-fetched same-origin, with
  metadata stripped)
- navigate to the full page on click

links to PDFs (`/notes/papers/<file>.pdf`) get an iframe popover
instead of the html preview.

opt out of the popover on a specific link with `data-no-popover="true"`
and (usually) `target="_blank"` — see the intro-meta `animus vault`
link for the pattern.

## interactive figures

the ANIMUS article has three:

- **bar chart** (`chart.js`) — vanilla SVG, click a facet, bars
  rerender. all data lives in `data.js` — `ROWS`, `MODELS`,
  `EVIDENCE`.
- **reasoning chain explorer** (`reasoning.js`) — tabbed UI. clicking
  a model tab swaps the score readout + verbatim quote.
- **radar + table** (`radar.js` + `app.js`'s table builder) — five
  axes, seven polylines, four preset views. small-multiples row for
  facet drilldown. toggleable to a sortable table.

if you reuse any of these for a future post, **copy the file**, don't
import — each post should be self-contained. if a pattern recurs,
extract it into `blog/_shared/` and document it here.

## checklist before committing

- [ ] post renders at `http://127.0.0.1:5188/blog/<your-slug>/`
- [ ] mark href goes back to `/`
- [ ] nav has `← blog`
- [ ] all wiki cross-links use `/notes/...` (no `127.0.0.1:5187`)
- [ ] popovers work on hover (test at least one wiki-link)
- [ ] theme toggle persists across `blog/<slug>/` and the home page
- [ ] post is added to `blog/index.html`
- [ ] (if selected for the home page) post is also listed on `index.html`
- [ ] article cards have equal visual weight on desktop and stack on mobile
- [ ] no console errors in playwright or chrome devtools
- [ ] mobile responsive at <720px
