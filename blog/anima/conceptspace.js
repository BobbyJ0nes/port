/* =====================================================================
   conceptspace.js — Figure 1.0 · the interpolation between two texts.
   Two source texts as anchor points in a (projected) high-dimensional
   meaning space. Drag the reader along the line — the model doesn't fetch
   either text, it reads off the point in between: a third idea that belonged
   to neither. Dimensionality, becoming abstraction. Illustrative.
   ===================================================================== */

import { svgEl, el, rng, clamp, lerp } from './util.js';

export function mountConceptSpace(mount) {
  const wrap = el('div', { class: 'cspace' }, mount);
  const svg = svgEl('svg', { class: 'cspace__svg', viewBox: '0 0 460 250',
    role: 'img', 'aria-label': 'two source texts as points in meaning space with a draggable reader between them' }, wrap);

  const A = { x: 92, y: 130, name: 'Faust', sub: 'Goethe' };
  const B = { x: 368, y: 120, name: 'Jung', sub: 'Collected Works' };

  // ── faint constellation: "the space has many dimensions" ────────────
  const field = svgEl('g', { class: 'cspace__field', 'aria-hidden': 'true' }, svg);
  const r = rng(2718);
  for (let i = 0; i < 70; i++) {
    const x = 24 + r() * 412, y = 24 + r() * 202;
    const d = Math.min(Math.hypot(x - A.x, y - A.y), Math.hypot(x - B.x, y - B.y));
    const c = svgEl('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (0.6 + r() * 1.6).toFixed(2) }, field);
    c.style.fill = 'var(--ink-faint)';
    c.style.opacity = (clamp(0.05 + (120 - d) / 260, 0.04, 0.32)).toFixed(2);
  }

  // ── the connecting axis ─────────────────────────────────────────────
  const axis = svgEl('line', { x1: A.x, y1: A.y, x2: B.x, y2: B.y, class: 'cspace__axis' }, svg);
  axis.style.stroke = 'var(--rule)';

  // ── anchors ─────────────────────────────────────────────────────────
  function anchor(P, color) {
    const g = svgEl('g', {}, svg);
    const halo = svgEl('circle', { cx: P.x, cy: P.y, r: 13, class: 'cspace__halo' }, g);
    halo.style.fill = color; halo.style.opacity = '0.14';
    const c = svgEl('circle', { cx: P.x, cy: P.y, r: 6.5, class: 'cspace__anchor' }, g);
    c.style.fill = color;
    const tx = svgEl('text', { x: P.x, y: P.y - 22, class: 'cspace__name', 'text-anchor': 'middle' }, g, P.name);
    svgEl('text', { x: P.x, y: P.y - 22 + 13, class: 'cspace__sub', 'text-anchor': 'middle' }, g, P.sub);
    return c;
  }
  anchor(A, 'var(--accent)');
  anchor(B, 'var(--accent-2)');

  // ── the draggable reader ────────────────────────────────────────────
  let t = 0.5;
  const handleG = svgEl('g', { class: 'cspace__reader', tabindex: '0',
    'aria-label': 'reader position between the two texts — drag to interpolate' }, svg);
  const ring = svgEl('circle', { r: 11, class: 'cspace__reader-ring' }, handleG);
  const core = svgEl('circle', { r: 5, class: 'cspace__reader-core' }, handleG);

  // ── readout card ────────────────────────────────────────────────────
  const card = el('div', { class: 'cspace__card' }, wrap);

  const IDEAS = [
    { lo: 0.00, hi: 0.14, title: 'Faust', body: 'the restless will — to strive, to overreach, to bargain away the self for more world.' },
    { lo: 0.14, hi: 0.40, title: 'mostly Faust', body: 'striving read as a symptom: the ambition that will not rest is already reaching for something it cannot name.' },
    { lo: 0.40, hi: 0.60, title: 'neither, exactly', body: 'the pact as individuation — the bargain a psyche strikes with its own shadow in order to become whole. an idea that lived in neither text alone.' },
    { lo: 0.60, hi: 0.86, title: 'mostly Jung', body: 'the drive to overreach reframed as the unlived life pressing up from below — the shadow, asking to be met.' },
    { lo: 0.86, hi: 1.01, title: 'Jung', body: 'the unconscious and the shadow — what is disowned returns, wearing the mask of fate.' },
  ];

  function ideaFor(tt) {
    return IDEAS.find(d => tt >= d.lo && tt < d.hi) || IDEAS[IDEAS.length - 1];
  }

  function place() {
    const x = lerp(A.x, B.x, t), y = lerp(A.y, B.y, t);
    ring.setAttribute('cx', x); ring.setAttribute('cy', y);
    core.setAttribute('cx', x); core.setAttribute('cy', y);
    const mix = t < 0.5
      ? `var(--accent)` : `var(--accent-2)`;
    core.style.fill = mix;
    const idea = ideaFor(t);
    const fp = Math.round((1 - t) * 100), jp = 100 - fp;
    card.innerHTML =
      `<p class="cspace__ratio"><span class="cspace__chip cspace__chip--a">${fp}% faust</span>` +
      `<span class="cspace__chip cspace__chip--b">${jp}% jung</span></p>` +
      `<p class="cspace__idea-title">${idea.title}</p>` +
      `<p class="cspace__idea-body">${idea.body}</p>`;
  }

  // ── drag ────────────────────────────────────────────────────────────
  const SZ = 460;
  function setFromEvent(ev) {
    const rect = svg.getBoundingClientRect();
    const scale = SZ / rect.width;
    const mx = (ev.clientX - rect.left) * scale;
    const my = (ev.clientY - rect.top) * (250 / rect.height);
    // project (mx,my) onto segment AB
    const abx = B.x - A.x, aby = B.y - A.y;
    const len2 = abx * abx + aby * aby;
    t = clamp(((mx - A.x) * abx + (my - A.y) * aby) / len2, 0, 1);
    place();
  }
  let dragging = false;
  svg.addEventListener('pointerdown', (e) => { dragging = true; svg.setPointerCapture?.(e.pointerId); setFromEvent(e); });
  svg.addEventListener('pointermove', (e) => { if (dragging) setFromEvent(e); });
  svg.addEventListener('pointerup', () => { dragging = false; });
  svg.addEventListener('pointercancel', () => { dragging = false; });
  handleG.addEventListener('keydown', (e) => {
    let used = true;
    if (e.key === 'ArrowLeft') t = clamp(t - 0.05, 0, 1);
    else if (e.key === 'ArrowRight') t = clamp(t + 0.05, 0, 1);
    else used = false;
    if (used) { e.preventDefault(); place(); }
  });

  place();
}
