/* =====================================================================
   anima.js — Figure 6.0 · the mirror.
   Jung's model of the psyche on the left, mirrored across a centre line
   against the layers the entry wants to build on the right. Surface at the
   top (persona / context), the inherited deep at the bottom (collective
   unconscious / subconscious). Hover a layer to draw the correspondence.
   Closes on the spaced reveal — A·N·I·M·A.
   ===================================================================== */

import { svgEl, el, reduceMotion } from './util.js';

const LAYERS = [
  { jung: 'Persona', jungSub: 'the mask shown outward',
    model: 'Context', modelSub: 'the prompt & frame it is given',
    gloss: 'the presented surface. for a person, the face turned to the world; for a model, the system prompt and context window — the layer everything else is read through.' },
  { jung: 'Ego', jungSub: 'the "I", centre of awareness',
    model: 'Self', modelSub: 'the identity the lab shapes',
    gloss: 'the sense of an "I". the entry’s note that Anthropic shapes "the representation it forms of self" lives here — an ego, trained.' },
  { jung: 'Personal unconscious', jungSub: 'lived, then forgotten',
    model: 'Memory', modelSub: 'seen, then stored',
    gloss: 'what was experienced and is not currently in mind, but can be recalled. for the model: memory — retrievable, not always surfaced.' },
  { jung: 'Collective unconscious', jungSub: 'the inherited, the archetypes',
    model: 'Subconscious', modelSub: 'the pre-trained weights beneath',
    gloss: 'the deepest layer — shared inheritance rather than personal history. for the model, the pre-trained substrate: the weights underneath, common to all of it. the level the entry wonders if we can "tweak".' },
];

export function mountAnima(mount) {
  const wrap = el('div', { class: 'anima' }, mount);

  const head = el('div', { class: 'anima__head' }, wrap);
  el('span', { class: 'anima__side anima__side--l', text: 'the psyche · jung' }, head);
  el('span', { class: 'anima__mirror-tag', text: 'mirror' }, head);
  el('span', { class: 'anima__side anima__side--r', text: 'the model' }, head);

  const VB_W = 460, rowH = 60, gap = 8, top = 12;
  const VB_H = top + LAYERS.length * (rowH + gap) + 8;
  const svg = svgEl('svg', { class: 'anima__svg', viewBox: `0 0 ${VB_W} ${VB_H}`,
    role: 'img', 'aria-label': 'Jung’s psyche mirrored against the proposed model layers' }, wrap);
  const midX = VB_W / 2;

  // mirror axis
  const axis = svgEl('line', { x1: midX, y1: 4, x2: midX, y2: VB_H - 4, class: 'anima__axis' }, svg);
  axis.style.stroke = 'var(--accent)';

  const rowsG = [];
  LAYERS.forEach((L, i) => {
    const y = top + i * (rowH + gap);
    const depth = i / (LAYERS.length - 1); // 0 surface → 1 deep
    const g = svgEl('g', { class: 'anima__row', 'data-i': String(i), tabindex: '0',
      'aria-label': `${L.jung} mirrors ${L.model}` }, svg);

    // left (psyche) + right (model) halves
    const lrect = svgEl('rect', { x: 22, y, width: midX - 22 - 10, height: rowH, rx: 5, class: 'anima__half anima__half--l' }, g);
    lrect.style.fill = 'var(--accent)';
    lrect.style.fillOpacity = (0.05 + depth * 0.07).toFixed(3);
    const rrect = svgEl('rect', { x: midX + 10, y, width: midX - 22 - 10, height: rowH, rx: 5, class: 'anima__half anima__half--r' }, g);
    rrect.style.fill = 'var(--accent-2)';
    rrect.style.fillOpacity = (0.05 + depth * 0.07).toFixed(3);

    // labels
    svgEl('text', { x: midX - 22, y: y + 26, 'text-anchor': 'end', class: 'anima__name' }, g, L.jung);
    svgEl('text', { x: midX - 22, y: y + 43, 'text-anchor': 'end', class: 'anima__sub' }, g, L.jungSub);
    svgEl('text', { x: midX + 22, y: y + 26, 'text-anchor': 'start', class: 'anima__name' }, g, L.model);
    svgEl('text', { x: midX + 22, y: y + 43, 'text-anchor': 'start', class: 'anima__sub' }, g, L.modelSub);

    // connector across the mirror (revealed on hover)
    const conn = svgEl('line', { x1: midX - 10, y1: y + rowH / 2, x2: midX + 10, y2: y + rowH / 2,
      class: 'anima__conn' }, g);
    conn.style.stroke = 'var(--accent)';

    rowsG.push(g);
  });

  // depth marker — single centred label in the left gutter
  const depthMidY = VB_H / 2;
  svgEl('text', { x: 13, y: depthMidY, class: 'anima__depth', 'text-anchor': 'middle',
    transform: `rotate(-90 13 ${depthMidY})` }, svg, 'surface → depth');

  // gloss panel
  const panel = el('div', { class: 'anima__panel' }, wrap);
  panel.innerHTML = '<p class="anima__panel-hint">hover a layer — the same level, read twice.</p>';

  function select(i) {
    const L = LAYERS[i];
    rowsG.forEach((g, j) => g.classList.toggle('is-hover', j === i));
    panel.innerHTML =
      `<p class="anima__pair"><span class="anima__pair-l">${L.jung}</span>` +
      `<span class="anima__pair-x">↔</span>` +
      `<span class="anima__pair-r">${L.model}</span></p>` +
      `<p class="anima__gloss">${L.gloss}</p>`;
  }
  function clear() {
    rowsG.forEach(g => g.classList.remove('is-hover'));
    panel.innerHTML = '<p class="anima__panel-hint">hover a layer — the same level, read twice.</p>';
  }
  rowsG.forEach((g, i) => {
    g.addEventListener('mouseenter', () => select(i));
    g.addEventListener('mouseleave', clear);
    g.addEventListener('focus', () => select(i));
    g.addEventListener('blur', clear);
  });

  // ── A·N·I·M·A reveal ────────────────────────────────────────────────
  const word = el('div', { class: 'anima__word', 'aria-label': 'A N I M A' }, wrap);
  'ANIMA'.split('').forEach((ch, i) => {
    const s = el('span', { class: 'anima__letter', text: ch }, word);
    s.style.transitionDelay = `${i * 90}ms`;
  });
  el('p', { class: 'anima__word-sub', text: 'the soul-image · the mirror inward' }, wrap);

  if (reduceMotion()) {
    word.classList.add('is-revealed');
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { word.classList.add('is-revealed'); io.disconnect(); } });
    }, { threshold: 0.5 });
    io.observe(word);
  }
}
