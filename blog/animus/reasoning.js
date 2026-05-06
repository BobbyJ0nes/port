/**
 * reasoning.js — tabbed reasoning chain explorer (Figure 3.4).
 *
 * Pick a facet (only the 15 facets, not the 5 dimension roll-ups).
 * Click a model tab. Render the verbatim "Evidence" cell from that
 * model's chat for that facet (sourced from BFI self-evaluation.md).
 */

import { EVIDENCE, MODELS } from './data.js';

// Per-model accent colour (matches chart.js / radar / legend).
//   anthropic (opus) → terracotta
//   google (gemini-pro) → saturated teal
//   google (flash)      → desaturated teal (same family, distinct hue)
function modelAccent(modelId) {
  if (!modelId) return 'var(--accent)';
  const m = MODELS.find(x => x.id === modelId);
  if (!m) return 'var(--accent)';
  if (m.family === 'anthropic') return 'var(--accent)';
  if (modelId.startsWith('flash')) {
    return 'color-mix(in oklab, var(--accent-2) 60%, var(--ink-faint) 40%)';
  }
  return 'var(--accent-2)';
}

export function initReasoning() {
  const select   = document.getElementById('reasoning-facet');
  const tabsRoot = document.querySelector('.reasoning__tabs');
  const scoreEl  = document.getElementById('reasoning-score');
  const evEl     = document.getElementById('reasoning-evidence');
  if (!select || !tabsRoot || !scoreEl || !evEl) return;

  // Populate facet select from EVIDENCE keys.
  Object.keys(EVIDENCE).forEach(facet => {
    const opt = document.createElement('option');
    opt.value = facet;
    opt.textContent = facet.toLowerCase();
    select.appendChild(opt);
  });
  select.value = 'Creative Imagination';

  // Track current model tab.
  let currentModel = 'opus-c1';

  // Pre-tint each tab with its model's accent (used for the active underline,
  // and the score `.num` numeral when that tab is current).
  tabsRoot.querySelectorAll('.reasoning__tab').forEach(btn => {
    const accent = modelAccent(btn.dataset.model);
    btn.style.setProperty('--tab-accent', accent);
  });

  function render() {
    const facet = select.value;
    const cell = EVIDENCE[facet]?.[currentModel];
    const accent = modelAccent(currentModel);
    if (!cell) {
      scoreEl.textContent = 'no data';
      evEl.textContent = '—';
      return;
    }
    const model = MODELS.find(m => m.id === currentModel);
    scoreEl.innerHTML = `
      <span class="num" style="color:${accent}">${cell.score}</span>
      <span>${facet.toLowerCase()} · ${model?.label ?? currentModel}</span>
    `;
    evEl.textContent = cell.evidence;
  }

  select.addEventListener('change', render);

  tabsRoot.querySelectorAll('.reasoning__tab').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsRoot.querySelectorAll('.reasoning__tab').forEach(b =>
        b.setAttribute('aria-selected', 'false'));
      btn.setAttribute('aria-selected', 'true');
      currentModel = btn.dataset.model;
      render();
    });
  });

  // Initial render
  render();
}
