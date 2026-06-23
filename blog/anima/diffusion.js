/* =====================================================================
   diffusion.js — Figure 2.0 · how a diffusion model learns "cat".
   Two coupled views over a real photo + a cosine noise schedule:
     x_t   — the forward process: the real image + noise at level t. This is
             how the *training data* is made (no learning here, just corruption).
     x̂₀   — what a trained denoiser reconstructs from x_t. The faithful part:
             at high noise the best possible guess is the *gist* every cat shares
             (coarse shape + palette → the learned abstraction); detail returns
             only as the noise drops. Sampling = walking t from 1 → 0.
   Real images, real forward math (xt = √ᾱ·x₀ + √(1−ᾱ)·ε, cosine schedule).
   The reconstruction is a faithful illustration (coarse-to-fine + fall-back to
   the dataset prior), not a real network running in the browser.
   ===================================================================== */

import { svgEl, el, rng, clamp, lerp, tween, reduceMotion } from './util.js';

const N = 200;                          // working buffer (square)
const CATS = ['cats/cat1.jpg', 'cats/cat2.jpg', 'cats/cat3.jpg', 'cats/cat4.jpg', 'cats/cat5.jpg'];

// cosine noise schedule (Nichol & Dhariwal). ᾱ(0)=1 (clean) → ᾱ(1)≈0 (noise).
const S = 0.008;
const fOf = (u) => Math.cos(((u + S) / (1 + S)) * Math.PI / 2) ** 2;
const F0 = fOf(0);
const abarOf = (t) => clamp(fOf(t) / F0, 0, 1);

export function mountDiffusion(mount) {
  const wrap = el('div', { class: 'diff' }, mount);
  el('p', { class: 'diff__loading', text: 'loading cats…' }, wrap);

  // ── load the real images, build float buffers + the dataset prototype ──
  const off = document.createElement('canvas'); off.width = N; off.height = N;
  const octx = off.getContext('2d', { willReadFrequently: true });

  function imageToFloat(img) {
    // cover-fit (scale to fill, centre-crop) → N×N → rgb float [0,1]
    const scale = Math.max(N / img.width, N / img.height);
    const w = img.width * scale, h = img.height * scale;
    octx.clearRect(0, 0, N, N);
    octx.drawImage(img, (N - w) / 2, (N - h) / 2, w, h);
    const d = octx.getImageData(0, 0, N, N).data;
    const out = new Float32Array(N * N * 3);
    for (let p = 0, i = 0, j = 0; p < N * N; p++, i += 4, j += 3) {
      out[j] = d[i] / 255; out[j + 1] = d[i + 1] / 255; out[j + 2] = d[i + 2] / 255;
    }
    return out;
  }

  Promise.all(CATS.map(src => new Promise(res => {
    const img = new Image();
    img.onload = () => res(imageToFloat(img));
    img.onerror = () => res(null);
    img.src = src;
  }))).then(bufs => {
    const cats = bufs.filter(Boolean);
    if (!cats.length) { wrap.innerHTML = '<p class="widget-fallback">couldn\'t load the cat images.</p>'; return; }
    // prototype = mean over the whole (tiny) "training set" — the population prior
    const proto = new Float32Array(N * N * 3);
    for (const c of cats) for (let i = 0; i < proto.length; i++) proto[i] += c[i] / cats.length;
    build(cats, proto);
  });

  // ── the actual widget, once images are ready ──────────────────────────
  function build(cats, proto) {
    wrap.innerHTML = '';

    // noise schedule curve
    const sched = el('div', { class: 'diff__schedule' }, wrap);
    el('span', { class: 'diff__caplabel', text: 'noise schedule · ᾱₜ (cosine)' }, sched);
    const svg = svgEl('svg', { class: 'diff__sched-svg', viewBox: '0 0 320 60', 'aria-hidden': 'true' }, sched);
    const PADX = 6, PADY = 8, GW = 320 - PADX * 2, GH = 60 - PADY * 2;
    let dPath = '';
    for (let i = 0; i <= 60; i++) { const u = i / 60; const x = PADX + u * GW; const y = PADY + (1 - abarOf(u)) * GH; dPath += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' '; }
    const curve = svgEl('path', { d: dPath, fill: 'none', class: 'diff__sched-curve' }, svg);
    curve.style.stroke = 'var(--accent)';
    const marker = svgEl('line', { class: 'diff__sched-marker', y1: PADY - 3, y2: 60 - PADY + 3 }, svg);
    marker.style.stroke = 'var(--ink-faint)';
    const mdot = svgEl('circle', { r: 3, class: 'diff__sched-dot' }, svg);
    mdot.style.fill = 'var(--accent)';

    // two tiles
    const tiles = el('div', { class: 'diff__tiles' }, wrap);
    const mkTile = (cap, sub) => {
      const t = el('div', { class: 'diff__tile' }, tiles);
      const c = el('p', { class: 'diff__tile-cap' }, t);
      el('span', { class: 'diff__tile-name', text: cap }, c);
      el('span', { class: 'diff__tile-sub', text: sub }, c);
      const cv = el('canvas', { class: 'diff__tilecanvas', width: N, height: N }, t);
      return cv.getContext('2d');
    };
    const ctxXt   = mkTile('xₜ — fed to the model', 'real image + noise');
    const ctxXhat = mkTile('x̂₀ — what it reconstructs', 'gist first · detail last');

    // narration
    const narrate = el('p', { class: 'diff__narrate' }, wrap);

    // controls
    const controls = el('div', { class: 'diff__controls' }, wrap);
    const srow = el('div', { class: 'diff__sliderrow' }, controls);
    el('span', { class: 'diff__end', text: 'clean' }, srow);
    const slider = el('input', { class: 'diff__slider', type: 'range', min: '0', max: '1000', value: '350', 'aria-label': 'noise level t' }, srow);
    el('span', { class: 'diff__end', text: 'pure noise' }, srow);
    const btns = el('div', { class: 'diff__btns' }, controls);
    const genBtn = el('button', { class: 'diff__btn diff__btn--primary', type: 'button', html: '▶ generate' }, btns);
    const noiseBtn = el('button', { class: 'diff__btn', type: 'button', html: '⟳ new noise' }, btns);
    const readout = el('span', { class: 'diff__readout' }, btns);

    // the "training set" — thumbnails + the prototype it distils to
    const setRow = el('div', { class: 'diff__set' }, wrap);
    el('span', { class: 'diff__caplabel diff__set-lab', text: 'training set →' }, setRow);
    const thumbs = [];
    cats.forEach((c, i) => {
      const b = el('button', { class: 'diff__thumb', type: 'button', 'aria-label': `cat ${i + 1}` }, setRow);
      const cv = el('canvas', { width: 48, height: 48 }, b);
      putFloat(cv.getContext('2d'), c, 48);
      b.addEventListener('click', () => { sel = i; x0 = cats[i]; syncThumbs(); render(); });
      thumbs.push(b);
    });
    el('span', { class: 'diff__arrow', text: '→ distils to →' }, setRow);
    const protoWrap = el('div', { class: 'diff__protowrap' }, setRow);
    const protoCv = el('canvas', { class: 'diff__proto', width: 48, height: 48 }, protoWrap);
    putFloat(protoCv.getContext('2d'), proto, 48);
    el('span', { class: 'diff__proto-lab', text: 'the "idea of cat"' }, protoWrap);

    // ── state ──────────────────────────────────────────────────────────
    let sel = 0, x0 = cats[0], t = 0.35, seed = 11, cancelAnim = null;
    let noise = makeNoise(seed);

    function syncThumbs() { thumbs.forEach((b, i) => b.classList.toggle('is-sel', i === sel)); }

    function makeNoise(sd) {
      const r = rng(sd >>> 0); const out = new Float32Array(N * N * 3);
      for (let i = 0; i < out.length; i += 2) {           // Box–Muller, two at a time
        let u = r() || 1e-9, v = r();
        const mag = Math.sqrt(-2 * Math.log(u));
        out[i] = mag * Math.cos(2 * Math.PI * v);
        if (i + 1 < out.length) out[i + 1] = mag * Math.sin(2 * Math.PI * v);
      }
      return out;
    }

    // forward: xt = √ᾱ·x₀ + √(1−ᾱ)·ε
    function renderXt() {
      const ab = abarOf(t), a = Math.sqrt(ab), b = Math.sqrt(1 - ab);
      const img = ctxXt.createImageData(N, N), d = img.data;
      for (let p = 0, i = 0, j = 0; p < N * N; p++, i += 4, j += 3) {
        d[i]     = clamp(a * x0[j]     + b * noise[j],     0, 1) * 255;
        d[i + 1] = clamp(a * x0[j + 1] + b * noise[j + 1], 0, 1) * 255;
        d[i + 2] = clamp(a * x0[j + 2] + b * noise[j + 2], 0, 1) * 255;
        d[i + 3] = 255;
      }
      ctxXt.putImageData(img, 0, 0);
    }

    // reconstruction estimate: coarse-to-fine blur + fall-back to the prior
    function renderXhat() {
      const ab = abarOf(t), nf = Math.sqrt(1 - ab);          // noise fraction 0..1
      const radius = Math.round(nf * nf * 30);               // blurrier as noise rises
      const blurred = radius >= 1 ? boxBlur3(boxBlur3(x0, radius), radius) : x0;
      const wProto = clamp((nf - 0.62) / 0.38, 0, 1) * 0.6;  // only near pure noise
      const img = ctxXhat.createImageData(N, N), d = img.data;
      for (let p = 0, i = 0, j = 0; p < N * N; p++, i += 4, j += 3) {
        d[i]     = lerp(blurred[j],     proto[j],     wProto) * 255;
        d[i + 1] = lerp(blurred[j + 1], proto[j + 1], wProto) * 255;
        d[i + 2] = lerp(blurred[j + 2], proto[j + 2], wProto) * 255;
        d[i + 3] = 255;
      }
      ctxXhat.putImageData(img, 0, 0);
    }

    function renderSchedule() {
      const ab = abarOf(t);
      const x = PADX + t * GW, y = PADY + (1 - ab) * GH;
      marker.setAttribute('x1', x.toFixed(1)); marker.setAttribute('x2', x.toFixed(1));
      mdot.setAttribute('cx', x.toFixed(1)); mdot.setAttribute('cy', y.toFixed(1));
    }

    function narration() {
      const nf = Math.sqrt(1 - abarOf(t));
      if (t < 0.06) return 'clean — the specific cat, every detail intact. <em>x̂₀ = x₀</em>.';
      if (nf < 0.45) return 'a little noise. the model still sees <em>this</em> cat clearly.';
      if (nf < 0.72) return 'noise rising — the guess keeps the gist (shape, palette) and starts losing the specifics.';
      if (nf < 0.94) return 'mostly noise. the safest guess is the <em>idea of a cat</em> the weights distilled from the whole set — the abstraction.';
      return 'pure noise. nothing of this cat is left; only the learned prior remains to start a new sample from.';
    }

    function render() {
      renderXt(); renderXhat(); renderSchedule();
      const ab = abarOf(t), nf = Math.sqrt(1 - ab);
      readout.innerHTML = `<b>t</b> ${t.toFixed(2)} · <b>ᾱ</b> ${ab.toFixed(2)} · <b>noise</b> ${Math.round(nf * 100)}%`;
      narrate.innerHTML = narration();
    }

    // ── interactions ─────────────────────────────────────────────────
    slider.addEventListener('input', () => { if (cancelAnim) { cancelAnim(); cancelAnim = null; } t = +slider.value / 1000; render(); });

    genBtn.addEventListener('click', () => {
      if (cancelAnim) cancelAnim();
      t = 1; slider.value = '1000'; render();
      const ms = reduceMotion() ? 0 : 2600;
      cancelAnim = tween(ms, k => { t = 1 - k; slider.value = String(Math.round(t * 1000)); render(); }, () => { cancelAnim = null; });
    });
    noiseBtn.addEventListener('click', () => { seed = (seed * 1664525 + 1013904223) >>> 0; noise = makeNoise(seed); render(); });

    syncThumbs();
    render();
  }

  // ── helpers (module scope) ────────────────────────────────────────────
  function putFloat(ctx, buf3, size) {
    // draw an N×N float-rgb buffer into a `size`×`size` canvas (nearest is fine for thumbs)
    const tmp = document.createElement('canvas'); tmp.width = N; tmp.height = N;
    const tctx = tmp.getContext('2d');
    const img = tctx.createImageData(N, N), d = img.data;
    for (let p = 0, i = 0, j = 0; p < N * N; p++, i += 4, j += 3) {
      d[i] = buf3[j] * 255; d[i + 1] = buf3[j + 1] * 255; d[i + 2] = buf3[j + 2] * 255; d[i + 3] = 255;
    }
    tctx.putImageData(img, 0, 0);
    ctx.drawImage(tmp, 0, 0, size, size);
  }
}

// separable box blur over an interleaved rgb float buffer (clamped edges)
function boxBlur3(src, r) {
  if (r < 1) return src;
  const w = N, h = N, win = r * 2 + 1;
  const tmp = new Float32Array(src.length), out = new Float32Array(src.length);
  for (let c = 0; c < 3; c++) {
    for (let y = 0; y < h; y++) {
      const row = y * w * 3; let sum = 0;
      for (let x = -r; x <= r; x++) { const xx = Math.min(w - 1, Math.max(0, x)); sum += src[row + xx * 3 + c]; }
      for (let x = 0; x < w; x++) {
        tmp[row + x * 3 + c] = sum / win;
        const xo = Math.min(w - 1, Math.max(0, x - r)), xi = Math.min(w - 1, Math.max(0, x + r + 1));
        sum += src[row + xi * 3 + c] - src[row + xo * 3 + c];
      }
    }
    for (let x = 0; x < w; x++) {
      const col = x * 3 + c; let sum = 0;
      for (let y = -r; y <= r; y++) { const yy = Math.min(h - 1, Math.max(0, y)); sum += tmp[yy * w * 3 + col]; }
      for (let y = 0; y < h; y++) {
        out[y * w * 3 + col] = sum / win;
        const yo = Math.min(h - 1, Math.max(0, y - r)), yi = Math.min(h - 1, Math.max(0, y + r + 1));
        sum += tmp[yi * w * 3 + col] - tmp[yo * w * 3 + col];
      }
    }
  }
  return out;
}
