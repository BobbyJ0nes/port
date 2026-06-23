/* =====================================================================
   posttraining.js — Figure 3.1 · the same prompt, three trainings.
   Walks the journal's own example: a small model raised on Amazon reviews.
   Raw, it only knows the *shape* of a review. After instruction-tuning it
   answers the question. After RLHF it answers the way people preferred —
   and the A/B card is the "compare these answers, pick your favourite"
   pop-up the entry mentions, wired up live.
   ===================================================================== */

import { el } from './util.js';

const PROMPT = 'Give me a positive review example:';

const STAGES = [
  {
    id: 'pre', tag: '1 · pre-training', model: 'raw weights',
    desc: 'trained only to predict the next token across a pile of Amazon reviews.',
    verdict: 'knows the <em>shape</em> of a review — not that your sentence was a request.',
  },
  {
    id: 'sft', tag: '2 · instruction-tuning', model: 'weights + SFT',
    desc: 'further trained on input → output pairs, until it learns that prompts want answers.',
    verdict: 'now it maps the instruction to the <em>kind</em> of output you asked for.',
  },
  {
    id: 'rlhf', tag: '3 · RLHF', model: 'weights + SFT + RLHF',
    desc: 'responses scored by humans; higher-scoring ones are preferred in behaviour.',
    verdict: 'your pick below is the training signal — preference, folded back into the weights.',
  },
];

export function mountPostTraining(mount) {
  const wrap = el('div', { class: 'ptr' }, mount);

  // stage rail
  const rail = el('div', { class: 'ptr__rail', role: 'tablist', 'aria-label': 'post-training stage' }, wrap);
  const railBtns = STAGES.map((s, i) =>
    el('button', { class: 'ptr__stage', type: 'button', role: 'tab', text: s.tag, 'data-i': String(i) }, rail));

  // flow: prompt → model → output
  const flow = el('div', { class: 'ptr__flow' }, wrap);
  const promptBox = el('div', { class: 'ptr__box ptr__box--prompt' }, flow);
  el('span', { class: 'ptr__box-key', text: 'prompt' }, promptBox);
  el('p', { class: 'ptr__box-body', text: PROMPT }, promptBox);

  const modelBox = el('div', { class: 'ptr__box ptr__box--model' }, flow);
  el('span', { class: 'ptr__box-key', text: 'model' }, modelBox);
  const modelName = el('p', { class: 'ptr__box-body ptr__model-name' }, modelBox);
  const modelDesc = el('p', { class: 'ptr__model-desc' }, modelBox);

  const outBox = el('div', { class: 'ptr__box ptr__box--out' }, flow);
  el('span', { class: 'ptr__box-key', text: 'output' }, outBox);
  const outBody = el('div', { class: 'ptr__out-body' }, outBox);

  const verdict = el('p', { class: 'ptr__verdict' }, wrap);

  let preferred = null; // 'A' | 'B'

  function renderOutput(i) {
    outBody.innerHTML = '';
    outBody.classList.remove('is-in');
    if (i === 0) {
      el('p', { class: 'ptr__gen ptr__gen--raw',
        html: `<span class="ptr__cursor-pre">${PROMPT} </span>… arrived two days early and the packaging was lovely. would buy again!! ★★★★★ honestly the best thing i&rsquo;ve bought all year, my kids love it and the battery lasts and&mdash;` }, outBody);
      el('p', { class: 'ptr__outtag', html: 'it just keeps writing reviews. the instruction was invisible to it.' }, outBody);
    } else if (i === 1) {
      el('p', { class: 'ptr__gen', html: `Sure — here&rsquo;s a positive review:` }, outBody);
      el('blockquote', { class: 'ptr__review',
        html: `&ldquo;Genuinely impressed. Set-up took two minutes, the build quality feels premium, and it does exactly what it promises. Five stars.&rdquo;` }, outBody);
    } else {
      // RLHF: the A/B preference card
      const ab = el('div', { class: 'ptr__ab' }, outBody);
      el('p', { class: 'ptr__ab-q', text: 'compare these answers · pick your favourite' }, ab);
      const grid = el('div', { class: 'ptr__ab-grid' }, ab);
      const cardA = el('button', { class: 'ptr__ab-card', type: 'button', 'data-k': 'A',
        html: `<span class="ptr__ab-key">A</span><span class="ptr__ab-text">&ldquo;Great product. 5 stars.&rdquo;</span>` }, grid);
      const cardB = el('button', { class: 'ptr__ab-card', type: 'button', 'data-k': 'B',
        html: `<span class="ptr__ab-key">B</span><span class="ptr__ab-text">&ldquo;Genuinely impressed — quick set-up, premium feel, does what it promises. Would recommend. ★★★★★&rdquo;</span>` }, grid);
      const result = el('div', { class: 'ptr__ab-result' }, outBody);

      const choose = (k, card) => {
        preferred = k;
        [cardA, cardB].forEach(c => c.classList.toggle('is-picked', c === card));
        result.innerHTML =
          `<span class="ptr__reward">reward +1 → response ${k}</span> reinforced. ` +
          `the model drifts toward ${k === 'B' ? 'fuller, more helpful' : 'terse, minimal'} answers.`;
        result.classList.add('is-in');
      };
      cardA.addEventListener('click', () => choose('A', cardA));
      cardB.addEventListener('click', () => choose('B', cardB));
      if (preferred) (preferred === 'A' ? cardA : cardB).click();
    }
    requestAnimationFrame(() => outBody.classList.add('is-in'));
  }

  function setStage(i) {
    railBtns.forEach((b, j) => b.setAttribute('aria-selected', j === i ? 'true' : 'false'));
    const s = STAGES[i];
    modelName.textContent = s.model;
    modelDesc.textContent = s.desc;
    verdict.innerHTML = `<span class="ptr__verdict-key">↳</span> ${s.verdict}`;
    wrap.dataset.stage = s.id;
    renderOutput(i);
  }

  railBtns.forEach((b, i) => b.addEventListener('click', () => setStage(i)));
  setStage(0);
}
