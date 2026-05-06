/**
 * chart.js — interactive cross-model bar chart (Figure 3.2).
 *
 * Pure SVG — no D3, no charting library. Click a facet/dimension in the
 * select; bars rerender showing baseline + 6 LLM scorings. Caption updates
 * with the standard deviation across the LLM scorings only.
 */

import { ROWS, MODELS } from './data.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Family colours match the legend / radar.
//   anthropic (opus) → terracotta var(--accent)
//   google (gemini-pro) → saturated teal var(--accent-2)
//   google (flash)      → desaturated teal (same family, distinct hue)
//   baseline → ink (high-contrast neutral)
function familyColour(modelId) {
  if (modelId === 'baseline') return 'var(--ink)';
  const m = MODELS.find(x => x.id === modelId);
  if (!m) return 'var(--ink-faint)';
  if (m.family === 'anthropic') return 'var(--accent)';
  // google family: split pro vs flash by id prefix.
  if (modelId.startsWith('flash')) {
    return 'color-mix(in oklab, var(--accent-2) 60%, var(--ink-faint) 40%)';
  }
  return 'var(--accent-2)';
}

export function initChart() {
  const select   = document.getElementById('chart-trait');
  const svg      = document.getElementById('chart-svg');
  const readout  = document.getElementById('chart-readout');
  if (!select || !svg) return;

  // Populate the select with all rows; group dimensions vs facets visually.
  const optBaseline = document.createElement('option');
  optBaseline.disabled = true;
  optBaseline.textContent = '— bfi dimensions —';
  select.appendChild(optBaseline);
  ROWS.filter(r => r.facet === null).forEach(r => {
    const opt = document.createElement('option');
    opt.value = `${r.dimension}`;
    opt.textContent = r.dimension.toLowerCase();
    select.appendChild(opt);
  });
  const optFacets = document.createElement('option');
  optFacets.disabled = true;
  optFacets.textContent = '— facets —';
  select.appendChild(optFacets);
  ROWS.filter(r => r.facet !== null).forEach(r => {
    const opt = document.createElement('option');
    opt.value = `${r.dimension}::${r.facet}`;
    opt.textContent = `${r.facet.toLowerCase()}`;
    select.appendChild(opt);
  });

  // Default: intellectual curiosity (highest agreement).
  select.value = 'Open-Mindedness::Intellectual Curiosity';

  function findRow(value) {
    if (value.includes('::')) {
      const [dim, facet] = value.split('::');
      return ROWS.find(r => r.dimension === dim && r.facet === facet);
    }
    return ROWS.find(r => r.dimension === value && r.facet === null);
  }

  function renderRow(row) {
    if (!row) return;

    // Clear svg
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    // Re-add the title
    const titleEl = document.createElementNS(SVG_NS, 'title');
    titleEl.id = 'chart-svg-title';
    titleEl.textContent = `bar chart for ${row.facet || row.dimension}`;
    svg.appendChild(titleEl);

    const series = [
      { id: 'baseline', label: 'baseline', value: row.baseline, family: 'baseline' },
      ...MODELS.map(m => ({
        id: m.id,
        label: m.shortLabel.toLowerCase(),
        value: row[m.id],
        family: m.family
      }))
    ];

    const W = 600, H = 280;
    const PAD_L = 56, PAD_R = 16, PAD_T = 16, PAD_B = 56;
    const innerW = W - PAD_L - PAD_R;
    const innerH = H - PAD_T - PAD_B;

    const barCount = series.length;
    const gap = 12;
    const barW = (innerW - gap * (barCount - 1)) / barCount;

    // Y axis: 0..100
    // gridlines at 0, 25, 50, 75, 100
    [0, 25, 50, 75, 100].forEach(v => {
      const y = PAD_T + innerH - (v / 100) * innerH;
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', PAD_L);
      line.setAttribute('x2', PAD_L + innerW);
      line.setAttribute('y1', y);
      line.setAttribute('y2', y);
      line.setAttribute('class', 'axis-line');
      line.setAttribute('stroke-dasharray', v === 50 ? '0' : '2 4');
      line.setAttribute('opacity', v === 50 ? '0.6' : '0.3');
      svg.appendChild(line);

      const lbl = document.createElementNS(SVG_NS, 'text');
      lbl.setAttribute('x', PAD_L - 8);
      lbl.setAttribute('y', y);
      lbl.setAttribute('class', 'axis-text');
      lbl.setAttribute('text-anchor', 'end');
      lbl.setAttribute('dominant-baseline', 'middle');
      lbl.textContent = v;
      svg.appendChild(lbl);
    });

    // Bars
    series.forEach((s, i) => {
      const x = PAD_L + i * (barW + gap);
      const h = (s.value / 100) * innerH;
      const y = PAD_T + innerH - h;

      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('class', 'bar');
      rect.setAttribute('x', x);
      rect.setAttribute('y', PAD_T + innerH);
      rect.setAttribute('width', barW);
      rect.setAttribute('height', 0);
      rect.setAttribute('rx', 2);
      rect.setAttribute('fill', familyColour(s.id));
      rect.setAttribute('data-id', s.id);

      // Subtle scale-in via SMIL-style requestAnimationFrame: read final
      // dims from the closure. Browsers will animate the y/height attribute
      // changes when paired with an inline style transition that targets
      // those properties via attribute syntax. We fall back to an instant
      // snap if the browser ignores the transition (still correct).
      const delay = i * 35;
      setTimeout(() => {
        rect.setAttribute('y', y);
        rect.setAttribute('height', h);
      }, delay);

      svg.appendChild(rect);

      // Value label above
      const valLbl = document.createElementNS(SVG_NS, 'text');
      valLbl.setAttribute('class', 'value-text');
      valLbl.setAttribute('x', x + barW / 2);
      valLbl.setAttribute('y', y - 6);
      valLbl.setAttribute('text-anchor', 'middle');
      valLbl.textContent = s.value;
      valLbl.style.opacity = '0';
      setTimeout(() => {
        valLbl.style.transition = 'opacity 0.35s ease';
        valLbl.style.opacity = '1';
      }, delay + 350);
      svg.appendChild(valLbl);

      // X-axis label
      const xLbl = document.createElementNS(SVG_NS, 'text');
      xLbl.setAttribute('class', 'axis-text');
      xLbl.setAttribute('x', x + barW / 2);
      xLbl.setAttribute('y', H - PAD_B + 18);
      xLbl.setAttribute('text-anchor', 'middle');
      xLbl.textContent = s.label;
      svg.appendChild(xLbl);
    });

    // Update readout: SD across the 6 LLM scorings (baseline excluded).
    const llmName = row.facet || row.dimension;
    readout.innerHTML = `
      <span>llm avg <span class="num">${row.llmAvg}</span></span>
      &nbsp;·&nbsp;
      <span>sd <span class="num">${row.sd}</span></span>
      &nbsp;·&nbsp;
      <span>range <span class="num">${row.range}</span></span>
      &nbsp;·&nbsp;
      <span>baseline <span class="num">${row.baseline}</span></span>
      &nbsp;·&nbsp;
      <span>Δ <span class="num">${row.delta > 0 ? '+' : ''}${row.delta}</span></span>
    `;
  }

  select.addEventListener('change', () => {
    const row = findRow(select.value);
    renderRow(row);
  });

  // Initial render
  renderRow(findRow(select.value));
}
