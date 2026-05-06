# build + deploy

## the build script

`port_v2/build-notes.js` does one thing: build the Quartz wiki and
stage it under `port_v2/notes/`.

```
node build-notes.js
```

it runs `npx quartz build` in `../notes_quartz/`, then copies the
output (`notes_quartz/public/`) into `port_v2/notes/`. that copy is
what gets committed.

run it whenever:

- you've edited content in `../notes_quartz/content/`
- you've changed a Quartz component (e.g. `PageTitle.tsx`)
- you've changed the Quartz config (`quartz.config.ts` or
  `quartz.layout.ts`)
- you're about to commit + deploy

it's idempotent — running it twice gives you the same result.

## local serve

```
python serve.py 5188
```

use `serve.py`, not the stock `python -m http.server`. it adds
three things stock python lacks, all of which the production host
(github pages) provides:

- **extension-less url fallback** — `<a href="/notes/animus/Methods">`
  resolves to `Methods.html` instead of 404'ing.
- **HTTP Range support** — without this, `<video>` scrubbing breaks
  on the archv / chclt viewers. stock python returns 200 with the
  full file to a `Range:` request; serve.py returns the proper 206
  Partial Content.
- **Cache-Control: no-store** — so a hard refresh isn't needed
  every time you tweak a CSS or JS file in dev.

ports already in use by other tooling: 5180–5187 (article variants,
quartz dev server, etc.). 5188 is the canonical port_v2 port.

## deploy to github pages

the live site is at `bobbyjones.xyz`, served from the `BobbyJ0nes/port`
github repo via github pages.

deploy in three commands:

```
node build-notes.js                            # rebuild /notes/
git add .
git commit -m "<your message>"
git push
```

github pages will detect the push and rebuild within a minute. nothing
in the deploy is dynamic — it's all static html that's been generated
locally.

### what gets pushed to the repo

- everything in `port_v2/` (the portfolio shell, projects, blog,
  build script, `serve.py`, this documentation).
- the `port_v2/notes/` folder (the staged Quartz output).

### what does NOT get pushed

- `../notes_quartz/` — the Quartz install + raw content. that's a
  separate concern. the *output* is what ships, not the source.
- `node_modules`, build caches, etc.

if you want the wiki source under version control too (sensible),
keep `notes_quartz/` in its own repo and commit there separately.
the workflow then becomes:

1. edit content in notes_quartz, commit there
2. run `build-notes.js` from port_v2
3. commit + push the staged copy in port_v2

two commits per content change. a small price for keeping the
deploy unit (port_v2) clean.

## what changes between localhost and production

**nothing** that requires manual editing. all wiki cross-links use
`/notes/...` (relative absolute), which resolves the same way locally
and in production. all back-links from the wiki use `/blog/animus/`
(relative absolute), same.

the one production-only thing: `Quartz`'s `baseUrl` in
`quartz.config.ts` is set to `bobbyjones.xyz/notes`. that's used for
OG metadata, RSS, sitemap. if your domain changes, edit that and
rebuild.

## troubleshooting

### `404` on `/notes/animus/<page>` locally

you're using `python -m http.server`, not `python serve.py`. switch.

### popover shows "could not load preview"

a `fetch()` to the wiki page failed. usually means the page doesn't
exist (you haven't built since renaming) or the `WIKI_PATH_PREFIX` in
`blog/animus/popover.js` no longer matches your wiki mount. check
that `/notes/...` is the right prefix for your setup.

### wiki page shows wrong date

check the frontmatter `date` field on the source markdown in
`../notes_quartz/content/`. if you didn't add one, Quartz falls back
to file mtime, which is usually wrong. add a `date: YYYY-MM-DD`.

### popover content includes the breadcrumb / date

the css rule `.popover .popover-inner > div.popover-hint { display: none }`
in `notes_quartz/quartz/styles/custom.scss` hides the metadata strip.
if it's reappearing, the rule got overwritten by a Quartz upgrade —
check and re-add.

### build-notes.js can't find notes_quartz

`build-notes.js` resolves `../notes_quartz` from its own directory
(`port_v2/`). if you've moved port_v2 or notes_quartz, edit
`NOTES_QUARTZ` in the script.

### content didn't update after edit

did you run `node build-notes.js`? the wiki edits don't propagate to
`port_v2/notes/` until you rebuild. obsidian + quartz dev server gives
you instant feedback in dev — the staged copy is build-time only.

## adding a CI step (later, optional)

if running `build-notes.js` manually before every push gets old, add
a github actions workflow that:

1. clones both repos (port + notes_quartz)
2. runs `node build-notes.js`
3. commits the diff to port and pushes

draft is at `documentation/notes/ci-deploy-draft.md` once you decide
to set it up. for solo + low-frequency posting, manual is fine.
