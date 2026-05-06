// ANIMUS · v5 radar — SVG radar chart component
// Vanilla SVG + math, no D3. Optional pretext for axis-label measurement.
//
// Public API:
//   renderRadar(svg, opts)
//     opts.axes     — array of axis labels (strings)  [length = N axes]
//     opts.values   — array of {line, points: number[N]} for each polyline
//     opts.lines    — array of LINE definitions (full LINE objects from data.js)
//     opts.shadeBaselineGap — bool, fill the polygon between baseline & ensemble
//     opts.size     — px square size of the SVG
//     opts.evidence — fn(axisIdx, lineId) → string (for vertex tooltips)
//     opts.title    — optional aria title for the SVG
//     opts.minMax   — [0, 100] by default
//
// Hover behaviour is wired here. The host page provides a tooltip element
// (#radar-tooltip) which we reposition.

const SVG_NS = 'http://www.w3.org/2000/svg';

// pretext is optional — used for measuring axis-label widths to prevent
// collisions on narrow viewports. Falls back to character-count estimate.
// Loaded lazily in measureLabel() to avoid blocking the radar render
// if the CDN is slow / blocked.
let pretextPromise = null;
function loadPretext() {
  if (pretextPromise) return pretextPromise;
  pretextPromise = import('pretext')
    .then(mod => mod)
    .catch(() => null);
  // Add a 1.5s timeout: if pretext doesn't show up, give up gracefully.
  return Promise.race([
    pretextPromise,
    new Promise(resolve => setTimeout(() => resolve(null), 1500)),
  ]);
}

// ────────────────────────────────────────────────────────────────────── geometry
// Convert a (axisIndex, value0to100) pair to an SVG cartesian point.
// Axis 0 is at the top (12 o'clock), then clockwise.
function polarToXY(cx, cy, radius, axisIdx, axisCount) {
  // Start at 12 o'clock; go clockwise.
  const theta = -Math.PI / 2 + (2 * Math.PI * axisIdx) / axisCount;
  return {
    x: cx + radius * Math.cos(theta),
    y: cy + radius * Math.sin(theta),
  };
}

function valuePoint(cx, cy, maxR, axisIdx, axisCount, value, vMin, vMax) {
  const t = (value - vMin) / (vMax - vMin);
  return polarToXY(cx, cy, maxR * t, axisIdx, axisCount);
}

function svgEl(name, attrs = {}, parent = null, text = null) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    el.setAttribute(k, v);
  }
  if (text != null) el.textContent = text;
  if (parent) parent.appendChild(el);
  return el;
}

// Calculate optimal text-anchor + offset for axis labels so they don't
// crash into the polygon at any angle.
function labelAnchor(axisIdx, axisCount) {
  const theta = -Math.PI / 2 + (2 * Math.PI * axisIdx) / axisCount;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  let anchor = 'middle';
  if (cosT >  0.25) anchor = 'start';
  if (cosT < -0.25) anchor = 'end';
  // Slight extra distance from radius for top/bottom; less for sides.
  // Distance is set by caller via axisLabelOffset.
  return { anchor, cosT, sinT };
}

// Try to measure label widths via pretext; fall back to char-count proxy.
async function measureLabel(text, fontSize) {
  const pretext = await loadPretext();
  if (pretext && pretext.layout) {
    try {
      const m = pretext.layout({
        text,
        font: 'Iowan Old Style, Georgia, serif',
        fontSize,
        fontStyle: 'italic',
        maxWidth: 500,
      });
      if (m && typeof m.width === 'number') return m.width;
    } catch (_) {}
  }
  // crude proxy: char-count × ~0.5 of fontSize for italic serif
  return text.length * fontSize * 0.5;
}

// ────────────────────────────────────────────────────────────────────── render
export async function renderRadar(svg, opts) {
  const {
    axes,
    lines = [],
    values = [],
    shadeBaselineGap = false,
    size = 600,
    minMax = [0, 100],
    evidence = null,
    title = 'Radar chart',
    desc = '',
    rings = [25, 50, 75, 100],
    valueLabels = [25, 50, 75, 100],
    pad = null,             // padding around the radar (auto if null)
    onAxisClick = null,     // (axisIdx) => void  for facet drilldown
    animate = true,         // false skips the entrance stroke animation
  } = opts;

  // ── reset
  svg.innerHTML = '';
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-labelledby', svg.id ? `${svg.id}-title ${svg.id}-desc` : null);
  if (svg.id) {
    const titleEl = svgEl('title', { id: `${svg.id}-title` }, svg, title);
    const descEl  = svgEl('desc',  { id: `${svg.id}-desc`  }, svg, desc || `Radar with ${axes.length} axes and ${values.length} overlaid polylines.`);
  }

  const N = axes.length;
  const cx = size / 2;
  const cy = size / 2;

  // Determine padding (label gutter).
  // Measure each label and find the worst offender; pad accordingly.
  const fs = Math.max(10, Math.round(size * 0.030));      // axis-label font size
  const measureFs = fs;
  const widths = await Promise.all(axes.map(t => measureLabel(t, measureFs)));
  const maxW = Math.max(...widths);
  const autoPad = pad != null ? pad : Math.max(56, Math.min(110, maxW * 0.7 + fs * 1.4));
  const maxR = Math.max(40, (size / 2) - autoPad);
  const [vMin, vMax] = minMax;

  // ── 1. concentric reference rings (pentagonal)
  // (stroke colour is set via .radar__ring CSS rule to support theming)
  const ringsLayer = svgEl('g', { class: 'radar__rings', 'aria-hidden': 'true' }, svg);
  for (const r of rings) {
    const t = (r - vMin) / (vMax - vMin);
    const pts = [];
    for (let i = 0; i < N; i++) {
      const p = polarToXY(cx, cy, maxR * t, i, N);
      pts.push(`${p.x.toFixed(2)},${p.y.toFixed(2)}`);
    }
    let strokeWidth = 1;
    let dasharray = null;
    if (r === 25 || r === 75) dasharray = '2 3';
    if (r === 100) strokeWidth = 1.4;
    svgEl('polygon', {
      class: r === 100 ? 'radar__ring radar__ring--bound' : 'radar__ring',
      points: pts.join(' '),
      fill: 'none',
      'stroke-width': strokeWidth,
      'stroke-dasharray': dasharray,
    }, ringsLayer);
  }

  // ── 2. axis lines
  const axesLayer = svgEl('g', { class: 'radar__axes', 'aria-hidden': 'true' }, svg);
  for (let i = 0; i < N; i++) {
    const p = polarToXY(cx, cy, maxR, i, N);
    svgEl('line', {
      class: 'radar__axis-line',
      x1: cx, y1: cy, x2: p.x.toFixed(2), y2: p.y.toFixed(2),
      'stroke-width': 1,
    }, axesLayer);
  }

  // ── 3. value labels along the top axis (axis 0): 25, 50, 75, 100
  const valLabelsLayer = svgEl('g', { class: 'radar__value-labels', 'aria-hidden': 'true' }, svg);
  for (const v of valueLabels) {
    const t = (v - vMin) / (vMax - vMin);
    const p = polarToXY(cx, cy, maxR * t, 0, N);
    svgEl('text', {
      class: 'radar__value-label',
      x: p.x + 4,
      y: p.y - 2,
      'font-size': Math.max(9, fs - 2),
      'text-anchor': 'start',
    }, valLabelsLayer, String(v));
  }

  // ── 4. SHADE the baseline-gap polygon (under everything else, above rings)
  if (shadeBaselineGap) {
    const baselineLine = lines.find(l => l.id === 'baseline');
    const ensembleLine = lines.find(l => l.id === 'ensemble');
    if (baselineLine && ensembleLine) {
      const baselineVals = values.find(v => v.lineId === 'baseline');
      const ensembleVals = values.find(v => v.lineId === 'ensemble');
      if (baselineVals && ensembleVals) {
        // Build a path that traces the baseline polygon then back along the
        // ensemble polygon (in reverse) so the result is the area between.
        const ptsBaseline = baselineVals.points.map((v, i) => valuePoint(cx, cy, maxR, i, N, v, vMin, vMax));
        const ptsEnsemble = ensembleVals.points.map((v, i) => valuePoint(cx, cy, maxR, i, N, v, vMin, vMax));
        let d = '';
        d += `M ${ptsBaseline[0].x.toFixed(2)},${ptsBaseline[0].y.toFixed(2)}`;
        for (let i = 1; i < N; i++) d += ` L ${ptsBaseline[i].x.toFixed(2)},${ptsBaseline[i].y.toFixed(2)}`;
        d += ' Z';
        d += ` M ${ptsEnsemble[0].x.toFixed(2)},${ptsEnsemble[0].y.toFixed(2)}`;
        for (let i = 1; i < N; i++) d += ` L ${ptsEnsemble[i].x.toFixed(2)},${ptsEnsemble[i].y.toFixed(2)}`;
        d += ' Z';
        const shadePath = svgEl('path', {
          class: 'radar__gap-shade',
          d,
          'fill-opacity': 0.13,
          'fill-rule': 'evenodd',
          stroke: 'none',
          'pointer-events': 'none',
        }, svg);
        // Use the same darker-mix as the ensemble polygon stroke so the
        // gap shading reads as "this is the LLM-vs-baseline gap" rather
        // than getting confused with the individual Opus terracotta line.
        shadePath.style.fill = 'color-mix(in oklab, var(--accent) 70%, var(--ink) 30%)';
      }
    }
  }

  // ── 5. polylines (sorted by z so important lines are on top)
  const linesLayer = svgEl('g', { class: 'radar__lines' }, svg);
  // sort values by z order from line metadata
  const valuesSorted = [...values].sort((a, b) => {
    const lineA = lines.find(l => l.id === a.lineId);
    const lineB = lines.find(l => l.id === b.lineId);
    return (lineA?.z ?? 0) - (lineB?.z ?? 0);
  });

  // Track which polylines we've drawn for hover wiring.
  const drawnPolylines = [];
  const drawnVertices  = [];

  for (const v of valuesSorted) {
    const line = lines.find(l => l.id === v.lineId);
    if (!line) continue;

    const pts = v.points.map((val, i) => valuePoint(cx, cy, maxR, i, N, val, vMin, vMax));

    // Group for fill+stroke+dots, easier hover.
    const g = svgEl('g', {
      class: 'radar__poly',
      'data-line': line.id,
      'data-group': line.group,
      'data-family': line.family || '',
      tabindex: '0',
      'aria-label': `${line.label}, scores ${v.points.map((p, i) => `${axes[i]} ${p}`).join(', ')}`,
    }, linesLayer);

    // Optional fill (used by ensemble line).
    if (line.fill) {
      const fillPts = pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
      const fillPoly = svgEl('polygon', {
        class: 'radar__poly-fill',
        points: fillPts,
        'fill-opacity': line.fillOpacity ?? 0.10,
        stroke: 'none',
        'pointer-events': 'none',
      }, g);
      fillPoly.style.fill = line.fill;
    }

    // Stroke polyline (closed polygon).
    const strokePts = pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    const polygon = svgEl('polygon', {
      class: 'radar__poly-stroke',
      points: strokePts,
      fill: 'none',
      'stroke-width': line.width,
      'stroke-dasharray': line.dasharray || null,
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
      opacity: line.opacity ?? 1,
    }, g);
    polygon.style.stroke = line.stroke;
    drawnPolylines.push({ el: polygon, line, group: g });

    // Vertex dots (one per axis).
    for (let i = 0; i < N; i++) {
      const p = pts[i];
      const dot = svgEl('circle', {
        class: 'radar__vertex',
        'data-line': line.id,
        'data-axis': i,
        cx: p.x.toFixed(2),
        cy: p.y.toFixed(2),
        r: line.id === 'ensemble' || line.id === 'baseline' ? 3.5 : 3,
        'stroke-width': 1,
        opacity: line.opacity ?? 1,
        tabindex: '0',
      }, g);
      dot.style.fill = line.stroke;
      dot.style.stroke = 'var(--bg)';
      drawnVertices.push({ el: dot, line, axisIdx: i, value: v.points[i] });
    }
  }

  // ── 6. axis labels (just outside the 100-ring)
  const labelsLayer = svgEl('g', { class: 'radar__labels' }, svg);
  const labelOffset = fs * 1.0;

  for (let i = 0; i < N; i++) {
    const { anchor, cosT, sinT } = labelAnchor(i, N);
    const distance = maxR + labelOffset;
    const lp = polarToXY(cx, cy, distance, i, N);

    // Adjust dy for top/bottom axes for nicer baseline alignment.
    let dy = 0;
    if (sinT < -0.6) dy = -fs * 0.2;       // top
    else if (sinT > 0.6) dy = fs * 0.85;   // bottom
    else dy = fs * 0.32;

    const text = svgEl('text', {
      class: 'radar__axis-label',
      x: lp.x.toFixed(2),
      y: (lp.y + dy).toFixed(2),
      'font-size': fs,
      'text-anchor': anchor,
      'data-axis': i,
      tabindex: onAxisClick ? '0' : null,
      role: onAxisClick ? 'button' : null,
      'aria-label': onAxisClick ? `${axes[i]}, click to drill into facets` : axes[i],
    }, labelsLayer, axes[i]);

    if (onAxisClick) {
      text.style.cursor = 'pointer';
      text.addEventListener('click', () => onAxisClick(i));
      text.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAxisClick(i);
        }
      });
    }
  }

  // ── 7. animate strokes in (stroke-dasharray trick), staggered
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (animate && !reduceMotion) {
    // Order: baseline first, ensemble second, then individual chats
    const order = ['baseline', 'ensemble', 'opus_mean', 'gemini_mean', 'flash_mean',
                   'opus_c1', 'opus_c2', 'gemini_c1', 'gemini_c2', 'flash_c1', 'flash_c2'];
    let delay = 0;
    for (const id of order) {
      const entry = drawnPolylines.find(d => d.line.id === id);
      if (!entry) continue;
      const poly = entry.el;
      // approximate perimeter for dasharray
      const pts = poly.getAttribute('points').split(' ').map(p => p.split(',').map(parseFloat));
      let perim = 0;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i+1) % pts.length];
        perim += Math.hypot(b[0]-a[0], b[1]-a[1]);
      }
      poly.style.strokeDasharray = `${perim} ${perim}`;
      poly.style.strokeDashoffset = `${perim}`;
      poly.style.transition = `stroke-dashoffset 480ms ease ${delay}ms`;
      // also fade in vertices and fill
      const vertices = entry.group.querySelectorAll('.radar__vertex');
      const fill = entry.group.querySelector('.radar__poly-fill');
      vertices.forEach(v => { v.style.opacity = 0; v.style.transition = `opacity 200ms ease ${delay + 320}ms`; });
      if (fill) { const fo = fill.getAttribute('fill-opacity'); fill.setAttribute('fill-opacity', 0); fill.style.transition = `fill-opacity 320ms ease ${delay + 200}ms`; fill.dataset.targetOpacity = fo; }
      // schedule
      requestAnimationFrame(() => {
        // restore the dasharray *if* the line was meant to be dashed
        const targetDash = entry.line.dasharray || null;
        poly.style.strokeDashoffset = '0';
        // After animation, restore dasharray
        setTimeout(() => {
          if (targetDash) poly.style.strokeDasharray = targetDash;
          else poly.style.strokeDasharray = '';
          poly.style.transition = '';
          poly.style.strokeDashoffset = '';
        }, 480 + delay + 50);
        vertices.forEach(v => { v.style.opacity = ''; });
        if (fill) {
          fill.setAttribute('fill-opacity', fill.dataset.targetOpacity || 0.1);
        }
      });
      delay += 80;
    }
  }

  return { drawnPolylines, drawnVertices, cx, cy, maxR, N, fs };
}

// ────────────────────────────────────────────────────────────────────── interaction
// Wire hover + tooltip behaviour onto a rendered radar.
//   svg          — the SVG element
//   tooltipEl    — the floating tooltip div
//   axes         — array of axis labels
//   lines        — array of LINE objects
//   values       — array of {lineId, points: number[N]}
//   evidence     — fn(axisIdx, lineId) → string  (for vertex tooltips)
//   onLineHover  — optional callback(lineId|null) when hover changes
export function attachRadarInteractions(svg, tooltipEl, opts) {
  const { axes, lines, values, evidence } = opts;

  const polys = svg.querySelectorAll('.radar__poly');
  const vertices = svg.querySelectorAll('.radar__vertex');
  const axisLabels = svg.querySelectorAll('.radar__axis-label');

  const dimAll = () => {
    polys.forEach(g => {
      g.classList.remove('is-hover');
      g.classList.remove('is-dim');
    });
  };
  const highlightLine = (lineId) => {
    polys.forEach(g => {
      if (g.dataset.line === lineId) {
        g.classList.add('is-hover');
        g.classList.remove('is-dim');
      } else {
        g.classList.add('is-dim');
        g.classList.remove('is-hover');
      }
    });
  };
  const highlightAxis = (axisIdx) => {
    axisLabels.forEach(l => {
      if (l.dataset.axis === String(axisIdx)) l.classList.add('is-hover');
      else l.classList.add('is-dim');
    });
  };
  const resetAxes = () => {
    axisLabels.forEach(l => { l.classList.remove('is-hover'); l.classList.remove('is-dim'); });
  };

  // Tooltip helpers
  const showTooltip = (html, x, y) => {
    tooltipEl.innerHTML = html;
    tooltipEl.dataset.visible = 'true';
    positionTooltip(x, y);
  };
  const hideTooltip = () => {
    tooltipEl.dataset.visible = 'false';
  };
  const positionTooltip = (x, y) => {
    const rect = tooltipEl.getBoundingClientRect();
    const margin = 14;
    let left = x + 14;
    let top  = y + 14;
    if (left + rect.width + margin > window.innerWidth) left = x - rect.width - 14;
    if (top + rect.height + margin > window.innerHeight) top = y - rect.height - 14;
    if (left < margin) left = margin;
    if (top < margin) top = margin;
    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
  };

  // Polyline / polygon hover  → highlight that line, show line summary
  polys.forEach(g => {
    g.addEventListener('mouseenter', (e) => {
      const lineId = g.dataset.line;
      const line = lines.find(l => l.id === lineId);
      const v = values.find(v => v.lineId === lineId);
      if (!line || !v) return;
      highlightLine(lineId);
      showTooltip(buildLineTooltip(line, v, axes), e.clientX, e.clientY);
    });
    g.addEventListener('mousemove', (e) => positionTooltip(e.clientX, e.clientY));
    g.addEventListener('mouseleave', () => { dimAll(); hideTooltip(); });
    g.addEventListener('focus', () => {
      const lineId = g.dataset.line;
      const line = lines.find(l => l.id === lineId);
      const v = values.find(v => v.lineId === lineId);
      if (!line || !v) return;
      highlightLine(lineId);
      const bbox = g.getBoundingClientRect();
      showTooltip(buildLineTooltip(line, v, axes), bbox.left + bbox.width/2, bbox.top + bbox.height/2);
    });
    g.addEventListener('blur', () => { dimAll(); hideTooltip(); });
  });

  // Vertex hover  → show evidence quote
  vertices.forEach(c => {
    c.addEventListener('mouseenter', (e) => {
      e.stopPropagation();
      const lineId = c.dataset.line;
      const axisIdx = +c.dataset.axis;
      const line = lines.find(l => l.id === lineId);
      const v = values.find(v => v.lineId === lineId);
      if (!line || !v) return;
      highlightLine(lineId);
      const score = v.points[axisIdx];
      const quote = evidence ? evidence(axisIdx, lineId) : null;
      showTooltip(buildVertexTooltip(line, axes[axisIdx], score, quote), e.clientX, e.clientY);
    });
    c.addEventListener('mousemove', (e) => { e.stopPropagation(); positionTooltip(e.clientX, e.clientY); });
    c.addEventListener('mouseleave', () => { dimAll(); hideTooltip(); });
  });

  // Axis-label hover → highlight that axis
  axisLabels.forEach(l => {
    l.addEventListener('mouseenter', () => {
      const idx = +l.dataset.axis;
      highlightAxis(idx);
    });
    l.addEventListener('mouseleave', () => resetAxes());
  });

  // ESC to clear
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { dimAll(); resetAxes(); hideTooltip(); }
  });
}

// ────────────────────────────────────────────────────────────────────── tooltip HTML builders
function buildLineTooltip(line, v, axes) {
  const swatchStyle = `background:${line.stroke};${line.dasharray ? 'background:transparent;border-top:2px dashed ' + line.stroke + ';width:1.1em;height:0;' : ''}`;
  const scores = v.points.map((p, i) => `<dt>${axes[i]}</dt><dd>${p}</dd>`).join('');
  return `
    <p class="radar__tt-name">
      <span class="radar__tt-swatch" style="${swatchStyle}"></span>
      ${escapeHtml(line.label)}
    </p>
    <dl class="radar__tt-scores">${scores}</dl>
    <p class="radar__tt-character">${escapeHtml(line.character || '')}</p>
  `;
}

function buildVertexTooltip(line, axisName, score, quote) {
  const swatchStyle = `background:${line.stroke};${line.dasharray ? 'background:transparent;border-top:2px dashed ' + line.stroke + ';width:1.1em;height:0;' : ''}`;
  return `
    <p class="radar__tt-name">
      <span class="radar__tt-swatch" style="${swatchStyle}"></span>
      ${escapeHtml(line.short || line.label)} · <span class="radar__tt-axis">${escapeHtml(axisName)}</span>
    </p>
    <p class="radar__tt-score">${score}<small>/100</small></p>
    ${quote ? `<p class="radar__tt-quote">${escapeHtml(quote)}</p>` : ''}
  `;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
}
