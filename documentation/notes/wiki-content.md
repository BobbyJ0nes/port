# wiki content (notes)

the wiki content lives in `../notes_quartz/content/`. that path is a
sibling directory to `port_v2/`, **not** part of this repo. wiki edits
happen there; the build script ships the rendered output into
`port_v2/notes/`.

## the workflow

```
edit ../notes_quartz/content/<file>.md
            │
            │  node build-notes.js
            ▼
generates ../notes_quartz/public/         (Quartz output)
            │
            │  copied
            ▼
              port_v2/notes/              (committed, deployed)
```

three modes:

- **quick edit** — edit a markdown file, run `node build-notes.js` from
  port_v2, refresh the browser.
- **heavy editing** — run `npx quartz build --serve --port 5187` in
  notes_quartz for hot reload while you write. when you're done, run
  `node build-notes.js` to commit the staged copy.
- **just reading** — open `notes_quartz/content/` in obsidian. it's a
  vault. the published structure is identical to what you see there.

## adding a new note

1. drop a markdown file into `../notes_quartz/content/animus/<name>.md`
   (or under `<your-section>/<name>.md` for a new section).
2. add frontmatter at the top:

   ```markdown
   ---
   title: <Your Title>
   date: 2026-01-12
   ---
   ```

   `date` should be the **completion** date (when the writing was done),
   not the file mtime. it shows up in the folder listing and inside
   popovers — getting it right matters.

3. body in plain markdown. obsidian wikilinks `[[Other Note]]` work and
   resolve to the matching file in the vault.

4. if the note references a research paper, drop the PDF in
   `../notes_quartz/content/papers/` and link it explicitly:

   ```markdown
   [LIWC paper](/papers/LIWC_CM_Methods.pdf)
   ```

5. run `node build-notes.js` from port_v2.

## frontmatter cheat sheet

- `title` — page title, also used for OG metadata.
- `date` — completion date, ISO format `YYYY-MM-DD`.
- `tags` — list, e.g. `[methodology, animus]`. shown in the page meta.
- `draft: true` — exclude from the build (use for in-progress drafts
  you don't want published yet).

## links from articles into the wiki

each article links into the wiki via `/notes/<section>/<slug>` paths.
slugs are auto-derived from filenames by Quartz:

- spaces become single dashes (`Some File` → `Some-File`)
- characters like ` - ` become triple-dashes
  (`ANIMUS - BASAIRA Reflections.md` → `ANIMUS---BASAIRA-Reflections`)

if you rename a file, **find every cross-link in the articles** and
update them. they're tagged with `WIKI-LINK` HTML comments so they're
easy to grep. the build script does **not** rewrite article links —
that's manual on rename.

## back-link from the wiki to the article

every wiki page under `animus/` shows `← back to the article.` in the
masthead. that link is hardcoded to `/blog/animus/` in
`../notes_quartz/quartz/components/PageTitle.tsx`.

if you add a second article with its own vault subfolder, edit
`PageTitle.tsx`:

```tsx
const slug = fileData.slug ?? ""
if (slug.startsWith("animus/")) backHref = "/blog/animus/"
else if (slug.startsWith("kai/")) backHref = "/blog/kai/"
// …
```

## what NOT to put in the vault

- secrets, credentials, drafts you don't want crawled — Quartz publishes
  everything by default. use `draft: true` frontmatter or move the file
  out of `content/` while it's in flight.
- huge media files. PDFs <10MB are fine. video should live elsewhere
  (or as a `<video src>` pointing at a CDN).

## obsidian features that DO work in the published wiki

- `[[wikilinks]]` — resolve to the corresponding page.
- `![[images]]` — embed images from the vault. drop the file in the
  same folder or in `attachments/`.
- `> blockquote` — renders normally.
- callouts (`> [!note]` etc.) — Quartz supports these.
- frontmatter — `title`, `date`, `tags`, `draft`.
- internal anchor links (`[[Note#heading]]`).

## obsidian features that DON'T work

- dataview, templater, and other plugins — those are obsidian-only.
- canvas files (`.canvas`) — not rendered.
- some markdown extensions (e.g. footnotes) work; some don't. when in
  doubt, build and check.

## the cost of changing wiki content

wiki edits are **build-time**. nothing is reactive. if you edit a note
and don't run `build-notes.js`, the live site shows the old content.
the deploy workflow ([`build-and-deploy.md`](build-and-deploy.md)) puts
this in the deploy script so you can't forget.
