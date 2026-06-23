/* =====================================================================
   signature.js — Figure 4.0 · same iq, different shape.
   The temperaments the entry sketches, drawn as polygons on shared axes.
   The enclosed area is held roughly constant; only the *shape* moves.
   Hover a model (polygon or legend) to read its silhouette. Illustrative —
   a sketch of a claim, not a benchmark. Reuses the shared #radar-tooltip.
   ===================================================================== */

import { svgEl, el, escapeHtml } from './util.js';

const AXES = ['conversational', 'systematic', 'multi-modal', 'measured', 'expressive'];

const MODELS = [
  { id: 'gpt', name: 'ChatGPT', stroke: 'var(--accent-3)',
    vals: [92, 58, 70, 46, 82],
    character: 'broad market share — conversational, general, ego-encouraging.' },
  { id: 'claude', name: 'Claude', stroke: 'var(--accent)',
    vals: [64, 92, 55, 88, 56],
    character: 'geared to coding and systematic thinking — measured, careful with the downside.' },
  { id: 'gemini', name: 'Gemini', stroke: 'var(--accent-2)',
    vals: [72, 70, 95, 64, 66],
    character: 'multi-modal by default — a good go-to model for everything.' },
];

export function mountSignature(mount) {
  const wrap = el('div', { class: 'sig' }, mount);
  const svg = svgEl('svg', { class: 'sig__svg', viewBox: '0 0 360 360',
    preserveAspectRatio: 'xMidYMid meet', role: 'img',
    'aria-label': 'radar comparing three model temperaments across five axes' }, wrap);
  const legend = el('div', { class: 'sig__legend' }, wrap);
  const tooltip = document.getElementById('radar-tooltip');

  const N = AXES.length, cx = 180, cy = 184, maxR = 116;
  const pt = (i, v) => {
    const th = -Math.PI / 2 + (2 * Math.PI * i) / N;
    const r = maxR * (v / 100);
    return [cx + r * Math.cos(th), cy + r * Math.sin(th)];
  };

  // rings
  const ringsG = svgEl('g', { 'aria-hidden': 'true' }, svg);
  [25, 50, 75, 100].forEach(rv => {
    const pts = AXES.map((_, i) => pt(i, rv).map(n => n.toFixed(1)).join(',')).join(' ');
    const poly = svgEl('polygon', { points: pts, fill: 'none', class: 'radar__ring',
      'stroke-dasharray': rv === 100 ? null : '2 3', 'stroke-width': rv === 100 ? 1.4 : 1 }, ringsG);
  });
  // axes + labels
  AXES.forEach((ax, i) => {
    const [x, y] = pt(i, 100);
    svgEl('line', { x1: cx, y1: cy, x2: x.toFixed(1), y2: y.toFixed(1), class: 'radar__axis-line', 'stroke-width': 1 }, ringsG);
    const [lx, ly] = pt(i, 122);
    const th = -Math.PI / 2 + (2 * Math.PI * i) / N;
    let anchor = 'middle';
    if (Math.cos(th) > 0.3) anchor = 'start';
    if (Math.cos(th) < -0.3) anchor = 'end';
    let dy = 0; if (Math.sin(th) < -0.6) dy = -4; else if (Math.sin(th) > 0.6) dy = 11; else dy = 4;
    svgEl('text', { x: lx.toFixed(1), y: (ly + dy).toFixed(1), 'text-anchor': anchor,
      class: 'sig__axislabel radar__axis-label' }, svg, ax);
  });

  // polygons
  const groups = [];
  MODELS.forEach((m) => {
    const g = svgEl('g', { class: 'sig__poly radar__poly', 'data-id': m.id, tabindex: '0',
      'aria-label': `${m.name}: ${AXES.map((a, i) => `${a} ${m.vals[i]}`).join(', ')}` }, svg);
    const pts = m.vals.map((v, i) => pt(i, v).map(n => n.toFixed(1)).join(',')).join(' ');
    const fill = svgEl('polygon', { points: pts, class: 'radar__poly-fill', stroke: 'none', 'fill-opacity': 0.10 }, g);
    fill.style.fill = m.stroke;
    const stroke = svgEl('polygon', { points: pts, class: 'radar__poly-stroke', fill: 'none',
      'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    stroke.style.stroke = m.stroke;
    m.vals.forEach((v, i) => {
      const [x, y] = pt(i, v);
      const c = svgEl('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 3, class: 'radar__vertex' }, g);
      c.style.fill = m.stroke; c.style.stroke = 'var(--bg-hard)';
    });
    groups.push({ g, m });
  });

  // interactions
  function setHover(id) {
    groups.forEach(({ g, m }) => {
      g.classList.toggle('is-hover', m.id === id);
      g.classList.toggle('is-dim', id != null && m.id !== id);
    });
    legend.querySelectorAll('.sig__legend-item').forEach(it =>
      it.classList.toggle('is-active', it.dataset.id === id));
  }
  function showTip(m, ev) {
    if (!tooltip) return;
    const scores = AXES.map((a, i) => `<dt>${a}</dt><dd>${m.vals[i]}</dd>`).join('');
    tooltip.innerHTML =
      `<p class="radar__tt-name"><span class="radar__tt-swatch" style="background:${m.stroke}"></span>${escapeHtml(m.name)}</p>` +
      `<dl class="radar__tt-scores">${scores}</dl>` +
      `<p class="radar__tt-character">${escapeHtml(m.character)}</p>`;
    tooltip.dataset.visible = 'true';
    moveTip(ev);
  }
  function moveTip(ev) {
    if (!tooltip) return;
    const r = tooltip.getBoundingClientRect(), mgn = 14;
    let left = ev.clientX + 14, top = ev.clientY + 14;
    if (left + r.width + mgn > innerWidth) left = ev.clientX - r.width - 14;
    if (top + r.height + mgn > innerHeight) top = ev.clientY - r.height - 14;
    tooltip.style.left = `${Math.max(mgn, left)}px`;
    tooltip.style.top = `${Math.max(mgn, top)}px`;
  }
  function hideTip() { if (tooltip) tooltip.dataset.visible = 'false'; }

  groups.forEach(({ g, m }) => {
    g.addEventListener('mouseenter', (e) => { setHover(m.id); showTip(m, e); });
    g.addEventListener('mousemove', moveTip);
    g.addEventListener('mouseleave', () => { setHover(null); hideTip(); });
    g.addEventListener('focus', () => { setHover(m.id); });
    g.addEventListener('blur', () => { setHover(null); hideTip(); });
  });

  // legend
  MODELS.forEach((m) => {
    const item = el('button', { class: 'sig__legend-item', type: 'button', 'data-id': m.id }, legend);
    const sw = el('span', { class: 'sig__legend-sw' }, item);
    sw.style.background = m.stroke;
    el('span', { class: 'sig__legend-name', text: m.name }, item);
    el('span', { class: 'sig__legend-char', text: m.character }, item);
    item.addEventListener('mouseenter', () => setHover(m.id));
    item.addEventListener('mouseleave', () => setHover(null));
    item.addEventListener('focus', () => setHover(m.id));
    item.addEventListener('blur', () => setHover(null));
  });
}
