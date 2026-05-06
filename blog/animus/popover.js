/* =====================================================================
   ANIMUS · same-origin popover for wiki-links, with nested layers.
   Mimics Quartz's hover-popover for links to the wiki, mounted at /notes/
   on the same origin (bobbyjones.xyz/notes/, or localhost in dev).

   Skips links with target="_blank" or data-no-popover (the "go deeper"
   anchor + the intro-meta vault link open in a new tab; no preview).

   Multi-depth: hovering a wiki-link inside an open popover spawns a
   second popover offset diagonally; same chain works recursively up to
   MAX_DEPTH. Each layer is its own .wiki-popover element with a
   data-depth attribute.

   Caches fetched pages in-memory.
   ===================================================================== */

// Any link whose pathname starts with /notes/ on the same origin is a wiki link.
const WIKI_PATH_PREFIX = "/notes/"
const HOVER_DELAY_MS = 200
const CLOSE_DELAY_MS = 220
const NEST_OFFSET_PX = 24
const MAX_DEPTH = 3

/** @type {Map<string, Promise<DocumentFragment | null>>} */
const cache = new Map()

/** @type {Array<{ el: HTMLElement, anchor: HTMLAnchorElement | null, closeTimer: number | null, openTimer: number | null }>} */
const stack = []

function isWikiLink(a) {
  if (!(a instanceof HTMLAnchorElement)) return false
  if (a.target === "_blank") return false
  if (a.dataset.noPopover === "true") return false
  try {
    const u = new URL(a.href, window.location.href)
    // Same-origin, /notes/... path.
    return u.origin === window.location.origin && u.pathname.startsWith(WIKI_PATH_PREFIX)
  } catch {
    return false
  }
}

async function fetchAndExtract(href) {
  if (cache.has(href)) return cache.get(href)
  const promise = (async () => {
    try {
      // Same-origin fetch — no CORS dance needed.
      const res = await fetch(href, { credentials: "same-origin" })
      if (!res.ok) return null
      const text = await res.text()
      const doc = new DOMParser().parseFromString(text, "text/html")
      // Quartz wraps body content in <article class="popover-hint"> and the
      // breadcrumb/title/meta strip in <div class="popover-hint">. Keep
      // the article element only — drop the meta div.
      const hints = [...doc.getElementsByClassName("popover-hint")]
      const article = hints.find((el) => el.tagName === "ARTICLE")
      const fragment = document.createDocumentFragment()
      const root = article ?? hints.find((el) => el.tagName !== "DIV")
      if (root) {
        // Resolve relative links/images to absolute against the source URL.
        const base = new URL(href)
        root.querySelectorAll("a[href]").forEach((el) => {
          try {
            el.href = new URL(el.getAttribute("href"), base).toString()
          } catch {}
        })
        root.querySelectorAll("img[src]").forEach((el) => {
          try {
            el.src = new URL(el.getAttribute("src"), base).toString()
          } catch {}
        })
        // Strip ids inside the popover so they don't collide with article ids.
        root.querySelectorAll("[id]").forEach((el) => {
          el.id = `wiki-popover-${el.id}`
        })
        fragment.appendChild(root)
      }
      return fragment
    } catch (err) {
      console.warn("[wiki-popover] fetch failed for", href, err)
      return null
    }
  })()
  cache.set(href, promise)
  return promise
}

function getOrCreateLayer(depth) {
  if (stack[depth]) return stack[depth]
  const el = document.createElement("div")
  el.className = "wiki-popover"
  el.id = `wiki-popover-l${depth}`
  el.dataset.depth = String(depth)
  el.dataset.visible = "false"
  el.setAttribute("role", "tooltip")
  el.style.zIndex = String(100 + depth * 10)
  document.body.appendChild(el)

  const layer = { el, anchor: null, closeTimer: null, openTimer: null }
  stack[depth] = layer

  // Hovering a popover keeps it (and all its parents) alive.
  el.addEventListener("mouseenter", () => {
    for (let d = 0; d <= depth; d++) cancelClose(d)
  })
  el.addEventListener("mouseleave", () => {
    scheduleClose(depth)
  })
  return layer
}

function cancelClose(depth) {
  const layer = stack[depth]
  if (!layer) return
  if (layer.closeTimer != null) {
    clearTimeout(layer.closeTimer)
    layer.closeTimer = null
  }
}

function cancelCloseAll() {
  for (let d = 0; d < stack.length; d++) cancelClose(d)
}

function closeFrom(depth) {
  for (let d = stack.length - 1; d >= depth; d--) {
    const layer = stack[d]
    if (!layer) continue
    cancelClose(d)
    layer.el.dataset.visible = "false"
    layer.el.innerHTML = ""
    layer.anchor = null
  }
}

function scheduleClose(depth) {
  cancelClose(depth)
  const layer = stack[depth]
  if (!layer) return
  layer.closeTimer = setTimeout(() => {
    // Close this layer and any deeper layers.
    closeFrom(depth)
  }, CLOSE_DELAY_MS)
}

function positionPopover(el, anchor, depth) {
  const rect = anchor.getBoundingClientRect()
  const margin = 12
  const vw = window.innerWidth
  const vh = window.innerHeight

  // Force a layout pass to measure intrinsic dimensions.
  el.style.left = "0px"
  el.style.top = "0px"
  el.style.maxHeight = `${Math.min(vh - margin * 2, 416)}px`
  const pw = el.offsetWidth
  const ph = el.offsetHeight

  // Prefer below the link; flip above if no room.
  let top = rect.bottom + 8
  if (top + ph > vh - margin) {
    const above = rect.top - 8 - ph
    if (above >= margin) top = above
    else top = Math.max(margin, vh - ph - margin)
  }

  // Align left edge with the link, but keep within viewport.
  let left = rect.left
  // Nested layers nudge diagonally so they don't fully cover the parent.
  if (depth > 0) {
    left += NEST_OFFSET_PX
    top += NEST_OFFSET_PX * 0.4
  }
  if (left + pw > vw - margin) left = vw - pw - margin
  if (left < margin) left = margin
  if (top + ph > vh - margin) top = vh - ph - margin
  if (top < margin) top = margin

  el.style.left = `${Math.round(left)}px`
  el.style.top = `${Math.round(top)}px`
}

function isPdfHref(href) {
  try {
    const u = new URL(href, window.location.href)
    return u.pathname.toLowerCase().endsWith(".pdf")
  } catch {
    return false
  }
}

async function showPopoverFor(anchor, depth) {
  if (depth >= MAX_DEPTH) return
  // Cursor's just landed on a new anchor — cancel any pending closes
  // up to and including this depth, and tear down anything deeper.
  for (let d = 0; d <= depth; d++) cancelClose(d)
  closeFrom(depth + 1)

  const layer = getOrCreateLayer(depth)
  layer.anchor = anchor
  layer.el.dataset.visible = "true"
  layer.el.classList.toggle("wiki-popover--pdf", isPdfHref(anchor.href))
  layer.el.innerHTML = '<div class="wiki-popover__loading">loading…</div>'
  positionPopover(layer.el, anchor, depth)

  // PDFs: render an iframe instead of fetching/parsing HTML.
  if (isPdfHref(anchor.href)) {
    if (layer.anchor !== anchor) return
    layer.el.innerHTML = ""
    const iframe = document.createElement("iframe")
    iframe.src = anchor.href
    iframe.title = anchor.textContent || anchor.href
    layer.el.appendChild(iframe)
    positionPopover(layer.el, anchor, depth)
    return
  }

  const fragment = await fetchAndExtract(anchor.href)
  // If the cursor moved to a different link before the fetch resolved,
  // bail — a newer call will have taken over.
  if (layer.anchor !== anchor) return

  layer.el.innerHTML = ""
  if (fragment && fragment.childNodes.length > 0) {
    layer.el.appendChild(fragment)
    // Wire up child wiki-links inside this popover for the next depth.
    wireLinksInside(layer.el, depth + 1)
  } else {
    layer.el.innerHTML = '<div class="wiki-popover__error">could not load preview.</div>'
  }
  positionPopover(layer.el, anchor, depth)
}

function wireAnchor(anchor, depth) {
  if (depth >= MAX_DEPTH) return
  if (anchor.dataset.wikiPopoverWired === "true") return
  anchor.dataset.wikiPopoverWired = "true"
  let openTimer = null

  anchor.addEventListener("mouseenter", () => {
    // Hovering an anchor keeps every parent layer alive.
    for (let d = 0; d < depth; d++) cancelClose(d)
    if (openTimer) clearTimeout(openTimer)
    openTimer = setTimeout(() => {
      showPopoverFor(anchor, depth)
      openTimer = null
    }, HOVER_DELAY_MS)
  })
  anchor.addEventListener("mouseleave", () => {
    if (openTimer) {
      clearTimeout(openTimer)
      openTimer = null
    }
    // Closing logic: leaving an anchor schedules close at THIS depth.
    // If the popover at this depth is already showing, scheduleClose
    // will give the cursor a beat to land on it. If the cursor moves
    // up the chain to a parent popover, the parent's mouseenter will
    // cancel the close.
    scheduleClose(depth)
  })
}

function wireLinksInside(container, depth) {
  if (depth >= MAX_DEPTH) return
  container.querySelectorAll("a[href]").forEach((a) => {
    if (!isWikiLink(a)) return
    wireAnchor(a, depth)
  })
}

function wireUp() {
  // Wire all top-level wiki-links in the article body at depth 0.
  document.querySelectorAll("a[href]").forEach((a) => {
    if (!isWikiLink(a)) return
    wireAnchor(a, 0)
  })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", wireUp)
} else {
  wireUp()
}
