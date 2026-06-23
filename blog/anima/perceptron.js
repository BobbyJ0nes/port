/* =====================================================================
   perceptron.js — Figure 2.1 · Rosenblatt's artificial neuron (1958).
   Left: the neuron schematic (inputs × weights → Σ → threshold → output).
   Right: a 2-D plane with two classes and the live decision boundary.
   Drag the probe to make the output fire. Press train to let the perceptron
   learn the dividing line from its own mistakes (the 1958 learning rule).
   Vanilla SVG, themed via CSS variables.
   ===================================================================== */

import { svgEl, el, rng, clamp, reduceMotion } from './util.js';

export function mountPerceptron(mount) {
  const wrap = el('div', { class: 'perc' }, mount);
  const panels = el('div', { class: 'perc__panels' }, wrap);

  // ── neuron schematic ───────────────────────────────────────────────
  const nWrap = el('div', { class: 'perc__cell' }, panels);
  el('p', { class: 'perc__cap', text: 'the neuron' }, nWrap);
  const nsvg = svgEl('svg', { class: 'perc__svg perc__neuron', viewBox: '0 0 320 230',
    role: 'img', 'aria-label': 'perceptron schematic: inputs, weights, sum, threshold, output' }, nWrap);

  // ── plane ──────────────────────────────────────────────────────────
  const pWrap = el('div', { class: 'perc__cell' }, panels);
  el('p', { class: 'perc__cap', text: 'the decision boundary · drag the probe' }, pWrap);
  const psvg = svgEl('svg', { class: 'perc__svg perc__plane', viewBox: '0 0 260 260',
    role: 'img', 'aria-label': 'two classes of points and the perceptron decision boundary' }, pWrap);

  // ── controls ───────────────────────────────────────────────────────
  const controls = el('div', { class: 'perc__controls' }, wrap);
  const mkSlider = (label, key, min, max) => {
    const row = el('label', { class: 'perc__slider' }, controls);
    el('span', { class: 'perc__slider-key', text: label }, row);
    const input = el('input', { type: 'range', min: String(min), max: String(max), step: '0.01' }, row);
    const val = el('span', { class: 'perc__slider-val' }, row);
    return { input, val, key };
  };
  const sW1 = mkSlider('w₁', 'w1', -2, 2);
  const sW2 = mkSlider('w₂', 'w2', -2, 2);
  const sB  = mkSlider('b',  'b', -2, 2);

  const btns = el('div', { class: 'perc__btns' }, controls);
  const trainBtn = el('button', { class: 'perc__btn perc__btn--primary', type: 'button', html: '▶ train' }, btns);
  const stepBtn  = el('button', { class: 'perc__btn', type: 'button', html: '+1 step' }, btns);
  const resetBtn = el('button', { class: 'perc__btn', type: 'button', html: '⟳ reset' }, btns);
  const readout  = el('p', { class: 'perc__readout' }, wrap);

  // ── model state ────────────────────────────────────────────────────
  const R = 14;                                   // points
  let W = { w1: 0.6, w2: -0.4, b: 0.1 };
  let probe = { x: 0.45, y: 0.35 };
  let points = [];
  let autoTimer = null;

  function makeData(seed) {
    const r = rng(seed);
    // a hidden "true" separator with a margin → guaranteed separable
    const tw1 = 1.1, tw2 = 0.8, tb = -0.15, margin = 0.22;
    points = [];
    let guard = 0;
    while (points.length < R && guard < 4000) {
      guard++;
      const x = r() * 2.2 - 1.1, y = r() * 2.2 - 1.1;
      const s = tw1 * x + tw2 * y + tb;
      if (Math.abs(s) < margin) continue;          // keep the gap clean
      points.push({ x, y, label: s > 0 ? 1 : 0 });
    }
  }

  const predict = (x, y, w = W) => (w.w1 * x + w.w2 * y + w.b > 0 ? 1 : 0);

  function accuracy() {
    let ok = 0;
    for (const p of points) if (predict(p.x, p.y) === p.label) ok++;
    return { ok, total: points.length };
  }

  // one pass of the perceptron rule; returns true if a weight changed
  function trainStep() {
    const lr = 0.08;
    for (const p of points) {
      const pred = predict(p.x, p.y);
      const err = p.label - pred;
      if (err !== 0) {
        W.w1 += lr * err * p.x;
        W.w2 += lr * err * p.y;
        W.b  += lr * err;
        return true;
      }
    }
    return false;
  }

  // ── plane geometry ─────────────────────────────────────────────────
  const SZ = 260, PAD = 26, LO = -1.25, HI = 1.25;
  const sx = (x) => PAD + ((x - LO) / (HI - LO)) * (SZ - 2 * PAD);
  const sy = (y) => SZ - PAD - ((y - LO) / (HI - LO)) * (SZ - 2 * PAD);
  const ix = (px) => LO + ((px - PAD) / (SZ - 2 * PAD)) * (HI - LO);
  const iy = (py) => LO + ((SZ - PAD - py) / (SZ - 2 * PAD)) * (HI - LO);

  function renderPlane() {
    psvg.innerHTML = '';
    // half-plane shading: sample boundary line w1 x + w2 y + b = 0
    // build the polygon for the y=1 side by clipping the line to the box
    const corners = [[LO, LO], [HI, LO], [HI, HI], [LO, HI]];
    const pos = corners.filter(([x, y]) => predict(x, y) > 0);
    // simpler: fill whole bg, then draw the boundary; tint each side via two big rects masked by line is overkill.
    // Instead: colour each grid cell faintly by prediction (cheap, crisp enough).
    const g = svgEl('g', { class: 'perc__field', 'aria-hidden': 'true' }, psvg);
    const STEP = 13;
    for (let gx = PAD; gx < SZ - PAD; gx += STEP) {
      for (let gy = PAD; gy < SZ - PAD; gy += STEP) {
        const cls = predict(ix(gx + STEP / 2), iy(gy + STEP / 2));
        const rect = svgEl('rect', { x: gx, y: gy, width: STEP, height: STEP,
          'pointer-events': 'none' }, g);
        rect.style.fill = cls ? 'var(--accent)' : 'var(--accent-2)';
        rect.style.opacity = '0.07';
      }
    }
    // box
    svgEl('rect', { x: PAD, y: PAD, width: SZ - 2 * PAD, height: SZ - 2 * PAD,
      fill: 'none', class: 'perc__box' }, psvg);

    // decision boundary line (clip to box)
    const line = boundaryEndpoints();
    if (line) {
      const l = svgEl('line', { x1: sx(line.a.x), y1: sy(line.a.y), x2: sx(line.b.x), y2: sy(line.b.y),
        class: 'perc__boundary' }, psvg);
      l.style.stroke = 'var(--ink)';
    }

    // points
    for (const p of points) {
      const correct = predict(p.x, p.y) === p.label;
      const c = svgEl('circle', { cx: sx(p.x), cy: sy(p.y), r: 6, class: 'perc__pt',
        'data-correct': correct ? '1' : '0' }, psvg);
      if (p.label === 1) { c.style.fill = 'var(--accent)'; c.style.stroke = 'var(--accent)'; }
      else { c.style.fill = 'var(--bg-hard)'; c.style.stroke = 'var(--accent-2)'; }
      c.style.strokeWidth = '2';
      if (!correct) c.classList.add('perc__pt--wrong');
    }

    // probe (draggable)
    const py = predict(probe.x, probe.y);
    const probeG = svgEl('g', { class: 'perc__probe', tabindex: '0',
      'aria-label': 'draggable probe point' }, psvg);
    const halo = svgEl('circle', { cx: sx(probe.x), cy: sy(probe.y), r: 11, class: 'perc__probe-halo' }, probeG);
    halo.style.stroke = py ? 'var(--accent)' : 'var(--accent-2)';
    const dot = svgEl('circle', { cx: sx(probe.x), cy: sy(probe.y), r: 5.5, class: 'perc__probe-dot' }, probeG);
    dot.style.fill = py ? 'var(--accent)' : 'var(--accent-2)';
  }

  function boundaryEndpoints() {
    // intersect w1 x + w2 y + b = 0 with the box [LO,HI]^2
    const pts = [];
    const f = (x, y) => W.w1 * x + W.w2 * y + W.b;
    // vertical edges
    [LO, HI].forEach(x => { if (Math.abs(W.w2) > 1e-6) { const y = -(W.w1 * x + W.b) / W.w2; if (y >= LO && y <= HI) pts.push({ x, y }); } });
    // horizontal edges
    [LO, HI].forEach(y => { if (Math.abs(W.w1) > 1e-6) { const x = -(W.w2 * y + W.b) / W.w1; if (x >= LO && x <= HI) pts.push({ x, y }); } });
    if (pts.length < 2) return null;
    return { a: pts[0], b: pts[pts.length - 1] };
  }

  // ── neuron schematic ───────────────────────────────────────────────
  function renderNeuron() {
    nsvg.innerHTML = '';
    const inX = 40, sumX = 178, actX = 232, outX = 292;
    const yy = [58, 115, 172];                       // x1, x2, bias
    const sumY = 115;
    const inputs = [
      { y: yy[0], label: 'x₁', val: probe.x, w: W.w1, wlabel: 'w₁' },
      { y: yy[1], label: 'x₂', val: probe.y, w: W.w2, wlabel: 'w₂' },
      { y: yy[2], label: '1',  val: 1,        w: W.b,  wlabel: 'b' },
    ];

    // edges
    inputs.forEach((n) => {
      const mag = clamp(Math.abs(n.w), 0, 2);
      const line = svgEl('line', { x1: inX + 16, y1: n.y, x2: sumX - 17, y2: sumY,
        class: 'perc__edge' }, nsvg);
      line.style.stroke = n.w >= 0 ? 'var(--accent)' : 'var(--accent-2)';
      line.style.strokeWidth = (0.7 + mag * 1.8).toFixed(2);
      line.style.opacity = (0.35 + mag * 0.33).toFixed(2);
      // weight label
      const mx = (inX + 16 + sumX - 17) / 2, my = (n.y + sumY) / 2 - 4;
      svgEl('text', { x: mx, y: my, class: 'perc__wlabel', 'text-anchor': 'middle' },
        nsvg, `${n.wlabel}=${n.w.toFixed(2)}`);
    });

    // input nodes
    inputs.forEach((n) => {
      const g = svgEl('g', {}, nsvg);
      const c = svgEl('circle', { cx: inX, cy: n.y, r: 16, class: 'perc__node' }, g);
      c.style.fill = 'var(--bg-soft)';
      svgEl('text', { x: inX, y: n.y + 1, class: 'perc__nodelabel', 'text-anchor': 'middle',
        'dominant-baseline': 'middle' }, g, n.label);
      svgEl('text', { x: inX, y: n.y + 30, class: 'perc__nodeval', 'text-anchor': 'middle' },
        g, n.label === '1' ? 'bias' : n.val.toFixed(2));
    });

    // sum node
    const sumC = svgEl('circle', { cx: sumX, cy: sumY, r: 21, class: 'perc__node perc__sum' }, nsvg);
    sumC.style.fill = 'var(--bg-soft)';
    svgEl('text', { x: sumX, y: sumY + 1, class: 'perc__sumglyph', 'text-anchor': 'middle',
      'dominant-baseline': 'middle' }, nsvg, 'Σ');

    const z = W.w1 * probe.x + W.w2 * probe.y + W.b;
    svgEl('text', { x: sumX, y: sumY - 30, class: 'perc__nodeval', 'text-anchor': 'middle' },
      nsvg, `z=${z.toFixed(2)}`);

    // Σ → activation
    svgEl('line', { x1: sumX + 21, y1: sumY, x2: actX - 16, y2: sumY, class: 'perc__edge perc__edge--plain' }, nsvg);
    // activation box (step function glyph)
    svgEl('rect', { x: actX - 16, y: sumY - 16, width: 32, height: 32, rx: 4, class: 'perc__act' }, nsvg);
    // step glyph
    svgEl('path', { d: `M ${actX - 11} ${sumY + 8} H ${actX} V ${sumY - 8} H ${actX + 11}`,
      class: 'perc__stepglyph', fill: 'none' }, nsvg);

    // activation → output
    svgEl('line', { x1: actX + 16, y1: sumY, x2: outX - 17, y2: sumY, class: 'perc__edge perc__edge--plain' }, nsvg);

    // output node
    const y = z > 0 ? 1 : 0;
    const outC = svgEl('circle', { cx: outX, cy: sumY, r: 17, class: 'perc__node perc__out' }, nsvg);
    outC.style.fill = y ? 'var(--accent)' : 'var(--bg-soft)';
    outC.style.stroke = y ? 'var(--accent)' : 'var(--ink-faint)';
    svgEl('text', { x: outX, y: sumY + 1,
      class: y ? 'perc__outlabel perc__outlabel--on' : 'perc__outlabel',
      'text-anchor': 'middle', 'dominant-baseline': 'middle' }, nsvg, `${y}`);
    svgEl('text', { x: outX, y: sumY - 28, class: 'perc__nodeval', 'text-anchor': 'middle' }, nsvg, 'ŷ');
    svgEl('text', { x: outX, y: sumY + 34, class: 'perc__nodeval', 'text-anchor': 'middle' },
      nsvg, y ? 'fires' : 'silent');
  }

  // ── sync + render ──────────────────────────────────────────────────
  function syncSliders() {
    [sW1, sW2, sB].forEach(s => {
      s.input.value = String(W[s.key]);
      s.val.textContent = W[s.key].toFixed(2);
    });
  }
  function renderAll() {
    syncSliders();
    renderPlane();
    renderNeuron();
    const { ok, total } = accuracy();
    const done = ok === total;
    readout.innerHTML = `boundary: <b>${W.w1.toFixed(2)}</b>·x₁ + <b>${W.w2.toFixed(2)}</b>·x₂ + <b>${W.b.toFixed(2)}</b> &gt; 0` +
      ` &nbsp;·&nbsp; classifies <b class="${done ? 'perc--good' : ''}">${ok}/${total}</b> correctly` +
      (done ? ' — separated ✓' : '');
  }

  // ── interactions ───────────────────────────────────────────────────
  [sW1, sW2, sB].forEach(s => {
    s.input.addEventListener('input', () => { stopAuto(); W[s.key] = +s.input.value; renderAll(); });
  });
  stepBtn.addEventListener('click', () => { stopAuto(); trainStep(); renderAll(); });
  resetBtn.addEventListener('click', () => {
    stopAuto();
    W = { w1: +( (Math.random() * 2 - 1).toFixed(2) ), w2: +((Math.random() * 2 - 1).toFixed(2)), b: +((Math.random() * 1 - 0.5).toFixed(2)) };
    renderAll();
  });
  trainBtn.addEventListener('click', () => {
    if (autoTimer) { stopAuto(); return; }
    if (reduceMotion()) { for (let i = 0; i < 400 && trainStep(); i++); renderAll(); return; }
    trainBtn.innerHTML = '❚❚ pause';
    autoTimer = setInterval(() => {
      const changed = trainStep();
      renderAll();
      if (!changed) stopAuto();
    }, 90);
  });
  function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } trainBtn.innerHTML = '▶ train'; }

  // probe dragging
  function setProbeFromEvent(ev) {
    const rect = psvg.getBoundingClientRect();
    const scaleX = SZ / rect.width, scaleY = SZ / rect.height;
    const px = (ev.clientX - rect.left) * scaleX;
    const py = (ev.clientY - rect.top) * scaleY;
    probe.x = clamp(ix(px), LO, HI);
    probe.y = clamp(iy(py), LO, HI);
    renderPlane(); renderNeuron();
  }
  let dragging = false;
  psvg.addEventListener('pointerdown', (e) => { dragging = true; psvg.setPointerCapture?.(e.pointerId); setProbeFromEvent(e); });
  psvg.addEventListener('pointermove', (e) => { if (dragging) setProbeFromEvent(e); });
  psvg.addEventListener('pointerup', () => { dragging = false; });
  psvg.addEventListener('pointercancel', () => { dragging = false; });
  // keyboard nudge of the probe
  psvg.addEventListener('keydown', (e) => {
    const d = 0.06; let used = true;
    if (e.key === 'ArrowLeft') probe.x = clamp(probe.x - d, LO, HI);
    else if (e.key === 'ArrowRight') probe.x = clamp(probe.x + d, LO, HI);
    else if (e.key === 'ArrowUp') probe.y = clamp(probe.y + d, LO, HI);
    else if (e.key === 'ArrowDown') probe.y = clamp(probe.y - d, LO, HI);
    else used = false;
    if (used) { e.preventDefault(); renderPlane(); renderNeuron(); }
  });

  // ── boot ───────────────────────────────────────────────────────────
  makeData(42);
  renderAll();
}
