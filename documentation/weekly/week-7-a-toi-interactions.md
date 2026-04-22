# week 7 · à toi — events + pointer interaction

> _syllabus topic:_ event model, DOM interaction, event types, designing
> with friction.

> _artifact:_ `/projects/a_toi/`

## intent
a single looped video of a rose, framed by an ascii "field" that reacts
to the pointer. the page has only one control: drag anywhere to rotate
the field; stop dragging and it resumes its own slow auto-rotation
after three seconds. the title, _à toi_ ("to you"), is given.

the week's secondary prompt — _designing with friction_ — is inverted
here into designing with _patience_: the interaction is not immediate
feedback, it's a conversation where the page waits, then drifts back.

## mechanic
- **three pointer events** wire up the interaction:
  - `pointerdown` → start dragging, cancel auto-rotate timer,
    capture `lastX`.
  - `pointermove` (on `window`) → accumulate `targetRotY += (e.clientX - lastX) * 0.008`.
  - `pointerup` → end dragging, schedule a 3-second `setTimeout` that
    re-enables `autoRotate` if no new drag has happened.
- **smoothing:** `currentRotY += (targetRotY - currentRotY) * 0.06` every
  frame — a simple low-pass filter so drags feel weighty, not twitchy.
- **ascii field render:** a `for y, x` nested loop fills a
  `cols × rows` grid, sampling four noise terms
  (`sin(nx*3 + t*0.8 + rotY*2)`, etc.) that all depend on `rotY`, so
  the user's drag actually warps the field.
- **rendering target:** a `<div id="ascii">` with `white-space: pre`
  and `font-family: 'Courier New'` — no canvas needed. the text itself
  is the animation.

## build log
- **v1** — field rendered statically with one sin wave → pretty, dead.
- **v2** — added time as a second input → alive but uniform.
- **v3** — introduced `rotY` as a third input, wired to autoplay only →
  the field drifts.
- **v4** — swapped autoplay for pointer events; added the debouncing
  `setTimeout` so the page resumes on its own.
- **v5** — tuned `0.008` drag sensitivity and `0.06` smoothing until
  it felt like turning a record rather than a knob.

## screenshots
> _to add before submission:_
> - `screens/atoi-still.png` — the framed video with the ascii field at rest.
> - `screens/atoi-dragged.png` — the field mid-rotation.

## accessibility notes
- pointer events cover mouse / touch / pen in a single api — the
  interaction works identically on all three.
- **known issue:** `user-scalable=no` is set in the `<meta viewport>`,
  which disables pinch-zoom. violates WCAG 1.4.4 (resize text). the
  fix (tracked in `accessibility.md`) is to remove `user-scalable=no`
  and recompute the grid on `visualViewport` resize.
- there is no keyboard equivalent for the drag interaction — the field
  is decorative, so this is an acceptable exception, but a
  `left`/`right`-arrow keyboard nudge would be a small, correct addition.
- the video carries no audio; no captioning required.
- contrast between the ascii field (`#00ff41` at `opacity: 0.3`) on the
  `#050505` background is deliberately low — the text is decoration, not
  content, and the only text that is content (`à toi`, `Cormorant Garamond`
  italic, 45% white on near-black) measures 7.9:1 — passes AAA.

## ai disclaimer
pi was used to discuss the smoothing maths (the `current += (target - current) * k`
pattern) and to suggest `pointer*` events over `mouse*`/`touch*` pairs. the
creative decisions — palette, title, timing of the auto-rotate return,
the sepia filter — were mine. the narrative framing of the piece
(_à toi_) is also mine.

## references
- MDN (2024) _Pointer events._
  https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
- MDN (2024) _setTimeout._
  https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
- Freya Holmér (2020) _The Simple Yet Powerful Math We Don't Talk About
  (on lerp smoothing)._ https://www.youtube.com/watch?v=LSNQuFEDOyQ
