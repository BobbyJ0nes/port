/* =====================================================================
   naming.js — Figure 5.0 · the names, read as roots.
   The entry's own etymology, laid out as a small map. Opus the engine in
   the centre; the distillates (sonnet, haiku) compressed off to one side;
   the outputs it is built to write (mythos, fable) on the other. Hover a
   tile to follow it back to its root word and meaning.
   ===================================================================== */

import { el } from './util.js';

const NAMES = {
  opus:   { name: 'Opus',   root: 'Latin · opus', lit: 'a work; labour',
            gloss: 'to work, to labour — specifically toward a distinctly grand output. the engine.' },
  sonnet: { name: 'Sonnet', root: 'Italian · sonetto', lit: 'little song',
            gloss: 'a condensed, fixed poetic form. a distillate — a compressed representation of a concept.' },
  haiku:  { name: 'Haiku',  root: 'Japanese · 俳句', lit: 'short poem · 5–7–5',
            gloss: 'the smallest poetic vessel. compression, again — the concept boiled down.' },
  mythos: { name: 'Mythos', root: 'Greek · μῦθος', lit: 'story, tale — a touch of untruth',
            gloss: 'the story, with a touch of untruth in the original root. what Opus is built to write.' },
  fable:  { name: 'Fable',  root: 'Latin · fabula', lit: 'story, tale',
            gloss: 'the story again — the same touch of untruth. the grand output, named.' },
};

export function mountNaming(mount) {
  const wrap = el('div', { class: 'naming' }, mount);
  const map = el('div', { class: 'naming__map' }, wrap);

  // distillates column
  const colD = el('div', { class: 'naming__col' }, map);
  el('p', { class: 'naming__colhead', text: 'distillates' }, colD);
  tile(colD, 'sonnet'); tile(colD, 'haiku');

  // connector ← distilled
  el('div', { class: 'naming__link naming__link--left', html: '<span>distilled from</span>' }, map);

  // engine column
  const colE = el('div', { class: 'naming__col naming__col--engine' }, map);
  el('p', { class: 'naming__colhead', text: 'engine' }, colE);
  tile(colE, 'opus', true);

  // connector builds →
  el('div', { class: 'naming__link naming__link--right', html: '<span>built to write</span>' }, map);

  // outputs column
  const colO = el('div', { class: 'naming__col' }, map);
  el('p', { class: 'naming__colhead', text: 'the story' }, colO);
  tile(colO, 'mythos'); tile(colO, 'fable');

  // detail panel
  const panel = el('div', { class: 'naming__panel' }, wrap);

  const tiles = [...wrap.querySelectorAll('.naming__tile')];

  function tile(col, key, big) {
    const b = el('button', { class: 'naming__tile' + (big ? ' naming__tile--big' : ''),
      type: 'button', 'data-key': key }, col);
    el('span', { class: 'naming__tile-name', text: NAMES[key].name }, b);
    el('span', { class: 'naming__tile-root', text: NAMES[key].root.split(' · ')[0] }, b);
    return b;
  }

  function select(key) {
    const d = NAMES[key];
    wrap.querySelectorAll('.naming__tile').forEach(t =>
      t.classList.toggle('is-active', t.dataset.key === key));
    panel.innerHTML =
      `<p class="naming__panel-root">${d.root}</p>` +
      `<p class="naming__panel-name">${d.name} <span class="naming__panel-lit">— ${d.lit}</span></p>` +
      `<p class="naming__panel-gloss">${d.gloss}</p>`;
  }

  wrap.querySelectorAll('.naming__tile').forEach(t => {
    t.addEventListener('mouseenter', () => select(t.dataset.key));
    t.addEventListener('focus', () => select(t.dataset.key));
    t.addEventListener('click', () => select(t.dataset.key));
  });

  select('opus');
}
