/* =====================================================================
   attention.js — Figure 3.0 · self-attention.
   The one mechanism the whole stack is built on. Hover a token; the arcs
   show how strongly it attends to every other token when deciding what it
   means here. "it" reaches back to "cat" — that reach is the architecture.
   Hand-authored weights (one head), drawn as arcs over an HTML token row.
   ===================================================================== */

import { svgEl, el, clamp } from './util.js';

const TOKENS = ['the', 'cat', 'sat', 'down', 'because', 'it', 'was', 'tired'];

// rows = query token, cols = key token. roughly row-normalised. one "head".
const ATT = [
  [0.55, 0.30, 0.05, 0.02, 0.02, 0.02, 0.02, 0.02], // the
  [0.18, 0.34, 0.30, 0.06, 0.03, 0.03, 0.03, 0.03], // cat
  [0.06, 0.46, 0.22, 0.18, 0.03, 0.02, 0.02, 0.01], // sat
  [0.03, 0.16, 0.55, 0.18, 0.03, 0.02, 0.02, 0.01], // down
  [0.02, 0.10, 0.30, 0.06, 0.14, 0.06, 0.04, 0.28], // because
  [0.04, 0.78, 0.06, 0.01, 0.02, 0.05, 0.02, 0.02], // it  → cat (coreference)
  [0.02, 0.10, 0.06, 0.02, 0.06, 0.26, 0.10, 0.38], // was
  [0.02, 0.34, 0.06, 0.02, 0.18, 0.30, 0.04, 0.04], // tired
];

export function mountAttention(mount) {
  const wrap = el('div', { class: 'attn' }, mount);
  const stage = el('div', { class: 'attn__stage' }, wrap);
  const svg = svgEl('svg', { class: 'attn__svg', 'aria-hidden': 'true' }, stage);
  const row = el('div', { class: 'attn__row' }, stage);

  const chips = TOKENS.map((tok, i) => {
    const c = el('button', { class: 'attn__chip', type: 'button', text: tok,
      'data-i': String(i), 'aria-label': `token "${tok}" — show its attention` }, row);
    return c;
  });
  const note = el('p', { class: 'attn__note' }, wrap);

  let active = 5; // default: "it"

  function centers() {
    const sr = stage.getBoundingClientRect();
    return chips.map(c => {
      const r = c.getBoundingClientRect();
      return { x: r.left - sr.left + r.width / 2, top: r.top - sr.top, w: r.width };
    });
  }

  function draw(i) {
    const sr = stage.getBoundingClientRect();
    svg.setAttribute('width', sr.width);
    svg.setAttribute('height', sr.height);
    svg.setAttribute('viewBox', `0 0 ${sr.width} ${sr.height}`);
    svg.innerHTML = '';
    const ct = centers();
    if (!ct.length || i == null) return;

    const weights = ATT[i];
    const from = ct[i];
    const baseY = from.top - 4;

    // arcs to every token, strongest last (drawn on top)
    const order = weights.map((w, j) => ({ j, w })).sort((a, b) => a.w - b.w);
    for (const { j, w } of order) {
      if (j === i) continue;
      if (w < 0.04) continue;
      const to = ct[j];
      const x1 = from.x, x2 = to.x;
      const dist = Math.abs(x2 - x1);
      const lift = clamp(28 + dist * 0.42, 30, 120);
      const cx = (x1 + x2) / 2, cy = baseY - lift;
      const path = svgEl('path', { d: `M ${x1} ${baseY} Q ${cx} ${cy} ${x2} ${baseY}`,
        fill: 'none', class: 'attn__arc' }, svg);
      path.style.stroke = 'var(--accent)';
      path.style.strokeWidth = (0.8 + w * 6).toFixed(2);
      path.style.opacity = clamp(0.12 + w * 0.9, 0.12, 0.95).toFixed(2);
      // arrowhead-ish dot at the target
      const dot = svgEl('circle', { cx: x2, cy: baseY, r: (1.5 + w * 3).toFixed(2), class: 'attn__arcdot' }, svg);
      dot.style.fill = 'var(--accent)';
      dot.style.opacity = clamp(0.2 + w, 0.2, 1).toFixed(2);
    }

    // tint chips by incoming weight + mark the query
    chips.forEach((c, j) => {
      c.classList.toggle('is-query', j === i);
      const w = weights[j];
      c.style.setProperty('--att', j === i ? '0' : clamp(w, 0, 1).toFixed(3));
    });

    const top = weights.map((w, j) => ({ j, w })).filter(o => o.j !== i).sort((a, b) => b.w - a.w)[0];
    note.innerHTML = `<b>${TOKENS[i]}</b> attends most to <b class="attn__hl">${TOKENS[top.j]}</b> ` +
      `<span class="attn__pct">(${Math.round(top.w * 100)}%)</span> — the reach is the computation.`;
  }

  chips.forEach((c, i) => {
    c.addEventListener('mouseenter', () => { active = i; draw(i); });
    c.addEventListener('focus', () => { active = i; draw(i); });
    c.addEventListener('click', () => { active = i; draw(i); });
  });
  stage.addEventListener('mouseleave', () => draw(active));

  const ro = new ResizeObserver(() => draw(active));
  ro.observe(stage);

  // fonts can shift token widths after first paint — redraw once ready
  if (document.fonts?.ready) document.fonts.ready.then(() => draw(active));
  requestAnimationFrame(() => draw(active));
}
