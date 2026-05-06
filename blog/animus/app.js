/**
 * app.js — global wiring for ANIMUS variant 6 (revised).
 *
 * Loads each module, drives the theme toggle and j/k navigation, builds the
 * sticky section nav with IntersectionObserver active-state, builds the
 * sortable data table inside the combined radar/table figure, wires the
 * shape↔table view toggle, renders the radar (main + small multiples) with
 * preset views and facet drilldown, and (best-effort) imports pretext for
 * text-aware caption layout. All modules degrade gracefully if a CDN fails.
 */

import { ROWS, MODELS, SCORING_PROMPT, FIELD_NOTES,
         DIMENSIONS, LINES_ALL, PRESETS, DEFAULT_PRESET } from './data.js';
import { initChart }     from './chart.js';
import { initReasoning } from './reasoning.js';
import { renderRadar, attachRadarInteractions } from './radar.js';

// ---------------------------------------------------------------------
// 1. theme toggle (ported from port_v1/script.js)
// ---------------------------------------------------------------------

(function theme() {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('basaira-theme');
  if (stored === 'light' || stored === 'dark') {
    root.setAttribute('data-theme', stored);
    syncThemeButton(btn, stored);
  } else {
    syncThemeButton(btn, prefersDark() ? 'dark' : 'light');
  }
  btn?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || (prefersDark() ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('basaira-theme', next);
    syncThemeButton(btn, next);
    // Re-render radars so SVG strokes that resolve via CSS tokens recolour.
    redrawRadars();
  });
})();

function prefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function syncThemeButton(btn, theme) {
  if (!btn) return;
  btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  btn.setAttribute('aria-label', theme === 'dark' ? 'switch to light theme' : 'switch to dark theme');
  btn.querySelector('span').textContent = theme === 'dark' ? '☀' : '☾';
}

// ---------------------------------------------------------------------
// 2. j/k navigation between sections (ports the port_v1 pattern)
// ---------------------------------------------------------------------

(function jkNav() {
  const sections = Array.from(document.querySelectorAll('.lab-section'));
  if (!sections.length) return;
  let idx = 0;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = prefersReduced ? 'auto' : 'smooth';

  function focusSection(i) {
    const target = sections[i];
    if (!target) return;
    sections.forEach(s => s.classList.remove('is-focus'));
    target.classList.add('is-focus');
    target.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
  }

  window.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'j' || e.key === 'ArrowDown') {
      e.preventDefault();
      idx = Math.min(sections.length - 1, idx + 1);
      focusSection(idx);
    } else if (e.key === 'k' || e.key === 'ArrowUp') {
      e.preventDefault();
      idx = Math.max(0, idx - 1);
      focusSection(idx);
    }
  });
})();

// ---------------------------------------------------------------------
// 3. sticky section nav — IntersectionObserver active-state highlighting
// ---------------------------------------------------------------------

(function sectionNav() {
  const navLinks = Array.from(document.querySelectorAll('.section-nav a[data-section-target]'));
  if (!navLinks.length) return;

  const targets = navLinks
    .map(a => ({ a, el: document.getElementById(a.dataset.sectionTarget) }))
    .filter(t => t.el);

  function setActive(id) {
    navLinks.forEach(a => {
      a.classList.toggle('is-active', a.dataset.sectionTarget === id);
    });
  }

  // IntersectionObserver: section becomes "active" when its top crosses
  // a band ~30% from the top of the viewport.
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible[0]) setActive(visible[0].target.id);
  }, {
    rootMargin: '-30% 0px -60% 0px',
    threshold: [0, 0.25, 0.5, 0.75, 1],
  });
  targets.forEach(t => observer.observe(t.el));

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  navLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.dataset.sectionTarget;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      setActive(id);
      history.replaceState(null, '', `#${id}`);
    });
  });
})();

// ---------------------------------------------------------------------
// 4. inject the verbatim scoring prompt into the code figure
// ---------------------------------------------------------------------

(function injectPrompt() {
  const block = document.getElementById('prompt-block');
  if (!block) return;
  block.textContent = SCORING_PROMPT;
})();

// ---------------------------------------------------------------------
// 5. (intentionally removed) — field-notes were attached as hover title
//    tooltips on sections. Removed for the live cut so cursor hover
//    doesn't trigger native browser tooltips on body sections.
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// 6. sortable cross-model data table — lives inside Figure 7.0's
//    [ table ] view-panel, swapped in via the view toggle.
// ---------------------------------------------------------------------

(function buildTable() {
  const tbody = document.getElementById('data-table-body');
  if (!tbody) return;

  let sorted = [...ROWS];
  let sortKey = null;
  let sortDir = 1; // 1 asc, -1 desc

  // Score-distance heatmap: above-50 cells warm (terracotta), below-50 cool
  // (teal). This is a *score* signal, not a model-identity signal — so the
  // tint intensity is kept low enough that the column-header model names
  // (opus / pro / flash) remain the primary visual cue.
  function tintCellStyle(value) {
    const dist = Math.abs(value - 50);
    const intensity = Math.min(dist / 50, 1);
    if (value > 50) {
      return `background: color-mix(in oklab, var(--accent) ${Math.round(intensity * 11)}%, transparent);`;
    }
    if (value < 50) {
      return `background: color-mix(in oklab, var(--accent-2) ${Math.round(intensity * 11)}%, transparent);`;
    }
    return '';
  }

  function render() {
    tbody.innerHTML = '';
    sorted.forEach(row => {
      const tr = document.createElement('tr');
      tr.className = row.facet === null ? 'dim' : 'facet';
      const label = row.facet === null ? row.dimension : row.facet;

      const cells = [
        { v: label, num: false },
        { v: row.baseline, num: true },
        { v: row['opus-c1'], num: true },
        { v: row['opus-c2'], num: true },
        { v: row['pro-c1'],  num: true },
        { v: row['pro-c2'],  num: true },
        { v: row['flash-c1'],num: true },
        { v: row['flash-c2'],num: true },
        { v: row.llmAvg, num: true },
        { v: row.sd,     num: true },
        { v: (row.delta > 0 ? '+' : '') + row.delta, num: true, raw: row.delta }
      ];

      cells.forEach((c, idx) => {
        const td = document.createElement('td');
        td.textContent = c.v;
        if (c.num) {
          td.classList.add('num');
          if (idx >= 1 && idx <= 7) {
            const raw = typeof c.raw === 'number' ? c.raw : (typeof c.v === 'number' ? c.v : null);
            if (typeof raw === 'number') {
              td.style.cssText = tintCellStyle(raw);
              td.dataset.tint = String(raw);
            }
          }
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  document.querySelectorAll('.data-table th').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (!key) return;
      document.querySelectorAll('.data-table th').forEach(x => x.classList.remove('sort-asc', 'sort-desc'));

      if (sortKey === key) sortDir *= -1;
      else { sortKey = key; sortDir = 1; }

      th.classList.add(sortDir === 1 ? 'sort-asc' : 'sort-desc');

      sorted = [...ROWS].sort((a, b) => {
        let av = a[key], bv = b[key];
        if (key === 'dimension') {
          av = a.facet === null ? a.dimension : `${a.dimension} · ${a.facet}`;
          bv = b.facet === null ? b.dimension : `${b.dimension} · ${b.facet}`;
        }
        if (typeof av === 'string') return av.localeCompare(bv) * sortDir;
        return (av - bv) * sortDir;
      });
      render();
    });
  });

  render();
})();

// ---------------------------------------------------------------------
// 7. wire the bar chart and the reasoning explorer
// ---------------------------------------------------------------------

initChart();
initReasoning();

// ---------------------------------------------------------------------
// 8. radar — main + small multiples + presets + facet drilldown
// ---------------------------------------------------------------------

const mainSvg          = document.getElementById('main-radar');
const mainTooltipEl    = document.getElementById('radar-tooltip');
const smallMultiplesEl = document.getElementById('small-multiples');
const presetButtons    = document.querySelectorAll('.preset-btn');
const drilldownBackEl  = document.getElementById('drilldown-back');
const drilldownLabelEl = document.getElementById('drilldown-label');
const radarTitleEl     = document.getElementById('main-radar-title');

let activeLines        = new Set(PRESETS[DEFAULT_PRESET].lineIds);
let shadeBaselineGap   = !!PRESETS[DEFAULT_PRESET].shadeBaselineGap;
let viewMode           = { kind: 'dimensions' };
let mainRadarRendered  = false;
let smallMultiplesRendered = false;

function getMainSize() {
  const w = window.innerWidth;
  if (w < 480) return Math.min(w - 20, 360);
  if (w < 720) return Math.min(w - 40, 480);
  return 580;
}

async function renderMainRadar() {
  if (!mainSvg) return;

  if (viewMode.kind === 'dimensions') {
    const axes = DIMENSIONS.map(d => d.short || d.name);
    const lines = Array.from(activeLines).map(id => LINES_ALL[id]).filter(Boolean);
    const values = lines.map(line => ({
      lineId: line.id,
      points: DIMENSIONS.map(d => line.getValue(d)),
    }));
    if (drilldownBackEl) drilldownBackEl.hidden = true;
    if (drilldownLabelEl) drilldownLabelEl.textContent = 'five dimensions · 0–100 scale';
    if (radarTitleEl) radarTitleEl.textContent = 'BFI radar — five dimensions';
    await renderRadar(mainSvg, {
      axes,
      lines,
      values,
      shadeBaselineGap,
      size: getMainSize(),
      title: 'BFI radar — five dimensions, seven scoring methods overlaid',
      desc: 'A pentagonal radar chart with axes for open-mindedness, extraversion, agreeableness, conscientiousness, and negative emotionality. Each polyline represents one scoring method.',
      onAxisClick: (i) => enterFacetView(DIMENSIONS[i].id),
      animate: !mainRadarRendered,
    });
    mainRadarRendered = true;
    attachRadarInteractions(mainSvg, mainTooltipEl, {
      axes, lines, values,
      evidence: (axisIdx, lineId) => {
        const dim = DIMENSIONS[axisIdx];
        const line = LINES_ALL[lineId];
        if (!dim || !line) return null;
        if (line.id === 'baseline') return `Likert self-report: ${dim.baseline}/100 on ${dim.name}.`;
        if (line.group === 'mean')        return `${dim.name}: six-chat mean ${dim.stats.avg} (σ ${dim.stats.sd}, range ${dim.stats.min}–${dim.stats.max}).`;
        if (line.group === 'family-mean') return `${dim.name}: ${line.short} = ${line.getValue(dim)}.`;
        const f = dim.facets[0];
        return f.evidence?.[lineId] || `${dim.name}: scored ${dim.scores[lineId]}/100.`;
      },
    });
  } else {
    const dim = DIMENSIONS.find(d => d.id === viewMode.dimId);
    if (!dim) { viewMode = { kind: 'dimensions' }; return renderMainRadar(); }
    const axes = dim.facets.map(f => f.short || f.name);
    const lines = Array.from(activeLines).map(id => LINES_ALL[id]).filter(Boolean);
    const values = lines.map(line => ({
      lineId: line.id,
      points: dim.facets.map(f => line.getFacetValue(f)),
    }));
    if (drilldownBackEl) drilldownBackEl.hidden = false;
    if (drilldownLabelEl) drilldownLabelEl.textContent = `facets of ${dim.name}`;
    if (radarTitleEl) radarTitleEl.textContent = `${dim.name} — three facets`;
    await renderRadar(mainSvg, {
      axes, lines, values, shadeBaselineGap,
      size: getMainSize(),
      title: `${dim.name} radar — three facets, seven scoring methods overlaid`,
      desc: `A triangular radar of the three facets of ${dim.name}.`,
      animate: true,
    });
    attachRadarInteractions(mainSvg, mainTooltipEl, {
      axes, lines, values,
      evidence: (axisIdx, lineId) => {
        const f = dim.facets[axisIdx];
        const line = LINES_ALL[lineId];
        if (!f || !line) return null;
        if (line.id === 'baseline')       return `Likert self-report: ${f.baseline}/100 on ${f.name}.`;
        if (line.group === 'mean')        return `${f.name}: six-chat mean ${f.stats.avg} (σ ${f.stats.sd}).`;
        if (line.group === 'family-mean') return `${f.name}: ${line.short} = ${line.getFacetValue(f)}.`;
        return f.evidence?.[lineId] || `${f.name}: ${f.scores[lineId]}/100.`;
      },
    });
  }
}

async function renderSmallMultiples() {
  if (!smallMultiplesEl) return;
  smallMultiplesEl.innerHTML = '';

  for (const dim of DIMENSIONS) {
    const card = document.createElement('div');
    card.className = 'small-multiple';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Drill into ${dim.name} facets`);
    card.dataset.dimId = dim.id;

    const cap = document.createElement('div');
    cap.className = 'small-multiple__cap';
    cap.innerHTML = `<span class="small-multiple__name">${escapeHtml(dim.name)}</span><span class="small-multiple__meta">n=6 chats + 1 baseline</span>`;
    card.appendChild(cap);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'small-multiple__svg');
    svg.id = `sm-${dim.id}`;
    card.appendChild(svg);

    const subcap = document.createElement('div');
    subcap.className = 'small-multiple__sub';
    subcap.textContent = dim.facets.map(f => f.short).join(' · ');
    card.appendChild(subcap);

    smallMultiplesEl.appendChild(card);

    const axes = dim.facets.map(f => f.short || f.name);
    const lines = Array.from(activeLines).map(id => LINES_ALL[id]).filter(Boolean);
    const values = lines.map(line => ({
      lineId: line.id,
      points: dim.facets.map(f => line.getFacetValue(f)),
    }));

    await renderRadar(svg, {
      axes, lines, values, shadeBaselineGap,
      size: 240,
      title: `${dim.name} small-multiple radar`,
      desc: `Three facets: ${axes.join(', ')}.`,
      pad: 32,
      valueLabels: [50, 100],
      rings: [25, 50, 75, 100],
      animate: !smallMultiplesRendered,
    });

    card.addEventListener('click', () => enterFacetView(dim.id));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        enterFacetView(dim.id);
      }
    });
  }
  smallMultiplesRendered = true;
}

async function enterFacetView(dimId) {
  viewMode = { kind: 'facets', dimId };
  await renderMainRadar();
  const target = document.getElementById('main-radar-wrap');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target?.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
}
async function exitFacetView() {
  viewMode = { kind: 'dimensions' };
  await renderMainRadar();
}
drilldownBackEl?.addEventListener('click', (e) => {
  e.preventDefault();
  exitFacetView();
});

function renderLegend() {
  const mount = document.getElementById('radar-legend');
  if (!mount) return;
  const items = [
    { swatch: 'dashed-ink',   label: 'BFI-2 likert (self-report)' },
    { swatch: 'solid-accent', label: 'LLM ensemble mean (n=6)' },
    { swatch: 'solid-opus',   label: 'opus 4.5 — anthropic (×2 chats)' },
    { swatch: 'solid-pro',    label: 'gemini-pro — google (×2 chats)' },
    { swatch: 'dashed-flash', label: 'gemini-flash — google (×2 chats, dashed)' },
  ];
  mount.innerHTML = items.map(it =>
    `<span class="legend__item"><span class="legend__swatch legend__swatch--${it.swatch}"></span>${escapeHtml(it.label)}</span>`
  ).join('');
}

function applyPreset(name) {
  const preset = PRESETS[name];
  if (!preset) return;
  activeLines = new Set(preset.lineIds);
  shadeBaselineGap = !!preset.shadeBaselineGap;
  syncPresetButtons(name);
  redrawRadars();
}
function syncPresetButtons(active) {
  presetButtons.forEach(btn => {
    btn.setAttribute('aria-pressed', btn.dataset.preset === active ? 'true' : 'false');
  });
}
presetButtons.forEach(btn => {
  btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
});

let resizeTimer = null;
window.addEventListener('resize', () => {
  if (resizeTimer) cancelAnimationFrame(resizeTimer);
  resizeTimer = requestAnimationFrame(() => {
    redrawRadars();
  });
});

async function redrawRadars() {
  await renderMainRadar();
  await renderSmallMultiples();
}

// ---------------------------------------------------------------------
// 9. shape ↔ table view toggle on Figure 7.0
// ---------------------------------------------------------------------

(function viewToggle() {
  const buttons = document.querySelectorAll('.radar-figure__viewbtn');
  const panels  = document.querySelectorAll('.radar-figure [data-view-panel]');
  if (!buttons.length || !panels.length) return;

  function setView(view) {
    buttons.forEach(b => {
      b.setAttribute('aria-selected', b.dataset.view === view ? 'true' : 'false');
    });
    panels.forEach(p => {
      const match = p.dataset.viewPanel === view;
      p.hidden = !match;
    });
  }
  buttons.forEach(b => {
    b.addEventListener('click', () => setView(b.dataset.view));
  });
  setView('shape');
})();

// ---------------------------------------------------------------------
// 10. boot — render legend and the initial radar pair.
// ---------------------------------------------------------------------

syncPresetButtons(DEFAULT_PRESET);
renderLegend();
await redrawRadars();

// ---------------------------------------------------------------------
// 11. pretext (best-effort) — used to balance figure captions.
//     Loaded via importmap; if the CDN fails, the article still renders
//     fine, only without the pretext-driven caption-balancing pass.
// ---------------------------------------------------------------------

(async function pretextHook() {
  try {
    const pretext = await import('pretext');
    if (typeof pretext?.prepare !== 'function') return;
    document.querySelectorAll('.figure figcaption').forEach(cap => {
      const measured = pretext.prepare(cap.textContent);
      cap.dataset.pretextLines = measured?.lines ?? '';
    });
    console.info('%cpretext loaded', 'color:#38b2a8;font-family:monospace');
  } catch (err) {
    console.info('pretext unavailable; skipping text-aware layout pass', err?.message);
  }
})();

// ---------------------------------------------------------------------
// 12. console signature
// ---------------------------------------------------------------------

console.log(
  '%c✶ animus · the user-model layer',
  'color:#c9521f;font-family:monospace;font-size:14px;font-weight:700'
);
console.log('%cpress j / k (or ↓ / ↑) to walk through the sections.', 'color:#8a8178;font-family:monospace');
console.log('%cclick a small multiple to drill into facets. flip the figure to [ table ] for the full matrix.', 'color:#8a8178;font-family:monospace');
console.log('%csource: BASAIRA / ANIMUS · jan 2026', 'color:#8a8178;font-family:monospace');

// ---------------------------------------------------------------------
// 13. expose data on window for debugging convenience.
// ---------------------------------------------------------------------

window.ANIMUS = { ROWS, MODELS, DIMENSIONS };

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
}
