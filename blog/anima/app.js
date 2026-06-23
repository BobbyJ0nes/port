/**
 * app.js — global wiring for the ANIMA writeup.
 *
 * Ports the ANIMUS shell: theme toggle (+ broadcasts a theme event so the
 * canvas figures can repaint), j/k section navigation, the sticky section-nav
 * IntersectionObserver active-state, and a best-effort pretext caption pass.
 * Then boots each interactive figure by its [data-widget] mount id. Every
 * widget is isolated in a try/catch so one failure can't take the page down.
 */

import { mountConceptSpace } from './conceptspace.js';
import { mountDiffusion }    from './diffusion.js';
import { mountPerceptron }   from './perceptron.js';
import { mountAttention }    from './attention.js';
import { mountPostTraining } from './posttraining.js';
import { mountSignature }    from './signature.js';
import { mountNaming }       from './naming.js';
import { mountAnima }        from './anima.js';

// ---------------------------------------------------------------------
// 1. theme toggle — persisted, broadcasts 'basaira:theme'
// ---------------------------------------------------------------------
(function theme() {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('basaira-theme');
  const initial = (stored === 'light' || stored === 'dark')
    ? stored : (prefersDark() ? 'dark' : 'light');
  if (stored === 'light' || stored === 'dark') root.setAttribute('data-theme', stored);
  syncThemeButton(btn, initial);

  btn?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || (prefersDark() ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('basaira-theme', next);
    syncThemeButton(btn, next);
    // let canvas-based figures repaint with the new palette
    document.dispatchEvent(new CustomEvent('basaira:theme', { detail: { theme: next } }));
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
// 2. j/k navigation between sections
// ---------------------------------------------------------------------
(function jkNav() {
  const sections = Array.from(document.querySelectorAll('.lab-section'));
  if (!sections.length) return;
  let idx = 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = prefersReduced ? 'auto' : 'smooth';

  function focusSection(i) {
    const target = sections[i];
    if (!target) return;
    sections.forEach(s => s.classList.remove('is-focus'));
    target.classList.add('is-focus');
    target.scrollIntoView({ behavior, block: 'start' });
  }
  window.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(sections.length - 1, idx + 1); focusSection(idx); }
    else if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(0, idx - 1); focusSection(idx); }
  });
})();

// ---------------------------------------------------------------------
// 3. sticky section nav — IntersectionObserver active-state
// ---------------------------------------------------------------------
(function sectionNav() {
  const navLinks = Array.from(document.querySelectorAll('.section-nav a[data-section-target]'));
  if (!navLinks.length) return;
  const targets = navLinks
    .map(a => ({ a, el: document.getElementById(a.dataset.sectionTarget) }))
    .filter(t => t.el);

  function setActive(id) {
    navLinks.forEach(a => a.classList.toggle('is-active', a.dataset.sectionTarget === id));
  }
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible[0]) setActive(visible[0].target.id);
  }, { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });
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
// 4. boot the interactive figures
// ---------------------------------------------------------------------
const WIDGETS = {
  conceptspace: mountConceptSpace,
  diffusion:    mountDiffusion,
  perceptron:   mountPerceptron,
  attention:    mountAttention,
  posttraining: mountPostTraining,
  signature:    mountSignature,
  naming:       mountNaming,
  anima:        mountAnima,
};

document.querySelectorAll('[data-widget]').forEach(mount => {
  const fn = WIDGETS[mount.dataset.widget];
  if (!fn) return;
  try {
    fn(mount);
  } catch (err) {
    console.warn(`[anima] widget "${mount.dataset.widget}" failed:`, err);
    mount.innerHTML = `<p class="widget-fallback">this figure couldn't load — the prose still stands on its own.</p>`;
  }
});

// ---------------------------------------------------------------------
// 5. pretext (best-effort) — balances figure captions, like ANIMUS.
// ---------------------------------------------------------------------
(async function pretextHook() {
  try {
    const pretext = await import('pretext');
    if (typeof pretext?.prepare !== 'function') return;
    document.querySelectorAll('.figure figcaption').forEach(cap => {
      const measured = pretext.prepare(cap.textContent);
      cap.dataset.pretextLines = measured?.lines ?? '';
    });
  } catch (_) { /* CDN unavailable — captions still render fine */ }
})();

// ---------------------------------------------------------------------
// 6. console signature
// ---------------------------------------------------------------------
console.log('%c✶ anima · the model as mirror', 'color:#c9521f;font-family:monospace;font-size:14px;font-weight:700');
console.log('%cpress j / k (or ↓ / ↑) to walk the sections. the moon toggles the theme.', 'color:#8a8178;font-family:monospace');
console.log('%cthe text is a journal entry, reproduced verbatim. the figures are instruments built beside it.', 'color:#8a8178;font-family:monospace');
console.log('%csource: BASAIRA / ANIMA · 14.06.26', 'color:#8a8178;font-family:monospace');
