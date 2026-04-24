# archv_tgzt — short film in a reactive viewer

> _artifact:_ `/projects/archv/` (shared viewer at `/projects/_viewer/`)

## intent
A short portrait-orientation film presented in the smallest chrome a web
viewer can justify: one back link, one title, one row of playback
controls. The page itself breathes — its wash colour is pulled from the
current frame, so the whole window takes on the mood of what's being
shown.

## the viewer (shared)
Both video projects run on one small shared module:
`/projects/_viewer/viewer.css` + `/projects/_viewer/viewer.js`.

- **minimal chrome.** play/pause, a hair-thin scrub with a dot thumb
  that only appears on hover, volume slider, `m:ss / m:ss` time.
- **reactive background.** an offscreen 24×24 canvas samples the
  current frame about five times a second, averages RGB, darkens the
  result (`× 0.32`) and pipes it into the page's `--v-bg-tint` custom
  property. a 600 ms transition smooths out the changes so bright cuts
  don't flash the window.
- **keyboard.** `space` / `k` toggles play, `←`/`→` seeks ±5 s, `↑`/`↓`
  adjusts volume by 10 %, `m` toggles mute. the scrub bar is itself
  a focusable `role="slider"` with arrow-key seek.
- **idle.** chrome fades after 2.5 s of no input during playback;
  re-appears on any pointer move or keypress.
- **volume persistence.** stored in `localStorage` under
  `basaira-viewer-volume` so the user's choice survives across pieces.

## orientation
The source `.mov` was shot on a phone and carries `rotation=90` in its
display matrix — Safari honours it, Chromium is inconsistent, Firefox
has changed its mind across versions. To keep playback identical
across browsers the rotation is baked in during transcode.

The clip mixes portrait- and landscape-held shots. The bulk of the
footage (the coastline, the beach, the town) was filmed landscape, so
the final transcode is a 1280 × 720 landscape file with a 90° CW
rotation applied on top of ffmpeg's auto-rotation (`transpose=1`). The
strictly portrait-held openings read sideways inside the landscape
frame — this is the source, preserved.

## transcode notes
```
ffmpeg -i archv_tgzt.mov \
  -vf "transpose=1,scale=-2:720" \
  -c:v libx264 -profile:v main -level 4.0 -preset slow -crf 26 \
  -pix_fmt yuv420p \
  -c:a aac -b:a 112k \
  -map 0:v:0 -map 0:a:0 \
  -movflags +faststart \
  archv_tgzt.mp4
```
541 MB → 42 MB. `-movflags +faststart` moves the moov atom to the
start of the file so playback begins before the whole download
finishes. `transpose=1` rotates the already-auto-rotated portrait
decode 90° clockwise so the dominant landscape content reads the
right way up in every browser.

## on tools
`ffmpeg` on a vps for the transcode and frame extraction. the viewer
was written by hand after sketching the bits on paper (scrub geometry,
sample cadence, idle timer). pi was used to sanity-check the
`getImageData`-to-average-rgb pattern and the rotation-metadata fix.

## references
- MDN (2024) _HTMLVideoElement._
  https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement
- MDN (2024) _CanvasRenderingContext2D.drawImage()_ (video source).
  https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
- FFmpeg (2024) _auto-rotation._
  https://trac.ffmpeg.org/wiki/How%20to%20fix%20no%20audio%20or%20wrong%20rotation%20in%20video
