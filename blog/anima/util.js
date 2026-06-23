/* =====================================================================
   util.js — tiny shared helpers for the ANIMA figures.
   Vanilla. No deps. Everything SVG-coloured via CSS custom properties so
   the figures re-theme for free when :root[data-theme] flips.
   ===================================================================== */

export const SVG_NS = 'http://www.w3.org/2000/svg';

/** Create an SVG element with attributes (skips null/undefined). */
export function svgEl(name, attrs = {}, parent = null, text = null) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    el.setAttribute(k, v);
  }
  if (text != null) el.textContent = text;
  if (parent) parent.appendChild(el);
  return el;
}

/** Create an HTML element. attrs: {class, id, ...}, plus `html` / `text`. */
export function el(name, attrs = {}, parent = null) {
  const node = document.createElement(name);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'class') node.className = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v);
  }
  if (parent) parent.appendChild(node);
  return node;
}

export function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

export const reduceMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Read a CSS custom property off :root, resolved to a concrete value. */
export function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (t) => t * t * (3 - 2 * t);

/** Subscribe to theme changes dispatched by app.js. Returns an unsub fn. */
export function onTheme(fn) {
  document.addEventListener('basaira:theme', fn);
  return () => document.removeEventListener('basaira:theme', fn);
}

/** Deterministic PRNG (mulberry32) so noise / sampling is reproducible per seed. */
export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** requestAnimationFrame-based tween. cb(t) with t 0→1; calls done() at end. */
export function tween(durationMs, cb, done) {
  if (reduceMotion()) { cb(1); done && done(); return () => {}; }
  let start = null, raf = 0, cancelled = false;
  const step = (ts) => {
    if (cancelled) return;
    if (start == null) start = ts;
    const t = clamp((ts - start) / durationMs, 0, 1);
    cb(t);
    if (t < 1) raf = requestAnimationFrame(step);
    else done && done();
  };
  raf = requestAnimationFrame(step);
  return () => { cancelled = true; cancelAnimationFrame(raf); };
}
