# dark chocolate digestive — short film in a reactive viewer

> _artifact:_ `/projects/chclt/` (shared viewer at `/projects/_viewer/`)

## intent
A short landscape film — a boxed bit of cake on a bright red table, a
chess game under restaurant lamps, a walk past strings of festoon
lights. Presented in the same minimal viewer as `archv_tgzt`: the
chrome fades, the page wash re-tints itself to match the current
frame, and there is nothing else on the screen.

## the viewer
Shared with `archv_tgzt`. See
[`archv_tgzt.md`](./archv_tgzt.md) for the full mechanic (play/pause,
scrub, volume, idle fade, colour sampling, keyboard shortcuts,
`localStorage`-backed volume).

The main difference for this piece is orientation: the source was shot
landscape, so the viewer falls into its default `landscape` layout
without the portrait `max-width` clamp.

## transcode notes
```
ffmpeg -i dark_chclt_dgstv.mp4 \
  -vf scale=-2:720 \
  -c:v libx264 -profile:v main -level 4.0 -preset slow -crf 25 \
  -pix_fmt yuv420p \
  -c:a aac -b:a 112k \
  -movflags +faststart \
  dark_chclt_dgstv.mp4
```
122 MB → 37 MB, preserving the dim interior scenes at a reasonable
quality. CRF is one step tighter than `archv_tgzt` because the clip
has less high-frequency detail (no sparkles) and compresses more
kindly.

## accessibility notes
- captions / transcript are not included yet — **open item**. The
  clip has ambient audio (speech in the final outdoor scene).
- same minimal controls and keyboard shortcuts as `archv_tgzt`.
- page respects `prefers-reduced-motion`.

## on tools
`ffmpeg` on a vps for the transcode. the viewer module is shared, so
this project is effectively one HTML file pointing at the shared
stylesheet and script.
